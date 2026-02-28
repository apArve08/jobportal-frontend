"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { profileApi, uploadApi } from "@/lib/api";
import type { ProfileDto, UpsertProfileDto } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function SeekerProfilePage() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile]   = useState<ProfileDto | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess]   = useState("");
  const [error, setError]       = useState("");

  const [form, setForm] = useState<UpsertProfileDto>({
    headline: "", summary: "", location: "", skills: "",
    yearsOfExperience: undefined, linkedInUrl: "", gitHubUrl: "",
    portfolioUrl: "", phoneNumber: "", resumeFileName: "",
  });

  // Load existing profile on mount
  useEffect(() => {
    profileApi.getMine()
      .then((p) => {
        setProfile(p);
        setForm({
          headline:          p.headline          ?? "",
          summary:           p.summary           ?? "",
          location:          p.location          ?? "",
          skills:            p.skills            ?? "",
          yearsOfExperience: p.yearsOfExperience,
          linkedInUrl:       p.linkedInUrl       ?? "",
          gitHubUrl:         p.gitHubUrl         ?? "",
          portfolioUrl:      p.portfolioUrl      ?? "",
          phoneNumber:       p.phoneNumber       ?? "",
          resumeFileName:    p.resumeFileName    ?? "",
        });
      })
      .catch(() => { /* 404 = no profile yet — that's fine */ })
      .finally(() => setLoading(false));
  }, []);

  const set = (k: keyof UpsertProfileDto) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({
        ...f,
        [k]: k === "yearsOfExperience" ? (e.target.value ? Number(e.target.value) : undefined) : e.target.value,
      }));

  // Upload résumé file first, then store the filename in form state
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { fileName } = await uploadApi.resume(file);
      setForm((f) => ({ ...f, resumeFileName: fileName }));
      setSuccess("Résumé uploaded — click Save to apply the change.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await profileApi.upsert(form);
      setProfile(updated);
      setSuccess("Profile saved successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const resumeName = form.resumeFileName
    ? form.resumeFileName.replace(/^\d+_[a-f0-9]+/, "résumé") // humanise the stored name
    : null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            This is your live résumé — visible to employers who review your applications.
          </p>
        </div>
        {user && (
          <Link
            href={`/seekers/${user.id}`}
            target="_blank"
            className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            View public profile →
          </Link>
        )}
      </div>

      {error   && <div className="mb-4"><ErrorMessage message={error} /></div>}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Personal info ───────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Personal Info</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professional Headline
            </label>
            <input type="text" value={form.headline} onChange={set("headline")}
              className={inputClass}
              placeholder='e.g. "Full Stack Developer | React & .NET"' />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={set("location")}
                className={inputClass} placeholder="City, Country" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={form.phoneNumber} onChange={set("phoneNumber")}
                className={inputClass} placeholder="+1 555 000 0000" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professional Summary
            </label>
            <textarea rows={5} value={form.summary} onChange={set("summary")}
              className={inputClass}
              placeholder="Tell employers about your background, strengths, and what you're looking for…" />
          </div>
        </section>

        {/* ── Skills & experience ──────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Skills & Experience</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input type="text" value={form.skills} onChange={set("skills")}
              className={inputClass}
              placeholder="React, TypeScript, C#, Docker, PostgreSQL" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Experience
            </label>
            <select value={form.yearsOfExperience ?? ""} onChange={set("yearsOfExperience")}
              className={inputClass}>
              <option value="">Select…</option>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n === 0 ? "Less than 1 year" : `${n}+ years`}</option>
              ))}
            </select>
          </div>
        </section>

        {/* ── Links ───────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Links</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <input type="url" value={form.linkedInUrl} onChange={set("linkedInUrl")}
              className={inputClass} placeholder="https://linkedin.com/in/yourname" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
            <input type="url" value={form.gitHubUrl} onChange={set("gitHubUrl")}
              className={inputClass} placeholder="https://github.com/yourname" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio / Website</label>
            <input type="url" value={form.portfolioUrl} onChange={set("portfolioUrl")}
              className={inputClass} placeholder="https://yoursite.com" />
          </div>
        </section>

        {/* ── Résumé upload ────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Résumé / CV</h2>

          {resumeName ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
              <span className="text-green-700 text-sm">📄 {resumeName}</span>
              {profile?.resumeFileName && (
                <a
                  href={uploadApi.resumeUrl(profile.resumeFileName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline ml-auto"
                >
                  Preview ↗
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-3">No résumé uploaded yet.</p>
          )}

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleResumeUpload}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            {uploading ? "Uploading…" : resumeName ? "Replace résumé" : "Upload résumé (PDF / DOC)"}
          </button>
          <p className="mt-2 text-xs text-gray-400">Max 5 MB · PDF, DOC, or DOCX</p>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {saving ? "Saving…" : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
