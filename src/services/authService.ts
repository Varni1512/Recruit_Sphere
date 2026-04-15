import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"
import bcryptjs from "bcryptjs"
import { sendEmail } from "@/lib/email"
import { RegisterInput, ResetPasswordInput } from "@/shared/schemas/authSchema"

export class AuthService {
  static async register(data: RegisterInput) {
    await connectToDatabase()

    const existingUser = await User.findOne({ email: data.email.toLowerCase() })
    if (existingUser) {
      throw new Error("auth/email-already-in-use")
    }

    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(data.password, salt)

    const newUser = new User({
      ...data,
      email: data.email.toLowerCase(),
      password: hashedPassword,
    })

    await newUser.save()
    return this.toSafeUser(newUser)
  }

  static async authenticate(email: string, password: string) {
    await connectToDatabase()
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user || !user.password) {
      throw new Error("auth/invalid-credential")
    }

    const isMatch = await bcryptjs.compare(password, user.password)
    if (!isMatch) {
      throw new Error("auth/invalid-credential")
    }

    return this.toSafeUser(user)
  }

  static async sendPasswordResetOTP(email: string) {
    await connectToDatabase()
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      throw new Error("auth/user-not-found")
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
                <div style="text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">
                    ${otp}
                </div>
            </div>
            <p style="color: #ef4444; font-size: 14px; text-align: center;">This code will expire in 10 minutes.</p>
        </div>
    `

    await sendEmail({
      to: email,
      subject: "Your Password Reset OTP - Recruit Sphere",
      html: emailContent
    })

    return true
  }

  static async resetPassword(data: ResetPasswordInput) {
    await connectToDatabase()
    const user = await User.findOne({
      email: data.email.toLowerCase(),
      resetPasswordOTP: data.otp,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      throw new Error("auth/invalid-otp")
    }

    const salt = await bcryptjs.genSalt(10)
    user.password = await bcryptjs.hash(data.password, salt)
    user.resetPasswordOTP = undefined
    user.resetPasswordExpires = undefined
    
    await user.save()
    return true
  }

  private static toSafeUser(user: any) {
    return {
      uid: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      photoUrl: user.photoUrl
    }
  }
}
