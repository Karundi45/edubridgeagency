import mongoose, { Schema, Document, Model } from 'mongoose';

const localizedStringSchema = new Schema(
  { en: { type: String, default: '' }, fr: { type: String, default: '' } },
  { _id: false }
);

export interface IResourceDocument extends Document {
  title: { en: string; fr: string };
  slug: string;
  content: { en: string; fr: string };
  excerpt: { en: string; fr: string };
  category: string;
  author: string;
  coverImage?: string;
  tags: string[];
  published: boolean;
  readingTime: number;
  seo: { title: { en: string; fr: string }; description: { en: string; fr: string } };
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IResourceDocument>(
  {
    title: { type: localizedStringSchema, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: localizedStringSchema, required: true },
    excerpt: { type: localizedStringSchema, default: { en: '', fr: '' } },
    category: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    coverImage: { type: String },
    tags: [{ type: String }],
    published: { type: Boolean, default: false },
    readingTime: { type: Number, default: 5 },
    seo: {
      title: { type: localizedStringSchema, default: {} },
      description: { type: localizedStringSchema, default: {} },
    },
  },
  { timestamps: true }
);

resourceSchema.index({ category: 1 });
resourceSchema.index({ published: 1 });
resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ 'title.en': 'text', 'title.fr': 'text', 'content.en': 'text' });

const Resource: Model<IResourceDocument> =
  mongoose.models.Resource ||
  mongoose.model<IResourceDocument>('Resource', resourceSchema);

export default Resource;
