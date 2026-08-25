import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISavedOpportunityDocument extends Document {
  userId: mongoose.Types.ObjectId;
  opportunityId?: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  notes?: string;
  savedAt: Date;
}

const savedOpportunitySchema = new Schema<ISavedOpportunityDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity' },
  jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
  notes: { type: String, maxlength: 1000 },
  savedAt: { type: Date, default: Date.now },
});

// Ensure a user can't save the same opportunity or job twice
savedOpportunitySchema.index({ userId: 1, opportunityId: 1 }, { unique: true, sparse: true });
savedOpportunitySchema.index({ userId: 1, jobId: 1 }, { unique: true, sparse: true });
savedOpportunitySchema.index({ userId: 1, savedAt: -1 });

const SavedOpportunity: Model<ISavedOpportunityDocument> =
  mongoose.models.SavedOpportunity ||
  mongoose.model<ISavedOpportunityDocument>('SavedOpportunity', savedOpportunitySchema);

export default SavedOpportunity;
