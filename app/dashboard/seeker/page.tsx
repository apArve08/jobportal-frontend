"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { statisticsApi } from "@/lib/api";
import type { JobSeekerDashboardDto } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import StatCard from "@/components/ui/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Badge from "@/components/ui/Badge";

const statusColors: Record<string, "blue" | "yellow" | "green" | "red" | "gray" | "purple"> = {
  Submitted:   "blue",
  Reviewed:    "purple",
  Shortlisted: "yellow",
  Interview:   "green",
  Offered:     "green",
  Rejected:    "red",
  Withdrawn:   "gray",
};

export default function SeekerDashboardPage() {
  const { user } = useAuth();
  const [data, setData]   = useState<JobSeekerDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    statisticsApi.seekerDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} />;
  if (!data)   return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.fullName}</h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s your job search overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Applied" value={data.totalApplications} color="blue" />
        <StatCard label="Pending"       value={data.pendingApplications} color="yellow" />
        <StatCard label="Interviews"    value={data.interviewsScheduled} color="purple" />
        <StatCard label="Saved Jobs"    value={data.savedJobs} color="green" />
      </div>

      {data.offers > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium">
          🎉 You have {data.offers} job offer{data.offers > 1 ? "s" : ""}! Check your applications.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Recent Applications</h2>
            <Link href="/dashboard/seeker/applications" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {data.recentApplications.length === 0 ? (
            <p className="text-sm text-gray-400">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentApplications.map((a) => (
                <div key={a.applicationId} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{a.jobTitle}</p>
                    <p className="text-xs text-gray-400">{a.companyName}</p>
                  </div>
                  <Badge label={a.status} variant={statusColors[a.status] ?? "gray"} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application pipeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Application Pipeline</h2>
          <div className="space-y-2">
            {data.applicationsByStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{s.status}</span>
                <span className="text-sm font-semibold text-gray-900">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 flex gap-3 flex-wrap">
        <Link href="/" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">
          Browse Jobs
        </Link>
        <Link href="/dashboard/seeker/saved-jobs" className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors">
          Saved Jobs
        </Link>
      </div>
    </div>
  );
}
