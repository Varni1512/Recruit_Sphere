'use server'

import { Groq } from 'groq-sdk'
import connectToDatabase from '@/lib/mongodb'
import Job from '@/models/Job'
import Application from '@/models/Application'
import User from '@/models/User'
import { sendEmail } from '@/lib/email'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Extract text from resume using pdf-parse
async function extractResumeText(resumeUrl: string) {
    try {
        const pdfParse = require('pdf-parse');
        const pdfResponse = await fetch(resumeUrl);
        const arrayBuffer = await pdfResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const pdfData = await pdfParse(buffer);
        return pdfData.text;
    } catch (e) {
        console.error("Failed to parse resume", e);
        return "Resume parsing failed. Rely on user's input.";
    }
}

export async function generateNextInterviewQuestion(
    applicationId: string,
    currentTurn: number,
    conversationHistory: { role: 'ai' | 'candidate', text: string }[]
) {
    await connectToDatabase();
    const app = await Application.findById(applicationId).lean() as any;
    if (!app) throw new Error("Application not found");
    const job = await Job.findById(app.jobId).lean() as any;
    if (!job) throw new Error("Job not found");

    // Get user skills/summary
    const user = await User.findById(app.candidateId).lean() as any;

    let resumeText = "";
    if (currentTurn === 1 || currentTurn === 2) {
        // Only fetch resume on first turns to save TPM limits (Groq has 6K TPM limit)
        resumeText = await extractResumeText(app.resumeUrl);
    }

    const systemPrompt = `
You are an expert Technical Interviewer and HR manager for Recruit Sphere.
You are conducting a strict, professional AI video interview for the role of "${job.title}".
Candidate Name: ${app.firstName} ${app.lastName}
Job Description: ${job.description}
Candidate Skills: ${user?.skills?.join(", ") || ""}
${resumeText ? `Candidate Resume Text: ${resumeText.substring(0, 1000)}` : ""}

Current Interview Turn Phase: ${currentTurn}

Phase Guide:
- Turn 0 (Intro): Greet the candidate and say "Please give me a brief introduction about yourself."
- Turn 1 (Resume/Experience): Pick something from their resume (Education, Experience, or Summary) and ask them a specific question about it.
- Turn 2 (Projects): Ask them to explain a project they've worked on that is most relevant to this role.
- Turn 3 (Cross-Question): Cross-question their project against the Job Description. (e.g. "How would your project scale to meet our JD requirement of X?").
- Turn 4 (Skills): Ask a technical question about one of their listed skills that matches the JD.
- Turn 5 (Coding Question): Give them a short, classic algorithm/coding question and ask them to explain the algorithm and write pseudo-code.
- Turn 6 (Extra/Behavioral): Ask a behavioral question or about extra-curriculars.
- Turn 7 (Wrap-up): Conclude the interview. Say "Thank you. Do you have any questions? Also, would you like to receive your interview report via email?"


Rules:
1. Speak conversationally. ALWAYS acknowledge the candidate's last answer naturally (e.g., "That's an interesting approach...", "Great answer, thanks for sharing...") BEFORE asking the next question.
2. Keep your response strictly under 2-3 short sentences.
3. Do not use Markdown formatting (like ** or *) because this will be passed to a Text-to-Speech engine.
4. Be professional but friendly.

Generate your spoken response now:
`;

    // Only send the last 4 messages to save TPM (Tokens Per Minute) limit
    const recentHistory = conversationHistory.slice(-4);
    const chatHistory = recentHistory.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.text
    }));

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: systemPrompt },
                ...chatHistory,
                // If it's the first turn, we just want the AI to speak the greeting.
                ...(chatHistory.length === 0 ? [{ role: 'user', content: "Start the interview now. Greet me and ask for my introduction." }] as any : [])
            ],
            temperature: 0.7,
            max_tokens: 150
        });

        return { success: true, text: response.choices[0]?.message?.content || "Could not generate response." };
    } catch (error: any) {
        console.error("AI Interview Gen Error:", error);
        return { success: false, error: error.message };
    }
}

export async function concludeInterview(applicationId: string, conversationHistory: { role: 'ai' | 'candidate', text: string }[], wantsReport: boolean) {
    await connectToDatabase();
    const app = await Application.findById(applicationId).lean() as any;
    const job = await Job.findById(app.jobId).lean() as any;

    const transcript = conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.text}`).join('\n\n');

    const evaluationPrompt = `
You are an expert evaluator. Below is the transcript of an AI Interview for the role of ${job.title}.
Evaluate the candidate based on their answers. 

Output ONLY a raw JSON object (no markdown, no backticks) with this structure:
{
  "overallScore": number (0-100),
  "feedback": "2-3 sentences of overall feedback",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"]
}

Transcript:
${transcript}
`;

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: evaluationPrompt }],
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        let jsonText = response.choices[0]?.message?.content || "{}";
        const evaluation = JSON.parse(jsonText);

        const newStatus = evaluation.overallScore >= 70 ? "Interview Round" : "Rejected";

        await Application.findByIdAndUpdate(applicationId, {
            aiInterviewScore: evaluation.overallScore,
            aiInterviewReport: JSON.stringify(evaluation),
            wantsReportEmail: wantsReport,
            status: newStatus
        });

        // Send Email
        const emailSubject = wantsReport ? "Your AI Interview Report - Recruit Sphere" : "Thank you for your AI Interview - Recruit Sphere";
        const reportHtml = wantsReport ? `
            <h3>Your Interview Score: ${evaluation.overallScore}/100</h3>
            <p><strong>Feedback:</strong> ${evaluation.feedback}</p>
            <p><strong>Strengths:</strong> ${evaluation.strengths.join(", ")}</p>
            <p><strong>Areas to Improve:</strong> ${evaluation.weaknesses.join(", ")}</p>
        ` : "";

        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #2563eb;">Recruit Sphere</h2>
                <p>Hi ${app.firstName},</p>
                <p>Thank you for completing the AI Interview for the <strong>${job.title}</strong> role.</p>
                ${reportHtml}
                <p>Our team will review your profile and get back to you with the next steps.</p>
                <p>Best regards,<br/>Recruit Sphere Team</p>
            </div>
        `;

        await sendEmail({
            to: app.email,
            subject: emailSubject,
            html: emailContent
        });

        return { success: true, status: newStatus };
    } catch (error: any) {
        console.error("Evaluation Error:", error);
        return { success: false, error: error.message };
    }
}
