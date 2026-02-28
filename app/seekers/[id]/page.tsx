"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { profileApi, uploadApi } from "@/lib/api";
import type { ProfileDto } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function PublicSeekerProfilePage() {
  const { id }             = useParams<{ id: string }>();
  const { user, isEmployer } = useAuth();

  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    profileApi.getByUserId(Number(id))
      .then(setProfile)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Profile not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} />;
  if (!profile) return null;

  const isOwn = user?.id === profile.userId;

  const skills = profile.skills
    ? profile.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-5">
            {/* Avatar placeholder */}
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl shrink-0">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
              {profile.headline && (
                <p className="text-gray-500 mt-1">{profile.headline}</p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-400">
                {profile.location && <span>📍 {profile.location}</span>}
                {profile.yearsOfExperience != null && (
                  <span>💼 {profile.yearsOfExperience}+ years experience</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            {isOwn && (
              <a
                href="/dashboard/seeker/profile"
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-center"
              >
                Edit Profile
              </a>
            )}
            {profile.hasResume && profile.resumeFileName && (
              <a
                href={uploadApi.resumeUrl(profile.resumeFileName)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-center"
              >
                Download Résumé
              </a>
            )}
          </div>
        </div>

        {/* Contact row */}
        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">
              {profile.email}
            </a>
          )}
          {profile.phoneNumber && (
            <span className="text-gray-500">{profile.phoneNumber}</span>
          )}
        </div>

        {/* External links */}
        {(profile.linkedInUrl || profile.gitHubUrl || profile.portfolioUrl) && (
          <div className="mt-4 flex flex-wrap gap-3">
            {profile.linkedInUrl && (
              <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline">
                LinkedIn ↗
              </a>
            )}
            {profile.gitHubUrl && (
              <a href={profile.gitHubUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline">
                GitHub ↗
              </a>
            )}
            {profile.portfolioUrl && (
              <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline">
                Portfolio ↗
              </a>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {profile.summary && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">About</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {profile.summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Employer-only CTA */}
      {isEmployer && !isOwn && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 text-center text-sm text-gray-500">
          Reviewing this candidate? Go to your{" "}
          <a href="/dashboard/employer" className="text-blue-600 hover:underline">
            Employer Dashboard
          </a>{" "}
          to manage their application status.
        </div>
      )}
    </div>
  );
}
