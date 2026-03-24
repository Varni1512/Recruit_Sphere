'use server'

import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"
import bcryptjs from "bcryptjs"

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
