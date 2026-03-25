import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role: string;
    createdAt: Date;
    phone?: string;
    location?: string;
    jobTitle?: string;
    companyName?: string;
    summary?: string;
    skills?: string[];
    portfolio?: string;
    linkedin?: string;
    github?: string;
    photoUrl?: string;
    resumeUrl?: string;
    resumeName?: string;
    experiences?: any[];
}

const UserSchema: Schema = new Schema({
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
    },
    password: {
        type: String,
        required: false, // In case we add OAuth later, though removed for now
    },
    firstName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        default: "candidate",
        enum: ["candidate", "recruiter"],
    },
    phone: String,
    location: String,
    jobTitle: String,
    companyName: String,
    summary: String,
    skills: [String],
    portfolio: String,
    linkedin: String,
    github: String,
    photoUrl: String,
    resumeUrl: String,
    resumeName: String,
    experiences: [{
        id: String,
        role: String,
        company: String,
        location: String,
        startDate: String,
        endDate: String,
        current: Boolean,
        description: String
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
