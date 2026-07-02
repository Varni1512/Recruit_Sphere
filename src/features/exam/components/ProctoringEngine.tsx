"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle, Camera, Mic, Monitor } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'

// Need to import face-api. We will load models from CDN or public dir.
// For simplicity in this demo, we'll focus on coco-ssd for mobile phone detection
// and person detection (if no person, or >1 person).
// A full face orientation tracker is heavy, but coco-ssd can tell if "cell phone" is in frame
// and if "person" is exactly 1.

interface ProctoringEngineProps {
  onViolation: (type: string, message: string) => void
  onPermissionsGranted: () => void
  startProctoring: boolean
}

export const ProctoringEngine = ({ onViolation, onPermissionsGranted, startProctoring }: ProctoringEngineProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [permissions, setPermissions] = useState({ camera: false, screen: false })
  const [error, setError] = useState("")
  const [aiLoaded, setAiLoaded] = useState(false)
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null)
  
  // Track warnings
  const warningsRef = useRef<number>(0)
  const hasRequested = useRef(false)
  
  const streamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
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

        // 4. Load AI Model
        await tf.ready()
        modelRef.current = await cocoSsd.load()
        if (isMounted) setAiLoaded(true)

        // 5. Start AI & Audio Loop
        detectionIntervalRef.current = setInterval(() => detectViolations(analyser, dataArray), 1000) // check every 1 second

        // 5. Detect Tab Switch
        document.addEventListener('visibilitychange', handleVisibilityChange)

      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to access camera, microphone or screen.")
      }
    }

    const detectViolations = async (analyser?: AnalyserNode, dataArray?: any) => {
      if (!videoRef.current || !modelRef.current || !isMounted) return

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

        const predictions = await modelRef.current.detect(video)
        
        const persons = predictions.filter(p => p.class === 'person')
        const cellphones = predictions.filter(p => p.class === 'cell phone')

        if (persons.length === 0) {
          handleWarning('NO_PERSON', 'No face detected in camera.')
        } else if (persons.length > 1) {
          handleWarning('MULTIPLE_PERSONS', 'Multiple people detected in frame.')
        }

        if (cellphones.length > 0) {
          if (isMounted) onViolationRef.current('MOBILE_DETECTED', 'Mobile phone detected. Exam terminated.')
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
      if (document.hidden && isMounted) {
        handleWarning('TAB_SWITCH', 'Tab switching is not allowed.')
      }
    }

    initProctoring()

    return () => {
      isMounted = false
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop())
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current)
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
