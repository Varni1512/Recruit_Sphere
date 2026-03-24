'use server'

import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function uploadToCloudinary(formData: FormData) {
    // Actually upload locally to bypass Cloudinary PDF viewing restrictions
    try {
        const file = formData.get("file") as File
        if (!file) return { error: "No file provided" }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const ext = file.name.split('.').pop() || "pdf"
        const safeName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_")
        const fileName = `${safeName}_${Date.now()}.${ext}`
        
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) {}

        const filePath = path.join(uploadDir, fileName)
        await writeFile(filePath, buffer)

        // Return root relative path which next.js can serve from public folder
        return { url: `/uploads/${fileName}`, name: file.name }
    } catch (error: any) {
        console.error("Upload Error:", error)
        return { error: error.message || "Failed to process upload" }
    }
}
