"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

type UserRole = "customer" | "owner";

interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if backend session already exists
  useEffect(() => {
    async function fetchMe() {
      try {
        const data = await api<{ user: AuthUser }>("/api/users/me");
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  async function login(email: string, password: string) {
    const data = await api<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    setUser(data.user);
  }

  async function register(email: string, password: string, role: UserRole) {
    const data = await api<{ user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, role })
    });
    setUser(data.user);
  }

  async function logout() {
    await api<void>("/api/auth/logout", {
      method: "POST"
    });
    setUser(null);
  }

  const value: AuthContextValue = {
    user,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}