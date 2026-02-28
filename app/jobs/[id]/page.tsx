"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { jobsApi, savedJobsApi, applicationsApi, profileApi, uploadApi } from "@/lib/api";
import type { JobDto, ProfileDto } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

type ApplyState = "idle" | "form" | "submitting" | "done";

export default function JobDetailPage() {
  const { id }                    = useParams<{ id: string }>();
  const { user, isJobSeeker }     = useAuth();
  const router                    = useRouter();
  const fileRef                   = useRef<HTMLInputElement>(null);

  const [job, setJob]             = useState<JobDto | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [isSaved, setIsSaved]     = useState(false);

  // Seeker's saved profile — used to pre-fill resume
  const [profile, setProfile]     = useState<ProfileDto | null>(null);

  // Apply form state
  const [applyState, setApplyState]   = useState<ApplyState>("idle");
  const [applyError, setApplyError]   = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  // "saved" = use profile résumé | "new" = upload a fresh file
  const [resumeChoice, setResumeChoice] = useState<"saved" | "new">("saved");
  const [newFile, setNewFile]           = useState<File | null>(null);

  useEffect(() => {
    jobsApi.getById(Number(id))
      .then((data) => {
        setJob(data);
        if (user && isJobSeeker) {
          savedJobsApi.check(data.id).then((r) => setIsSaved(r.isSaved)).catch(() => {});
          // Load seeker profile to check for a saved résumé
          profileApi.getMine().then(setProfile).catch(() => {});
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

  const handleApplyClick = () => {
    if (!user) return router.push("/login");
    // Default résumé choice: "saved" if profile has one, otherwise "new"
    setResumeChoice(profile?.hasResume ? "saved" : "new");
    setApplyState("form");
    setApplyError("");
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError("");
    setApplyState("submitting");

    try {
      let resumePath = "";

      if (resumeChoice === "saved" && profile?.resumeFileName) {
        // Use the résumé already on file
        resumePath = profile.resumeFileName;
      } else {
        // Upload the selected file first
        if (!newFile) {
          setApplyError("Please select a résumé file to upload.");
          setApplyState("form");
          return;
        }
        const { fileName } = await uploadApi.resume(newFile);
        resumePath = fileName;
      }

      await applicationsApi.apply({
        jobId:       job!.id,
        resumePath,
        coverLetter: coverLetter.trim() || undefined,
      });

      setApplyState("done");
    } catch (err: unknown) {
      setApplyError(err instanceof Error ? err.message : "Application failed.");
      setApplyState("form");
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
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
              {job.company.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-500">
                <Link href={`/companies/${job.company.id}`} className="hover:text-blue-600 hover:underline">
                  {job.company.name}
                </Link>
                {job.company.location && ` · ${job.company.location}`}
              </p>
            </div>
          </div>

          {isJobSeeker && applyState === "idle" && (
            <div className="flex gap-2 shrink-0">
              <button onClick={handleSave}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isSaved ? "bg-blue-50 border-blue-300 text-blue-600" : "border-gray-300 hover:bg-gray-50"
                }`}>
                {isSaved ? "Saved ✓" : "Save"}
              </button>
              <button onClick={handleApplyClick}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                Apply Now
              </button>
            </div>
          )}
        </div>

        {/* ── Apply form ───────────────────────────────────────────────── */}
        {isJobSeeker && applyState === "done" && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            ✅ Application submitted! Track it in{" "}
            <Link href="/dashboard/seeker/applications" className="underline font-medium">
              My Applications
            </Link>
            .
          </div>
        )}

        {isJobSeeker && (applyState === "form" || applyState === "submitting") && (
          <form onSubmit={handleApplySubmit}
            className="mt-6 border border-blue-200 rounded-xl p-5 bg-blue-50 space-y-4">
            <h2 className="font-semibold text-gray-900">Apply for {job.title}</h2>

            {applyError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {applyError}
              </div>
            )}

            {/* Résumé section */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Résumé</p>

              {profile?.hasResume && (
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name="resumeChoice"
                    checked={resumeChoice === "saved"}
                    onChange={() => setResumeChoice("saved")}
                  />
                  <span className="text-sm text-gray-700">
                    Use saved résumé
                    {" "}
                    <a href={uploadApi.resumeUrl(profile.resumeFileName!)}
                      target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 text-xs hover:underline"
                      onClick={(e) => e.stopPropagation()}>
                      (preview ↗)
                    </a>
                  </span>
                </label>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="resumeChoice"
                  checked={resumeChoice === "new"}
                  onChange={() => setResumeChoice("new")}
                />
                <span className="text-sm text-gray-700">
                  {profile?.hasResume ? "Upload a different file" : "Upload résumé"}
                </span>
              </label>

              {resumeChoice === "new" && (
                <div className="mt-2 pl-6">
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
                  />
                  <button type="button"
                    onClick={() => fileRef.current?.click()}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                    {newFile ? `📄 ${newFile.name}` : "Choose file (PDF / DOC)"}
                  </button>
                  <span className="ml-2 text-xs text-gray-400">Max 5 MB</span>
                </div>
              )}
            </div>

            {/* Cover letter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={4}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Introduce yourself and explain why you're a great fit…"
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={applyState === "submitting"}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
                {applyState === "submitting" ? "Submitting…" : "Submit Application"}
              </button>
              <button type="button"
                onClick={() => setApplyState("idle")}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ── Badges ───────────────────────────────────────────────────── */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge label={job.jobType} variant="blue" />
          <Badge label={job.experienceLevel} variant="purple" />
          <Badge label={job.location} variant="gray" />
          {(job.salaryMin || job.salaryMax) && (
            <Badge label={`$${job.salaryMin?.toLocaleString()} – $${job.salaryMax?.toLocaleString()}`} variant="green" />
          )}
        </div>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <div className="mt-4 flex gap-6 text-sm text-gray-400">
          <span>{job.totalViews} views</span>
          <span>{job.totalApplications} applicants</span>
          <span>{job.totalSaves} saves</span>
        </div>

        {/* ── Tags ─────────────────────────────────────────────────────── */}
        {job.tags && (
          <div className="mt-4 flex flex-wrap gap-2">
            {job.tags.split(",").map((t) => (
              <span key={t} className="text-xs bg-gray-50 border rounded px-2 py-0.5 text-gray-500">
                {t.trim()}
              </span>
            ))}
          </div>
        )}

        {/* ── Description ──────────────────────────────────────────────── */}
        <div className="mt-8 border-t pt-6">
          <h2 className="font-semibold text-gray-900 mb-3">Job Description</h2>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
            {job.description}
          </div>
        </div>

        {/* ── Company ──────────────────────────────────────────────────── */}
        <div className="mt-8 border-t pt-6">
          <h2 className="font-semibold text-gray-900 mb-2">
            About{" "}
            <Link href={`/companies/${job.company.id}`} className="text-blue-600 hover:underline">
              {job.company.name}
            </Link>
          </h2>
          {job.company.industry && (
            <p className="text-sm text-gray-500">Industry: {job.company.industry}</p>
          )}
          {job.company.website && (
            <a href={job.company.website} target="_blank" rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline mt-1 block">
              {job.company.website}
            </a>
          )}
          <Link href={`/companies/${job.company.id}`}
            className="inline-block mt-3 text-sm text-blue-600 hover:underline">
            View company profile →
          </Link>
        </div>
      </div>
    </div>
  );
}
