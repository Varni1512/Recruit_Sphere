'use server'

import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"
import type { CandidateProfile } from "@/lib/profileUtils"
import mongoose from "mongoose"

export async function updateProfileInDb(uid: string, profileData: Partial<CandidateProfile>) {
    try {
        if (!uid || typeof uid !== "string") {
            throw new Error("Invalid UID")
        }

        // Validate ObjectId if the mock UID hasn't forced it as a mongo ID. 
        // If the UID is a mongo ObjectId, we can cast it. Otherwise, return error.
        if (!mongoose.Types.ObjectId.isValid(uid)) {
            throw new Error("Invalid MongoDB ObjectId format for User")
        }

        await connectToDatabase()

        const user = await User.findById(uid)

        if (!user) {
            throw new Error("User not found in DB")
        }

        // Ensure fullName maps to firstName and lastName intelligently if provided,
        // or just rely entirely on the robust candidate dataset fields to fulfill the UI
        if (profileData.fullName) {
            const parts = profileData.fullName.split(" ")
            user.firstName = parts[0]
            user.lastName = parts.slice(1).join(" ")
        }

        if (profileData.phone !== undefined) user.phone = profileData.phone
        if (profileData.location !== undefined) user.location = profileData.location
        if (profileData.summary !== undefined) user.summary = profileData.summary
        if (profileData.skills !== undefined) user.skills = profileData.skills
        if (profileData.portfolio !== undefined) user.portfolio = profileData.portfolio
        if (profileData.linkedin !== undefined) user.linkedin = profileData.linkedin
        if (profileData.github !== undefined) user.github = profileData.github
        if (profileData.photoUrl !== undefined) user.photoUrl = profileData.photoUrl
        if (profileData.resumeUrl !== undefined) user.resumeUrl = profileData.resumeUrl
        if (profileData.resumeName !== undefined) user.resumeName = profileData.resumeName

        if (profileData.experiences !== undefined) {
            user.experiences = profileData.experiences.map(e => ({
                id: e.id,
                role: e.role,
                company: e.company,
                location: e.location,
                startDate: e.startDate,
                endDate: e.endDate,
                current: e.current,
                description: e.description
            }))
        }

        await user.save()
        return { success: true }
    } catch (error: any) {
        console.error("Failed to update profile in DB:", error)
        return { success: false, error: error.message }
    }
}

export async function getProfileFromDb(uid: string) {
    try {
        if (!uid || typeof uid !== "string" || !mongoose.Types.ObjectId.isValid(uid)) {
            return { success: false, error: "Invalid user identity format" }
        }

        await connectToDatabase()
        const user = await User.findById(uid).lean()

        if (!user) return { success: false, error: "User not found" }

        // Shape mongo document to CandidatesProfile interface
        const profile: Partial<CandidateProfile> = {
            fullName: user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "",
            email: user.email,
            phone: user.phone || "",
            location: user.location || "",
            summary: user.summary || "",
            skills: user.skills || [],
            portfolio: user.portfolio || "",
            linkedin: user.linkedin || "",
            github: user.github || "",
            photoUrl: user.photoUrl || "",
            resumeUrl: user.resumeUrl || "",
            resumeName: user.resumeName || "",
            experiences: user.experiences?.map((e: any) => ({
                id: String(e.id || e._id),
                role: e.role || "",
                company: e.company || "",
                location: e.location || "",
                startDate: e.startDate || "",
                endDate: e.endDate || "",
                current: Boolean(e.current),
                description: e.description || ""
            })) || []
        }

        return { success: true, profile }
    } catch (error: any) {
        console.error("Failed to fetch profile from DB:", error)
        return { success: false, error: error.message }
    }
}

export interface RecruiterProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    companyName: string;
    jobTitle: string;
    photoUrl: string;
    summary: string;
}

export async function updateRecruiterProfileInDb(email: string, profileData: Partial<RecruiterProfile>) {
    try {
        if (!email || typeof email !== "string") {
            throw new Error("Invalid Email")
        }

        await connectToDatabase()

        let user = await User.findOne({ email })

        if (!user) {
            // Upsert fallback for dynamically localAuth created users
            user = new User({ email, role: "recruiter" })
        }

        if (profileData.firstName !== undefined) user.firstName = profileData.firstName
        if (profileData.lastName !== undefined) user.lastName = profileData.lastName
        if (profileData.phone !== undefined) user.phone = profileData.phone
        if (profileData.email !== undefined) user.email = profileData.email
        if (profileData.location !== undefined) user.location = profileData.location
        if (profileData.companyName !== undefined) user.companyName = profileData.companyName
        if (profileData.jobTitle !== undefined) user.jobTitle = profileData.jobTitle
        if (profileData.summary !== undefined) user.summary = profileData.summary
        if (profileData.photoUrl !== undefined) user.photoUrl = profileData.photoUrl

        await user.save()
        return { success: true }
    } catch (error: any) {
        console.error("Failed to update recruiter profile in DB:", error)
        return { success: false, error: error.message }
    }
}

export async function getRecruiterProfileFromDb(email: string) {
    try {
        if (!email || typeof email !== "string") {
            return { success: false, error: "Invalid email identity format" }
        }

        await connectToDatabase()
        const user = await User.findOne({ email }).lean()

        if (!user) return { success: false, error: "User not found" }

        const profile: Partial<RecruiterProfile> = {
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email,
            phone: user.phone || "",
            location: user.location || "",
            companyName: user.companyName || "",
            jobTitle: user.jobTitle || "",
            summary: user.summary || "",
            photoUrl: user.photoUrl || "",
        }

        return { success: true, profile }
    } catch (error: any) {
        console.error("Failed to fetch recruiter profile from DB:", error)
        return { success: false, error: error.message }
    }
}
