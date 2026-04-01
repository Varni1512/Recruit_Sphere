'use server'

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function uploadToCloudinary(formData: FormData) {
    try {
        const file = formData.get("file") as File
        if (!file) return { error: "No file provided" }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const ext = file.name.split('.').pop()?.toLowerCase() || "pdf"
        const isPdf = ext === 'pdf'
        const safeName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_")
        
        // Upload to Cloudinary using upload_stream
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: isPdf ? 'raw' : 'auto',
                    folder: 'recruit_sphere_uploads',
                    // Force the filename to include the correct extension for raw resources
                    public_id: `${safeName}_${Date.now()}${isPdf ? '.pdf' : ''}`
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            )
            uploadStream.end(buffer)
        })

        const uploadResult = result as any

        return { url: uploadResult.secure_url, name: file.name }
    } catch (error: any) {
        console.error("Upload Error:", error)
        return { error: error.message || "Failed to process upload" }
    }
}
