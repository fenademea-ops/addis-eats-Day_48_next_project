"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DEMO_USERS } from "@/lib/fixtures/users";
import { isSafeRedirectPath } from "@/lib/safe-redirect";

export function SignInView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signIn, signOut, isAuthenticated } = useAuth();

  // Attack 3 check: validate return destination
  const rawNext = searchParams.get("next");
  const validatedNext = isSafeRedirectPath(rawNext);
  const wasRedirectSanitized = Boolean(rawNext && rawNext !== validatedNext);
  const justRegistered = searchParams.get("registered") === "true";

  // Form input state
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectAccount = async (key: "customer" | "customerB" | "staff") => {
    setEmailInput(DEMO_USERS[key].email);
    await signIn(key);
    router.push(validatedNext);
  };

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await signIn(emailInput, passwordInput);
      if (result.success) {
        router.push(validatedNext);
      } else {
        setErrorMessage(result.error || "Invalid email or password.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred during sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Registration Success Notification */}
      {justRegistered && (
        <div
          role="status"
          className="bg-emerald-950/60 border border-emerald-800 rounded-2xl p-4 text-xs text-emerald-200 flex items-center gap-3 shadow-md animate-in fade-in duration-200"
        >
          <span className="text-xl" aria-hidden="true">✓</span>
          <div>
            <p className="font-semibold text-emerald-300">Registration Complete</p>
            <p className="text-stone-300 mt-0.5">
              Your account has been created. Please sign in with your email and password below.
            </p>
          </div>
        </div>
      )}

      {/* Security Defense Notification */}
      {wasRedirectSanitized && (
        <div
          role="status"
          className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 text-xs text-amber-200 flex items-start gap-3 shadow-md"
        >
          <span className="text-base leading-none" aria-hidden="true">🛡️</span>
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">Notice: External redirect prevented</p>
            <p className="text-stone-300">
              For your account security, external redirect destinations are blocked. You will be safely directed to the home page after signing in.
            </p>
          </div>
        </div>
      )}

      {/* Current Active Account Status */}
      <section aria-labelledby="session-status-heading" className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-md">
        <h2 id="session-status-heading" className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-3">
          Current Active Session
        </h2>
        {isAuthenticated ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm text-stone-950 shadow-sm ${
                  user?.role === "staff" ? "bg-purple-400" : "bg-emerald-400"
                }`}
                aria-hidden="true"
              >
                {user?.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-100 flex items-center gap-2">
                  <span>{user?.name}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      user?.role === "staff"
                        ? "bg-purple-950/80 text-purple-300 border border-purple-800/60"
                        : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                    }`}
                  >
                    {user?.role === "staff" ? "Kitchen Staff" : "Customer"}
                  </span>
                </p>
                <p className="text-xs text-stone-400 mt-0.5">{user?.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold bg-stone-800/90 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="text-xs text-stone-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-stone-500" aria-hidden="true" />
            <span>Currently browsing as a guest. Sign in with your registered account or select a demo persona below.</span>
          </div>
        )}
      </section>

      {/* Standard Email Sign-In Form */}
      <section aria-labelledby="signin-form-title" className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-lg">
        <div>
          <h1 id="signin-form-title" className="text-base sm:text-lg font-serif font-bold text-stone-100">
            Sign In with Your Account
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Access your orders, saved favorites, and delivery addresses.
          </p>
        </div>

        {errorMessage && (
          <div role="alert" className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-xs text-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="user-email" className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-amber-500" aria-hidden="true">*</span>
            </label>
            <input
              id="user-email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g. abebe@example.com or customer@addiseats.local"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="user-password" className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Password <span className="text-amber-500" aria-hidden="true">*</span>
            </label>
            <input
              id="user-password"
              type="password"
              autoComplete="current-password"
              required
              aria-required="true"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter your account password"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[44px] px-6 py-3 rounded-xl text-sm font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-98 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 shadow-md cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div className="pt-3 border-t border-stone-800/80 text-center">
          <p className="text-xs text-stone-400">
            Don&apos;t have an account?{" "}
            <Link
              href={rawNext ? `/signup?next=${encodeURIComponent(rawNext)}` : "/signup"}
              className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded p-1"
            >
              Sign up
            </Link>
          </p>
        </div>
      </section>

      {/* Quick Demo Persona Switcher */}
      <section aria-labelledby="persona-switcher-title" className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between">
          <h2 id="persona-switcher-title" className="text-sm font-serif font-bold text-stone-100">
            Or Use Demo Persona Switcher
          </h2>
          <span className="text-[11px] text-amber-400 font-medium">1-Click Test Access</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="group" aria-label="Demo personas">
          {/* Customer Account 1 */}
          <button
            type="button"
            onClick={() => handleSelectAccount("customer")}
            className="p-4 rounded-xl text-left bg-stone-900 border border-stone-800 hover:border-amber-500/80 hover:bg-stone-900/90 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] group shadow-xs cursor-pointer"
            aria-label="Sign in as Customer A: Abebe Bikila"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                Customer A
              </span>
              <span className="text-xs text-stone-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" aria-hidden="true">
                →
              </span>
            </div>
            <p className="text-sm font-semibold text-stone-100">Abebe Bikila</p>
            <p className="text-[11px] text-stone-400 truncate mt-1">customer@addiseats.local</p>
            <p className="text-[11px] text-emerald-400/90 mt-2 font-medium">Owns ord_810–812</p>
          </button>

          {/* Customer Account 2 */}
          <button
            type="button"
            onClick={() => handleSelectAccount("customerB")}
            className="p-4 rounded-xl text-left bg-stone-900 border border-stone-800 hover:border-blue-500/80 hover:bg-stone-900/90 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] group shadow-xs cursor-pointer"
            aria-label="Sign in as Customer B: Sara Haile"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wide">
                Customer B
              </span>
              <span className="text-xs text-stone-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" aria-hidden="true">
                →
              </span>
            </div>
            <p className="text-sm font-semibold text-stone-100">Sara Haile</p>
            <p className="text-[11px] text-stone-400 truncate mt-1">sara@addiseats.local</p>
            <p className="text-[11px] text-blue-400/90 mt-2 font-medium">Owns ord_201 (IDOR)</p>
          </button>

          {/* Kitchen Staff */}
          <button
            type="button"
            onClick={() => handleSelectAccount("staff")}
            className="p-4 rounded-xl text-left bg-stone-900 border border-stone-800 hover:border-purple-500/80 hover:bg-stone-900/90 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] group shadow-xs cursor-pointer"
            aria-label="Sign in as Kitchen Staff: Kitchen Head Chef"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wide">
                Kitchen Staff
              </span>
              <span className="text-xs text-stone-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" aria-hidden="true">
                →
              </span>
            </div>
            <p className="text-sm font-semibold text-stone-100">Kitchen Head Chef</p>
            <p className="text-[11px] text-stone-400 truncate mt-1">kitchen@addiseats.local</p>
            <p className="text-[11px] text-purple-400/90 mt-2 font-medium">Admin & Kitchen Access</p>
          </button>
        </div>
      </section>
    </div>
  );
}
