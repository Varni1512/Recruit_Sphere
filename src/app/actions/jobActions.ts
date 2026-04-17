'use server'

import connectToDatabase from "@/lib/mongodb"
import Job from "@/models/Job"
import Application from "@/models/Application"
import Notification from "@/models/Notification"
import User from "@/models/User"
import { revalidatePath } from "next/cache"
import { formatDistanceToNow } from "date-fns"
import { sendEmail } from "@/lib/email"
import { getRecruitmentEmailTemplate } from "@/lib/emailTemplates"
import { JobService } from "@/services/jobService"
import { createJobSchema } from "@/shared/schemas/jobSchema"
import { calculateATSScore } from "@/lib/atsScoring"

const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

export async function createJob(data: any) {
    try {
        const payload = data instanceof FormData ? Object.fromEntries(data.entries()) : data
        const validatedData = createJobSchema.parse(payload)
        const newJob = await JobService.createJob(validatedData)

        revalidatePath('/jobs')
        revalidatePath('/candidate/jobs')
        
        return { success: true, jobId: (newJob as any)._id.toString() }
    } catch (error: any) {
        console.error("Failed to create job:", error)
        if (error.name === "ZodError") {
            const messages = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(", ");
            return { success: false, error: `Validation failed: ${messages}` }
        }
        return { success: false, error: error.message || "An unexpected error occurred" }
    }
}

