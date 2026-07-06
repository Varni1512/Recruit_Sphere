import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"
import bcryptjs from "bcryptjs"
import { sendEmail } from "@/lib/email"
import { RegisterInput, ResetPasswordInput } from "@/shared/schemas/authSchema"

export class AuthService {
  /**
   * Registers a new user in the system with securely hashed credentials.
   * @param {RegisterInput} data - The validated registration payload.
   * @returns {Promise<Object>} The newly created, sanitized user object.
   * @throws {Error} If the email is already registered.
   */
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

  /**
   * Authenticates a user against their email and password.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's plaintext password.
   * @returns {Promise<Object>} The authenticated, sanitized user object.
   * @throws {Error} If credentials are invalid.
   */
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

  /**
   * Generates and dispatches a one-time password (OTP) for password resets.
   * @param {string} email - The email address associated with the account.
   * @returns {Promise<boolean>} True if the OTP was successfully dispatched.
   * @throws {Error} If the user is not found.
   */
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

  /**
   * Validates an OTP and resets the user's password.
   * @param {ResetPasswordInput} data - The payload containing email, OTP, and new password.
   * @returns {Promise<boolean>} True if the password was successfully reset.
   * @throws {Error} If the OTP is invalid or expired.
   */
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

  /**
   * Sanitizes a user document by stripping sensitive information (e.g., password hashes)
   * and calculating the profile completion percentage before returning to the client.
   * @param {any} user - The raw Mongoose user document.
   * @returns {Object} The sanitized safe user profile.
   * @private
   */
  private static toSafeUser(user: any) {
    const fieldsToTrack = [
        "fullName", "email", "phone", "location",
        "summary", "skills", "portfolio", "linkedin", "github", "photoUrl", "resumeUrl", "experiences"
    ];
    let filledFields = 0;
    
    const fullName = user.firstName || user.lastName 
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() 
        : "";
        
    const profileData = {
        ...user.toObject(),
        fullName
    };

    for (const field of fieldsToTrack) {
        if (profileData[field] && (Array.isArray(profileData[field]) ? profileData[field].length > 0 : String(profileData[field]).trim() !== "")) {
            filledFields++;
        }
    }
    const profileCompletion = Math.round((filledFields / fieldsToTrack.length) * 100) || 0;

    return {
      uid: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      photoUrl: user.photoUrl,
      profileCompletion
    }
  }
}
