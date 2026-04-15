import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"
import mongoose from "mongoose"

export class UserService {
  static async getProfileByUid(uid: string) {
    if (!mongoose.Types.ObjectId.isValid(uid)) throw new Error("Invalid User ID")
    await connectToDatabase()
    const user = await User.findById(uid).lean() as any
    if (!user) return null

    // Industry Best Practice: Synthesize fullName for UI consumers
    if (!user.fullName && (user.firstName || user.lastName)) {
      user.fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim()
    }
    
    return JSON.parse(JSON.stringify(user))
  }

  static async getProfileByEmail(email: string) {
    await connectToDatabase()
    const user = await User.findOne({ email: email.toLowerCase() }).lean() as any
    if (!user) return null

    if (!user.fullName && (user.firstName || user.lastName)) {
      user.fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim()
    }

    return JSON.parse(JSON.stringify(user))
  }

  static async updateProfile(uid: string, data: any) {
    if (!mongoose.Types.ObjectId.isValid(uid)) throw new Error("Invalid User ID")
    await connectToDatabase()
    
    // Handle specific mappings like fullName -> firstName/lastName
    const updateData = { ...data }
    if (data.fullName) {
      const parts = data.fullName.split(" ")
      updateData.firstName = parts[0]
      updateData.lastName = parts.slice(1).join(" ")
      delete updateData.fullName
    }

    const user = await User.findByIdAndUpdate(uid, { $set: updateData }, { new: true }).lean()
    if (!user) throw new Error("User not found")
    return JSON.parse(JSON.stringify(user))
  }

  static async searchCandidates(query: any) {
    await connectToDatabase()
    return User.find({ role: 'candidate', ...query }).lean()
  }
}
