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
  ProfileDto, UpsertProfileDto,
} from "./types";

// In dev: calls go through Next.js proxy (/api/proxy → localhost:5177/api)
// In prod: set NEXT_PUBLIC_API_URL to your deployed API domain
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/proxy";

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
    // Redirect to login on 401, but NOT when already on an auth page.
    // On /login or /register a 401 means "wrong credentials" — it should
    // surface as an error message, not trigger a page-reload redirect loop.
    const onAuthPage =
      typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/login") ||
        window.location.pathname.startsWith("/register"));

    if (error.response?.status === 401 && typeof window !== "undefined" && !onAuthPage) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      document.cookie = "token=; path=/; max-age=0";
      window.location.href = "/login";
    }

    // FluentValidation 400 errors come back as { errors: { field: ["msg"] } }
    // Surface all validation messages as a single string
    const responseData = error.response?.data;
    if (error.response?.status === 400 && responseData?.errors) {
      const errs = responseData.errors;
      if (Array.isArray(errs)) {
        return Promise.reject(new Error(errs.join(" ")));
      }
      // ASP.NET model-binding error format: { "field": ["msg"] }
      if (typeof errs === "object") {
        const msgs = Object.values(errs).flat().join(" ");
        return Promise.reject(new Error(msgs));
      }
    }

    const message =
      responseData?.message ??
      error.message ??
      "Network error — is the backend running on port 5177?";
    return Promise.reject(new Error(message));
  }
);

// ── Helper: unwrap ApiResponse<T> ────────────────────────────────────────────
// Backend sends "data": null for void responses — use == null (covers both null and undefined)
function unwrap<T>(response: { data: ApiResponse<T> }): T {
  if (!response.data.success) {
    throw new Error(response.data.message || "Request failed");
  }
  if (response.data.data == null) {
    // For typed responses, null data with success:true means the resource wasn't found
    // For void operations (DELETE) callers don't use unwrap, so this is always an error
    throw new Error(response.data.message || "No data returned");
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

// ═════════════════════════════════════════════════════════════════════════════
// PROFILE (JobSeeker live résumé)
// ═════════════════════════════════════════════════════════════════════════════
export const profileApi = {
  getMine: () =>
    api.get<ApiResponse<ProfileDto>>("/profile").then(unwrap),

  upsert: (data: UpsertProfileDto) =>
    api.put<ApiResponse<ProfileDto>>("/profile", data).then(unwrap),

  getByUserId: (userId: number) =>
    api.get<ApiResponse<ProfileDto>>(`/profile/${userId}`).then(unwrap),
};

// ═════════════════════════════════════════════════════════════════════════════
// UPLOADS (résumé files)
// ═════════════════════════════════════════════════════════════════════════════
export const uploadApi = {
  /** Upload a résumé file — returns the stored filename. */
  resume: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post<ApiResponse<{ fileName: string }>>("/uploads/resume", formData)
      .then(unwrap);
  },

  /** Construct the URL for viewing/downloading a stored résumé. */
  resumeUrl: (fileName: string) =>
    `${API_BASE}/uploads/resume/${encodeURIComponent(fileName)}`,
};
