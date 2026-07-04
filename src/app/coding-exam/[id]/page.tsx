import { getJobById } from "@/app/actions/jobActions"
import { CodingExamPortalClient } from "@/features/exam/components/CodingExamPortalClient"
import connectToDatabase from "@/lib/mongodb"
import Application from "@/models/Application"

export default async function CodingExamPortalPage({ params }: { params: { id: string } }) {
  const { id: applicationId } = params

  await connectToDatabase()
  const application: any = await Application.findById(applicationId).lean()

  if (!application) {
    return <div className="p-10 text-center text-xl font-bold">Application Not Found or Invalid Link</div>
  }

  // 1. Fetch Job
  const jobRes = await getJobById(application.jobId.toString())
  if (!jobRes.success || !jobRes.job) {
    return <div className="p-10 text-center text-xl font-bold">Job Not Found</div>
  }

  if (application.status !== "Coding Round" && application.status !== "Applied") {
    const isRejected = application.status === "Rejected"
    const reason = (application as any).rejectionReason

    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-xl border shadow-sm">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isRejected ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
            {isRejected ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {isRejected ? "Exam Terminated" : "Exam Completed"}
          </h2>
          <p className="text-muted-foreground">
            {isRejected && reason 
              ? `Your exam was automatically terminated. Reason: ${reason}`
              : "You have already completed this exam, or it was automatically terminated. Your results have been recorded."}
          </p>
          <a href="/candidate/dashboard" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 w-full">
            Return to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return <CodingExamPortalClient job={jobRes.job} application={application} />
}
