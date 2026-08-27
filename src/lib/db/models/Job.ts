import mongoose, { Schema, Document, Model } from 'mongoose';
import { IJob } from '@/types/job';

export interface IJobDocument extends Omit<IJob, '_id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const LocalizedStringSchema = new Schema({
  en: { type: String, required: true },
  fr: { type: String }
}, { _id: false });

const jobSchema = new Schema<IJobDocument>({
  title: { type: LocalizedStringSchema, required: true },
  slug: { type: String, required: true, unique: true },
  company: { type: String, required: true },
  companyLogo: { type: String },
  location: { type: String, required: true },
  province: { type: String, required: true },
  employmentType: [{ type: String, required: true }],
  category: [{ type: String, required: true }],
  experienceLevel: { type: String, required: true },
  educationRequirement: { type: LocalizedStringSchema, required: true },
  salary: { type: String },

  description: { type: LocalizedStringSchema, required: true },
  responsibilities: [{ type: String }],
  requirements: [{ type: String }],
  skills: [{ type: String }],
  benefits: [{ type: String }],

  applicationInstructions: { type: LocalizedStringSchema, required: true },
  applicationEmail: { type: String },
  applicationUrl: { type: String },
  deadline: { type: Date },

  featuredImage: { type: String },
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'published', 'expired'], default: 'draft' },

  metrics: {
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    outboundClicks: { type: Number, default: 0 }
  },

  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Indexes for search and filtering
jobSchema.index({ status: 1, deadline: 1 });
jobSchema.index({ 'title.en': 'text', company: 'text', location: 'text', 'tags': 'text' });
jobSchema.index({ province: 1, category: 1 });
jobSchema.index({ isFeatured: -1, createdAt: -1 });

const Job: Model<IJobDocument> = mongoose.models.Job || mongoose.model<IJobDocument>('Job', jobSchema);

export default Job;
