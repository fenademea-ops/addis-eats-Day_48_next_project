"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DemoUser, DEMO_USERS, DEFAULT_DEMO_USER } from "@/lib/fixtures/users";
import { useHydrated } from "@/lib/use-hydrated";

interface AuthContextType {
  user: DemoUser | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  signIn: (roleKey: "customer" | "customerB" | "staff") => void;
  signOut: () => void;
  switchUser: (roleKey: "customer" | "customerB" | "staff" | "signedOut") => void;
  isHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "addis_eats_demo_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = useHydrated();
  const [user, setUser] = useState<DemoUser | null>(DEFAULT_DEMO_USER);

  // Load saved demo user after mount (hydration safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored === "signed_out") {
        queueMicrotask(() => setUser(null));
      } else if (stored && DEMO_USERS[stored]) {
        queueMicrotask(() => setUser(DEMO_USERS[stored]));
      }
    } catch {
      // Storage access blocked
    }
  }, []);

  const signIn = (roleKey: "customer" | "customerB" | "staff") => {
    const selected = DEMO_USERS[roleKey] || DEMO_USERS.customer;
    setUser(selected);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, roleKey);
    } catch {
      // Ignore
    }
  };

  const signOut = () => {
    setUser(null);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, "signed_out");
    } catch {
      // Ignore
    }
  };

  const switchUser = (roleKey: "customer" | "customerB" | "staff" | "signedOut") => {
    if (roleKey === "signedOut") {
      signOut();
    } else {
      signIn(roleKey);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isStaff: user?.role === "staff",
        signIn,
        signOut,
        switchUser,
        isHydrated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
