'use server'

import connectToDatabase from "@/lib/mongodb"
import Notification from "@/models/Notification"

export async function createNotification(data: {
    recipientEmail: string;
    type: string;
    message: string;
    relatedJobId?: string;
    relatedApplicationId?: string;
}) {
    try {
        await connectToDatabase()
        const newNotification = new Notification(data)
        await newNotification.save()
        return { success: true, notificationId: newNotification._id.toString() }
    } catch (error: any) {
        console.error("Failed to create notification:", error)
        return { success: false, error: error.message }
    }
}

export async function getNotifications(email: string) {
    try {
        if (!email) return { success: false, notifications: [] }
        await connectToDatabase()
        const notifications = await Notification.find({ recipientEmail: email, read: false })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean()
        
        return {
            success: true,
            notifications: notifications.map((n: any) => ({
                id: n._id.toString(),
                type: n.type,
                message: n.message,
                read: n.read,
                relatedJobId: n.relatedJobId?.toString(),
                relatedApplicationId: n.relatedApplicationId?.toString(),
                createdAt: n.createdAt.toISOString()
            }))
        }
    } catch (error: any) {
        console.error("Failed to fetch notifications:", error)
        return { success: false, error: error.message, notifications: [] }
    }
}

export async function markAsRead(notificationId: string) {
    try {
        await connectToDatabase()
        await Notification.findByIdAndUpdate(notificationId, { read: true })
        return { success: true }
    } catch (error: any) {
        console.error("Failed to mark notification as read:", error)
        return { success: false, error: error.message }
    }
}

export async function markAllAsRead(email: string) {
    try {
        if (!email) return { success: false }
        await connectToDatabase()
        await Notification.deleteMany({ recipientEmail: email })
        return { success: true }
    } catch (error: any) {
        console.error("Failed to mark all notifications as read:", error)
        return { success: false, error: error.message }
    }
}
