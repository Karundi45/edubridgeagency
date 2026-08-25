import { z } from 'zod';

// ============================================================
// Auth Schemas
// ============================================================

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms of service' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ============================================================
// Profile Schema
// ============================================================

export const profileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  country: z.string().optional(),
  nationality: z.string().optional(),
  educationLevel: z
    .enum(['undergraduate', 'masters', 'phd', 'diploma', 'certificate', 'postdoctoral', 'fellowship'])
    .optional(),
  institution: z.string().max(200).optional(),
  field: z.string().max(100).optional(),
  gpa: z.number().min(0).max(4.0).optional(),
  graduationYear: z.number().min(1990).max(2035).optional(),
  preferredCountries: z.array(z.string()).optional(),
  preferredFields: z.array(z.string()).optional(),
  preferredDegree: z
    .enum(['undergraduate', 'masters', 'phd', 'diploma', 'certificate', 'postdoctoral', 'fellowship'])
    .optional(),
  languages: z.array(z.string()).optional(),
  englishLevel: z
    .enum(['beginner', 'intermediate', 'upper_intermediate', 'advanced', 'native'])
    .optional(),
  frenchLevel: z
    .enum(['beginner', 'intermediate', 'upper_intermediate', 'advanced', 'native'])
    .optional(),
  workExperience: z.string().max(1000).optional(),
  interests: z.array(z.string()).optional(),
});

// ============================================================
// Opportunity Schema
// ============================================================

export const opportunitySchema = z.object({
  title: z.object({ en: z.string().min(1, 'English title is required'), fr: z.string().optional().default('') }),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only').min(2),
  type: z.enum(['scholarship', 'fellowship', 'grant', 'internship', 'exchange', 'research', 'competition', 'conference', 'summer_program', 'volunteer', 'online_course', 'job_vacancy']),
  provider: z.string().min(1, 'Provider is required').max(200),
  organization: z.string().min(1, 'Organization is required').max(200),
  description: z.object({ en: z.string().min(10, 'English description required'), fr: z.string().optional().default('') }),
  eligibility: z.object({ en: z.string().optional().default(''), fr: z.string().optional().default('') }).optional(),
  applicationInstructions: z.object({ en: z.string().optional().default(''), fr: z.string().optional().default('') }).optional(),
  requirements: z.array(z.string()).optional(),
  benefits: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  studyDestination: z.string().optional(),
  field: z.array(z.string()).optional(),
  degree: z.array(z.enum(['undergraduate', 'masters', 'phd', 'diploma', 'certificate', 'postdoctoral', 'fellowship'])).optional(),
  studyMode: z.enum(['on_campus', 'online', 'hybrid']).optional().default('on_campus'),
  funding: z.object({
    tuition: z.boolean().optional().default(false),
    accommodation: z.boolean().optional().default(false),
    stipend: z.boolean().optional().default(false),
    travel: z.boolean().optional().default(false),
    insurance: z.boolean().optional().default(false),
    visaSupport: z.boolean().optional().default(false),
    researchAllowance: z.boolean().optional().default(false),
    other: z.string().optional().default(''),
  }).optional(),
  fundingType: z.array(z.enum(['fully_funded', 'partially_funded', 'tuition_waiver', 'monthly_stipend', 'travel_funding', 'accommodation', 'research_funding'])).optional(),
  nationality: z.array(z.string()).optional(),
  gpa: z.number().min(0).max(4.0).optional(),
  ageLimit: z.string().optional(),
  languageRequirements: z.string().optional(),
  deadline: z.string().optional(),
  openingDate: z.string().optional(),
  resultsDate: z.string().optional(),
  officialUrl: z.string().url('Please enter a valid URL'),
  verification: z.object({
    status: z.enum(['verified', 'pending', 'needs_review', 'expired', 'reported']).default('pending'),
    sourceUrl: z.string().url().optional().or(z.literal('')),
    notes: z.string().optional(),
  }).optional(),
  status: z.enum(['draft', 'published', 'archived', 'expired']).optional().default('draft'),
  isFeatured: z.boolean().optional().default(false),
  isDemo: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional(),
});

// ============================================================
// Newsletter Schema
// ============================================================

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  country: z.string().optional(),
  preferredDegree: z
    .enum(['undergraduate', 'masters', 'phd', 'diploma', 'certificate', 'postdoctoral', 'fellowship'])
    .optional(),
  preferredField: z.string().optional(),
});

// ============================================================
// Report Schema
// ============================================================

export const reportSchema = z.object({
  opportunityId: z.string().optional(),
  jobId: z.string().optional(),
  reason: z.enum(['expired', 'wrong_deadline', 'broken_link', 'incorrect_info', 'suspicious', 'other']),
  description: z.string().max(2000).optional(),
}).refine(data => data.opportunityId || data.jobId, {
  message: "Either opportunityId or jobId must be provided"
});

// ============================================================
// Application Schema
// ============================================================

export const applicationSchema = z.object({
  opportunityId: z.string().min(1, 'Opportunity is required'),
  status: z
    .enum(['interested', 'preparing', 'ready', 'applied', 'interview', 'accepted', 'rejected', 'withdrawn'])
    .default('interested'),
  notes: z.string().max(2000).optional(),
  deadline: z.string().optional(),
  reminderDays: z.array(z.number()).optional(),
});

// ============================================================
// Resource Schema
// ============================================================

export const resourceSchema = z.object({
  title: z.object({ en: z.string().min(1, 'English title is required'), fr: z.string().optional().default('') }),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(2),
  content: z.object({ en: z.string().min(10, 'English content is required'), fr: z.string().optional().default('') }),
  excerpt: z.object({ en: z.string().max(300).optional().default(''), fr: z.string().max(300).optional().default('') }).optional(),
  category: z.string().min(1, 'Category is required'),
  author: z.string().min(1, 'Author is required').max(100),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional().default(false),
  readingTime: z.number().min(1).optional(),
  seo: z.object({
    title: z.object({ en: z.string().optional().default(''), fr: z.string().optional().default('') }).optional(),
    description: z.object({ en: z.string().optional().default(''), fr: z.string().optional().default('') }).optional(),
  }).optional(),
});

// ============================================================
// Contact Schema
// ============================================================

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(20, 'Message must be at least 20 characters').max(2000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type OpportunityInput = z.infer<typeof opportunitySchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ResourceInput = z.infer<typeof resourceSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
