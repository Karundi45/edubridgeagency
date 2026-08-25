import mongoose, { Schema, Document, Model } from 'mongoose';
import type { DegreeLevel, LanguageLevel } from '@/types';

export interface IStudentProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  nationality?: string;
  educationLevel?: DegreeLevel;
  institution?: string;
  field?: string;
  gpa?: number;
  graduationYear?: number;
  preferredCountries?: string[];
  preferredFields?: string[];
  preferredDegree?: DegreeLevel;
  languages?: string[];
  englishLevel?: LanguageLevel;
  frenchLevel?: LanguageLevel;
  workExperience?: string;
  interests?: string[];
  profileCompleteness: number;
  createdAt: Date;
  updatedAt: Date;
}

const studentProfileSchema = new Schema<IStudentProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    nationality: { type: String, trim: true },
    educationLevel: {
      type: String,
      enum: ['undergraduate', 'masters', 'phd', 'diploma', 'certificate', 'postdoctoral', 'fellowship'],
    },
    institution: { type: String, trim: true },
    field: { type: String, trim: true },
    gpa: { type: Number, min: 0, max: 4.0 },
    graduationYear: { type: Number, min: 1990, max: 2035 },
    preferredCountries: [{ type: String }],
    preferredFields: [{ type: String }],
    preferredDegree: {
      type: String,
      enum: ['undergraduate', 'masters', 'phd', 'diploma', 'certificate', 'postdoctoral', 'fellowship'],
    },
    languages: [{ type: String }],
    englishLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'upper_intermediate', 'advanced', 'native'],
    },
    frenchLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'upper_intermediate', 'advanced', 'native'],
    },
    workExperience: { type: String, maxlength: 1000 },
    interests: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: profile completeness percentage
studentProfileSchema.virtual('profileCompleteness').get(function () {
  const fields = [
    this.nationality,
    this.educationLevel,
    this.institution,
    this.field,
    this.gpa,
    this.graduationYear,
    this.preferredCountries?.length,
    this.preferredFields?.length,
    this.preferredDegree,
    this.englishLevel,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
});

// Indexes

const StudentProfile: Model<IStudentProfileDocument> =
  mongoose.models.StudentProfile ||
  mongoose.model<IStudentProfileDocument>('StudentProfile', studentProfileSchema);

export default StudentProfile;
