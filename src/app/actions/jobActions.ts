'use server'

import connectToDatabase from "@/lib/mongodb"
import Job from "@/models/Job"
import Application from "@/models/Application"
import Notification from "@/models/Notification"
import User from "@/models/User"
import { revalidatePath } from "next/cache"
import { formatDistanceToNow } from "date-fns"

const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

export async function createJob(data: any) {
    try {
        await connectToDatabase()

        // Derive some simple search tags based on title/department to fill out the UI
        const tags = [data.department, data.locationType, data.type].filter(Boolean)

        const newJob = new Job({
            title: data.title,
            department: data.department,
            type: data.type,
            locationType: data.locationType,
            location: data.location,
            description: data.description,
            company: data.company || "Recruit Sphere",
            salary: data.salary || "Competitive",
            experience: data.experience || "Mid-Level",
            tags: tags,
            status: "Active"
        })

        await newJob.save()

        // Notify all candidates about the new job
        const candidates = await User.find({ role: 'candidate' }, { email: 1 }).lean();
        const notifications = candidates.map(c => ({
            recipientEmail: c.email,
            type: 'JOB_POSTED',
            message: `A new job '${newJob.title}' has been posted by ${newJob.company}.`,
            relatedJobId: newJob._id.toString()
        }));
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        // Notify all recruiters about the new job post
        const recruiters = await User.find({ role: 'recruiter' }, { email: 1 }).lean();
        const recruiterNotifs = recruiters.map(r => ({
            recipientEmail: r.email,
            type: 'JOB_POSTED',
            message: `Job '${newJob.title}' was successfully posted.`,
            relatedJobId: newJob._id.toString()
        }));
        if (recruiterNotifs.length > 0) {
            await Notification.insertMany(recruiterNotifs);
        }

        // Tell Next.js to immediately purge the cache for the jobs pages so queries refresh in realtime
        revalidatePath('/jobs')
        revalidatePath('/candidate/jobs')
        
        return { success: true, jobId: newJob._id.toString() }
    } catch (error: any) {
        console.error("Failed to create job:", error)
        return { success: false, error: error.message }
    }
}

export async function getAllJobs(filterStatus?: string) {
    try {
        await connectToDatabase()
        
        const query = filterStatus && filterStatus !== "all" 
            ? { status: filterStatus } 
            : {}
            
        // Return latest first
        const jobs = await Job.find(query).sort({ createdAt: -1 }).lean()

        // Format for standard UI ingestion (dates, strings)
        return { 
            success: true, 
            jobs: jobs.map((job: any) => ({
                id: job._id.toString(),
                title: job.title,
                company: job.company === "Acme Corp" ? "Recruit Sphere" : (job.company || "Recruit Sphere"),
                department: capitalize(job.department),
                location: job.location,
                locationType: job.locationType,
                type: job.type,
                experience: job.experience,
                salary: job.salary,
                posted: job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : "recently",
                createdAt: job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : "recently",
                tags: (job.tags || []).map((tag: string) => capitalize(tag)),
                description: job.description,
                status: job.status,
                candidates: job.candidatesCount || 0
            }))
        }
    } catch (error: any) {
        console.error("Failed to fetch jobs:", error)
        return { success: false, error: error.message, jobs: [] }
    }
}

