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
    aptitudeQuestions?: {
        question: string;
        questionType: 'mcq' | 'msq' | 'text';
        options: string[];
        answer: any;
        marks: number;
    }[];
    aptitudeExamWindow?: { start: Date; end: Date };
    examDuration?: number;
    codingQuestions?: {
        title: string;
        problemStatement: string;
        constraints: string;
        marks: number;
        testCases: { input: string; expectedOutput: string; isHidden: boolean; }[];
        boilerplates: { language: string; code: string; }[];
    }[];
    codingExamWindow?: { start: Date; end: Date };
    codingExamDuration?: number;
    codingQuestionsPerCandidate?: number;
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
    aptitudeQuestions: [{
        question: String,
        questionType: { type: String, enum: ['mcq', 'msq', 'text'], default: 'mcq' },
        options: [String],
        answer: mongoose.Schema.Types.Mixed, // string or string[]
        marks: { type: Number, default: 1 }
    }],
    aptitudeExamWindow: {
        start: { type: Date },
        end: { type: Date }
    },
    examDuration: { type: Number, default: 30 },
    codingQuestions: [{
        title: String,
        problemStatement: String,
        constraints: String,
        marks: { type: Number, default: 10 },
        testCases: [{ input: String, expectedOutput: String, isHidden: { type: Boolean, default: false } }],
        boilerplates: [{ language: String, code: String }]
    }],
    codingExamWindow: {
        start: { type: Date },
        end: { type: Date }
    },
    codingExamDuration: { type: Number, default: 60 },
    codingQuestionsPerCandidate: { type: Number, default: 2 },
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
}, { timestamps: true });

// Industry Best Practice: Adding indexes for high-frequency queries
JobSchema.index({ recruiterId: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ createdAt: -1 }); // Optimized for "Latest first" sorting
JobSchema.index({ department: 1 });

if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Job;
}
const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);

export default Job;
