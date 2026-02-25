"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { statisticsApi, jobsApi } from "@/lib/api";
import type { JobStatsDto } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function ManageJobsPage() {
  const [jobs, setJobs]   = useState<JobStatsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    statisticsApi.employerDashboard()
      .then((d) => setJobs(d.jobStats))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const deleteJob = async (jobId: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await jobsApi.delete(jobId);
      setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
        <Link href="/dashboard/employer/post-job"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
          + Post a Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No jobs posted yet.{" "}
          <Link href="/dashboard/employer/post-job" className="text-blue-600 hover:underline">
            Post your first job →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y">
          {jobs.map((job) => (
            <div key={job.jobId} className="p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/jobs/${job.jobId}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 truncate">
                    {job.title}
                  </Link>
                  <Badge label={job.status} variant={job.status === "Active" ? "green" : "gray"} />
                </div>
                <p className="text-sm text-gray-400 mt-0.5">
                  {job.totalApplications} applicants · {job.totalViews} views · {job.totalSaves} saves
                  {job.newApplications > 0 && (
                    <span className="ml-2 text-blue-600 font-medium">+{job.newApplications} new</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-sm">
                <Link href={`/dashboard/employer/applicants/${job.jobId}`}
                  className="text-blue-600 hover:underline">
                  Applicants
                </Link>
                <button onClick={() => deleteJob(job.jobId, job.title)}
                  className="text-red-500 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
