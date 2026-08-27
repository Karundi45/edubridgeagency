import mongoose, { Schema, Document, Model } from 'mongoose';
import type { DegreeLevel } from '@/types';
import crypto from 'crypto';

export interface INewsletterSubscriberDocument extends Document {
  email: string;
  country?: string;
  preferredDegree?: DegreeLevel;
  preferredField?: string;
  unsubscribeToken: string;
  subscribedAt: Date;
  active: boolean;
}

const newsletterSubscriberSchema = new Schema<INewsletterSubscriberDocument>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  country: { type: String },
  preferredDegree: {
    type: String,
    enum: ['undergraduate', 'masters', 'phd', 'diploma', 'certificate', 'postdoctoral', 'fellowship'],
  },
  preferredField: { type: String },
  unsubscribeToken: {
    type: String,
    default: () => crypto.randomBytes(32).toString('hex'),
    select: false,
  },
  subscribedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
});


newsletterSubscriberSchema.index({ active: 1 });

const NewsletterSubscriber: Model<INewsletterSubscriberDocument> =
  mongoose.models.NewsletterSubscriber ||
  mongoose.model<INewsletterSubscriberDocument>('NewsletterSubscriber', newsletterSubscriberSchema);

export default NewsletterSubscriber;
