export type JobStatus = "draft" | "published" | "closed" | "archived";

export type WorkplaceType = "Work at office" | "Hybrid" | "Remote";
export type EmploymentType = "Full Time" | "Part Time" | "Contractual" | "Internship";
export type GenderRequirement = "Both Male & Female" | "Only Male" | "Only Female" | "Any";

export type ComputedDeadlineStatus = "Open" | "Closing Soon" | "Closed" | "Draft" | "Archived";

export interface JobPost {
  id: string;
  slug: string;
  title: string;
  department: string;
  company: string;
  location: string;
  employmentType: EmploymentType | string;
  workplace: WorkplaceType | string;
  gender: GenderRequirement | string;
  vacancy: number | string;
  minAge?: number | null;
  maxAge?: number | null;
  minExperience?: number | null; // e.g. 1
  maxExperience?: number | null; // e.g. 7
  experienceLabel?: string; // e.g. "1 to 7 years"
  salaryMin?: number | null; // e.g. 25000
  salaryMax?: number | null; // e.g. 40000
  salaryPeriod?: string; // e.g. "Monthly"
  salaryNegotiable?: boolean;
  salaryDisplay?: string; // e.g. "Tk. 25,000 – 40,000 Monthly"
  applicationDeadline: string; // "2026-09-30"
  publishedDate?: string | null; // "2026-08-31"
  status: JobStatus;
  featured: boolean;

  // Structured Content Sections
  shortDescription: string;
  highlights: string[];
  education: string[];
  experienceRequirements: string[];
  additionalRequirements: string[];
  responsibilities: string[];
  skills: string[];
  otherSkills: string[];
  compensationAndBenefits: string[];
  incentiveInfo: string;
  careerGrowth: string[];
  applicationInstructions: string;

  // SEO
  seoTitle?: string;
  seoDescription?: string;

  createdAt: string;
  updatedAt: string;
}

export interface JobFilterOptions {
  search?: string;
  department?: string;
  location?: string;
  employmentType?: string;
  experience?: string;
  status?: string; // "all" | "open" | "closing_soon"
}

export type JobApplicationStatus =
  | "new"
  | "screening"
  | "shortlisted"
  | "interview"
  | "selected"
  | "rejected"
  | "withdrawn";

export interface ApplicationAttachment {
  name: string;
  url?: string;
  path?: string;
  size?: number;
  type?: string;
  dataUrl?: string; // Base64 fallback ensures CV is always downloadable
}

export interface ApplicationNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface ApplicationTimelineEvent {
  id: string;
  kind: "submission" | "status_change" | "note" | "interview_scheduled" | "recruiter_assigned";
  text: string;
  at: string;
  actor?: string;
}

export interface JobApplication {
  id: string;
  code: string; // e.g. APP-2026-9812
  jobId: string;
  jobTitle: string;
  jobSlug: string;
  fullName: string;
  email: string;
  phone: string;
  currentLocation: string;
  experienceYears: string | number;
  currentCompany: string;
  currentPosition: string;
  expectedSalary: string;
  noticePeriod: string;
  linkedinUrl: string;
  portfolioUrl: string;
  coverLetter: string;
  resumeAttachment?: ApplicationAttachment;
  status: JobApplicationStatus;
  assignedRecruiterId?: string | null;
  assignedRecruiterName?: string | null;
  notes: ApplicationNote[];
  timeline: ApplicationTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationSubmissionInput {
  jobId: string;
  jobTitle: string;
  jobSlug: string;
  fullName: string;
  email: string;
  phone: string;
  currentLocation: string;
  experienceYears: string | number;
  currentCompany?: string;
  currentPosition?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  coverLetter?: string;
  resumeFile?: File | null;
  consentConfirmed: boolean;
}
