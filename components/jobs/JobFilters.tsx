"use client";

import type { JobFilterParams, JobType, ExperienceLevel } from "@/lib/types";

const JOB_TYPES: JobType[] = ["FullTime","PartTime","Contract","Freelance","Internship","Remote"];
const EXP_LEVELS: ExperienceLevel[] = ["Entry","Junior","Mid","Senior","Lead","Executive"];

interface Props {
  filters: JobFilterParams;
  onChange: (f: JobFilterParams) => void;
}

export default function JobFilters({ filters, onChange }: Props) {
  const set = (patch: Partial<JobFilterParams>) =>
    onChange({ ...filters, ...patch, page: 1 });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
      {/* Search */}
      <div className="flex-1 min-w-48">
        <label className="text-xs text-gray-500 mb-1 block">Search</label>
        <input
          type="text"
          placeholder="Title, company, skill…"
          value={filters.search ?? ""}
          onChange={(e) => set({ search: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Location */}
      <div className="min-w-36">
        <label className="text-xs text-gray-500 mb-1 block">Location</label>
        <input
          type="text"
          placeholder="Any location"
          value={filters.location ?? ""}
          onChange={(e) => set({ location: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Job type */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Type</label>
        <select
          value={filters.jobType ?? ""}
          onChange={(e) => set({ jobType: (e.target.value as JobType) || undefined })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All types</option>
          {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Experience */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Experience</label>
        <select
          value={filters.experienceLevel ?? ""}
          onChange={(e) => set({ experienceLevel: (e.target.value as ExperienceLevel) || undefined })}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All levels</option>
          {EXP_LEVELS.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>

      {/* Clear */}
      {(filters.search || filters.location || filters.jobType || filters.experienceLevel) && (
        <button
          onClick={() => onChange({ page: 1, pageSize: 10 })}
          className="text-sm text-gray-500 underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}
