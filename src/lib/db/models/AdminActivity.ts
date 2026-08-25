import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminActivityDocument extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  createdAt: Date;
}

const adminActivitySchema = new Schema<IAdminActivityDocument>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

adminActivitySchema.index({ adminId: 1, createdAt: -1 });
adminActivitySchema.index({ createdAt: -1 });
adminActivitySchema.index({ entity: 1 });

const AdminActivity: Model<IAdminActivityDocument> =
  mongoose.models.AdminActivity ||
  mongoose.model<IAdminActivityDocument>('AdminActivity', adminActivitySchema);

export default AdminActivity;
