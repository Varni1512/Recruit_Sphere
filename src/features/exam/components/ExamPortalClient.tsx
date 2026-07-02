"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ProctoringEngine } from "@/features/exam/components/ProctoringEngine"
import { ProctoredExam } from "@/features/exam/components/ProctoredExam"
import { submitExam } from "@/app/actions/examActions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldAlert, CheckCircle2 } from "lucide-react"

export const ExamPortalClient = ({ job, application }: { job: any, application: any }) => {
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [examStarted, setExamStarted] = useState(false)
  const [proctoringLogs, setProctoringLogs] = useState<any[]>([])
  const [examClosed, setExamClosed] = useState(false)
  const [examClosedReason, setExamClosedReason] = useState("")
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [triggerProctoring, setTriggerProctoring] = useState(false)

  const proctoringLogsRef = useRef<any[]>([])
  const handleViolationRef = useRef<((type: string, message: string) => void) | null>(null)

  const handleViolation = async (type: string, message: string) => {
    const newLog = { timestamp: new Date(), type, message }
    
    // Update ref immediately for accurate latest state
    const currentLogs = [...proctoringLogsRef.current, newLog]
    proctoringLogsRef.current = currentLogs
    setProctoringLogs(currentLogs)
    
    // Auto close conditions
    if (type === 'MOBILE_DETECTED' || type === 'EXCESSIVE_WARNINGS' || type === 'SCREEN_STOPPED') {
      setExamClosed(true)
      setExamClosedReason(message)
      
      // Auto-submit exam as a failure
      await submitExam(application.id, job.id, {}, currentLogs)
    }
  }

  useEffect(() => {
    handleViolationRef.current = handleViolation
  }, [handleViolation])

  // Disable Copy/Paste
  useEffect(() => {
    if (!examStarted) return;
    
    const blockAction = (e: ClipboardEvent | Event) => {
      e.preventDefault();
    }
    
    const checkFullscreen = () => {
      if (!document.fullscreenElement && examStarted) {
        if (handleViolationRef.current) handleViolationRef.current('FULLSCREEN_EXIT', 'Exiting full screen is not allowed.')
      }
    }

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
    }
  }, [examStarted])



  if (examClosed) {
    return (
      <div className="max-w-3xl mx-auto mt-20 p-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-6 w-6" />
          <AlertTitle className="text-lg">Exam Terminated</AlertTitle>
          <AlertDescription className="text-base mt-2">
            Your exam has been automatically closed due to a proctoring violation: <br />
            <strong>{examClosedReason}</strong>
            <br /><br />
            This incident has been logged and your application has been rejected.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (examSubmitted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-xl border shadow-sm">
          <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Exam Submitted!</h2>
          <p className="text-muted-foreground">
            Thank you for completing the exam. The camera access has been turned off. You will receive an email shortly with the result and the next steps.
          </p>
          <Button 
            className="w-full" 
            onClick={() => window.location.href = '/candidate/dashboard'}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      <div className="flex-1 flex flex-col relative h-full">
        {/* Header */}
        <header className="h-16 border-b flex items-center px-6 justify-between bg-card shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold">
              RS
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{job.title}</h1>
              <p className="text-xs text-muted-foreground">Candidate: {application.name}</p>
            </div>
          </div>
          {examStarted && (
             <div className="text-sm px-4 py-1.5 bg-primary/10 text-primary font-medium rounded-full">
               Exam in Progress
             </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {/* Left Panel: Instructions or Questions */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-12 relative bg-muted/10">
            {!examStarted ? (
              <div className="max-w-2xl mx-auto bg-card p-8 rounded-xl border shadow-sm mt-8">
                <h2 className="font-bold text-2xl mb-6 text-foreground">Welcome to your Assessment</h2>
                
                <div className="space-y-6">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <h3 className="font-semibold text-primary mb-2">Proctoring Requirements</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                      <li>You must grant <strong>Camera</strong>, <strong>Microphone</strong>, and <strong>Screen Share</strong> permissions.</li>
                      <li>The AI Engine on the right will monitor you continuously.</li>
                      <li>Ensure your face is clearly visible and well-lit.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Strict Rules</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-destructive/90">
                      <li><strong>Do NOT look away</strong> from the screen.</li>
                      <li><strong>Do NOT use a mobile phone.</strong> It will automatically terminate the exam.</li>
                      <li><strong>Do NOT speak or allow background noise.</strong> Audio is being actively monitored.</li>
                      <li><strong>Do NOT switch tabs.</strong> Doing so will issue a warning.</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                    <p className="text-xs text-orange-800">
                      <strong>Mac Users:</strong> Please ensure "Center Stage" (or Studio Display auto-zoom) is disabled in your Control Center before starting, as it can cause accidental framing violations.
                    </p>
                  </div>
                  
                  <div className="pt-6 border-t flex flex-col items-center">
                    {!permissionsGranted ? (
                      <p className="text-sm text-muted-foreground mb-4">Click below to start permission requests.</p>
                    ) : (
                      <p className="text-sm text-emerald-600 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Permissions granted. You may begin.
                      </p>
                    )}
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto min-w-[200px]"
                      onClick={() => {
                        if (!permissionsGranted) {
                          setTriggerProctoring(true)
                        } else {
                          // Go Fullscreen
                          if (document.documentElement.requestFullscreen) {
                            document.documentElement.requestFullscreen().catch(e => console.error(e))
                          }
                          setExamStarted(true)
                        }
                      }}
                    >
                      {permissionsGranted ? "Start Assessment" : "Grant Permissions"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto w-full">
                {(!job.aptitudeQuestions || job.aptitudeQuestions.length === 0) ? (
                   <div className="text-center py-20 bg-card rounded-xl border">
                      <h3 className="text-xl font-bold text-muted-foreground">No questions found for this exam.</h3>
                      <p className="text-sm text-muted-foreground mt-2">Please contact your recruiter.</p>
                   </div>
                ) : (
                  <ProctoredExam 
                    jobId={job.id}
                    applicationId={application.id}
                    questions={job.aptitudeQuestions}
                    durationMinutes={job.examDuration || 30}
                    proctoringLogs={proctoringLogs}
                    onComplete={() => setExamSubmitted(true)}
                  />
                )}
              </div>
            )}
          </div>
          
          {/* Right Panel: Proctoring */}
          <aside className="w-80 lg:w-96 border-l bg-card flex flex-col shrink-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20">
              <div className="p-6 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">AI Proctoring</h3>
                <ProctoringEngine 
                  onViolation={handleViolation} 
                  onPermissionsGranted={() => setPermissionsGranted(true)}
                  startProctoring={triggerProctoring}
                />
              </div>
             
             {/* Sidebar Info Area */}
             <div className="flex-1 p-4 overflow-y-auto">
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
      </div>
    </div>
  )
}
