// EduBridge Agency — Complete TypeScript Type Definitions

// ============================================================
// Enums / Union Types
// ============================================================

export type UserRole = 'student' | 'editor' | 'admin' | 'superadmin';

export type OpportunityType =
  | 'scholarship'
  | 'fellowship'
  | 'grant'
  | 'internship'
  | 'exchange'
  | 'research'
  | 'competition'
  | 'conference'
  | 'summer_program'
  | 'volunteer'
  | 'online_course'
  | 'job_vacancy';

export type DegreeLevel =
  | 'undergraduate'
  | 'masters'
  | 'phd'
  | 'diploma'
  | 'certificate'
  | 'postdoctoral'
  | 'fellowship';

export type FundingType =
  | 'fully_funded'
  | 'partially_funded'
  | 'tuition_waiver'
  | 'monthly_stipend'
  | 'travel_funding'
  | 'accommodation'
  | 'research_funding';

export type StudyMode = 'on_campus' | 'online' | 'hybrid';

export type VerificationStatus = 'verified' | 'pending' | 'needs_review' | 'expired' | 'reported';

export type OpportunityStatus = 'draft' | 'published' | 'archived' | 'expired';

export type ApplicationStatus =
  | 'interested'
  | 'preparing'
  | 'ready'
  | 'applied'
  | 'interview'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export type ReportReason =
  | 'expired'
  | 'wrong_deadline'
  | 'broken_link'
  | 'incorrect_info'
  | 'suspicious'
  | 'other';

export type ReportStatus = 'new' | 'investigating' | 'resolved' | 'rejected';

export type NotificationType =
  | 'matching_scholarship'
  | 'deadline_approaching'
  | 'scholarship_updated'
  | 'application_reminder'
  | 'announcement';

export type LanguageLevel = 'beginner' | 'intermediate' | 'upper_intermediate' | 'advanced' | 'native';

// ============================================================
// Shared Interfaces
// ============================================================

export interface LocalizedString {
  en: string;
  fr: string;
}

export interface OpportunityFunding {
  tuition: boolean;
  accommodation: boolean;
  stipend: boolean;
  travel: boolean;
  insurance: boolean;
  visaSupport: boolean;
  researchAllowance: boolean;
  other: string;
}

// ============================================================
// Core Entity Types
// ============================================================

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  country?: string;
  image?: string;
  emailVerified?: boolean;
  suspended?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IStudentProfile {
  _id: string;
  userId: string;
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
  profileCompleteness?: number;
}

