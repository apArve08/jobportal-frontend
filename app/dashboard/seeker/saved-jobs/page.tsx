"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { savedJobsApi } from "@/lib/api";
import type { SavedJobDto } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function SavedJobsPage() {
  const [jobs, setJobs]   = useState<SavedJobDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    savedJobsApi.list()
      .then(setJobs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const unsave = async (jobId: number) => {
    try {
      await savedJobsApi.unsave(jobId);
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
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        <span className="text-sm text-gray-500">{jobs.length} saved</span>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No saved jobs yet.{" "}
          <Link href="/" className="text-blue-600 hover:underline">Browse jobs →</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex justify-between items-start gap-2">
                <Link href={`/jobs/${job.jobId}`} className="font-semibold text-gray-900 hover:text-blue-600">
                  {job.jobTitle}
                </Link>
                <button onClick={() => unsave(job.jobId)} className="text-xs text-gray-400 hover:text-red-500 shrink-0">
                  Remove
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{job.companyName} · {job.location}</p>
              <div className="mt-3 flex gap-2 flex-wrap">
                <Badge label={job.jobType} variant="blue" />
                {job.jobStatus !== "Active" && <Badge label={job.jobStatus} variant="red" />}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Saved {new Date(job.savedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
