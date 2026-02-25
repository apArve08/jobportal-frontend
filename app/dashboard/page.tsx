"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Role-based redirect hub — /dashboard sends each role to their own dashboard
export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace("/login"); return; }
    if (user.role === "Employer")  router.replace("/dashboard/employer");
    if (user.role === "JobSeeker") router.replace("/dashboard/seeker");
    if (user.role === "Admin")     router.replace("/dashboard/admin");
  }, [user, isLoading, router]);

  return <LoadingSpinner text="Redirecting to your dashboard…" />;
}
