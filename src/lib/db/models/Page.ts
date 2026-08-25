import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true }, // HTML content
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.Page || mongoose.model('Page', pageSchema);
