export type JobStatus = 'draft' | 'published' | 'expired';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance' | 'volunteer';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive' | 'internship' | 'no_experience';
export type Province = 'Kigali' | 'Northern Province' | 'Southern Province' | 'Eastern Province' | 'Western Province' | 'Remote' | 'Multiple';
export type JobCategory = 'IT' | 'Engineering' | 'Finance' | 'Accounting' | 'Education' | 'Healthcare' | 'Marketing' | 'Administration' | 'NGO' | 'Government' | 'Hospitality' | 'Customer Service' | 'Construction' | 'Agriculture' | 'Other';

export interface LocalizedString {
  en: string;
  fr?: string;
}

export interface IJob {
  _id: string;
  title: LocalizedString;
  slug: string;
  company: string;
  companyLogo?: string;
  location: string;
  province: Province;
  employmentType: EmploymentType[];
  category: JobCategory[];
  experienceLevel: ExperienceLevel;
  educationRequirement: LocalizedString;
  salary?: string;
  
  description: LocalizedString;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  benefits: string[];
  
  applicationInstructions: LocalizedString;
  applicationEmail?: string;
  applicationUrl?: string;
  deadline?: string;
  
  featuredImage?: string;
  tags: string[];
  isFeatured: boolean;
  status: JobStatus;
  
  metrics: {
    views: number;
    shares: number;
    outboundClicks: number;
  };
  
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export const JOB_CATEGORIES: JobCategory[] = [
  'IT', 'Engineering', 'Finance', 'Accounting', 'Education', 
  'Healthcare', 'Marketing', 'Administration', 'NGO', 'Government', 
  'Hospitality', 'Customer Service', 'Construction', 'Agriculture', 'Other'
];

export const PROVINCES: Province[] = [
  'Kigali', 'Northern Province', 'Southern Province', 
  'Eastern Province', 'Western Province', 'Remote', 'Multiple'
];

export const EMPLOYMENT_TYPES: Record<EmploymentType, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  'contract': 'Contract',
  'internship': 'Internship',
  'freelance': 'Freelance',
  'volunteer': 'Volunteer'
};

export const EXPERIENCE_LEVELS: Record<ExperienceLevel, string> = {
  'entry': 'Entry Level',
  'mid': 'Mid Level',
  'senior': 'Senior Level',
  'executive': 'Executive',
  'internship': 'Internship',
  'no_experience': 'No Experience Required'
};
