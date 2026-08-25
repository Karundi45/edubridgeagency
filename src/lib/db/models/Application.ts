import mongoose, { Schema, Document, Model } from 'mongoose';
import type { ApplicationStatus } from '@/types';

export interface IApplicationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  opportunityId?: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  notes?: string;
  documents?: string[];
  deadline?: Date;
  reminderDays?: number[];
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplicationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity' },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    status: {
      type: String,
      enum: ['interested', 'preparing', 'ready', 'applied', 'interview', 'accepted', 'rejected', 'withdrawn'],
      default: 'interested',
    },
    notes: { type: String, maxlength: 2000 },
    documents: [{ type: String }],
    deadline: { type: Date },
    reminderDays: [{ type: Number }],
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1 });
applicationSchema.index({ userId: 1, opportunityId: 1 });
applicationSchema.index({ deadline: 1 }); // for reminder queries
applicationSchema.index({ status: 1 });

const Application: Model<IApplicationDocument> =
  mongoose.models.Application ||
  mongoose.model<IApplicationDocument>('Application', applicationSchema);

export default Application;
