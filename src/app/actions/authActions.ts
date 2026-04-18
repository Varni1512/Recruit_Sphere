'use server'

import { AuthService } from "@/services/authService"
import { loginSchema, registerSchema, resetPasswordSchema } from "@/shared/schemas/authSchema"
import { cookies } from "next/headers"

export async function registerCandidateAction(data: any) {
    try {
        const payload = data instanceof FormData ? Object.fromEntries(data.entries()) : data
        const validatedData = registerSchema.parse(payload)
        const user = await AuthService.register(validatedData)
        
        cookies().set('role', user.role, { path: '/' })
        cookies().set('uid', user.uid, { path: '/' })
        cookies().set('profileCompletion', String(user.profileCompletion), { path: '/' })

        return { success: true, user }
    } catch (error: any) {
        console.error("Register Error:", error)
        if (error.name === "ZodError" && error.errors) {
            const messages = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(", ");
            return { error: `Validation failed: ${messages}` }
        }
        return { error: error.message || "Failed to register" }
    }
}

export async function loginAction(data: any) {
    try {
        const payload = data instanceof FormData ? Object.fromEntries(data.entries()) : data
        const { email, password } = loginSchema.parse(payload)
        const user = await AuthService.authenticate(email, password)

        cookies().set('role', user.role, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' })
        cookies().set('uid', user.uid, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' })
        cookies().set('profileCompletion', String(user.profileCompletion), { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' })

        const safeUser = {
            uid: String(user.uid),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            role: user.role
        }

        return { success: true, user: safeUser }
    } catch (error: any) {
        console.error("Login Error:", error)
        if (error.name === "ZodError" && error.errors) {
            const messages = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(", ");
            return { error: `Validation failed: ${messages}` }
        }
        return { error: error.message || "Invalid email or password" }
    }
}

export async function syncCookiesAction(uid: string, role: string) {
    try {
        cookies().set('role', role, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' })
        cookies().set('uid', uid, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' })
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

export async function sendOTPAction(email: string) {
    try {
        await AuthService.sendPasswordResetOTP(email)
        return { success: true }
    } catch (error: any) {
        return { error: error.message || "Failed to send OTP" }
    }
}

export async function resetPasswordAction(data: any) {
    try {
        const payload = data instanceof FormData ? Object.fromEntries(data.entries()) : data
        const validatedData = resetPasswordSchema.parse(payload)
        await AuthService.resetPassword(validatedData)
        return { success: true }
    } catch (error: any) {
        console.error("Reset Password Error:", error)
        if (error.name === "ZodError" && error.errors) {
            const messages = error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(", ");
            return { error: `Validation failed: ${messages}` }
        }
        return { error: error.message || "Failed to reset password" }
    }
}

export async function logoutAction() {
    cookies().delete('role')
    cookies().delete('uid')
    return { success: true }
}

// Backward Compatibility Aliases to resolve persistent build issues
export { 
    sendOTPAction as sendOTP, 
    resetPasswordAction as resetPassword,
    registerCandidateAction as registerCandidate,
    registerCandidateAction as registerAction,
    loginAction as loginCandidate
}
