"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { applicationsApi, uploadApi } from "@/lib/api";
import type { ApplicationDto } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

const statusColors: Record<string, "blue" | "yellow" | "green" | "red" | "gray" | "purple"> = {
  Submitted: "blue", Reviewed: "purple", Shortlisted: "yellow",
  Interview: "green", Offered: "green", Rejected: "red", Withdrawn: "gray",
};

const statusMessage: Record<string, string> = {
  Submitted:   "Your application was received and is waiting to be reviewed.",
  Reviewed:    "The employer has reviewed your application.",
  Shortlisted: "Great news — you've been shortlisted! The employer is interested.",
  Interview:   "You've been invited for an interview. Check your email for details.",
  Offered:     "🎉 Congratulations! You've received a job offer.",
  Rejected:    "The employer has decided to move forward with other candidates.",
  Withdrawn:   "You withdrew this application.",
};

export default function MyApplicationsPage() {
  const [apps, setApps]         = useState<ApplicationDto[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    applicationsApi.mine()
      .then(setApps)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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
          {apps.map((app) => {
            const isOpen = expanded === app.id;
            const hasResume = app.resumePath && app.resumePath !== "pending-upload";

            return (
              <div key={app.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">

                {/* ── Summary row ────────────────────────────────────────── */}
                <button
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : app.id)}
                >
                  {/* Company initial */}
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                    {app.job.companyName.charAt(0)}
                  </div>

                  {/* Job info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{app.job.title}</p>
                    <p className="text-xs text-gray-500">{app.job.companyName} · {app.job.location}</p>
                    <p className="text-xs text-gray-400">
                      Applied {new Date(app.appliedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>

                  {/* Status badge */}
                  <Badge label={app.status} variant={statusColors[app.status] ?? "gray"} />

                  {/* Chevron */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5"
                    className={`shrink-0 text-gray-400 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* ── Expanded detail panel ──────────────────────────────── */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">

                    {/* Status message */}
                    <div className={`rounded-lg px-3 py-2.5 text-sm border ${
                      app.status === "Offered"     ? "bg-green-50 border-green-200 text-green-700" :
                      app.status === "Rejected"    ? "bg-red-50 border-red-200 text-red-700" :
                      app.status === "Interview"   ? "bg-blue-50 border-blue-200 text-blue-700" :
                      app.status === "Withdrawn"   ? "bg-gray-100 border-gray-200 text-gray-500" :
                      "bg-blue-50 border-blue-200 text-blue-700"
                    }`}>
                      {statusMessage[app.status] ?? app.status}
                    </div>

                    {/* Resume sent */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Résumé / CV Sent</p>
                      {hasResume ? (
                        <a href={uploadApi.resumeUrl(app.resumePath)}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-700 transition-colors">
                          📄 View / Download Résumé
                        </a>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No résumé attached to this application.</p>
                      )}
                    </div>

                    {/* Cover letter */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Cover Letter Sent</p>
                      {app.coverLetter ? (
                        <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-3 whitespace-pre-line leading-relaxed">
                          {app.coverLetter}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No cover letter was included.</p>
                      )}
                    </div>

                    {/* Employer note */}
                    {app.employerNote && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Note from Employer</p>
                        <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 leading-relaxed">
                          {app.employerNote}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 flex-wrap gap-2">
                      <div className="text-xs text-gray-400 space-y-0.5">
                        <p>Applied: {new Date(app.appliedAt).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</p>
                        {app.updatedAt && (
                          <p>Last updated: {new Date(app.updatedAt).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/jobs/${app.job.id}`}
                          className="text-xs text-blue-600 hover:underline">
                          View job →
                        </Link>
                        {(app.status === "Submitted" || app.status === "Reviewed") && (
                          <button
                            onClick={() => withdraw(app.id)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
