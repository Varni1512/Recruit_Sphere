'use server'

import { UserService } from "@/services/userService"
import { revalidatePath } from "next/cache"

import { cookies } from "next/headers"

export async function updateProfileInDb(uid: string, profileData: any, newCompletion?: number) {
    try {
        await UserService.updateProfile(uid, profileData)
        if (newCompletion !== undefined) {
            cookies().set('profileCompletion', String(newCompletion), { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' })
        }
        revalidatePath('/candidate/profile')
        revalidatePath('/candidate/dashboard')
        return { success: true }
    } catch (error: any) {
        console.error("Failed to update profile:", error)
        return { success: false, error: error.message }
    }
}

export async function getProfileFromDb(uid: string) {
    try {
        const user = await UserService.getProfileByUid(uid)
        if (!user) return { success: false, error: "User not found" }

        return { success: true, profile: user }
    } catch (error: any) {
        console.error("Failed to fetch profile:", error)
        return { success: false, error: error.message }
    }
}

export async function updateRecruiterProfileAction(email: string, profileData: any) {
    try {
        const user = await UserService.getProfileByEmail(email)
        if (!user) throw new Error("User not found")
        
        await UserService.updateProfile(user._id.toString(), profileData)
        revalidatePath('/profile')
        return { success: true }
    } catch (error: any) {
        console.error("Failed to update recruiter profile:", error)
        return { success: false, error: error.message }
    }
}

export async function syncCompletionCookieAction(completion: number) {
    try {
        cookies().set('profileCompletion', String(completion), { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' })
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}
