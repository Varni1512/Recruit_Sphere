'use server'

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(formData: FormData) {
    try {
        const file = formData.get("file") as File
        if (!file) return { error: "No file provided" }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const ext = file.name.split('.').pop() || ""

        return new Promise<{ url: string, name: string }>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "auto",
                    public_id: `upload_${Date.now()}${ext ? '.' + ext : ''}`
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error)
                        reject({ error: "Failed to upload file" })
                    } else if (result) {
                        resolve({ url: result.secure_url, name: file.name })
                    }
                }
            )
            uploadStream.end(buffer)
        })
    } catch (error: any) {
        console.error("Upload Error:", error)
        return { error: error.message || "Failed to process upload" }
    }
}