export interface IOpportunity {
  _id: string;
  title: LocalizedString;
  slug: string;
  type: OpportunityType;
  provider: string;
  organization: string;
  description: LocalizedString;
  eligibility: LocalizedString;
  requirements: string[];
  benefits: string;
  country: string;
  studyDestination: string;
  field: string[];
  degree: DegreeLevel[];
  studyMode: StudyMode;
  funding: OpportunityFunding;
  fundingType: FundingType[];
  nationality: string[];
  gpa?: number;
  ageLimit?: string;
  languageRequirements?: string;
  deadline?: string;
  openingDate?: string;
  resultsDate?: string;
  officialUrl: string;
  applicationInstructions: LocalizedString;
  verification: {
    status: VerificationStatus;
    sourceUrl?: string;
    verifiedBy?: string;
    verifiedAt?: string;
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
  createdBy?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ISavedOpportunity {
  _id: string;
  userId: string;
  opportunityId?: string | IOpportunity;
  jobId?: string | any; // using any for now since IJob might not be exported from index
  notes?: string;
  savedAt: string;
}

export interface IApplication {
  _id: string;
  userId: string;
  opportunityId?: string | IOpportunity;
  jobId?: string | any;
  status: ApplicationStatus;
  notes?: string;
  documents?: string[];
  deadline?: string;
  reminderDays?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface IResource {
  _id: string;
  title: LocalizedString;
  slug: string;
  content: LocalizedString;
  excerpt: LocalizedString;
  category: string;
  author: string;
  coverImage?: string;
  tags: string[];
  published: boolean;
  readingTime: number;
  seo: {
    title: LocalizedString;
    description: LocalizedString;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IReport {
  _id: string;
  userId: string;
  opportunityId: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: string;
}

export interface INewsletterSubscriber {
  _id: string;
  email: string;
  country?: string;
  preferredDegree?: DegreeLevel;
  preferredField?: string;
  subscribedAt: string;
  active: boolean;
}

export interface IAIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface IAIConversation {
  _id: string;
  userId: string;
  messages: IAIMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface IAdminActivity {
  _id: string;
  adminId: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  createdAt: string;
}

// ============================================================
// API / Response Types
// ============================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PlatformStats {
  totalScholarships: number;
  totalOpportunities: number;
  countries: number;
  fields: number;
  studentsReached: number;
}

export interface AdminStats {
  totalStudents: number;
  activeUsers: number;
  totalScholarships: number;
  publishedScholarships: number;
  pendingVerification: number;
  expiredOpportunities: number;
  totalSaves: number;
  applicationRecords: number;
  newReports: number;
  newsletterSubscribers: number;
}

// ============================================================
// Matching Engine Types
// ============================================================

export interface MatchScore {
  total: number;
  breakdown: {
    nationality: number;
    degree: number;
    field: number;
    destination: number;
    gpa: number;
  };
  reasons: string[];
  missingInfo: string[];
}

// ============================================================
// Search & Filter Types
// ============================================================

export interface SearchFilters {
  query?: string;
  type?: OpportunityType[];
  degree?: DegreeLevel[];
  country?: string[];
  studyDestination?: string[];
  field?: string[];
  fundingType?: FundingType[];
  nationality?: string;
  studyMode?: StudyMode;
  deadlineBefore?: string;
  deadlineAfter?: string;
  verificationStatus?: VerificationStatus;
  status?: OpportunityStatus;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: 'newest' | 'deadline' | 'updated' | 'views' | 'saves' | 'recommended';
}

// ============================================================
// Constants
// ============================================================

export const STUDY_FIELDS = [
  'Computer Science',
  'Engineering',
  'Medicine',
  'Nursing',
  'Business',
  'Economics',
  'Law',
  'Agriculture',
  'Education',
  'Social Sciences',
  'Natural Sciences',
  'Environmental Studies',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Arts',
  'Design',
  'Technology',
  'Architecture',
  'Media',
  'Other',
] as const;

export const OPPORTUNITY_TYPES: Record<OpportunityType, string> = {
  scholarship: 'Scholarship',
  fellowship: 'Fellowship',
  grant: 'Grant',
  internship: 'Internship',
  exchange: 'Exchange Program',
  research: 'Research Program',
  competition: 'Competition',
  conference: 'Conference',
  summer_program: 'Summer Program',
  volunteer: 'Volunteer Program',
  online_course: 'Online Course',
};

export const DEGREE_LABELS: Record<DegreeLevel, string> = {
  undergraduate: "Undergraduate",
  masters: "Master's",
  phd: 'PhD',
  diploma: 'Diploma',
  certificate: 'Certificate',
  postdoctoral: 'Postdoctoral',
  fellowship: 'Fellowship',
};

export const FUNDING_LABELS: Record<FundingType, string> = {
  fully_funded: 'Fully Funded',
  partially_funded: 'Partially Funded',
  tuition_waiver: 'Tuition Waiver',
  monthly_stipend: 'Monthly Stipend',
  travel_funding: 'Travel Funding',
  accommodation: 'Accommodation',
  research_funding: 'Research Funding',
};

export const COUNTRIES_BY_REGION: Record<string, string[]> = {
  Africa: [
    'Rwanda',
    'Kenya',
    'Uganda',
    'Tanzania',
    'Ethiopia',
    'Nigeria',
    'Ghana',
    'South Africa',
    'Egypt',
    'Morocco',
    'Senegal',
    "Côte d'Ivoire",
    'Cameroon',
    'Zimbabwe',
    'Zambia',
    'Malawi',
    'Mozambique',
    'Burkina Faso',
    'Mali',
    'Niger',
  ],
  Europe: [
    'Germany',
    'France',
    'United Kingdom',
    'Netherlands',
    'Sweden',
    'Norway',
    'Denmark',
    'Switzerland',
    'Belgium',
    'Austria',
    'Italy',
    'Spain',
    'Finland',
    'Czech Republic',
    'Poland',
  ],
  'North America': ['United States', 'Canada', 'Mexico'],
  'South America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru'],
  Asia: [
    'China',
    'Japan',
    'South Korea',
    'India',
    'Singapore',
    'Malaysia',
    'Turkey',
    'Indonesia',
    'Thailand',
    'Vietnam',
  ],
  'Middle East': ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Jordan', 'Lebanon'],
  'Australia/Oceania': ['Australia', 'New Zealand'],
};

export const RESOURCE_CATEGORIES = [
  'Scholarships',
  'Study Abroad',
  'CV & Resume',
  'Motivation Letters',
  'Personal Statements',
  'IELTS/TOEFL',
  'Visa Guidance',
  'University Applications',
  'Interviews',
  'Student Finance',
  'Career Development',
] as const;

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  interested: 'Interested',
  preparing: 'Preparing',
  ready: 'Ready to Apply',
  applied: 'Applied',
  interview: 'Interview',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const REPORT_REASONS: Record<ReportReason, string> = {
  expired: 'Scholarship has expired',
  wrong_deadline: 'Wrong deadline',
  broken_link: 'Broken/incorrect application link',
  incorrect_info: 'Incorrect information',
  suspicious: 'Suspicious or potentially fraudulent',
  other: 'Other',
};

export const DISCLAIMER_TEXT =
  'EduBridge Agency provides scholarship information and guidance. Eligibility requirements, deadlines, selection decisions, and application procedures are controlled by the official scholarship provider. Always verify the latest information on the official provider website before applying. EduBridge Agency does not control scholarship selection or admission decisions.';
