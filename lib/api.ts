/**
 * Central Axios instance.
 * - All requests include the JWT from localStorage automatically via the
 *   request interceptor.
 * - All responses are unwrapped from ApiResponse<T> so callers get T directly.
 * - 401 responses redirect to /login automatically.
 */
import axios from "axios";
import type {
  ApiResponse, PagedResult,
  AuthResponseDto, RegisterRequest, LoginRequest,
  UserDto, CompanyDto, CreateCompanyDto, UpdateCompanyDto,
  JobDto, JobListItemDto, JobFilterParams, CreateJobDto, UpdateJobDto,
  ApplicationDto, CreateApplicationDto, UpdateApplicationStatusDto,
  SavedJobDto, EmployerDashboardDto, JobSeekerDashboardDto,
} from "./types";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5177/api";

const api = axios.create({ baseURL: API_BASE });

// ── Request interceptor — attach JWT token ────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — unwrap envelope or throw clean error ───────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Redirect to login on 401 anywhere in the app
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    // Surface the backend's message if available
    const message =
      error.response?.data?.message ?? error.message ?? "An error occurred";
    return Promise.reject(new Error(message));
  }
);

// ── Helper: unwrap ApiResponse<T> ────────────────────────────────────────────
function unwrap<T>(response: { data: ApiResponse<T> }): T {
  if (!response.data.success || response.data.data === undefined) {
    throw new Error(response.data.message || "Request failed");
  }
  return response.data.data;
}

// ═════════════════════════════════════════════════════════════════════════════
// AUTH
// ═════════════════════════════════════════════════════════════════════════════
export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponseDto>>("/auth/register", data).then(unwrap),

  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponseDto>>("/auth/login", data).then(unwrap),

  me: () =>
    api.get<ApiResponse<UserDto>>("/auth/me").then(unwrap),
};

// ═════════════════════════════════════════════════════════════════════════════
// COMPANIES
// ═════════════════════════════════════════════════════════════════════════════
export const companyApi = {
  getById: (id: number) =>
    api.get<ApiResponse<CompanyDto>>(`/companies/${id}`).then(unwrap),

  getMine: () =>
    api.get<ApiResponse<CompanyDto>>("/companies/mine").then(unwrap),

  create: (data: CreateCompanyDto) =>
    api.post<ApiResponse<CompanyDto>>("/companies", data).then(unwrap),

  update: (data: UpdateCompanyDto) =>
    api.put<ApiResponse<CompanyDto>>("/companies", data).then(unwrap),
};

// ═════════════════════════════════════════════════════════════════════════════
// JOBS
// ═════════════════════════════════════════════════════════════════════════════
export const jobsApi = {
  list: (params: JobFilterParams = {}) =>
    api
      .get<ApiResponse<PagedResult<JobListItemDto>>>("/jobs", { params })
      .then(unwrap),

  getById: (id: number) =>
    api.get<ApiResponse<JobDto>>(`/jobs/${id}`).then(unwrap),

  create: (data: CreateJobDto) =>
    api.post<ApiResponse<JobDto>>("/jobs", data).then(unwrap),

  update: (id: number, data: UpdateJobDto) =>
    api.put<ApiResponse<JobDto>>(`/jobs/${id}`, data).then(unwrap),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/jobs/${id}`),
};

// ═════════════════════════════════════════════════════════════════════════════
// APPLICATIONS
// ═════════════════════════════════════════════════════════════════════════════
export const applicationsApi = {
  apply: (data: CreateApplicationDto) =>
    api.post<ApiResponse<ApplicationDto>>("/applications", data).then(unwrap),

  mine: () =>
    api.get<ApiResponse<ApplicationDto[]>>("/applications/mine").then(unwrap),

  withdraw: (id: number) =>
    api.delete<ApiResponse<null>>(`/applications/${id}/withdraw`),

  forJob: (jobId: number) =>
    api
      .get<ApiResponse<ApplicationDto[]>>(`/applications/job/${jobId}`)
      .then(unwrap),

  updateStatus: (id: number, data: UpdateApplicationStatusDto) =>
    api
      .patch<ApiResponse<ApplicationDto>>(`/applications/${id}/status`, data)
      .then(unwrap),
};

// ═════════════════════════════════════════════════════════════════════════════
// SAVED JOBS
// ═════════════════════════════════════════════════════════════════════════════
export const savedJobsApi = {
  list: () =>
    api.get<ApiResponse<SavedJobDto[]>>("/saved-jobs").then(unwrap),

  save: (jobId: number) =>
    api.post<ApiResponse<SavedJobDto>>(`/saved-jobs/${jobId}`).then(unwrap),

  unsave: (jobId: number) =>
    api.delete<ApiResponse<null>>(`/saved-jobs/${jobId}`),

  check: (jobId: number) =>
    api
      .get<ApiResponse<{ isSaved: boolean }>>(`/saved-jobs/${jobId}/check`)
      .then(unwrap),
};

// ═════════════════════════════════════════════════════════════════════════════
// STATISTICS
// ═════════════════════════════════════════════════════════════════════════════
export const statisticsApi = {
  employerDashboard: () =>
    api
      .get<ApiResponse<EmployerDashboardDto>>("/statistics/employer/dashboard")
      .then(unwrap),

  seekerDashboard: () =>
    api
      .get<ApiResponse<JobSeekerDashboardDto>>("/statistics/seeker/dashboard")
      .then(unwrap),
};
