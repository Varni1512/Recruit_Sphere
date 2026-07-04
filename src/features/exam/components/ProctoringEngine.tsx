"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle, Camera, Mic, Monitor } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import * as blazeface from '@tensorflow-models/blazeface'

interface ProctoringEngineProps {
  onViolation: (type: string, message: string) => void
  onPermissionsGranted: () => void
  startProctoring: boolean
  onReady?: () => void
}

export const ProctoringEngine = ({ onViolation, onPermissionsGranted, startProctoring, onReady }: ProctoringEngineProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [permissions, setPermissions] = useState({ camera: false, screen: false })
  const [error, setError] = useState("")
  const [aiLoaded, setAiLoaded] = useState(false)
  
  const cocoModelRef = useRef<cocoSsd.ObjectDetection | null>(null)
  const blazefaceModelRef = useRef<blazeface.BlazeFaceModel | null>(null)
  
  // Track warnings
  const warningsRef = useRef<number>(0)
  const tabSwitchCountRef = useRef<number>(0)
  const missingFaceStartTimeRef = useRef<number | null>(null)
  const completelyMissingStartTimeRef = useRef<number | null>(null)
  const hasRequested = useRef(false)
  
  const streamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const tabSwitchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const onViolationRef = useRef(onViolation)
  const onPermissionsGrantedRef = useRef(onPermissionsGranted)

  useEffect(() => {
    onViolationRef.current = onViolation
    onPermissionsGrantedRef.current = onPermissionsGranted
  }, [onViolation, onPermissionsGranted])
  
  useEffect(() => {
    if (!startProctoring) return;
    let isMounted = true;
    
    if (hasRequested.current) return
    hasRequested.current = true

    const initProctoring = async () => {
      try {
        // 1. Get Camera & Audio
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (!isMounted) {
            stream.getTracks().forEach(t => t.stop())
            return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        // 2. Setup Audio Detection
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        
        // Wait briefly before requesting screen share to ensure prompt visibility
        await new Promise(resolve => setTimeout(resolve, 500))
        if (!isMounted) return

        // 3. Get Screen Share
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        if (!isMounted) {
            screenStream.getTracks().forEach(t => t.stop())
            return
        }
        screenStreamRef.current = screenStream
        
        // Screen share stop detection
        screenStream.getVideoTracks()[0].onended = () => {
          if (isMounted) onViolationRef.current('SCREEN_STOPPED', 'Screen sharing was stopped.')
        }

        setPermissions({ camera: true, screen: true })
        onPermissionsGrantedRef.current()

        // 4. Load AI Models
        await tf.ready()
        cocoModelRef.current = await cocoSsd.load()
        blazefaceModelRef.current = await blazeface.load()
        if (isMounted) {
          setAiLoaded(true)
          if (onReady) onReady()
        }

        // 5. Start AI & Audio Loop
        detectionIntervalRef.current = setInterval(() => detectViolations(analyser, dataArray), 1000) // check every 1 second

        // 6. Detect Tab Switch
        document.addEventListener('visibilitychange', handleVisibilityChange)

      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to access camera, microphone or screen.")
      }
    }

    const detectViolations = async (analyser?: AnalyserNode, dataArray?: any) => {
      if (!videoRef.current || !cocoModelRef.current || !blazefaceModelRef.current || !isMounted) return

      const video = videoRef.current
      if (video.readyState !== 4) return // Wait for video to be ready

      try {
        // Audio Check
        if (analyser && dataArray) {
          analyser.getByteFrequencyData(dataArray)
          const sum = dataArray.reduce((a: number, b: number) => a + b, 0)
          const average = sum / dataArray.length
          // Average volume threshold (0-255). 40 is a reasonable threshold for speaking
          if (average > 40) {
            handleWarning('AUDIO_DETECTED', 'Background noise or speaking detected.')
          }
        }

        const cocoPredictions = await cocoModelRef.current.detect(video)
        const facePredictions = await blazefaceModelRef.current.estimateFaces(video, false)
        
        // Filter out low confidence cell phone detections (e.g. bottles)
        const cellphones = cocoPredictions.filter(p => p.class === 'cell phone' && p.score > 0.65)

        if (cellphones.length > 0) {
          if (isMounted) onViolationRef.current('MOBILE_DETECTED', 'mobile was detected')
          return
        }

        const validFaces = facePredictions.filter(p => {
            const prob = Array.isArray(p.probability) ? p.probability[0] : p.probability;
            return prob > 0.9;
        })
        
        const persons = cocoPredictions.filter(p => p.class === 'person' && p.score > 0.5)

        if (validFaces.length === 0) {
          // No face detected - check if body is also missing (camera covered or left seat)
          if (persons.length === 0) {
            if (completelyMissingStartTimeRef.current === null) {
              completelyMissingStartTimeRef.current = Date.now()
            } else if (Date.now() - completelyMissingStartTimeRef.current > 5000) {
              handleWarning('FACE_MISSING', 'You are completely out of frame or camera is covered. Please return to the camera view.')
              completelyMissingStartTimeRef.current = Date.now() // Reset timer after warning
            }
          } else {
            completelyMissingStartTimeRef.current = null // Reset completely missing timer
            // No face, but body detected - likely looking down or away
            if (missingFaceStartTimeRef.current === null) {
              missingFaceStartTimeRef.current = Date.now()
            } else {
              const timeMissing = Date.now() - missingFaceStartTimeRef.current
              // Warning if face is missing for > 2 minutes (120000ms)
              if (timeMissing > 120000) {
                handleWarning('LOOKING_DOWN', 'You have been looking away from the screen for too long.')
                missingFaceStartTimeRef.current = Date.now() // Reset timer after warning
              }
            }
          }
        } else {
          // Face is back, reset timers
          missingFaceStartTimeRef.current = null
          completelyMissingStartTimeRef.current = null
          
          if (validFaces.length > 1) {
            handleWarning('MULTIPLE_PERSONS', 'Multiple people detected in frame.')
          }
        }
      } catch (e) {
        console.error("AI Detection Error:", e)
      }
    }

    const handleWarning = (type: string, msg: string) => {
      if (!isMounted) return
      warningsRef.current += 1
      if (warningsRef.current >= 3) { // 2 warnings, 3rd time close
        onViolationRef.current('EXCESSIVE_WARNINGS', `Multiple warnings exceeded limit (${msg}). Exam auto-closed.`)
      } else {
        onViolationRef.current(type, msg) // Just a warning
      }
    }

    const handleVisibilityChange = () => {
      if (!isMounted) return
      
      if (document.hidden) {
        tabSwitchCountRef.current += 1
        const count = tabSwitchCountRef.current
        
        if (count >= 3) {
          onViolationRef.current('TAB_SWITCH_LIMIT_EXCEEDED', 'You have switched tabs 3 times. Exam terminated.')
          return
        }
        
        const allowedTime = count === 1 ? 60 : 30
        handleWarning('TAB_SWITCH', `Tab switching is not allowed. You must return within ${allowedTime} seconds. (Count: ${count}/3)`)
        
        tabSwitchTimeoutRef.current = setTimeout(() => {
          if (isMounted) {
            onViolationRef.current('TAB_SWITCH_TIMEOUT_EXCEEDED', `You were away from the exam tab for too long (>${allowedTime} seconds). Exam terminated.`)
          }
        }, allowedTime * 1000)
        
      } else {
        // Returned to tab
        if (tabSwitchTimeoutRef.current) {
          clearTimeout(tabSwitchTimeoutRef.current)
          tabSwitchTimeoutRef.current = null
        }
      }
    }

    initProctoring()

    return () => {
      isMounted = false
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop())
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current)
      if (tabSwitchTimeoutRef.current) clearTimeout(tabSwitchTimeoutRef.current)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [startProctoring])

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Permission Error</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border-2 border-primary/20 shadow-inner">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        />
        {!permissions.camera && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <Camera className="h-6 w-6 animate-pulse" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
           <div className={`h-2.5 w-2.5 rounded-full ${aiLoaded ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
           <span className="text-xs font-medium uppercase text-muted-foreground">
             {aiLoaded ? 'Engine Active' : (permissions.camera ? 'Initializing...' : 'Awaiting Permissions')}
           </span>
        </div>
        {!aiLoaded && permissions.camera && !error && (
          <p className="text-[10px] text-muted-foreground mt-1">Loading TensorFlow models...</p>
        )}
      </div>
    </div>
  )
}
