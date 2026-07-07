'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Camera, Mic, Play, Square, Code, ShieldAlert, Monitor, CheckCircle2 } from 'lucide-react'
import { generateNextInterviewQuestion, concludeInterview } from '@/app/actions/aiInterviewActions'


export default function AIInterviewRoom() {
    const params = useParams()
    const router = useRouter()
    const applicationId = params.id as string

    const [status, setStatus] = useState<'setup' | 'running' | 'completed'>('setup')
    const [currentTurn, setCurrentTurn] = useState(0)
    const [conversation, setConversation] = useState<{ role: 'ai' | 'candidate', text: string }[]>([])
    
    // Media & UI State
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isListening, setIsListening] = useState(false)
    const [isAiSpeaking, setIsAiSpeaking] = useState(false)
    const [transcript, setTranscript] = useState("")
    const [manualText, setManualText] = useState("")
    const [isNotepadOpen, setIsNotepadOpen] = useState(false)
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
    const [pseudoCode, setPseudoCode] = useState("")
    
    // Proctoring State
    const [warnings, setWarnings] = useState(0)
    const [isMuted, setIsMuted] = useState(false)

    // STT/TTS Instances
    const recognitionRef = useRef<any>(null)
    const synthesisRef = useRef<SpeechSynthesis | null>(null)
    const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
    const isListeningRef = useRef(false)
    const accumulatedTranscriptRef = useRef("")
    const lastInterimRef = useRef("")

    useEffect(() => {
        // Initialize Web Speech APIs
        if (typeof window !== 'undefined') {
            synthesisRef.current = window.speechSynthesis;
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                
                recognitionRef.current.onresult = (event: any) => {
                    let interim = "";
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            accumulatedTranscriptRef.current += event.results[i][0].transcript + " ";
                        } else {
                            interim += event.results[i][0].transcript;
                        }
                    }
                    lastInterimRef.current = interim;
                    setTranscript(accumulatedTranscriptRef.current + interim);
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                };

                recognitionRef.current.onend = () => {
                    if (isListeningRef.current) {
                        // If it auto-stopped due to silence, save the last interim as final
                        if (lastInterimRef.current) {
                            accumulatedTranscriptRef.current += lastInterimRef.current + " ";
                            lastInterimRef.current = "";
                        }
                        try { recognitionRef.current.start() } catch(e) {}
                    }
                };
            }
        }
    }, [])

    useEffect(() => {
        if (status === 'running' && videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
        }
    }, [status, mediaStream]);

    // Proctoring hook
    useEffect(() => {
        if (status !== 'running') return;
        
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setWarnings(w => w + 1)
                alert("WARNING: Tab switching is strictly prohibited during the interview. Further violations will result in termination.")
            }
        }
        document.addEventListener("visibilitychange", handleVisibilityChange)
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
    }, [status])

    const startCamera = async () => {
        try {
            // Request Fullscreen for proctoring
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen().catch(err => console.error("Fullscreen error", err));
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            setMediaStream(stream)
            setStatus('running')
            handleAITurn(0, [])
        } catch (e) {
            alert("Camera and Microphone access is required to proceed.")
        }
    }

    const speak = (text: string, onEnd: () => void) => {
        if (!synthesisRef.current) {
            onEnd();
            return;
        }
        setIsAiSpeaking(true)
        const utterance = new SpeechSynthesisUtterance(text)
        currentUtteranceRef.current = utterance // Prevent GC bug in Chrome

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        // Find a good english female voice
        const voices = synthesisRef.current.getVoices()
        const preferredVoice = voices.find(v => 
            (v.name.includes('Female') || v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Victoria')) 
            && v.lang.includes('en')
        )
        if (preferredVoice) utterance.voice = preferredVoice
        utterance.pitch = 1.2; // slightly higher pitch
        utterance.rate = 1.05; // slightly faster conversational speed

        utterance.onend = () => {
            setIsAiSpeaking(false)
            onEnd()
        }
        utterance.onerror = (e) => {
            console.error("Speech Synthesis Error", e);
            setIsAiSpeaking(false)
            onEnd()
        }
        synthesisRef.current.speak(utterance)
    }

    const handleAITurn = async (turn: number, history: any[]) => {
        // Open notepad automatically on coding round (turn 5)
        if (turn === 5) setIsNotepadOpen(true);
        if (turn > 5 && isNotepadOpen) setIsNotepadOpen(false);

        if (turn >= 8) {
            // End of interview
            await concludeInterview(applicationId, history, false); // By default false, will handle via final interaction
            setStatus('completed')
            return;
        }

        const res = await generateNextInterviewQuestion(applicationId, turn, history)
        if (res.success && res.text) {
            const newHistory = [...history, { role: 'ai', text: res.text }]
            setConversation(newHistory as any)
            speak(res.text, () => {
                // When AI stops speaking, automatically start listening
                startListening()
            })
        } else {
            console.error("Failed to generate AI response", res.error)
        }
    }

    const startListening = () => {
        // Use ref instead of state to avoid stale closure bugs in async callbacks
        if (isListeningRef.current) return; 
        
        accumulatedTranscriptRef.current = ""
        lastInterimRef.current = ""
        setTranscript("")
        setManualText("")
        setIsListening(true)
        isListeningRef.current = true

        try {
            recognitionRef.current?.start()
        } catch(e) {
            console.log("Speech recognition start ignored", e)
        }
    }

    const stopListeningAndSubmit = () => {
        const finalText = manualText.trim() ? manualText : (accumulatedTranscriptRef.current + lastInterimRef.current);
        const finalCandidateText = finalText + (isNotepadOpen ? `\n[Candidate wrote pseudo-code]:\n${pseudoCode}` : "");
        
        if (!finalCandidateText.trim()) {
            alert("We couldn't detect your answer. Please speak clearly or type your answer in the transcript box before clicking Done.");
            return; // Don't stop listening, let them try again
        }

        setIsListening(false)
        isListeningRef.current = false
        try { recognitionRef.current?.stop(); } catch (e) {}

        const newHistory = [...conversation, { role: 'candidate', text: finalCandidateText }] as any
        setConversation(newHistory)
        
        // Check for specific 'yes' in the final round to send email report
        if (currentTurn === 7 && finalCandidateText.toLowerCase().includes('yes')) {
            concludeInterview(applicationId, newHistory, true).then(() => setStatus('completed'))
        } else {
            setCurrentTurn(c => c + 1)
            handleAITurn(currentTurn + 1, newHistory)
        }
    }

    if (status === 'setup') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full space-y-6 text-center">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <Monitor className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight mb-2">AI Interview Setup</h1>
                        <p className="text-muted-foreground text-sm">
                            You are about to begin a strictly proctored AI Video Interview. Ensure you are in a quiet room with stable internet.
                        </p>
                    </div>
                    <div className="space-y-3 text-sm text-left bg-amber-50 p-4 rounded-xl text-amber-800 border border-amber-200">
                        <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" /> Tab-switching is prohibited.</div>
                        <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" /> Camera & Mic will remain active.</div>
                        <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" /> Speak clearly into the microphone.</div>
                    </div>
                    <Button disabled className="w-full h-12 text-lg font-bold bg-muted text-muted-foreground cursor-not-allowed">
                        <Camera className="mr-2 h-5 w-5" /> Unavailable (Future Function)
                    </Button>
                </motion.div>
            </div>
        )
    }

    if (status === 'completed') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full space-y-6 text-center">
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight mb-2">Interview Completed</h1>
                        <p className="text-muted-foreground text-sm">
                            Thank you for your time. Your evaluation has been submitted to the recruitment team. You may now close this window.
                        </p>
                    </div>
                    <Button onClick={() => router.push('/candidate/dashboard')} variant="outline" className="w-full">
                        Return to Dashboard
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="h-screen w-full bg-slate-950 text-slate-50 flex flex-col overflow-hidden font-sans">
            {/* Header */}
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <span className="font-bold tracking-widest uppercase text-primary">Recruit Sphere AI</span>
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live Proctoring
                    </span>
                </div>
                {warnings > 0 && (
                    <div className="flex items-center gap-2 text-amber-500 text-sm font-bold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                        <ShieldAlert className="h-4 w-4" /> Warnings: {warnings}/3
                    </div>
                )}
            </header>

            <main className="flex-1 flex flex-col md:flex-row relative p-4 gap-4 min-h-0">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-4 min-h-0">
                    
                    {/* Video Feed Area */}
                    <div className="relative w-full aspect-video md:aspect-auto md:flex-1 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
                        
                        {/* AI Interviewer Avatar (Center) */}
                        <div className="flex flex-col items-center justify-center">
                            <div className={`relative w-40 h-40 rounded-full overflow-hidden border-4 transition-all duration-500 ${isAiSpeaking ? 'border-primary shadow-[0_0_50px_rgba(37,99,235,0.6)] scale-110' : 'border-slate-700 shadow-xl scale-100'}`}>
                                <img 
                                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop" 
                                    alt="AI Interviewer"
                                    className="w-full h-full object-cover"
                                />
                                {isAiSpeaking && (
                                    <div className="absolute inset-0 bg-primary/20 mix-blend-overlay animate-pulse"></div>
                                )}
                            </div>
                            <div className="mt-6 flex flex-col items-center">
                                <h3 className="text-lg font-bold text-slate-200 tracking-wide">Sarah (AI)</h3>
                                <p className={`text-sm mt-1 font-medium transition-colors ${isAiSpeaking ? 'text-primary' : 'text-slate-500'}`}>
                                    {isAiSpeaking ? 'Speaking...' : 'Listening...'}
                                </p>
                            </div>
                            
                            {/* AI Voice Equalizer (Only when speaking) */}
                            <div className={`mt-4 flex gap-1.5 h-8 items-end transition-opacity duration-300 ${isAiSpeaking ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="w-2 h-4 bg-primary rounded-full animate-pulse" style={{animationDuration: '0.4s'}}></div>
                                <div className="w-2 h-7 bg-primary rounded-full animate-pulse" style={{animationDuration: '0.5s', animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-3 bg-primary rounded-full animate-pulse" style={{animationDuration: '0.3s', animationDelay: '0.2s'}}></div>
                                <div className="w-2 h-8 bg-primary rounded-full animate-pulse" style={{animationDuration: '0.6s', animationDelay: '0.1s'}}></div>
                                <div className="w-2 h-5 bg-primary rounded-full animate-pulse" style={{animationDuration: '0.4s', animationDelay: '0.3s'}}></div>
                            </div>
                        </div>

                        {/* Candidate Video (Picture-in-Picture Top Right) */}
                        <div className={`absolute top-6 right-6 w-48 aspect-video bg-black rounded-xl overflow-hidden border-2 shadow-2xl transition-all duration-300 ${isListening ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'border-slate-700'}`}>
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                muted
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                            {/* Listening indicator on user video */}
                            {isListening && (
                                <div className="absolute bottom-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                                    <Mic className="h-3 w-3" /> LIVE
                                </div>
                            )}
                        </div>

                        {/* Bottom Subtitles / AI Transcript */}
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                            <div className="max-w-3xl mx-auto text-center">
                                <p className="text-sm md:text-lg font-medium text-slate-200 drop-shadow-md">
                                    {conversation.length > 0 ? conversation[conversation.length - 1]?.role === 'ai' ? conversation[conversation.length - 1]?.text : "..." : "Connecting..."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Candidate Controls */}
                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shrink-0">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="flex-1 w-full relative">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                        <Mic className="h-4 w-4" /> Your Transcript
                                    </span>
                                    {isListening ? (
                                        <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> LISTENING...
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-500">PAUSED</span>
                                    )}
                                </div>
                                <textarea 
                                    className={`w-full h-24 bg-slate-950 rounded-xl border p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${isListening ? 'border-green-500/50 text-slate-200' : 'border-slate-800 text-slate-400'}`}
                                    value={manualText !== "" ? manualText : transcript}
                                    onChange={(e) => setManualText(e.target.value)}
                                    placeholder={isListening ? "Listening... (You can also type your answer here)" : "Wait for the AI to finish..."}
                                    disabled={!isListening}
                                />
                            </div>
                            
                            <div className="shrink-0 w-full md:w-auto">
                                <Button 
                                    size="lg" 
                                    className={`w-full md:w-32 h-16 rounded-xl font-bold transition-all ${!isListening ? 'opacity-50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
                                    onClick={stopListeningAndSubmit}
                                    disabled={!isListening}
                                >
                                    <Square className="mr-2 h-5 w-5" /> Done
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sliding Notepad (Opens during Coding round) */}
                <AnimatePresence>
                    {isNotepadOpen && (
                        <motion.div 
                            initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                            animate={{ width: "40%", opacity: 1, marginLeft: "1rem" }}
                            exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                            className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col shrink-0"
                        >
                            <div className="h-14 border-b border-slate-800 flex items-center px-4 bg-slate-800/50 shrink-0">
                                <Code className="h-5 w-5 text-primary mr-2" />
                                <span className="font-bold text-sm">Pseudo-Code Notepad</span>
                            </div>
                            <textarea
                                value={pseudoCode}
                                onChange={(e) => setPseudoCode(e.target.value)}
                                placeholder="Write your pseudo-code or logical approach here..."
                                className="flex-1 w-full bg-slate-950 p-4 text-slate-300 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
