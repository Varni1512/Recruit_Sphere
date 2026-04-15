'use server'

import { ApplicationService } from "@/services/applicationService"
import { revalidatePath } from "next/cache"

export async function applyToJobAction(data: any) {
    try {
        await ApplicationService.applyToJob(data)
        revalidatePath('/jobs')
        revalidatePath('/candidate/applications')
        return { success: true }
    } catch (error: any) {
        console.error("Failed to apply:", error)
        return { success: false, error: error.message }
    }
}

export async function updateApplicationStatusAction(id: string, status: string) {
    try {
        await ApplicationService.updateStatus(id, status)
        revalidatePath('/candidates')
        revalidatePath('/candidate/applications')
        return { success: true }
    } catch (error: any) {
        console.error("Failed to update application status:", error)
        return { success: false, error: error.message }
    }
}
