"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { statisticsApi } from "@/lib/api";
import type { EmployerDashboardDto } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const [data, setData]   = useState<EmployerDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    statisticsApi.employerDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} />;
  if (!data)   return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.fullName}</p>
        </div>
        <Link href="/dashboard/employer/post-job"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
          + Post a Job
        </Link>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Jobs"       value={data.overview.totalJobs}       color="blue" />
        <StatCard label="Active Jobs"      value={data.overview.activeJobs}      color="green" />
        <StatCard label="Applications"     value={data.overview.totalApplications} color="purple" />
        <StatCard label="Views"            value={data.overview.totalViews}      color="yellow" />
        <StatCard label="Saves"            value={data.overview.totalSaves}      color="blue" />
        <StatCard label="New This Week"    value={data.overview.newApplicationsThisWeek} color="green"
          sub="applications" />
      </div>

      {/* Most popular job highlight */}
      {data.mostPopularJob && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">Most Popular Job</p>
            <p className="font-semibold text-gray-900 mt-1">{data.mostPopularJob.title}</p>
            <p className="text-sm text-gray-500">
              {data.mostPopularJob.totalApplications} applicants · {data.mostPopularJob.totalViews} views
            </p>
          </div>
          <Link href={`/dashboard/employer/applicants/${data.mostPopularJob.jobId}`}
            className="text-sm text-blue-600 hover:underline shrink-0">
            View applicants →
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Applications by status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Applications by Status</h2>
          {data.applicationsByStatus.length === 0 ? (
            <p className="text-sm text-gray-400">No applications yet.</p>
          ) : (
            <div className="space-y-2">
              {data.applicationsByStatus.map((s) => (
                <div key={s.status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{s.status}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${(s.count / data.overview.totalApplications) * 100}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-6 text-right">{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent job stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">My Jobs</h2>
            <Link href="/dashboard/employer/jobs" className="text-sm text-blue-600 hover:underline">Manage all</Link>
          </div>
          {data.jobStats.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 mb-3">No jobs posted yet.</p>
              <Link href="/dashboard/employer/post-job"
                className="text-sm text-blue-600 hover:underline">Post your first job →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.jobStats.slice(0, 5).map((j) => (
                <div key={j.jobId} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{j.title}</p>
                    <p className="text-xs text-gray-400">{j.totalApplications} apps · {j.totalViews} views</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge label={j.status} variant={j.status === "Active" ? "green" : "gray"} />
                    <Link href={`/dashboard/employer/applicants/${j.jobId}`}
                      className="text-xs text-blue-600 hover:underline">View</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
