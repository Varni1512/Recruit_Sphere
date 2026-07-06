import connectToDatabase from "@/lib/mongodb"
import Job from "@/models/Job"
import User from "@/models/User"
import Notification from "@/models/Notification"
import { CreateJobInput } from "@/shared/schemas/jobSchema"

export class JobService {
  /**
   * Creates a new job posting and calculates the automated round schedules.
   * @param {CreateJobInput} data - The validated job creation payload.
   * @returns {Promise<Object>} The newly created job document.
   */
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
      tags,
      applicationCloseDate,
      deadline: deadlineDate,
      hiringPipeline: selectedRounds,
      roundSchedule,
      status: "Active"
    })

    await newJob.save()

    await this.notifyRelevantUsers(newJob)

    return JSON.parse(JSON.stringify(newJob))
  }

  /**
   * Distributes the hiring pipeline rounds evenly across the active hiring window.
   * @param {any[]} pipeline - Array of selected pipeline rounds.
   * @param {Date} startDate - The date after applications close.
   * @param {number} windowDays - Total days allocated for pipeline execution.
   * @returns {Object[]} Array of scheduled round dates.
   * @private
   */
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

  /**
   * Dispatches automated notifications to relevant candidates and recruiters
   * upon successful job creation.
   * @param {any} job - The job document that was created.
   * @private
   */
  private static async notifyRelevantUsers(job: any) {
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

  /**
   * Synchronizes active job statuses by automatically closing expired jobs.
   * This acts as an automated background reconciliation mechanism.
   * @returns {Promise<void>}
   */
  static async syncJobStatuses() {
    await connectToDatabase()
    const now = new Date()
    
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

  /**
   * Retrieves a list of jobs based on the provided filter criteria.
   * Forces a status synchronization before querying to ensure fresh data.
   * @param {any} filter - Optional Mongoose query filter.
   * @returns {Promise<Object[]>} Array of job documents.
   */
  static async getJobs(filter?: any) {
    await connectToDatabase()
    await this.syncJobStatuses()
    
    const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean()
    return JSON.parse(JSON.stringify(jobs))
  }

  /**
   * Retrieves a single job document by its unique identifier.
   * Forces a status synchronization before querying.
   * @param {string} id - The MongoDB ObjectId of the job.
   * @returns {Promise<Object|null>} The job document or null if not found.
   */
  static async getJobById(id: string) {
    await connectToDatabase()
    await this.syncJobStatuses()
    
    const job = await Job.findById(id).lean()
    return job ? JSON.parse(JSON.stringify(job)) : null
  }
}
