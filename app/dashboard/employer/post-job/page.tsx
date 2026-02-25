"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { jobsApi } from "@/lib/api";
import type { JobType, ExperienceLevel } from "@/lib/types";
import ErrorMessage from "@/components/ui/ErrorMessage";

const JOB_TYPES: JobType[] = ["FullTime","PartTime","Contract","Freelance","Internship","Remote"];
const EXP_LEVELS: ExperienceLevel[] = ["Entry","Junior","Mid","Senior","Lead","Executive"];

export default function PostJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", location: "",
    salaryMin: "", salaryMax: "",
    jobType: "FullTime" as JobType,
    experienceLevel: "Mid" as ExperienceLevel,
    tags: "",
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const job = await jobsApi.create({
        title: form.title, description: form.description, location: form.location,
        jobType: form.jobType, experienceLevel: form.experienceLevel,
        tags: form.tags || undefined,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
      });
      router.push(`/jobs/${job.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post job.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a Job</h1>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
          <input type="text" required value={form.title} onChange={set("title")}
            className={inputClass} placeholder="e.g. Senior C# Developer" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
            <select value={form.jobType} onChange={set("jobType")} className={inputClass}>
              {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level *</label>
            <select value={form.experienceLevel} onChange={set("experienceLevel")} className={inputClass}>
              {EXP_LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
          <input type="text" required value={form.location} onChange={set("location")}
            className={inputClass} placeholder="e.g. New York, NY or Remote" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary (optional)</label>
            <input type="number" value={form.salaryMin} onChange={set("salaryMin")}
              className={inputClass} placeholder="e.g. 80000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary (optional)</label>
            <input type="number" value={form.salaryMax} onChange={set("salaryMax")}
              className={inputClass} placeholder="e.g. 120000" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags <span className="text-gray-400 font-normal">(comma-separated)</span>
          </label>
          <input type="text" value={form.tags} onChange={set("tags")}
            className={inputClass} placeholder="e.g. C#,React,Docker" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description * <span className="text-gray-400 font-normal">(min 50 chars)</span>
          </label>
          <textarea required rows={10} value={form.description} onChange={set("description")}
            className={inputClass} placeholder="Describe the role, responsibilities, requirements…" />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {loading ? "Posting…" : "Post Job"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
