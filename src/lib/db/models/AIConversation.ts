import mongoose, { Schema, Document, Model } from 'mongoose';

const messageSchema = new Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

export interface IAIConversationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
  context?: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiConversationSchema = new Schema<IAIConversationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [messageSchema],
    context: { type: String },
  },
  { timestamps: true }
);

aiConversationSchema.index({ userId: 1, createdAt: -1 });

const AIConversation: Model<IAIConversationDocument> =
  mongoose.models.AIConversation ||
  mongoose.model<IAIConversationDocument>('AIConversation', aiConversationSchema);

export default AIConversation;
