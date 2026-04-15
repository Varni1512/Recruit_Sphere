import connectToDatabase from "@/lib/mongodb"
import Notification from "@/models/Notification"

export class NotificationService {
  static async createNotification(data: {
    recipientEmail: string;
    type: string;
    message: string;
    relatedJobId?: string;
    relatedApplicationId?: string;
  }) {
    await connectToDatabase()
    return Notification.create(data)
  }

  static async getNotificationsForUser(email: string) {
    await connectToDatabase()
    return Notification.find({ recipientEmail: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
  }

  static async markAsRead(notificationId: string) {
    await connectToDatabase()
    return Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true })
  }

  static async markAllAsRead(email: string) {
    await connectToDatabase()
    return Notification.updateMany({ recipientEmail: email.toLowerCase(), read: false }, { read: true })
  }
}
