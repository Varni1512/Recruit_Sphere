import connectToDatabase from "@/lib/mongodb"
import Job from "@/models/Job"
import User from "@/models/User"
import Notification from "@/models/Notification"
import { CreateJobInput } from "@/shared/schemas/jobSchema"

export class JobService {
  static async createJob(data: CreateJobInput) {
    await connectToDatabase()

    const applicationCloseDays = data.applicationCloseDays
    const hiringDeadlineDays = data.hiringDeadlineDays
    
    const applicationCloseDate = new Date()
    applicationCloseDate.setDate(applicationCloseDate.getDate() + applicationCloseDays)
    
    const deadlineDate = new Date()
    deadlineDate.setDate(deadlineDate.getDate() + hiringDeadlineDays)

    const selectedRounds = data.hiringPipeline.filter((r: any) => r.selected !== false)

    const roundSchedule = this.calculateRoundSchedule(
      selectedRounds, 
      applicationCloseDate, 
      hiringDeadlineDays - applicationCloseDays
    )

    const tags = [data.department, data.locationType, data.type].filter(Boolean)

    const newJob = new Job({
      ...data,
      company: "Recruit Sphere",
      tags,
      applicationCloseDate,
      deadline: deadlineDate,
      hiringPipeline: selectedRounds,
      roundSchedule,
      status: "Active"
    })

    await newJob.save()

    // Trigger Notifications asynchronously (or via internal events)
    await this.notifyRelevantUsers(newJob)

    return JSON.parse(JSON.stringify(newJob))
  }

  private static calculateRoundSchedule(pipeline: any[], startDate: Date, windowDays: number) {
    if (pipeline.length === 0) return []
    
    const daysPerRound = Math.max(1, Math.floor(windowDays / pipeline.length))
    return pipeline.map((round, index) => {
      const roundDate = new Date(startDate)
      roundDate.setDate(roundDate.getDate() + (daysPerRound * (index + 1)))
      return {
        roundName: round.roundName,
        date: roundDate
      }
    })
  }

  private static async notifyRelevantUsers(job: any) {
    // Candidates notification
    const candidates = await User.find({ role: 'candidate' }, { email: 1 }).lean()
    const notifications = candidates.map(c => ({
      recipientEmail: c.email,
      type: 'JOB_POSTED',
      message: `A new job '${job.title}' has been posted by ${job.company}.`,
      relatedJobId: job._id.toString()
    }))

    if (notifications.length > 0) {
      await Notification.insertMany(notifications)
    }

    // Recruiter self-notification
    const recruiters = await User.find({ role: 'recruiter' }, { email: 1 }).lean()
    const recruiterNotifs = recruiters.map(r => ({
      recipientEmail: r.email,
      type: 'JOB_POSTED',
      message: `Job '${job.title}' was successfully posted.`,
      relatedJobId: job._id.toString()
    }))

    if (recruiterNotifs.length > 0) {
      await Notification.insertMany(recruiterNotifs)
    }
  }

  static async syncJobStatuses() {
    await connectToDatabase()
    const now = new Date()
    
    // Update all Active jobs that have passed their applicationCloseDate to Closed
    const result = await Job.updateMany(
      { 
        status: "Active", 
        applicationCloseDate: { $lt: now } 
      }, 
      { 
        $set: { status: "Closed" } 
      }
    )
    
    if (result.modifiedCount > 0) {
      console.log(`Automatically closed ${result.modifiedCount} expired jobs.`)
    }
  }

  static async getJobs(filter?: any) {
    await connectToDatabase()
    // Sync statuses before fetching
    await this.syncJobStatuses()
    
    const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean()
    return JSON.parse(JSON.stringify(jobs))
  }

  static async getJobById(id: string) {
    await connectToDatabase()
    // Sync statuses before fetching
    await this.syncJobStatuses()
    
    const job = await Job.findById(id).lean()
    return job ? JSON.parse(JSON.stringify(job)) : null
  }
}
