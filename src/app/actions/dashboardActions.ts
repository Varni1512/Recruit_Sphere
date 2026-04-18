'use server'

import connectToDatabase from "@/lib/mongodb"
import Job from "@/models/Job"
import Application from "@/models/Application"
import User from "@/models/User"
import { JobService } from "@/services/jobService"

export async function getDashboardStats() {
    try {
        await connectToDatabase()

        // Sync job statuses to ensure accuracy
        await JobService.syncJobStatuses()

        const [
            totalJobs,
            totalCandidates,
            interviewsScheduled,
            offersAccepted
        ] = await Promise.all([
            Job.countDocuments({ status: "Active" }),
            User.countDocuments({ role: 'candidate' }),
            Application.countDocuments({ status: { $in: ['Interview', 'Interviewing', 'Interview Round'] } }),
            Application.countDocuments({ status: { $in: ['Offer', 'Hired', 'Hire'] } })
        ])

        // Get recent applications (limit 5)
        const recentAppsRaw = await Application.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean()
        
        // Fetch corresponding jobs for recent apps
        const jobIds = recentAppsRaw.map(app => app.jobId)
        const jobs = await Job.find({ _id: { $in: jobIds } }).lean()
        const jobMap = jobs.reduce((acc, job) => {
            acc[job._id.toString()] = job.title;
            return acc;
        }, {} as Record<string, string>);

        const recentApplications = recentAppsRaw.map((app: any) => ({
            id: app._id.toString(),
            name: `${app.firstName} ${app.lastName}`,
            email: app.email,
            role: jobMap[app.jobId] || "Unknown Role",
            status: app.status || "Applied",
            date: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "recently",
            avatar: `${app.firstName.charAt(0)}${app.lastName.charAt(0)}`.toUpperCase(),
            appliedAt: app.createdAt ? new Date(app.createdAt).getTime() : 0
        }))

        // Chart data: past 12 months applications count
        const currentDate = new Date()
        const chartData: { monthIndex: number, year: number, name: string, total: number }[] = []
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        
        // We will make a simple 12-month array
        for (let i = 11; i >= 0; i--) {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
            const monthName = months[d.getMonth()]
            chartData.push({ monthIndex: d.getMonth(), year: d.getFullYear(), name: monthName, total: 0 })
        }

        // Aggregate from MongoDB
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 11, 1)
        const appsAgg = await Application.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { 
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            }
        ])

        // Populate counts into chartData
        appsAgg.forEach((agg: any) => {
            // MongoDB $month is 1-12, js getMonth is 0-11
            const monthIdx = agg._id.month - 1
            const year = agg._id.year
            const entry = chartData.find(c => c.monthIndex === monthIdx && c.year === year)
            if (entry) {
                entry.total = agg.count
            }
        })

        return {
            success: true,
            data: {
                totalJobs,
                totalCandidates,
                interviewsScheduled,
                offersAccepted,
                recentApplications,
                chartData: chartData.map(c => ({ name: c.name, total: c.total }))
            }
        }
    } catch (error: any) {
        console.error("Failed to fetch dashboard stats:", error)
        return { 
            success: false, 
            error: error.message,
            data: {
                totalJobs: 0,
                totalCandidates: 0,
                interviewsScheduled: 0,
                offersAccepted: 0,
                recentApplications: [],
                chartData: []
            }
        }
    }
}
