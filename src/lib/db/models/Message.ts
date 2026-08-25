import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessageDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessageDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Message: Model<IMessageDocument> = mongoose.models.Message || mongoose.model<IMessageDocument>('Message', messageSchema);

export default Message;
