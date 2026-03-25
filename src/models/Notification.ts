import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
    recipientEmail: string;
    type: string; // 'JOB_POSTED', 'APPLICATION_RECEIVED', 'STATUS_UPDATE', etc.
    message: string;
    read: boolean;
    relatedJobId?: string;
    relatedApplicationId?: string;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    recipientEmail: { type: String, required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    relatedJobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: false },
    relatedApplicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: false },
    createdAt: { type: Date, default: Date.now },
});

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
