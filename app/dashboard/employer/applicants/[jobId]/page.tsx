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
  "Submitted", "Reviewed", "Shortlisted", "Interview", "Offered", "Rejected",
];

const statusColors: Record<string, "blue" | "yellow" | "green" | "red" | "gray" | "purple"> = {
  Submitted: "blue", Reviewed: "purple", Shortlisted: "yellow",
  Interview: "green", Offered: "green", Rejected: "red", Withdrawn: "gray",
};

type NoteMap = Record<number, string>;

export default function ApplicantsPage() {
  const { jobId }               = useParams<{ jobId: string }>();
  const [apps, setApps]         = useState<ApplicationDto[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [updating, setUpdating] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [notes, setNotes]       = useState<NoteMap>({});
  const [savingNote, setSavingNote] = useState<number | null>(null);

  useEffect(() => {
    applicationsApi.forJob(Number(jobId))
      .then((data) => {
        setApps(data);
        const seed: NoteMap = {};
        data.forEach((a) => { seed[a.id] = a.employerNote ?? ""; });
        setNotes(seed);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  const updateStatus = async (appId: number, status: ApplicationStatus) => {
    setUpdating(appId);
    try {
      const updated = await applicationsApi.updateStatus(appId, {
        status,
        employerNote: notes[appId] || undefined,
      });
      setApps((prev) => prev.map((a) => a.id === appId ? updated : a));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setUpdating(null);
    }
  };

  const saveNote = async (appId: number) => {
    const app = apps.find((a) => a.id === appId);
    if (!app) return;
    setSavingNote(appId);
    try {
      const updated = await applicationsApi.updateStatus(appId, {
        status: app.status as ApplicationStatus,
        employerNote: notes[appId] || undefined,
      });
      setApps((prev) => prev.map((a) => a.id === appId ? updated : a));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setSavingNote(null);
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
        <div className="space-y-3">
          {apps.map((app) => {
            const isOpen      = expanded === app.id;
            const isUpdating  = updating  === app.id;
            const noteDirty   = (notes[app.id] ?? "") !== (app.employerNote ?? "");

            return (
              <div key={app.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">

                {/* ── Summary row ────────────────────────────────────────── */}
                <div className="px-4 py-3 flex items-center gap-3">

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm shrink-0">
                    {app.applicant.fullName.charAt(0)}
                  </div>

                  {/* Name / email / date */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{app.applicant.fullName}</span>
                      <Link href={`/seekers/${app.applicant.id}`}
                        className="text-xs text-blue-600 hover:underline">
                        profile →
                      </Link>
                    </div>
                    <p className="text-xs text-gray-400">
                      {app.applicant.email} · Applied {new Date(app.appliedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>

                  {/* Status dropdown */}
                  {app.status === "Withdrawn" ? (
                    <Badge label="Withdrawn" variant="gray" />
                  ) : (
                    <select
                      value={app.status}
                      disabled={isUpdating}
                      onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}

                  {/* Résumé shortcut */}
                  {app.resumePath && app.resumePath !== "pending-upload" && (
                    <a href={uploadApi.resumeUrl(app.resumePath)}
                      target="_blank" rel="noopener noreferrer"
                      className="hidden sm:inline-flex text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shrink-0">
                      📄 CV
                    </a>
                  )}

                  {/* Expand chevron */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : app.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 shrink-0"
                    aria-label={isOpen ? "Collapse" : "Expand details"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      className={`transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                {/* ── Expanded detail panel ──────────────────────────────── */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">

                    {/* Cover letter */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Cover Letter</p>
                      {app.coverLetter ? (
                        <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-3 whitespace-pre-line leading-relaxed">
                          {app.coverLetter}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No cover letter provided.</p>
                      )}
                    </div>

                    {/* Resume + profile links */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Documents & Profile</p>
                      <div className="flex flex-wrap gap-2">
                        {app.resumePath && app.resumePath !== "pending-upload" ? (
                          <a href={uploadApi.resumeUrl(app.resumePath)}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-700 transition-colors">
                            📄 Download Résumé / CV
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No résumé attached.</span>
                        )}
                        <Link href={`/seekers/${app.applicant.id}`}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-700 transition-colors">
                          👤 View Applicant Profile
                        </Link>
                      </div>
                    </div>

                    {/* Internal note */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Internal Note <span className="normal-case font-normal text-gray-400">(only visible to you)</span></p>
                      <textarea
                        rows={2}
                        value={notes[app.id] ?? ""}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [app.id]: e.target.value }))}
                        placeholder="Add a private note about this applicant…"
                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      {noteDirty && (
                        <button
                          onClick={() => saveNote(app.id)}
                          disabled={savingNote === app.id}
                          className="mt-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                        >
                          {savingNote === app.id ? "Saving…" : "Save Note"}
                        </button>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        Last updated: {app.updatedAt
                          ? new Date(app.updatedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
                          : "Not yet updated"}
                      </p>
                      <Badge label={app.status} variant={statusColors[app.status] ?? "gray"} />
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
