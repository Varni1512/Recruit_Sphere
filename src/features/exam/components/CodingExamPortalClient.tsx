"use client";

import { useState, useEffect, useRef } from "react";
import { CodingExamPortal, CodingQuestion } from "@/features/exam/components/CodingExamPortal";
import { ProctoringEngine } from "@/features/exam/components/ProctoringEngine";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldAlert, Clock, EyeOff, Eye } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { updateApplicationStatus, startExam, submitCodingExam } from "@/app/actions/jobActions";
import { reportProblem } from "@/app/actions/reportActions";

interface CodingExamPortalClientProps {
    job: any;
    application: any;
}

export function CodingExamPortalClient({ job, application }: CodingExamPortalClientProps) {
    const [permissionsGranted, setPermissionsGranted] = useState(false);
    const [examStarted, setExamStarted] = useState(false);
    const [triggerProctoring, setTriggerProctoring] = useState(false);
    const [isEngineReady, setIsEngineReady] = useState(false);
    
    const [examClosed, setExamClosed] = useState(false);
    const [examClosedReason, setExamClosedReason] = useState("");
    const [proctoringLogs, setProctoringLogs] = useState<any[]>([]);
    
    // Timer state
    const [timeLeft, setTimeLeft] = useState((job.codingExamDuration || 60) * 60); 
    const [halfTimeNotified, setHalfTimeNotified] = useState(false);
    
    // Sidebar State
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    // Final Submit State
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [examFinalized, setExamFinalized] = useState(false);
    const [warningBanner, setWarningBanner] = useState("");
    
    // Questions State
    const [questions, setQuestions] = useState<CodingQuestion[]>([]);
    const [examStats, setExamStats] = useState({ total: 0, submitted: 0, notSubmitted: 0, notVisited: 0 });

    const [windowError, setWindowError] = useState("");

    const codesRef = useRef<string[]>([]);
    const resultsRef = useRef<any[]>([]);

    const [isReporting, setIsReporting] = useState(false);
    const [reportIssue, setReportIssue] = useState("");
    const [reportSubmitted, setReportSubmitted] = useState(false);

    // Check Window and Single Attempt
    useEffect(() => {
        if (application.codingExamSubmitted) {
            setWindowError("You have already submitted this exam.");
            return;
        }
        if (application.codingExamStarted) {
            setWindowError("You have already attempted this exam. Multiple attempts are not allowed.");
            return;
        }
        if (job.codingExamWindow?.start && job.codingExamWindow?.end) {
            const now = new Date();
            const start = new Date(job.codingExamWindow.start);
            const end = new Date(job.codingExamWindow.end);
            if (now < start) {
                setWindowError(`The exam window opens at ${start.toLocaleString()}. Please return later.`);
            } else if (now > end) {
                setWindowError("The exam window has closed.");
            }
        }
    }, [application, job]);

    const proctoringLogsRef = useRef<any[]>([]);
    const handleViolationRef = useRef<((type: string, message: string) => void) | null>(null);
    const pasteAttemptCountRef = useRef(0);

    // Initialize randomized questions
    useEffect(() => {
        const pool = [...(job.codingQuestions || [])];
        // Fisher-Yates shuffle
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        
        const numQuestions = job.codingQuestionsPerCandidate || 2;
        const selectedQuestions = pool.slice(0, numQuestions);
        
        setQuestions(selectedQuestions);
        setExamStats({
            total: selectedQuestions.length,
            submitted: 0,
            notSubmitted: selectedQuestions.length,
            notVisited: Math.max(0, selectedQuestions.length - 1)
        });
    }, [job.codingQuestions, job.codingQuestionsPerCandidate]);

    const submitExamToDB = async (status: string, reason?: string) => {
        try {
            await updateApplicationStatus(application._id.toString(), status);
            // We could also record the score or reason in the database if the schema supported it, 
            // but for now, updating the status is the main requirement.
        } catch (e) {
            console.error("Failed to submit exam:", e);
        }
    };

    const handleViolation = (type: string, message: string) => {
        const newLog = { timestamp: new Date(), type, message };
        const currentLogs = [...proctoringLogsRef.current, newLog];
        proctoringLogsRef.current = currentLogs;
        setProctoringLogs(currentLogs);
        
        // Auto close conditions
        if (type === 'MOBILE_DETECTED' || type === 'EXCESSIVE_WARNINGS' || type === 'SCREEN_STOPPED' || type === 'FULLSCREEN_EXIT' || type === 'TAB_SWITCH_LIMIT_EXCEEDED' || type === 'TAB_SWITCH_TIMEOUT_EXCEEDED') {
            setExamClosed(true);
            setExamClosedReason(message);
            submitExamToDB("Rejected", message);
        }
    };

    useEffect(() => {
        handleViolationRef.current = handleViolation;
    }, [handleViolation]);

    // Timer Effect
    useEffect(() => {
        if (!examStarted || examClosed || examFinalized) return;

        const timerId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    setExamFinalized(true);
                    submitCodingExam(application._id.toString(), codesRef.current, resultsRef.current);
                    return 0;
                }
                
                // 50% time notification
                const halfTime = (job.codingExamDuration || 60) * 30;
                if (prev === halfTime && !halfTimeNotified) {
                    setWarningBanner("Warning: Half of your exam time has passed.");
                    setTimeout(() => setWarningBanner(""), 5000);
                    setHalfTimeNotified(true);
                }
                
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [examStarted, examClosed, examFinalized, halfTimeNotified, job.codingExamDuration]);

    const handlePasteAttempt = () => {
        pasteAttemptCountRef.current += 1;
        if (pasteAttemptCountRef.current >= 2) {
            if (handleViolationRef.current) handleViolationRef.current('EXCESSIVE_WARNINGS', 'You attempted to paste multiple times. Exam terminated.');
        } else {
            setWarningBanner("Copy/paste is disabled. Further attempts will terminate the exam.");
            setTimeout(() => setWarningBanner(""), 5000);
            if (handleViolationRef.current) handleViolationRef.current('PASTE_WARNING', 'Paste attempt detected and blocked.');
        }
    };

    // Disable Copy/Paste and Fullscreen check globally
    useEffect(() => {
        if (!examStarted || examFinalized) return;
        
        const blockAction = (e: ClipboardEvent | Event) => {
            e.preventDefault();
            if (e.type === 'paste') {
                handlePasteAttempt();
            }
        };
        
        const checkFullscreen = () => {
            if (!document.fullscreenElement && examStarted) {
                if (handleViolationRef.current) handleViolationRef.current('FULLSCREEN_EXIT', 'Exited full screen mode.');
            }
        };

        document.addEventListener("copy", blockAction);
        document.addEventListener("paste", blockAction);
        document.addEventListener("cut", blockAction);
        document.addEventListener("contextmenu", blockAction);
        document.addEventListener("fullscreenchange", checkFullscreen);

        return () => {
            document.removeEventListener("copy", blockAction);
            document.removeEventListener("paste", blockAction);
            document.removeEventListener("cut", blockAction);
            document.removeEventListener("contextmenu", blockAction);
            document.removeEventListener("fullscreenchange", checkFullscreen);
        };
    }, [examStarted, examFinalized]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (examClosed) {
        return (
            <div className="max-w-3xl mx-auto mt-20 p-6">
                <Alert variant="destructive">
                    <ShieldAlert className="h-6 w-6" />
                    <AlertTitle className="text-lg">Exam Terminated</AlertTitle>
                    <AlertDescription className="text-base mt-2">
                        Your exam has been automatically closed due to a proctoring violation: <br />
                        <strong>{examClosedReason}</strong>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (windowError) {
        return (
            <div className="max-w-3xl mx-auto mt-20 p-6">
                <Alert variant="destructive">
                    <ShieldAlert className="h-6 w-6" />
                    <AlertTitle className="text-lg">Access Denied</AlertTitle>
                    <AlertDescription className="text-base mt-2">
                        {windowError}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (examFinalized) {
        return (
            <div className="max-w-3xl mx-auto mt-20 p-6 text-center space-y-6">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                <h1 className="text-3xl font-bold">Exam Submitted Successfully</h1>
                <p className="text-muted-foreground">Thank you for completing the coding assessment.</p>
                <Button asChild className="mt-4">
                    <a href="/candidate/dashboard">Return to Dashboard</a>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full bg-background overflow-hidden font-sans">
            <header className="h-14 border-b flex items-center px-4 md:px-6 bg-[#181818] text-white shrink-0 shadow-sm z-10 justify-between">
                <div className="font-bold text-base md:text-lg truncate mr-4">Recruit Sphere - Coding Exam</div>
                
                {examStarted && (
                    <div className="flex items-center gap-4">
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                            className="bg-transparent border-[#444] text-white hover:bg-[#333] hidden md:flex"
                        >
                            {isSidebarVisible ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                            {isSidebarVisible ? "Hide Camera" : "Show Camera"}
                        </Button>
                        
                        <div className="flex items-center gap-2 font-mono text-lg font-semibold bg-[#2d2d2d] px-3 py-1 rounded-md border border-[#444] mr-2">
                            <Clock className={`w-4 h-4 ${timeLeft < 120 ? 'text-red-400' : 'text-emerald-400'}`} />
                            <span className={timeLeft < 120 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                        
                        <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => setShowSubmitModal(true)}
                        >
                            Submit Exam
                        </Button>
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-transparent border-[#444] text-red-400 hover:bg-red-400 hover:text-white"
                            onClick={() => setIsReporting(true)}
                        >
                            Report Issue
                        </Button>
                    </div>
                )}
            </header>

            <main className="flex-1 flex overflow-hidden relative">
                {warningBanner && (
                    <div className="absolute top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground text-center py-2 text-sm font-semibold shadow-md animate-in slide-in-from-top-2">
                        {warningBanner}
                    </div>
                )}
                <div className="flex-1 overflow-hidden relative bg-background">
                    {!examStarted ? (
                        <div className="max-w-2xl mx-auto bg-card p-8 rounded-xl border shadow-sm mt-8 relative z-10">
                            <h2 className="font-bold text-2xl mb-6 text-foreground">Welcome to your Assessment</h2>
                            
                            <div className="space-y-6">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <h3 className="font-semibold text-primary mb-2">Proctoring Requirements</h3>
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                        <li>You must grant <strong>Camera</strong>, <strong>Microphone</strong>, and <strong>Screen Share</strong> permissions.</li>
                                        <li>The AI Engine will monitor you continuously.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">Strict Rules</h3>
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-destructive/90">
                                        <li><strong>Do NOT exit full screen.</strong> Doing so will terminate the exam.</li>
                                        <li><strong>Do NOT look away</strong> from the screen for &gt; 2 minutes.</li>
                                        <li><strong>Do NOT use a mobile phone.</strong> It will automatically terminate the exam.</li>
                                        <li><strong>Do NOT switch tabs.</strong> Doing so will issue a warning (max 3).</li>
                                        <li><strong>Copy and paste is blocked.</strong></li>
                                    </ul>
                                </div>
                                
                                <div className="pt-6 border-t flex flex-col items-center">
                                    {!permissionsGranted ? (
                                        <p className="text-sm text-muted-foreground mb-4">Click below to start permission requests.</p>
                                    ) : !isEngineReady ? (
                                        <p className="text-sm text-amber-600 mb-4 font-medium animate-pulse">Initializing AI Engine... Please wait.</p>
                                    ) : (
                                        <p className="text-sm text-emerald-600 mb-4 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" /> AI Engine Ready. You may begin.
                                        </p>
                                    )}
                                    <Button 
                                        size="lg" 
                                        className="w-full sm:w-auto min-w-[200px]"
                                        disabled={permissionsGranted && !isEngineReady}
                                        onClick={async () => {
                                            if (!permissionsGranted) {
                                                setTriggerProctoring(true);
                                            } else if (isEngineReady) {
                                                const res = await startExam(application._id.toString(), 'coding');
                                                if (res.success) {
                                                    if (document.documentElement.requestFullscreen) {
                                                        document.documentElement.requestFullscreen().catch(e => console.error(e));
                                                    }
                                                    setExamStarted(true);
                                                } else {
                                                    setWindowError(res.error || "Failed to start exam.");
                                                }
                                            }
                                        }}
                                    >
                                        {!permissionsGranted ? "Grant Permissions" : isEngineReady ? "Start Assessment" : "Loading..."}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <CodingExamPortal 
                            questions={questions} 
                            onPasteAttempt={handlePasteAttempt} 
                            onExamStateChange={(stats, codes, results) => {
                                setExamStats(stats);
                                codesRef.current = codes;
                                resultsRef.current = results;
                            }}
                            onShowWarning={(msg) => {
                                setWarningBanner(msg);
                                setTimeout(() => setWarningBanner(""), 5000);
                            }}
                        />
                    )}
                </div>
                
                <aside 
                    className={`relative border-l bg-card flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 transition-all duration-300 ease-in-out ${isSidebarVisible ? 'w-80 lg:w-96 translate-x-0' : 'w-0 translate-x-full overflow-hidden border-none'}`}
                >
                    <div className="p-6 pb-2 min-w-[320px]">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">AI Proctoring</h3>
                        <ProctoringEngine 
                            onViolation={handleViolation} 
                            onPermissionsGranted={() => setPermissionsGranted(true)}
                            startProctoring={triggerProctoring}
                            onReady={() => setIsEngineReady(true)}
                        />
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto min-w-[320px]">
                        <div className="grid gap-4">
                            <div className="bg-muted p-4 rounded-lg border text-sm">
                                <p className="font-semibold mb-1">Status Logs</p>
                                <div className="space-y-2 mt-3 max-h-[300px] overflow-y-auto pr-2">
                                    {proctoringLogs.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic">No violations detected.</p>
                                    ) : (
                                        proctoringLogs.map((log, i) => (
                                            <div key={i} className="text-xs border-l-2 border-destructive pl-2 py-1">
                                                <span className="font-bold text-destructive">{log.type}</span>
                                                <p className="text-muted-foreground mt-0.5">{log.message}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>

            <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit Exam</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to finish and submit the exam? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="p-4 bg-muted rounded-lg border">
                                <div className="text-2xl font-bold text-primary">{examStats.total}</div>
                                <div className="text-xs text-muted-foreground uppercase font-semibold mt-1">Total</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg border">
                                <div className="text-2xl font-bold text-green-500">{examStats.submitted}</div>
                                <div className="text-xs text-muted-foreground uppercase font-semibold mt-1">Submitted</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg border">
                                <div className="text-2xl font-bold text-amber-500">{examStats.notSubmitted}</div>
                                <div className="text-xs text-muted-foreground uppercase font-semibold mt-1">Not Submitted</div>
                            </div>
                            <div className="p-4 bg-muted rounded-lg border">
                                <div className="text-2xl font-bold text-red-400">{examStats.notVisited}</div>
                                <div className="text-xs text-muted-foreground uppercase font-semibold mt-1">Not Visited</div>
                            </div>
                        </div>

                        <div className="space-y-2 mt-4">
                            <label className="text-sm font-medium">Type <span className="font-bold font-mono">confirm</span> to submit</label>
                            <Input 
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="confirm"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
                        <Button 
                            variant="destructive" 
                            disabled={confirmText !== 'confirm'}
                            onClick={() => {
                                setShowSubmitModal(false);
                                setExamFinalized(true);
                                submitCodingExam(application._id.toString(), codesRef.current, resultsRef.current);
                            }}
                        >
                            Final Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isReporting} onOpenChange={setIsReporting}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Report an Issue</DialogTitle>
                        <DialogDescription>
                            Describe the problem you're facing. Our team will investigate.
                        </DialogDescription>
                    </DialogHeader>
                    {!reportSubmitted ? (
                        <div className="py-4">
                            <textarea 
                                className="w-full p-3 border rounded-md min-h-[120px] bg-background text-sm"
                                placeholder="E.g. I cannot type in the editor, or my code runner is stuck..."
                                value={reportIssue}
                                onChange={(e) => setReportIssue(e.target.value)}
                            />
                        </div>
                    ) : (
                        <div className="py-8 text-center text-green-500 font-medium flex flex-col items-center">
                            <CheckCircle2 className="w-10 h-10 mb-2" />
                            Your issue has been reported.
                        </div>
                    )}
                    <DialogFooter>
                        {!reportSubmitted && (
                            <>
                                <Button variant="outline" onClick={() => setIsReporting(false)}>Cancel</Button>
                                <Button onClick={async () => {
                                    if (!reportIssue.trim()) return;
                                    await reportProblem(application._id.toString(), reportIssue);
                                    setReportSubmitted(true);
                                    setTimeout(() => {
                                        setIsReporting(false);
                                        setReportSubmitted(false);
                                        setReportIssue("");
                                    }, 2000);
                                }}>Submit Report</Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
