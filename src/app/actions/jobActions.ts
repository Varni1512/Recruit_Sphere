'use server'

import connectToDatabase from "@/lib/mongodb"
import Job from "@/models/Job"
import Application from "@/models/Application"
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

        revalidatePath('/jobs')
        revalidatePath('/candidate/jobs')
        revalidatePath(`/candidate/jobs/${data.jobId}`)
        return { success: true }
    } catch (error: any) {
        console.error("Failed applying:", error)
        return { success: false, error: error.message }
    }
}
