"use client";

import { useEffect, useState } from "react";
import { applicationsApi } from "@/lib/api";
import type { ApplicationDto } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Link from "next/link";

const statusColors: Record<string, "blue"|"yellow"|"green"|"red"|"gray"|"purple"> = {
  Submitted:"blue", Reviewed:"purple", Shortlisted:"yellow",
  Interview:"green", Offered:"green", Rejected:"red", Withdrawn:"gray",
};

export default function MyApplicationsPage() {
  const [apps, setApps]   = useState<ApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    applicationsApi.mine()
      .then(setApps)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const withdraw = async (id: number) => {
    if (!confirm("Withdraw this application?")) return;
    try {
      await applicationsApi.withdraw(id);
      setApps((prev) => prev.map((a) => a.id === id ? { ...a, status: "Withdrawn" } : a));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <span className="text-sm text-gray-500">{apps.length} total</span>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No applications yet.{" "}
          <Link href="/" className="text-blue-600 hover:underline">Browse jobs →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                  {app.job.companyName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <Link href={`/jobs/${app.job.id}`} className="font-semibold text-gray-900 hover:text-blue-600 truncate block">
                    {app.job.title}
                  </Link>
                  <p className="text-sm text-gray-500">{app.job.companyName} · {app.job.location}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Applied {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Badge label={app.status} variant={statusColors[app.status] ?? "gray"} />
                {app.status === "Submitted" || app.status === "Reviewed" ? (
                  <button onClick={() => withdraw(app.id)}
                    className="text-xs text-red-500 hover:underline">
                    Withdraw
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
