'use server'

import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"
import bcryptjs from "bcryptjs"
import { sendEmail } from "@/lib/email"

export async function registerCandidate(formData: FormData) {
    try {
        const firstName = formData.get("first-name") as string
        const lastName = formData.get("last-name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        if (!email || !password) {
            return { error: "Email and password are required" }
        }

        await connectToDatabase()

        // Check if user exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return { error: "auth/email-already-in-use" }
        }

        if (password.length < 6) {
            return { error: "auth/weak-password" }
        }

        // Hash password
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        // Create new candidate
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: "candidate"
        })

        await newUser.save()

        // Create the dummy profile payload to return to the client
        const safeUser = {
            uid: newUser._id.toString(),
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role,
        }

        return { success: true, user: safeUser }

    } catch (error: any) {
        console.error("Register Error:", error)
        return { error: error.message || "Failed to register" }
    }
}

export async function loginCandidate(formData: FormData) {
    try {
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        if (!email || !password) {
            return { error: "Email and password are required" }
        }

        await connectToDatabase()

        // Find user by email
        const user = await User.findOne({ email })
        if (!user) {
            return { error: "Invalid email or password" }
        }

        // Check password
        const isMatch = await bcryptjs.compare(password, user.password || "")
        if (!isMatch) {
            return { error: "Invalid email or password" }
        }

        // Create the payload
        const safeUser = {
            uid: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        }

        return { success: true, user: safeUser }

    } catch (error: any) {
        console.error("Login Error:", error)
        return { error: error.message || "Failed to login" }
    }
}

export async function sendOTP(email: string) {
    try {
        await connectToDatabase()
        const user = await User.findOne({ email })
        if (!user) {
            return { error: "User with this email does not exist" }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        user.resetPasswordOTP = otp
        user.resetPasswordExpires = otpExpiry
        await user.save()

        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #2563eb; margin: 0;">Recruit Sphere</h2>
                    <p style="color: #6b7280; font-size: 14px;">Elevate your hiring journey</p>
                </div>
                <h3 style="color: #1f2937; text-align: center;">Password Reset OTP</h3>
                <p style="color: #4b5563;">Hello,</p>
                <p style="color: #4b5563;">You requested to reset your password. Use the following 6-digit verification code to proceed:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827; background: #f3f4f6; padding: 15px 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        ${otp}
                    </div>
                </div>
                <p style="color: #ef4444; font-size: 14px; text-align: center;">This code will expire in 10 minutes.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                    If you did not request this email, you can safely ignore it.
                </p>
            </div>
        `

        await sendEmail({
            to: email,
            subject: "Your Password Reset OTP - Recruit Sphere",
            html: emailContent
        })

        return { success: true }
    } catch (error: any) {
        console.error("Send OTP Error:", error)
        return { error: error.message || "Failed to send OTP" }
    }
}

export async function verifyOTP(email: string, otp: string) {
    try {
        await connectToDatabase()
        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        })

        if (!user) {
            return { error: "Invalid or expired OTP" }
        }

        return { success: true }
    } catch (error: any) {
        return { error: error.message || "Verification failed" }
    }
}

export async function resetPassword(formData: FormData) {
    try {
        const email = formData.get("email") as string
        const otp = formData.get("otp") as string
        const password = formData.get("password") as string

        if (!password || password.length < 6) {
            return { error: "Password must be at least 6 characters" }
        }

        await connectToDatabase()
        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        })

        if (!user) {
            return { error: "Invalid session or expired OTP. Please start over." }
        }

        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        user.password = hashedPassword
        user.resetPasswordOTP = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        return { success: true }
    } catch (error: any) {
        console.error("Reset Password Error:", error)
        return { error: error.message || "Failed to reset password" }
    }
}
