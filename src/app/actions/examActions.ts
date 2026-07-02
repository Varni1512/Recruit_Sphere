'use server'

import connectToDatabase from "@/lib/mongodb"
import Application from "@/models/Application"
import Job from "@/models/Job"
import { revalidatePath } from "next/cache"
import { updateApplicationStatus } from "./jobActions"

export async function submitExam(
  applicationId: string, 
  jobId: string, 
  answers: Record<number, string>, 
  proctoringLogs: any[]
) {
  try {
    await connectToDatabase()

    const job = await Job.findById(jobId).lean()
    if (!job) return { success: false, error: "Job not found" }

    const questions = job.aptitudeQuestions || []
    let marksObtained = 0
    let totalMarks = 0

    questions.forEach((q: any, index: number) => {
      totalMarks += q.marks || 1
      const candidateAnswer = answers[index]
      if (candidateAnswer && q.answer) {
        // Simple string comparison (case-insensitive for text)
        if (q.questionType === 'text') {
          if (candidateAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
            marksObtained += q.marks || 1
          }
        } else {
          if (candidateAnswer === q.answer) {
            marksObtained += q.marks || 1
          }
        }
      }
    })

    const scorePercentage = totalMarks > 0 ? (marksObtained / totalMarks) * 100 : 0

    // Determine next status based on pipeline
    const pipelineRound = job.hiringPipeline.find((r: any) => r.roundName === "Aptitude" || r.roundName === "Apptitude Round")
    const passingScore = pipelineRound?.passingScore || 60

    let newStatus = scorePercentage >= passingScore ? "AI Interview Round" : "Rejected"

    // If proctoring logs show cheating (e.g., mobile phone detected), force reject
    const cheatingLog = proctoringLogs.find(log => 
      ['CHEATING', 'MOBILE_DETECTED', 'EXCESSIVE_WARNINGS', 'SCREEN_STOPPED', 'FULLSCREEN_EXIT'].includes(log.type)
    )
    
    if (cheatingLog) {
      newStatus = "Rejected"
    }

    const rejectionReason = cheatingLog 
      ? cheatingLog.message || "Application rejected due to suspicious activity detected during the proctored exam."
      : scorePercentage < passingScore 
        ? `Aptitude score (${scorePercentage.toFixed(2)}%) did not meet the passing criteria.`
        : ""

    await Application.findByIdAndUpdate(applicationId, {
      aptitudeScore: scorePercentage,
      proctoringLogs,
      status: newStatus,
      ...(rejectionReason ? { rejectionReason } : {})
    })

    const app = await Application.findById(applicationId).lean()
    
    if (app) {
      const { sendEmail } = await import("@/lib/email");
      const { getExamCompletionTemplate } = await import("@/lib/emailTemplates");
      
      const emailHtml = getExamCompletionTemplate({
          candidateName: (app as any).firstName,
          role: job.title
      });

      await sendEmail({
          to: (app as any).email,
          subject: `Exam Completed Successfully: ${job.title}`,
          html: emailHtml
      });
    }

    // Also trigger the standard email updates via updateApplicationStatus logic if needed
    if (!cheatingLog) {
       await updateApplicationStatus(applicationId, newStatus)
    }

    revalidatePath('/candidate/jobs')
    revalidatePath(`/candidate/jobs/${jobId}`)
    
    return { success: true, score: scorePercentage, status: newStatus }
  } catch (error: any) {
    console.error("Failed to submit exam:", error)
    return { success: false, error: error.message }
  }
}
