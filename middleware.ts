/**
 * Next.js middleware runs on the Edge before every request.
 * It reads the token from localStorage — BUT middleware can't access
 * localStorage (it's server-side). So we store the token in a cookie
 * (named "token") when the user logs in, and read it here.
 *
 * Protected route matrix:
 *   /dashboard/seeker/*  → JobSeeker only
 *   /dashboard/employer/* → Employer only
 *   /dashboard           → any authenticated user (redirect by role)
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_SEEKER   = ["/dashboard/seeker"];
const PROTECTED_EMPLOYER = ["/dashboard/employer"];
// /seekers/* is readable by any authenticated user (employers view applicant profiles)
const PROTECTED_ANY      = ["/dashboard", "/seekers"];

interface JwtPayload {
  role?: string;
  exp?: number;
  [key: string]: unknown;
}

function decode(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Parse the token to get role and expiry
  const payload = token ? decode(token) : null;
  const isExpired = payload?.exp ? payload.exp * 1000 < Date.now() : true;
  const isAuthenticated = !!payload && !isExpired;
  // ASP.NET Core stores the role claim under this long URI key in the JWT payload
  const roleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
  const role = payload ? (payload[roleKey] as string | undefined) : undefined;

  const redirectToLogin = () =>
    NextResponse.redirect(new URL(`/login?next=${pathname}`, request.url));

  // Unauthenticated user hitting any protected route
  if (!isAuthenticated) {
    const needsAuth = [...PROTECTED_ANY, ...PROTECTED_SEEKER, ...PROTECTED_EMPLOYER];
    if (needsAuth.some((p) => pathname.startsWith(p))) return redirectToLogin();
  }

  // Role-based guards
  if (isAuthenticated) {
    if (PROTECTED_SEEKER.some((p) => pathname.startsWith(p)) && role !== "JobSeeker")
      return NextResponse.redirect(new URL("/dashboard", request.url));

    if (PROTECTED_EMPLOYER.some((p) => pathname.startsWith(p)) && role !== "Employer")
      return NextResponse.redirect(new URL("/dashboard", request.url));

    // /login and /register redirect already-authed users to dashboard
    if (pathname === "/login" || pathname === "/register")
      return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // /seekers/[id] requires auth (employers view applicant profiles)
  matcher: ["/dashboard/:path*", "/seekers/:path*", "/login", "/register"],
};