export async function getAllJobs(filterStatus?: string) {
    try {
        const query = filterStatus && filterStatus !== "all" 
            ? { status: filterStatus } 
            : {}
            
        const jobs = await JobService.getJobs(query)

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
        const job = await JobService.getJobById(id)
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
                atsKeywords: job.atsKeywords || [],
                atsCriteriaScore: job.atsCriteriaScore || 75,
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
            atsKeywords: data.atsKeywords,
            atsCriteriaScore: data.atsCriteriaScore,
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

        const job = await Job.findById(data.jobId).lean();
        if (!job) return { success: false, error: "Job not found" }

        // Check if application window is closed
        if (job.applicationCloseDate && new Date() > new Date(job.applicationCloseDate)) {
            return { success: false, error: "Applications for this job are now closed." }
        }
        
        let calculatedScore = 0; // Prevent unparseable docs from getting random passing scores
        let initialStatus = "Applied";
        let rejectionReason = "";
        let parserCrashError = ""; // Store for UI debugging

        // Perform ATS Parsing via TF-IDF ML
        if (data.resumeUrl && job && job.atsKeywords && job.atsKeywords.length > 0) {
            let parser;
            try {
                const pdfParse = require('pdf-parse');
                
                let buffer;
                if (data.resumeUrl.startsWith('http')) {
                    const pdfResponse = await fetch(data.resumeUrl, { cache: 'no-store' });
                    if (!pdfResponse.ok) {
                        throw new Error(`Failed to fetch from Cloudinary. Status: ${pdfResponse.status}`);
                    }
                    const arrayBuffer = await pdfResponse.arrayBuffer();
                    buffer = Buffer.from(arrayBuffer);
                } else {
                    const fs = require('fs');
                    const path = require('path');
                    // Remove leading slash if present, and read from public dir
                    const cleanPath = data.resumeUrl.startsWith('/') ? data.resumeUrl.slice(1) : data.resumeUrl;
                    const filePath = path.join(process.cwd(), 'public', cleanPath);
                    buffer = fs.readFileSync(filePath);
                }
                
                const result = await pdfParse(buffer);
                const pdfText = result.text || "";

                calculatedScore = calculateATSScore(pdfText, job.description || "", job.atsKeywords);
                
            } catch (error: any) {
                console.error("ATS Resume Parsing failed (Likely invalid document format or fetch error): ", error);
                calculatedScore = 0; 
                parserCrashError = error.message || "Unknown PDF parsing internal error";
            }
        }

        if (job && typeof job.atsCriteriaScore === 'number') {
            if (parserCrashError) {
                initialStatus = "Rejected";
                rejectionReason = `SYSTEM ERROR: Failed to extract text from Resume PDF. Details: ${parserCrashError}`;
            } else if (calculatedScore >= job.atsCriteriaScore) {
                initialStatus = "Shortlisted";
            } else {
                initialStatus = "Rejected";
                rejectionReason = `Resume score (${calculatedScore}%) is below the required criteria (${job.atsCriteriaScore}%). Priority keywords were missing or insufficient.`;
            }
        }

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
            resumeScore: calculatedScore,
            status: initialStatus,
            rejectionReason: rejectionReason
        })
        await newApp.save()

        // Increment candidate tracker
        await Job.findByIdAndUpdate(data.jobId, { $inc: { candidatesCount: 1 } })

        // AUTOMATED NOTIFICATIONS (SIMULATED MAIL)
        if (initialStatus === "Shortlisted") {
            await Notification.create({
                recipientEmail: data.email,
                type: 'SHORTLISTED',
                message: `Dear ${data.firstName}, congratulations! Your profile has been automatically shortlisted for the '${job.title}' role. Our system identified a great match with your skills. Please visit your dashboard to see your next steps and schedule.`,
                relatedJobId: data.jobId,
                relatedApplicationId: newApp._id.toString()
            });
        } else if (initialStatus === "Rejected") {
            await Notification.create({
                recipientEmail: data.email,
                type: 'REJECTION',
                message: `Dear ${data.firstName}, thank you for applying for '${job.title}'. After reviewing your application against our criteria, we regret to inform you that you have not been shortlisted at this time. We wish you the best in your career.`,
                relatedJobId: data.jobId,
                relatedApplicationId: newApp._id.toString()
            });
        } else {
            await Notification.create({
                recipientEmail: data.email,
                type: 'APPLICATION_RECEIVED',
                message: `Dear ${data.firstName}, thank you for your interest in Recruit Sphere! We have received your application for the '${job.title}' role. Our team will review your profile and get back to you shortly.`,
                relatedJobId: data.jobId,
                relatedApplicationId: newApp._id.toString()
            });
        }

        // Notify all recruiters
        const recruiters = await User.find({ role: 'recruiter' }, { email: 1 }).lean();
        const recruiterNotifs = recruiters.map(r => ({
            recipientEmail: r.email,
            type: 'APPLICATION_RECEIVED',
            message: `${newApp.firstName} ${newApp.lastName} applied for '${job.title}'. Status: ${initialStatus}.`,
            relatedJobId: data.jobId,
            relatedApplicationId: newApp._id.toString()
        }));
        // REAL EMAIL NOTIFICATION (SMTP)
        const emailHtml = getRecruitmentEmailTemplate({
            candidateName: data.firstName,
            role: job.title,
            status: initialStatus,
            reason: initialStatus === 'Rejected' ? rejectionReason : undefined,
            message: initialStatus === 'Shortlisted' 
                ? `Wonderful news! Your profile has been automatically shortlisted for the '${job.title}' role. Our system identified a great match with your skills. Please check your dashboard for next steps.`
                : initialStatus === 'Rejected'
                ? `Thank you for your interest in '${job.title}'. Unfortunately, you have not been shortlisted at this time. We wish you the best in your career pursuits.`
                : `Thank you for your interest in our '${job.title}' position. We have received your application and our team will review your profile shortly.`
        });

        await sendEmail({
            to: data.email,
            subject: initialStatus === 'Shortlisted' 
                ? `Great News! You've been Shortlisted at Recruit Sphere` 
                : initialStatus === 'Rejected'
                ? `Update regarding your application at Recruit Sphere`
                : `Application Received: ${job.title}`,
            html: emailHtml
        });

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
            acc[job._id.toString()] = {
                title: job.title,
                pipelineStages: job.hiringPipeline?.map((r: any) => r.roundName) || []
            };
            return acc;
        }, {} as Record<string, { title: string, pipelineStages: string[] }>);

        // Fetch corresponding users (candidates) to get their photoUrl
        const users = await User.find({ _id: { $in: apps.map(a => a.candidateId) } }).lean()
        const userMap = users.reduce((acc, user) => {
            acc[user._id.toString()] = user.photoUrl;
            return acc;
        }, {} as Record<string, string | undefined>);

        return {
            success: true,
            applications: apps.map((app: any) => ({
                 id: app._id.toString(),
                 jobId: app.jobId.toString(),
                 role: jobMap[app.jobId]?.title || "Unknown Role",
                 pipelineStages: jobMap[app.jobId]?.pipelineStages || ["Screening", "Interview"],
                 name: `${app.firstName} ${app.lastName}`,
                 photoUrl: userMap[app.candidateId.toString()] || null,
                 email: app.email,
                 mobile: app.mobile,
                 location: app.address || "Unknown",
                 status: app.status || "Applied",
                 score: typeof app.resumeScore === 'number' ? app.resumeScore : Math.floor(60 + (parseInt(app._id.toString().slice(-6), 16) % 30)),
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

        const result = {
            success: true,
            applications: apps.map((app: any) => {
                const jobIdStr = app.jobId.toString();
                const job = jobMap[jobIdStr];
                return {
                    id: app._id.toString(),
                    jobId: app.jobId.toString(),
                    role: job?.title || "Unknown Role",
                    company: job?.company === "Acme Corp" ? "Recruit Sphere" : (job?.company || "Recruit Sphere"),
                    location: job?.location || "Unknown Location",
                    candidateName: `${app.firstName} ${app.lastName}`,
                    appliedDate: app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : "recently",
                    status: app.status || "Applied",
                    rejectionReason: app.rejectionReason || "",
                    resumeScore: typeof app.resumeScore === 'number' ? app.resumeScore : Math.floor(60 + (parseInt(app._id.toString().slice(-6), 16) % 30)),
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

        return JSON.parse(JSON.stringify(result))
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
            let message = ""
            let type = 'STATUS_UPDATE'

            switch(status) {
                case 'Shortlisted':
                    type = 'SHORTLISTED'
                    message = `Congratulations ${app.firstName}! You have been shortlisted for the '${job?.title}' position at Recruit Sphere. Please check your dashboard to view the upcoming round schedule.`
                    break;
                case 'Coding Round':
                    message = `Dear ${app.firstName}, you have been invited to the Coding Round for '${job?.title}'. Please log in to the platform to start your assessment at the scheduled time.`
                    break;
                case 'Apptitude Round':
                    message = `Dear ${app.firstName}, your application for '${job?.title}' has moved to the Aptitude Round. Get ready for the next stage!`
                    break;
                case 'AI Interview Round':
                    message = `Hello ${app.firstName}, you have been selected for the AI Interview Round for '${job?.title}'. This automated session will evaluate your technical and soft skills.`
                    break;
                case 'Interview Round':
                    message = `Great news ${app.firstName}! You have been scheduled for a Technical Interview for the '${job?.title}' role. A calendar invite will follow shortly.`
                    break;
                case 'Hire':
                case 'Offer':
                    type = 'OFFER_EXTENDED'
                    message = `Fantastic news ${app.firstName}! We are pleased to extend an offer for the '${job?.title}' position. Welcome to the team!`
                    break;
                case 'Rejected':
                    type = 'REJECTION'
                    message = `Dear ${app.firstName}, thank you for your interest in the '${job?.title}' role. Unfortunately, you have not been shortlisted for this position at this time. We wish you the best of luck.`
                    break;
                default:
                    message = `Your application status for '${job?.title}' has been updated to: ${status}.`
            }

            // REAL EMAIL NOTIFICATION (SMTP)
            const emailHtml = getRecruitmentEmailTemplate({
                candidateName: app.firstName,
                role: job?.title || "Position",
                status: status,
                message: message
            });

            await sendEmail({
                to: app.email,
                subject: `Application Update: ${status} for ${job?.title || 'the job'}`,
                html: emailHtml
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
export async function hasUserAppliedToJob(jobId: string, candidateId: string) {
    try {
        await connectToDatabase()
        const app = await Application.findOne({ jobId, candidateId }).lean()
        if (app) {
            return { 
                success: true, 
                hasApplied: true, 
                status: (app as any).status, 
                rejectionReason: (app as any).rejectionReason,
                appliedAt: (app as any).createdAt
            }
        }
        return { success: true, hasApplied: false }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function getApplicationsByJobId(jobId: string) {
    try {
        await connectToDatabase()
        const apps = await Application.find({ jobId }).sort({ createdAt: -1 }).lean()
        
        // Fetch corresponding users (candidates) to get their photoUrl
        const users = await User.find({ _id: { $in: apps.map(a => a.candidateId) } }).lean()
        const userMap = users.reduce((acc, user) => {
            acc[user._id.toString()] = user.photoUrl;
            return acc;
        }, {} as Record<string, string | undefined>);

        return {
            success: true,
            applications: apps.map((app: any) => ({
                 id: app._id.toString(),
                 name: `${app.firstName} ${app.lastName}`,
                 photoUrl: userMap[app.candidateId.toString()] || null,
                 email: app.email,
                 mobile: app.mobile,
                 status: app.status || "Applied",
                 score: typeof app.resumeScore === 'number' ? app.resumeScore : Math.floor(60 + (parseInt(app._id.toString().slice(-6), 16) % 30)),
                 appliedAt: app.createdAt ? formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }) : "recently",
                 collegeYear: app.collegeYear,
                 collegeBranch: app.collegeBranch,
            }))
        }
    } catch (error: any) {
        return { success: false, error: error.message, applications: [] }
    }
}

export async function sendCandidateEmail(candidateId: string, message: string) {
    try {
        await connectToDatabase()
        const app = await Application.findById(candidateId).lean()
        if (!app) return { success: false, error: "Candidate not found" }
        
        const job = await Job.findById(app.jobId).lean()

        await Notification.create({
            recipientEmail: app.email,
            type: 'MESSAGE',
            message: message,
            relatedJobId: app.jobId.toString(),
            relatedApplicationId: app._id.toString()
        });

        // REALLY send email via SMTP
        const emailHtml = getRecruitmentEmailTemplate({
            candidateName: app.firstName,
            role: job?.title || "Job Application",
            status: "Update",
            message: message
        });

        await sendEmail({
            to: app.email,
            subject: `Update regarding your application for ${job?.title || 'a role'}`,
            html: emailHtml
        });

        return { success: true }
    } catch (error: any) {
        console.error("Failed to send candidate email:", error)
        return { success: false, error: error.message }
    }
}
