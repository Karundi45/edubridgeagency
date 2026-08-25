import mongoose, { Schema, Document, Model } from 'mongoose';
import type { NotificationType } from '@/types';

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['matching_scholarship', 'deadline_approaching', 'scholarship_updated', 'application_reminder', 'announcement'],
      required: true,
    },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>('Notification', notificationSchema);

export default Notification;
