"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { jobsApi, savedJobsApi, applicationsApi } from "@/lib/api";
import type { JobDto } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function JobDetailPage() {
  const { id }          = useParams<{ id: string }>();
  const { user, isJobSeeker } = useAuth();
  const router          = useRouter();
  const [job, setJob]   = useState<JobDto | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [isSaved, setIsSaved]   = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");

  useEffect(() => {
    jobsApi.getById(Number(id))
      .then((data) => {
        setJob(data);
        // Check bookmark state for logged-in seekers
        if (user && isJobSeeker) {
          savedJobsApi.check(data.id).then((r) => setIsSaved(r.isSaved)).catch(() => {});
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, user, isJobSeeker]);

  const handleSave = async () => {
    if (!user) return router.push("/login");
    try {
      if (isSaved) { await savedJobsApi.unsave(job!.id); setIsSaved(false); }
      else         { await savedJobsApi.save(job!.id);   setIsSaved(true);  }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error");
    }
  };

  const handleApply = async () => {
    if (!user) return router.push("/login");
    setApplyLoading(true);
    setApplyMsg("");
    try {
      await applicationsApi.apply({ jobId: job!.id, resumePath: "pending-upload" });
      setApplyMsg("Application submitted! Check My Applications for status.");
    } catch (e: unknown) {
      setApplyMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} />;
  if (!job)    return null;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline mb-6 block">
        ← Back to jobs
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
              {job.company.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-500">{job.company.name} · {job.company.location}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 shrink-0">
            {isJobSeeker && (
              <button onClick={handleSave}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isSaved ? "bg-blue-50 border-blue-300 text-blue-600" : "border-gray-300 hover:bg-gray-50"
                }`}>
                {isSaved ? "Saved ✓" : "Save"}
              </button>
            )}
            {isJobSeeker && (
              <button onClick={handleApply} disabled={applyLoading}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {applyLoading ? "Applying…" : "Apply Now"}
              </button>
            )}
          </div>
        </div>

        {applyMsg && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 text-sm text-blue-700">{applyMsg}</div>
        )}

        {/* Badges */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge label={job.jobType} variant="blue" />
          <Badge label={job.experienceLevel} variant="purple" />
          <Badge label={job.location} variant="gray" />
          {(job.salaryMin || job.salaryMax) && (
            <Badge label={`$${job.salaryMin?.toLocaleString()} – $${job.salaryMax?.toLocaleString()}`} variant="green" />
          )}
        </div>

        {/* Stats row */}
        <div className="mt-4 flex gap-6 text-sm text-gray-400">
          <span>{job.totalViews} views</span>
          <span>{job.totalApplications} applicants</span>
          <span>{job.totalSaves} saves</span>
        </div>

        {/* Tags */}
        {job.tags && (
          <div className="mt-4 flex flex-wrap gap-2">
            {job.tags.split(",").map((t) => (
              <span key={t} className="text-xs bg-gray-50 border rounded px-2 py-0.5 text-gray-500">{t.trim()}</span>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="mt-8 border-t pt-6">
          <h2 className="font-semibold text-gray-900 mb-3">Job Description</h2>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
            {job.description}
          </div>
        </div>

        {/* Company info */}
        <div className="mt-8 border-t pt-6">
          <h2 className="font-semibold text-gray-900 mb-2">About {job.company.name}</h2>
          {job.company.industry && <p className="text-sm text-gray-500">Industry: {job.company.industry}</p>}
          {job.company.website && (
            <a href={job.company.website} target="_blank" rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline mt-1 block">
              {job.company.website}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
