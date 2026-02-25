"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout, isEmployer, isJobSeeker } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          JobPortal
        </Link>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">Jobs</Link>

          {isEmployer && (
            <>
              <Link href="/dashboard/employer" className="hover:text-blue-600 transition-colors">Dashboard</Link>
              <Link href="/dashboard/employer/post-job" className="hover:text-blue-600 transition-colors">Post a Job</Link>
            </>
          )}

          {isJobSeeker && (
            <>
              <Link href="/dashboard/seeker" className="hover:text-blue-600 transition-colors">Dashboard</Link>
              <Link href="/dashboard/seeker/applications" className="hover:text-blue-600 transition-colors">My Applications</Link>
              <Link href="/dashboard/seeker/saved-jobs" className="hover:text-blue-600 transition-colors">Saved Jobs</Link>
            </>
          )}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 hidden sm:block">
                {user.fullName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
