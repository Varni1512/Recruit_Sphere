import mongoose, { Document, Model, Schema } from "mongoose";

export interface IApplication extends Document {
    jobId: mongoose.Types.ObjectId;
    candidateId: mongoose.Types.ObjectId;
    firstName: string;
    middleName?: string;
    lastName: string;
    mobile: string;
    email: string;
    githubLink?: string;
    linkedinLink?: string;
    codolioLink?: string;
    website?: string;
    resumeUrl: string; // Cloudinary URL
    address: string;
    collegeYear: string;
    collegeBranch: string;
    qualifications: string;
    gender: string;
    resumeScore: number;
    aptitudeScore: number;
    codingScore: number;
    aiInterviewScore: number;
    aiInterviewReport?: string;
    wantsReportEmail?: boolean;
    technicalInterviewScore: number;
    finalInterviewScore: number;
    proctoringLogs?: {
        timestamp: Date;
        type: string;
        message: string;
    }[];
    aptitudeExamStarted?: boolean;
    codingExamStarted?: boolean;
    aptitudeExamSubmitted?: boolean;
    codingExamSubmitted?: boolean;
    codingFeedback?: string;
    status: string; // "Pending", "Reviewed", "Rejected", "Accepted"
    rejectionReason?: string;
    createdAt: Date;
}

const ApplicationSchema: Schema = new Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    firstName: { type: String, required: true },
    middleName: { type: String, required: false },
    lastName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    githubLink: { type: String, required: false },
    linkedinLink: { type: String, required: false },
    codolioLink: { type: String, required: false },
    website: { type: String, required: false },
    resumeUrl: { type: String, required: true },
    address: { type: String, required: true },
    collegeYear: { type: String, required: true },
    collegeBranch: { type: String, required: true },
    qualifications: { type: String, required: true },
    gender: { type: String, required: true },
    resumeScore: { type: Number, default: 0 },
    aptitudeScore: { type: Number, default: 0 },
    codingScore: { type: Number, default: 0 },
    aiInterviewScore: { type: Number, default: 0 },
    aiInterviewReport: { type: String, required: false },
    wantsReportEmail: { type: Boolean, default: false },
    technicalInterviewScore: { type: Number, default: 0 },
    finalInterviewScore: { type: Number, default: 0 },
    proctoringLogs: [{
        timestamp: { type: Date, default: Date.now },
        type: String,
        message: String
    }],
    aptitudeExamStarted: { type: Boolean, default: false },
    codingExamStarted: { type: Boolean, default: false },
    aptitudeExamSubmitted: { type: Boolean, default: false },
    codingExamSubmitted: { type: Boolean, default: false },
    codingFeedback: { type: String, default: "" },
    status: { type: String, default: "Applied", enum: ["Applied", "Pending", "Reviewed", "Rejected", "Accepted", "Shortlisted", "Coding Round", "Apptitude Round", "AI Interview Round", "Interview Round", "Hire"] },
    rejectionReason: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Performance Tuning: Indexes for fast filtering and ranking
ApplicationSchema.index({ jobId: 1 });
ApplicationSchema.index({ candidateId: 1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ createdAt: -1 });
ApplicationSchema.index({ resumeScore: -1 }); // Fast sorting of top candidates

if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Application;
}
const Application: Model<IApplication> = mongoose.models.Application || mongoose.model<IApplication>("Application", ApplicationSchema);

export default Application;
