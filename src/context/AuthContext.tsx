"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DemoUser, DEMO_USERS } from "@/lib/fixtures/users";
import { useHydrated } from "@/lib/use-hydrated";
import {
  getSavedSession,
  saveSession,
  clearSession,
  verifyRegisteredCredentials,
} from "@/lib/account-storage";

export interface AuthContextType {
  user: DemoUser | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  signIn: (roleKeyOrEmail: "customer" | "customerB" | "staff" | string, plainPassword?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  switchUser: (roleKey: "customer" | "customerB" | "staff" | "signedOut") => void;
  setRegisteredSession: (user: DemoUser) => void;
  isHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "addis_eats_demo_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = useHydrated();
  const [user, setUser] = useState<DemoUser | null>(null);

  // Load saved session or demo user after mount (hydration safe)
  useEffect(() => {
    try {
      // 1. Check for registered user session first
      const session = getSavedSession();
      if (session) {
        queueMicrotask(() => {
          setUser({
            id: session.id,
            name: session.name,
            email: session.email,
            role: session.role,
            phone: session.phone || "",
            defaultAddress: session.defaultAddress || "",
          });
        });
        return;
      }

      // 2. Check for demo persona switch state
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored && stored !== "signed_out" && DEMO_USERS[stored]) {
        queueMicrotask(() => setUser(DEMO_USERS[stored]));
      }
    } catch {
      // Storage access blocked or unavailable
    }
  }, []);

  const signIn = async (
    roleKeyOrEmail: "customer" | "customerB" | "staff" | string,
    plainPassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Check if it's one of the demo keys
    if (roleKeyOrEmail === "customer" || roleKeyOrEmail === "customerB" || roleKeyOrEmail === "staff") {
      const selected = DEMO_USERS[roleKeyOrEmail] || DEMO_USERS.customer;
      setUser(selected);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, roleKeyOrEmail);
        saveSession(selected);
      } catch {
        // Ignore
      }
      return { success: true };
    }

    // Check if it's an email matching a demo persona
    const matchedDemoKey = (Object.keys(DEMO_USERS) as Array<"customer" | "customerB" | "staff">).find(
      (k) => DEMO_USERS[k].email.toLowerCase() === roleKeyOrEmail.trim().toLowerCase()
    );

    if (matchedDemoKey) {
      const selected = DEMO_USERS[matchedDemoKey];
      setUser(selected);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, matchedDemoKey);
        saveSession(selected);
      } catch {
        // Ignore
      }
      return { success: true };
    }

    // Check registered accounts in localStorage
    if (plainPassword !== undefined) {
      const verifyRes = await verifyRegisteredCredentials(roleKeyOrEmail, plainPassword);
      if (!verifyRes.success || !verifyRes.account) {
        return { success: false, error: verifyRes.error || "Invalid email or password." };
      }

      const registeredUser: DemoUser = {
        id: verifyRes.account.id,
        name: verifyRes.account.name,
        email: verifyRes.account.email,
        role: "customer", // Strict customer role
        phone: verifyRes.account.phone,
        defaultAddress: verifyRes.account.defaultAddress,
      };

      setUser(registeredUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, "registered");
        saveSession(registeredUser);
      } catch {
        // Ignore
      }
      return { success: true };
    }

    return { success: false, error: "Password is required to sign in." };
  };

  const setRegisteredSession = (registeredUser: DemoUser) => {
    setUser(registeredUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, "registered");
      saveSession(registeredUser);
    } catch {
      // Ignore
    }
  };

  const signOut = () => {
    setUser(null);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, "signed_out");
      clearSession();
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
        setRegisteredSession,
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
