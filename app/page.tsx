"use client";

import { useEffect, useState, useCallback } from "react";
import { jobsApi } from "@/lib/api";
import type { JobListItemDto, JobFilterParams, PagedResult } from "@/lib/types";
import JobCard from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function HomePage() {
  const [result, setResult]   = useState<PagedResult<JobListItemDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [filters, setFilters] = useState<JobFilterParams>({ page: 1, pageSize: 10 });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await jobsApi.list(filters);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      {/* Hero */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Find Your Next Opportunity
        </h1>
        <p className="text-gray-500 text-lg">
          {result?.totalCount ?? "..."} jobs available right now
        </p>
      </div>

      {/* Filters */}
      <JobFilters filters={filters} onChange={setFilters} />

      {/* Results */}
      <div className="mt-6">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : !result?.items.length ? (
          <div className="text-center py-20 text-gray-400">
            No jobs match your search. Try different filters.
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Showing {result.items.length} of {result.totalCount} jobs
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((job) => <JobCard key={job.id} job={job} />)}
            </div>

            {/* Pagination */}
            {result.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  disabled={!result.hasPreviousPage}
                  onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                  className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {result.page} of {result.totalPages}
                </span>
                <button
                  disabled={!result.hasNextPage}
                  onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                  className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
