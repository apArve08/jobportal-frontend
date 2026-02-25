"use client";

import Link from "next/link";
import type { JobListItemDto } from "@/lib/types";
import Badge from "@/components/ui/Badge";

function salaryLabel(min?: number, max?: number) {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function JobCard({ job }: { job: JobListItemDto }) {
  const salary = salaryLabel(job.salaryMin, job.salaryMax);

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Company logo placeholder */}
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
            {job.companyName.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
            <p className="text-sm text-gray-500 truncate">{job.companyName}</p>
          </div>
        </div>
        <span className="text-xs text-gray-400 shrink-0">{timeAgo(job.createdAt)}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge label={job.jobType} variant="blue" />
        <Badge label={job.experienceLevel} variant="purple" />
        <Badge label={job.location} variant="gray" />
        {salary && <Badge label={salary} variant="green" />}
      </div>

      {job.tags && (
        <div className="mt-2 flex flex-wrap gap-1">
          {job.tags.split(",").slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-gray-500">
              {tag.trim()}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
