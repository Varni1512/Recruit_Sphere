'use server'

import { sendEmail } from "@/lib/email"
import { getRecruitmentEmailTemplate } from "@/lib/emailTemplates"
import Job from "@/models/Job"
import Application from "@/models/Application"
import connectToDatabase from "@/lib/mongodb"

export async function reportProblem(applicationId: string, issue: string) {
    try {
        await connectToDatabase();
        const application = await Application.findById(applicationId);
        if (!application) throw new Error("Application not found");
        
        const job = await Job.findById(application.jobId).lean();
        
        const emailHtml = getRecruitmentEmailTemplate({
            candidateName: "Admin",
            role: "System Admin",
            status: "Issue Reported",
            message: `A candidate has reported an issue during their exam.<br/><br/>
            <b>Candidate:</b> ${application.firstName} ${application.lastName} (${application.email})<br/>
            <b>Job:</b> ${job?.title}<br/>
            <b>Issue Description:</b><br/>
            ${issue}`
        });

        // Send to an admin email (hardcoded for now, or use a config var)
        await sendEmail({ 
            to: "varni1505@gmail.com", // Send to admin
            subject: `Exam Issue Reported by ${application.firstName} ${application.lastName}`, 
            html: emailHtml 
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
