import mongoose, { Schema, Document, Model } from 'mongoose';
import type { ReportReason, ReportStatus } from '@/types';

export interface IReportDocument extends Document {
  userId: mongoose.Types.ObjectId;
  opportunityId?: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: Date;
}

const reportSchema = new Schema<IReportDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity' },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    reason: {
      type: String,
      enum: ['expired', 'wrong_deadline', 'broken_link', 'incorrect_info', 'suspicious', 'other'],
      required: true,
    },
    description: { type: String, maxlength: 2000 },
    status: {
      type: String,
      enum: ['new', 'investigating', 'resolved', 'rejected'],
      default: 'new',
    },
    adminNotes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ opportunityId: 1 });

const Report: Model<IReportDocument> =
  mongoose.models.Report || mongoose.model<IReportDocument>('Report', reportSchema);

export default Report;
