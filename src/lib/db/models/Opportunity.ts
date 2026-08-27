import mongoose, { Schema, Document, Model } from 'mongoose';
import type { OpportunityType, DegreeLevel, FundingType, StudyMode, VerificationStatus, OpportunityStatus } from '@/types';

const localizedStringSchema = new Schema(
  {
    en: { type: String, default: '' },
    fr: { type: String, default: '' },
  },
  { _id: false }
);

const fundingSchema = new Schema(
  {
    tuition: { type: Boolean, default: false },
    accommodation: { type: Boolean, default: false },
    stipend: { type: Boolean, default: false },
    travel: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false },
    visaSupport: { type: Boolean, default: false },
    researchAllowance: { type: Boolean, default: false },
    other: { type: String, default: '' },
  },
  { _id: false }
);

const verificationSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['verified', 'pending', 'needs_review', 'expired', 'reported'],
      default: 'pending',
    },
    sourceUrl: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    notes: { type: String },
  },
  { _id: false }
);

const metricsSchema = new Schema(
  {
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    outboundClicks: { type: Number, default: 0 },
  },
  { _id: false }
);

export interface IOpportunityDocument extends Document {
  title: { en: string; fr: string };
  slug: string;
  type: OpportunityType;
  provider: string;
  organization: string;
  description: { en: string; fr: string };
  eligibility: { en: string; fr: string };
  applicationInstructions: { en: string; fr: string };
  requirements: string[];
  benefits: string;
  country: string;
  studyDestination: string;
  field: string[];
  degree: DegreeLevel[];
  studyMode: StudyMode;
  funding: {
    tuition: boolean;
    accommodation: boolean;
    stipend: boolean;
    travel: boolean;
    insurance: boolean;
    visaSupport: boolean;
    researchAllowance: boolean;
    other: string;
  };
  fundingType: FundingType[];
  nationality: string[];
  gpa?: number;
  ageLimit?: string;
  languageRequirements?: string;
  deadline?: Date;
  openingDate?: Date;
  resultsDate?: Date;
  officialUrl: string;
  verification: {
    status: VerificationStatus;
    sourceUrl?: string;
    verifiedBy?: mongoose.Types.ObjectId;
    verifiedAt?: Date;
    notes?: string;
  };
  status: OpportunityStatus;
  metrics: {
    views: number;
    saves: number;
    outboundClicks: number;
  };
  isFeatured: boolean;
  tags: string[];
  logo?: string;
  requirementDocumentUrl?: string;
  officialAnnouncementUrl?: string;
  createdBy?: mongoose.Types.ObjectId;
  isDemo?: boolean;
  daysUntilDeadline?: number;
  createdAt: Date;
  updatedAt: Date;
}

const opportunitySchema = new Schema<IOpportunityDocument>(
  {
    title: { type: localizedStringSchema, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: {
      type: String,
      enum: ['scholarship', 'fellowship', 'grant', 'internship', 'exchange', 'research', 'competition', 'conference', 'summer_program', 'volunteer', 'online_course', 'job_vacancy'],
      required: true,
    },
    provider: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    description: { type: localizedStringSchema, required: true },
    eligibility: { type: localizedStringSchema, default: { en: '', fr: '' } },
    applicationInstructions: { type: localizedStringSchema, default: { en: '', fr: '' } },
    requirements: [{ type: String }],
    benefits: { type: String, default: '' },
    country: { type: String, required: true, trim: true },
    studyDestination: { type: String, trim: true },
    field: [{ type: String }],
    degree: [{ type: String, enum: ['undergraduate', 'masters', 'phd', 'diploma', 'certificate', 'postdoctoral', 'fellowship'] }],
    studyMode: { type: String, enum: ['on_campus', 'online', 'hybrid'], default: 'on_campus' },
    funding: { type: fundingSchema, default: {} },
    fundingType: [{ type: String, enum: ['fully_funded', 'partially_funded', 'tuition_waiver', 'monthly_stipend', 'travel_funding', 'accommodation', 'research_funding'] }],
    nationality: [{ type: String }],
    gpa: { type: Number, min: 0, max: 4.0 },
    ageLimit: { type: String },
    languageRequirements: { type: String },
    deadline: { type: Date },
    openingDate: { type: Date },
    resultsDate: { type: Date },
    officialUrl: { type: String, required: true },
    verification: { type: verificationSchema, default: { status: 'pending' } },
    status: { type: String, enum: ['draft', 'published', 'archived', 'expired'], default: 'draft' },
    metrics: { type: metricsSchema, default: {} },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }],
    logo: { type: String },
    requirementDocumentUrl: { type: String },
    officialAnnouncementUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isDemo: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
opportunitySchema.index({ status: 1 });
opportunitySchema.index({ deadline: 1 });
opportunitySchema.index({ isFeatured: 1 });
opportunitySchema.index({ type: 1 });
opportunitySchema.index({ 'verification.status': 1 });
opportunitySchema.index({ createdAt: -1 });
opportunitySchema.index({ 'metrics.views': -1 });
opportunitySchema.index({ degree: 1 });
opportunitySchema.index({ field: 1 });
opportunitySchema.index({ country: 1 });
opportunitySchema.index({ nationality: 1 });

// Text index for search
opportunitySchema.index({
  'title.en': 'text',
  'title.fr': 'text',
  'description.en': 'text',
  'description.fr': 'text',
  provider: 'text',
  organization: 'text',
  tags: 'text',
});

// Virtual: daysUntilDeadline
opportunitySchema.virtual('daysUntilDeadline').get(function () {
  if (!this.deadline) return null;
  const now = new Date();
  const diff = Math.ceil((this.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
});

// Pre-save: auto-expire if deadline passed
opportunitySchema.pre('save', function (next) {
  if (this.deadline && this.status === 'published') {
    const now = new Date();
    if (this.deadline < now) {
      this.status = 'expired';
    }
  }
  next();
});

const Opportunity: Model<IOpportunityDocument> =
  mongoose.models.Opportunity ||
  mongoose.model<IOpportunityDocument>('Opportunity', opportunitySchema);

export default Opportunity;
