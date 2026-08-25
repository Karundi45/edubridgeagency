import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemSettingsDocument extends Document {
  key: string;
  value: unknown;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const systemSettingsSchema = new Schema<ISystemSettingsDocument>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

systemSettingsSchema.index({ key: 1 }, { unique: true });

// Static methods
systemSettingsSchema.statics.get = async function (key: string) {
  const doc = await this.findOne({ key });
  return doc ? doc.value : null;
};

systemSettingsSchema.statics.set = async function (
  key: string,
  value: unknown,
  updatedBy?: string
) {
  return this.findOneAndUpdate(
    { key },
    { key, value, updatedBy },
    { upsert: true, new: true }
  );
};

interface SystemSettingsModel extends Model<ISystemSettingsDocument> {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, updatedBy?: string): Promise<ISystemSettingsDocument>;
}

const SystemSettings: SystemSettingsModel =
  (mongoose.models.SystemSettings as SystemSettingsModel) ||
  mongoose.model<ISystemSettingsDocument, SystemSettingsModel>('SystemSettings', systemSettingsSchema);

export default SystemSettings;
