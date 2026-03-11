"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function Navbar() {
  const { user, logout, isEmployer, isJobSeeker } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          HireFlow
        </Link>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Jobs</Link>

          {isEmployer && (
            <>
              <Link href="/dashboard/employer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</Link>
              <Link href="/dashboard/employer/jobs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">My Jobs</Link>
              <Link href="/dashboard/employer/post-job" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Post a Job</Link>
              <Link href="/dashboard/employer/company" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Company</Link>
            </>
          )}

          {isJobSeeker && (
            <>
              <Link href="/dashboard/seeker" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</Link>
              <Link href="/dashboard/seeker/applications" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">My Applications</Link>
              <Link href="/dashboard/seeker/saved-jobs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Saved Jobs</Link>
              <Link href="/dashboard/seeker/profile" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">My Profile</Link>
            </>
          )}
        </div>

        {/* Right side: theme toggle + auth */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 dark:text-slate-300 hidden sm:block">
                {user.fullName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
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
