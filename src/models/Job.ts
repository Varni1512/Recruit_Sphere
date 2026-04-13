import mongoose, { Document, Model, Schema } from "mongoose";

export interface IJob extends Document {
    title: string;
    department: string;
    type: string; // "Full-time", "Part-time", "Contract", "Internship"
    locationType: string; // "Remote", "Hybrid", "On-site"
    location: string;
    description: string;
    status: string; // "Active", "Paused", "Closed"
    candidatesCount: number;
    company: string;
    experience: string;
    salary: string;
    tags: string[];
    atsKeywords: string[];
    atsCriteriaScore: number;
    deadline?: Date;
    applicationCloseDays: number;
    hiringDeadlineDays: number;
    applicationCloseDate?: Date;
    hiringPipeline: {
        roundName: string;
        totalScore: number;
        passingScore: number;
    }[];
    roundSchedule: {
        roundName: string;
        date: Date;
    }[];
    createdAt: Date;
    recruiterId?: string;
}

const JobSchema: Schema = new Schema({
    title: { type: String, required: true },
    department: { type: String, required: true },
    type: { type: String, required: true },
    locationType: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: "Active", enum: ["Active", "Paused", "Closed"] },
    candidatesCount: { type: Number, default: 0 },
    company: { type: String, default: "Acme Corp" }, // Mocked until advanced company profiles
    experience: { type: String, default: "Mid-Level" },
    salary: { type: String, default: "Competitive" },
    tags: { type: [String], default: [] },
    atsKeywords: { type: [String], default: [] },
    atsCriteriaScore: { type: Number, default: 75 },
    deadline: { type: Date },
    applicationCloseDays: { type: Number, default: 7 },
    hiringDeadlineDays: { type: Number, default: 30 },
    applicationCloseDate: { type: Date },
    hiringPipeline: [{
        roundName: String,
        totalScore: Number,
        passingScore: Number
    }],
    roundSchedule: [{
        roundName: String,
        date: Date
    }],
    createdAt: { type: Date, default: Date.now },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }
});

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);

export default Job;
