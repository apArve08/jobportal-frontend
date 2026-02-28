"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { applicationsApi, uploadApi } from "@/lib/api";
import type { ApplicationDto, ApplicationStatus } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

const STATUSES: ApplicationStatus[] = [
  "Submitted","Reviewed","Shortlisted","Interview","Offered","Rejected"
];
const statusColors: Record<string, "blue"|"yellow"|"green"|"red"|"gray"|"purple"> = {
  Submitted:"blue", Reviewed:"purple", Shortlisted:"yellow",
  Interview:"green", Offered:"green", Rejected:"red", Withdrawn:"gray",
};

export default function ApplicantsPage() {
  const { jobId }             = useParams<{ jobId: string }>();
  const [apps, setApps]       = useState<ApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    applicationsApi.forJob(Number(jobId))
      .then(setApps)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  const updateStatus = async (appId: number, status: ApplicationStatus) => {
    setUpdating(appId);
    try {
      const updated = await applicationsApi.updateStatus(appId, { status });
      setApps((prev) => prev.map((a) => a.id === appId ? updated : a));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
        <span className="text-sm text-gray-500">{apps.length} total</span>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No applications received yet.</div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-5">
              {/* ── Applicant header ───────────────────────────────────── */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm shrink-0">
                    {app.applicant.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{app.applicant.fullName}</p>
                      <Link
                        href={`/seekers/${app.applicant.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View profile →
                      </Link>
                    </div>
                    <p className="text-sm text-gray-500">{app.applicant.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Résumé download — only shown when a real file was uploaded */}
                  {app.resumePath && app.resumePath !== "pending-upload" && (
                    <a
                      href={uploadApi.resumeUrl(app.resumePath)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    >
                      📄 Résumé
                    </a>
                  )}
                  <Badge label={app.status} variant={statusColors[app.status] ?? "gray"} />
                </div>
              </div>

              {/* Cover letter */}
              {app.coverLetter && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <p className="font-medium text-gray-700 mb-1 text-xs uppercase tracking-wide">
                    Cover Letter
                  </p>
                  {app.coverLetter}
                </div>
              )}

              {/* Employer note */}
              {app.employerNote && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  <span className="font-medium">Note: </span>{app.employerNote}
                </div>
              )}

              {/* Status pipeline */}
              {app.status !== "Withdrawn" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {STATUSES.filter((s) => s !== app.status).map((s) => (
                    <button key={s}
                      disabled={updating === app.id}
                      onClick={() => updateStatus(app.id, s)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 transition-colors">
                      → {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
