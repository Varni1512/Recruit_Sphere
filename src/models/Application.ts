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
    status: string; // "Pending", "Reviewed", "Rejected", "Accepted"
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
    status: { type: String, default: "Applied", enum: ["Applied", "Pending", "Reviewed", "Rejected", "Accepted", "Shortlisted", "Coding Round", "Apptitude Round", "AI Interview Round", "Interview Round", "Hire"] },
    createdAt: { type: Date, default: Date.now }
});

const Application: Model<IApplication> = mongoose.models.Application || mongoose.model<IApplication>("Application", ApplicationSchema);

export default Application;
