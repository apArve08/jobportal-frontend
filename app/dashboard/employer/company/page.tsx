"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { companyApi } from "@/lib/api";
import type { CompanyDto, CreateCompanyDto } from "@/lib/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

const SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];
const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "Retail",
  "Manufacturing", "Media", "Consulting", "Real Estate", "Other",
];

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function CompanyProfilePage() {
  const router = useRouter();

  const [company, setCompany]     = useState<CompanyDto | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState("");
  const [error, setError]         = useState("");

  // Form state — pre-filled when company exists
  const [form, setForm] = useState<CreateCompanyDto & { logoUrl?: string }>({
    name: "", description: "", website: "",
    industry: "", companySize: "", location: "", logoUrl: "",
  });

  // Load existing company on mount
  useEffect(() => {
    companyApi.getMine()
      .then((c) => {
        setCompany(c);
        setForm({
          name:        c.name        ?? "",
          description: c.description ?? "",
          website:     c.website     ?? "",
          industry:    c.industry    ?? "",
          companySize: c.companySize ?? "",
          location:    c.location    ?? "",
          logoUrl:     c.logoUrl     ?? "",
        });
      })
      .catch(() => {
        // 404 = no company yet — that's fine, show create form
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      name:        form.name,
      description: form.description || undefined,
      website:     form.website     || undefined,
      industry:    form.industry    || undefined,
      companySize: form.companySize || undefined,
      location:    form.location    || undefined,
    };

    try {
      if (company) {
        // Update existing
        const updated = await companyApi.update({ ...payload, logoUrl: form.logoUrl || undefined });
        setCompany(updated);
        setSuccess("Company profile updated successfully.");
      } else {
        // Create new
        const created = await companyApi.create(payload);
        setCompany(created);
        setSuccess("Company profile created! You can now post jobs.");
        // Redirect to dashboard after short delay
        setTimeout(() => router.push("/dashboard/employer"), 1500);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save company profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const isNew = !company;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? "Create Company Profile" : "Company Profile"}
        </h1>
        {isNew && (
          <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            ⚠️ You need a company profile before you can post jobs.
          </p>
        )}
      </div>

      {error   && <div className="mb-4"><ErrorMessage message={error} /></div>}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
          <input type="text" required value={form.name} onChange={set("name")}
            className={inputClass} placeholder="e.g. Acme Corporation" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <select value={form.industry} onChange={set("industry")} className={inputClass}>
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
            <select value={form.companySize} onChange={set("companySize")} className={inputClass}>
              <option value="">Select size</option>
              {SIZES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input type="text" value={form.location} onChange={set("location")}
            className={inputClass} placeholder="e.g. San Francisco, CA" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input type="url" value={form.website} onChange={set("website")}
            className={inputClass} placeholder="https://yourcompany.com" />
        </div>

        {!isNew && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input type="url" value={form.logoUrl} onChange={set("logoUrl")}
              className={inputClass} placeholder="https://yourcompany.com/logo.png" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea rows={5} value={form.description} onChange={set("description")}
            className={inputClass}
            placeholder="Tell job seekers about your company, culture, and mission…" />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {saving ? "Saving…" : isNew ? "Create Company Profile" : "Save Changes"}
          </button>
          {!isNew && (
            <button type="button" onClick={() => router.push("/dashboard/employer")}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
