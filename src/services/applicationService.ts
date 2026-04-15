import connectToDatabase from "@/lib/mongodb"
import Application from "@/models/Application"
import Job from "@/models/Job"
import Notification from "@/models/Notification"
import { sendEmail } from "@/lib/email"
import { getRecruitmentEmailTemplate } from "@/lib/emailTemplates"

export class ApplicationService {
  static async applyToJob(data: any) {
    await connectToDatabase()

    const job = await Job.findById(data.jobId).lean()
    if (!job) throw new Error("Job not found")

    // Check application deadline
    if (job.applicationCloseDate && new Date() > new Date(job.applicationCloseDate)) {
      throw new Error("Applications for this job are closed")
    }

    // ATS Scoring logic
    const { score, status, reason } = await this.evaluateATSScore(data.resumeUrl, job)

    const newApp = new Application({
      ...data,
      resumeScore: score,
      status: status,
      rejectionReason: reason
    })

    await newApp.save()

    // Update job candidate count
    await Job.findByIdAndUpdate(data.jobId, { $inc: { candidatesCount: 1 } })

    // Orchestrate Notifications correctly in a production system (transactional or event-based)
    await this.notifyNewApplication(newApp, job, status, reason)

    return JSON.parse(JSON.stringify(newApp))
  }

  static async evaluateATSScore(resumeUrl: string, job: any) {
    let score = Math.floor(Math.random() * 20) + 60 // fallback
    let status = "Applied"
    let reason = ""

    if (resumeUrl && job.atsKeywords?.length > 0) {
      try {
        const pdfParse = require('pdf-parse')
        const pdfResponse = await fetch(resumeUrl)
        const arrayBuffer = await pdfResponse.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const pdfData = await pdfParse(buffer)
        const pdfText = pdfData.text.toLowerCase()

        let matches = 0
        for (const word of job.atsKeywords) {
          const safeWord = word.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const regex = new RegExp(`\\b${safeWord}\\b`, 'i')
          if (regex.test(pdfText)) matches++
        }
        
        const matchPercentage = matches / job.atsKeywords.length
        score = Math.floor(50 + (matchPercentage * 50))
      } catch (error) {
        console.error("ATS Resonance Parsing failed: ", error)
      }
    }

    if (job.atsCriteriaScore && typeof job.atsCriteriaScore === 'number') {
      if (score >= job.atsCriteriaScore) {
        status = "Shortlisted"
      } else {
        status = "Rejected"
        reason = `Resume score (${score}%) is below the requirement (${job.atsCriteriaScore}%).`
      }
    }

    return { score, status, reason }
  }

  private static async notifyNewApplication(app: any, job: any, status: string, reason: string) {
    // 1. Candidate Notification
    await Notification.create({
      recipientEmail: app.email,
      type: status === 'Shortlisted' ? 'SHORTLISTED' : (status === 'Rejected' ? 'REJECTION' : 'APPLICATION_RECEIVED'),
      message: this.getNotificationMessage(app.firstName, job.title, status, reason),
      relatedJobId: job._id.toString(),
      relatedApplicationId: app._id.toString()
    })

    // 2. Email System
    const html = getRecruitmentEmailTemplate({
      candidateName: app.firstName,
      role: job.title,
      status: status,
      reason: status === 'Rejected' ? reason : undefined,
      message: this.getNotificationMessage(app.firstName, job.title, status, reason)
    })

    await sendEmail({
      to: app.email,
      subject: this.getEmailSubject(status, job.title),
      html: html
    })
  }

  private static getNotificationMessage(name: string, title: string, status: string, reason: string) {
    if (status === "Shortlisted") return `Congratulations ${name}! You've been shortlisted for ${title}.`
    if (status === "Rejected") return `Thank you for your interest in ${title}. Unfortunately, you have not been shortlisted.`
    return `Thank you ${name}, we have received your application for ${title}.`
  }

  private static getEmailSubject(status: string, title: string) {
    if (status === 'Shortlisted') return `Great News! You've been Shortlisted for ${title}`
    if (status === 'Rejected') return `Update on your application for ${title}`
    return `Application Received: ${title}`
  }

  static async updateStatus(applicationId: string, status: string) {
      await connectToDatabase()
      const app = await Application.findByIdAndUpdate(applicationId, { status }, { new: true })
      if (!app) throw new Error("Application not found")
      
      const job = await Job.findById(app.jobId).lean()
      
      // Notify status change
      await this.notifyStatusUpdate(app, job, status)
      
      return JSON.parse(JSON.stringify(app))
  }

  private static async notifyStatusUpdate(app: any, job: any, status: string) {
      const html = getRecruitmentEmailTemplate({
          candidateName: app.firstName,
          role: job?.title || "Position",
          status: status,
          message: `Your application status for ${job?.title} has been updated to ${status}.`
      })
      
      await sendEmail({
          to: app.email,
          subject: `Status Update: ${status} for ${job?.title}`,
          html
      })
  }
}
