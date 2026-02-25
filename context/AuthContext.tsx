"use client";

import {
  createContext, useContext, useEffect, useState, useCallback,
  type ReactNode,
} from "react";
import { authApi } from "@/lib/api";
import type { UserDto, LoginRequest, RegisterRequest } from "@/lib/types";

interface AuthContextValue {
  user: UserDto | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isEmployer: boolean;
  isJobSeeker: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<UserDto | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (stored && storedUser) {
      setToken(stored);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const persist = (token: string, user: UserDto) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    // Write cookie so Next.js middleware (Edge runtime) can read role for route guards
    document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Lax`;
    setToken(token);
    setUser(user);
  };

  const login = useCallback(async (data: LoginRequest) => {
    const res = await authApi.login(data);
    persist(res.token, res.user);
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    persist(res.token, res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user, token, isLoading, login, register, logout,
        isEmployer:  user?.role === "Employer",
        isJobSeeker: user?.role === "JobSeeker",
        isAdmin:     user?.role === "Admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