export async function getJobById(id: string) {
    try {
        await connectToDatabase()
        const job = await Job.findById(id).lean()
        if (!job) return { success: false, error: "Job not found" }

        return { 
            success: true, 
             job: {
                id: job._id.toString(),
                title: job.title,
                company: job.company === "Acme Corp" ? "Recruit Sphere" : (job.company || "Recruit Sphere"),
                department: capitalize(job.department),
                location: job.location,
                locationType: job.locationType,
                type: job.type,
                experience: job.experience,
                salary: job.salary,
                posted: job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : "recently",
                createdAt: job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : "recently",
                tags: (job.tags || []).map((tag: string) => capitalize(tag)),
                description: job.description,
                status: job.status,
                candidates: job.candidatesCount
            }
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function updateJobStatus(id: string, status: string) {
    try {
        await connectToDatabase()
        await Job.findByIdAndUpdate(id, { status })
        revalidatePath('/jobs')
        revalidatePath('/candidate/jobs')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function deleteJob(id: string) {
    try {
        await connectToDatabase()
        await Job.findByIdAndDelete(id)
        revalidatePath('/jobs')
        revalidatePath('/candidate/jobs')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function updateJob(id: string, data: any) {
    try {
        await connectToDatabase()
        await Job.findByIdAndUpdate(id, {
            title: data.title,
            department: data.department,
            type: data.type,
            locationType: data.locationType,
            location: data.location,
            description: data.description,
            experience: data.experience,
            salary: data.salary,
        })
        revalidatePath('/jobs')
        revalidatePath('/candidate/jobs')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function applyToJob(data: any) {
    try {
        await connectToDatabase()

        const newApp = new Application({
            jobId: data.jobId,
            candidateId: data.candidateId,
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            email: data.email,
            mobile: data.mobile,
            githubLink: data.githubLink,
            linkedinLink: data.linkedinLink,
            codolioLink: data.codolioLink,
            website: data.website,
            resumeUrl: data.resumeUrl,
            address: data.address,
            collegeYear: data.collegeYear,
            collegeBranch: data.collegeBranch,
            qualifications: data.qualifications,
            gender: data.gender,
        })
        await newApp.save()

        // Increment candidate tracker
        await Job.findByIdAndUpdate(data.jobId, { $inc: { candidatesCount: 1 } })

        // Notify the candidate
        await Notification.create({
            recipientEmail: data.email,
            type: 'APPLICATION_RECEIVED',
            message: `You have successfully applied for the job.`,
            relatedJobId: data.jobId,
            relatedApplicationId: newApp._id.toString()
        });

        // Notify all recruiters
        const recruiters = await User.find({ role: 'recruiter' }, { email: 1 }).lean();
        const jobName = await Job.findById(data.jobId, { title: 1 }).lean();
        const recruiterNotifs = recruiters.map(r => ({
            recipientEmail: r.email,
            type: 'APPLICATION_RECEIVED',
            message: `${newApp.firstName} ${newApp.lastName} applied for '${jobName?.title || 'a job'}'.`,
            relatedJobId: data.jobId,
            relatedApplicationId: newApp._id.toString()
        }));
        if (recruiterNotifs.length > 0) {
            await Notification.insertMany(recruiterNotifs);
        }

        revalidatePath('/jobs')
        revalidatePath('/candidate/jobs')
        revalidatePath(`/candidate/jobs/${data.jobId}`)
        return { success: true }
    } catch (error: any) {
        console.error("Failed applying:", error)
        return { success: false, error: error.message }
    }
}

export async function getAllApplications() {
    try {
        await connectToDatabase()
        const apps = await Application.find().sort({ createdAt: -1 }).lean()
        
        // Fetch corresponding jobs
        const jobs = await Job.find({ _id: { $in: apps.map(a => a.jobId) } }).lean()
        const jobMap = jobs.reduce((acc, job) => {
            acc[job._id.toString()] = job.title;
            return acc;
        }, {} as Record<string, string>);

        return {
            success: true,
            applications: apps.map((app: any) => ({
                id: app._id.toString(),
                jobId: app.jobId.toString(),
                role: jobMap[app.jobId] || "Unknown Role",
                name: `${app.firstName} ${app.lastName}`,
                email: app.email,
                mobile: app.mobile,
                location: app.address || "Unknown",
                status: app.status || "Applied",
                score: Math.floor(Math.random() * 20) + 80, // Mock score for now
                collegeYear: app.collegeYear,
                collegeBranch: app.collegeBranch,
                qualifications: app.qualifications,
                githubLink: app.githubLink || "#",
                linkedinLink: app.linkedinLink || "#",
                codolioLink: app.codolioLink || "#",
                website: app.website || "#",
                resumeUrl: app.resumeUrl || "#",
                appliedAt: app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : "recently",
            }))
        }
    } catch (error: any) {
        console.error("Failed to fetch applications:", error)
        return { success: false, error: error.message, applications: [] }
    }
}

export async function getCandidateApplications(candidateId: string) {
    try {
        await connectToDatabase()
        const apps = await Application.find({ candidateId }).sort({ createdAt: -1 }).lean()
        
        // Fetch corresponding jobs
        const jobs = await Job.find({ _id: { $in: apps.map(a => a.jobId) } }).lean()
        const jobMap = jobs.reduce((acc, job) => {
            acc[job._id.toString()] = job;
            return acc;
        }, {} as Record<string, any>);

        return {
            success: true,
            applications: apps.map((app: any) => {
                const job = jobMap[app.jobId];
                return {
                    id: app._id.toString(),
                    jobId: app.jobId.toString(),
                    role: job?.title || "Unknown Role",
                    company: job?.company === "Acme Corp" ? "Recruit Sphere" : (job?.company || "Recruit Sphere"),
                    location: job?.location || "Unknown Location",
                    appliedDate: app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : "recently",
                    status: app.status || "Applied",
                    resumeScore: Math.floor(Math.random() * 20) + 80, // Mock score
                    pipeline: ["Applied", "Shortlisted", "Coding Round", "Apptitude Round", "AI Interview Round", "Interview Round", "Hire"],
                    currentStageIndex: app.status === "Applied" ? 0 : 
                                       app.status === "Shortlisted" ? 1 : 
                                       app.status === "Coding Round" ? 2 : 
                                       app.status === "Apptitude Round" ? 3 : 
                                       app.status === "AI Interview Round" ? 4 : 
                                       app.status === "Interview Round" ? 5 : 
                                       (app.status === "Hire" || app.status === "Offer" || app.status === "Hired") ? 6 : 
                                       app.status === "Rejected" ? -1 : 0,
                }
            })
        }
    } catch (error: any) {
        console.error("Failed to fetch candidate applications:", error)
        return { success: false, error: error.message, applications: [] }
    }
}

export async function updateApplicationStatus(id: string, status: string) {
    try {
        await connectToDatabase()
        const app = await Application.findByIdAndUpdate(id, { status })
        if (app) {
            const job = await Job.findById(app.jobId).lean()
            await Notification.create({
                recipientEmail: app.email,
                type: 'STATUS_UPDATE',
                message: `Your application for '${job?.title || 'the job'}' has been updated to: ${status}.`,
                relatedJobId: app.jobId.toString(),
                relatedApplicationId: app._id.toString(),
            });
        }
        revalidatePath('/candidates')
        revalidatePath('/candidate/jobs')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function withdrawApplication(id: string) {
    try {
        await connectToDatabase()
        const app = await Application.findById(id)
        if (app) {
            await Job.findByIdAndUpdate(app.jobId, { $inc: { candidatesCount: -1 } })
            await Application.findByIdAndDelete(id)
            revalidatePath('/candidate/applications')
            revalidatePath('/candidate/dashboard')
            revalidatePath('/candidates')
            return { success: true }
        }
        return { success: false, error: "Application not found" }
    } catch (error: any) {
        console.error("Failed to withdraw application:", error)
        return { success: false, error: error.message }
    }
}
