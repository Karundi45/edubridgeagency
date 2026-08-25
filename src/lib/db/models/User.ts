import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@/types';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  country?: string;
  image?: string;
  emailVerified?: boolean;
  emailVerifyToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  suspended?: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      select: false, // Never return password hash in queries by default
    },
    role: {
      type: String,
      enum: ['student', 'editor', 'admin', 'superadmin'],
      default: 'student',
    },
    country: { type: String, trim: true },
    image: { type: String },
    emailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    suspended: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Method: compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', userSchema);

export default User;
