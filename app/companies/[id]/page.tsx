"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { companyApi, jobsApi } from "@/lib/api";
import type { CompanyDto, JobListItemDto } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import JobCard from "@/components/jobs/JobCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function CompanyPage() {
  const { id } = useParams<{ id: string }>();
  const companyId = Number(id);
  const { user, isEmployer } = useAuth();

  const [company, setCompany] = useState<CompanyDto | null>(null);
  const [jobs, setJobs]       = useState<JobListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    Promise.all([
      companyApi.getById(companyId),
      jobsApi.list({ companyId, pageSize: 50 }),
    ])
      .then(([c, j]) => {
        setCompany(c);
        setJobs(j.items);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load company."))
      .finally(() => setLoading(false));
  }, [companyId]);

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} />;
  if (!company) return null;

  const isOwner = isEmployer && user?.id === company.ownerId;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Company header card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-16 h-16 rounded-xl object-contain border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center text-3xl shrink-0">
                🏢
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
                {company.industry  && <span>{company.industry}</span>}
                {company.location  && <span>· {company.location}</span>}
                {company.companySize && <span>· {company.companySize} employees</span>}
              </div>
            </div>
          </div>

          {/* Owner can edit from here */}
          {isOwner && (
            <Link
              href="/dashboard/employer/company"
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shrink-0"
            >
              Edit Profile
            </Link>
          )}
        </div>

        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-sm text-blue-600 hover:underline"
          >
            {company.website}
          </a>
        )}

        {company.description && (
          <p className="mt-4 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {company.description}
          </p>
        )}
      </div>

      {/* Open positions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Open Positions
          <span className="ml-2 text-base font-normal text-gray-400">({jobs.length})</span>
        </h2>

        {jobs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No open positions at this time.
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
