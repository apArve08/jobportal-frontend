// ─────────────────────────────────────────────────────────────────────────────
// All TypeScript types mirror the backend DTOs exactly.
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = "Admin" | "Employer" | "JobSeeker";
export type JobType = "FullTime" | "PartTime" | "Contract" | "Freelance" | "Internship" | "Remote";
export type ExperienceLevel = "Entry" | "Junior" | "Mid" | "Senior" | "Lead" | "Executive";
export type JobStatus = "Draft" | "Active" | "Paused" | "Closed" | "Expired";
export type ApplicationStatus =
  | "Submitted" | "Reviewed" | "Shortlisted"
  | "Interview" | "Offered" | "Rejected" | "Withdrawn";

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  profilePictureUrl?: string;
  createdAt: string;
}

export interface AuthResponseDto {
  token: string;
  user: UserDto;
  expiresAt: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ── Company ───────────────────────────────────────────────────────────────────
export interface CompanyDto {
  id: number;
  name: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  createdAt: string;
  ownerId: number;
}

export interface CreateCompanyDto {
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  location?: string;
}

export interface UpdateCompanyDto extends CreateCompanyDto {
  logoUrl?: string;
}

// ── Jobs ──────────────────────────────────────────────────────────────────────
export interface JobCompanyDto {
  id: number;
  name: string;
  logoUrl?: string;
  location?: string;
  industry?: string;
  website?: string;
}

export interface JobDto {
  id: number;
  title: string;
  description: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  status: JobStatus;
  tags?: string;
  expiresAt?: string;
  createdAt: string;
  company: JobCompanyDto;
  totalViews: number;
  totalApplications: number;
  totalSaves: number;
}

export interface JobListItemDto {
  id: number;
  title: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  tags?: string;
  createdAt: string;
  companyName: string;
  companyLogoUrl?: string;
}

export interface JobFilterParams {
  search?: string;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  companyId?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
}

export interface CreateJobDto {
  title: string;
  description: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  tags?: string;
  expiresAt?: string;
}

export interface UpdateJobDto extends CreateJobDto {
  status: JobStatus;
}

// ── Applications ──────────────────────────────────────────────────────────────
export interface ApplicationJobDto {
  id: number;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  location: string;
}

export interface ApplicationApplicantDto {
  id: number;
  fullName: string;
  email: string;
  profilePictureUrl?: string;
}

export interface ApplicationDto {
  id: number;
  resumePath: string;
  coverLetter?: string;
  status: ApplicationStatus;
  employerNote?: string;
  appliedAt: string;
  updatedAt?: string;
  job: ApplicationJobDto;
  applicant: ApplicationApplicantDto;
}

export interface CreateApplicationDto {
  jobId: number;
  resumePath: string;
  coverLetter?: string;
}

export interface UpdateApplicationStatusDto {
  status: ApplicationStatus;
  employerNote?: string;
}

// ── Saved Jobs ────────────────────────────────────────────────────────────────
export interface SavedJobDto {
  id: number;
  savedAt: string;
  jobId: number;
  jobTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  location: string;
  jobType: JobType;
  salaryMin?: number;
  salaryMax?: number;
  jobStatus: JobStatus;
}

// ── Statistics ────────────────────────────────────────────────────────────────
export interface JobStatsDto {
  jobId: number;
  title: string;
  status: string;
  createdAt: string;
  totalApplications: number;
  totalViews: number;
  totalSaves: number;
  newApplications: number;
}

export interface DailyCountDto { date: string; count: number; }
export interface StatusCountDto { status: string; count: number; }

export interface EmployerOverviewDto {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalViews: number;
  totalSaves: number;
  newApplicationsThisWeek: number;
}

export interface EmployerDashboardDto {
  overview: EmployerOverviewDto;
  jobStats: JobStatsDto[];
  mostPopularJob?: JobStatsDto;
  applicationsOverTime: DailyCountDto[];
  applicationsByStatus: StatusCountDto[];
}

export interface RecentApplicationDto {
  applicationId: number;
  jobTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  status: string;
  appliedAt: string;
}

export interface JobSeekerDashboardDto {
  totalApplications: number;
  savedJobs: number;
  pendingApplications: number;
  interviewsScheduled: number;
  offers: number;
  applicationsByStatus: StatusCountDto[];
  recentApplications: RecentApplicationDto[];
}

// ── Profile (JobSeeker live résumé) ───────────────────────────────────────────
export interface ProfileDto {
  userId: number;
  fullName: string;
  email: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
  headline?: string;
  summary?: string;
  location?: string;
  skills?: string;
  yearsOfExperience?: number;
  linkedInUrl?: string;
  gitHubUrl?: string;
  portfolioUrl?: string;
  hasResume: boolean;
  resumeFileName?: string;
  updatedAt?: string;
}

export interface UpsertProfileDto {
  headline?: string;
  summary?: string;
  location?: string;
  skills?: string;
  yearsOfExperience?: number;
  linkedInUrl?: string;
  gitHubUrl?: string;
  portfolioUrl?: string;
  phoneNumber?: string;
  resumeFileName?: string;
}

// ── Shared ────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
