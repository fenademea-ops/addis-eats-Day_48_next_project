"use client";

import React, { useState } from "react";
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

  // Form input state
  const [emailInput, setEmailInput] = useState(DEMO_USERS.customer.email);
  const [passwordInput, setPasswordInput] = useState("••••••••••••");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectAccount = (key: "customer" | "customerB" | "staff") => {
    setEmailInput(DEMO_USERS[key].email);
    signIn(key);
    router.push(validatedNext);
  };

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Find matching registered account
    const matchedKey = (Object.keys(DEMO_USERS) as Array<"customer" | "customerB" | "staff">).find(
      (k) => DEMO_USERS[k].email.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (matchedKey) {
      signIn(matchedKey);
      router.push(validatedNext);
    } else {
      setErrorMessage(
        "Account not found for that email address. Please select one of the available registered accounts below."
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Security Defense Notification (User-friendly notification when an external redirect is blocked) */}
      {wasRedirectSanitized && (
        <div
          role="status"
          className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 text-xs text-amber-200 flex items-start gap-3 shadow-md"
        >
          <span className="text-base leading-none">🛡️</span>
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">Notice: External redirect prevented</p>
            <p className="text-stone-300">
              For your account security, external redirect destinations are blocked. You will be safely directed to the home page after signing in.
            </p>
          </div>
        </div>
      )}

      {/* Current Active Account Status */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-md">
        <h2 className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-3">
          Current Active Session
        </h2>
        {isAuthenticated ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm text-stone-950 shadow-sm ${
                  user?.role === "staff" ? "bg-purple-400" : "bg-emerald-400"
                }`}
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
              className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold bg-stone-800/90 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="text-xs text-stone-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-stone-500" />
            <span>Currently browsing as a guest. Select an account below or sign in with your email.</span>
          </div>
        )}
      </div>

      {/* Quick Account Selection */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-serif font-bold text-stone-100">
            Select an Account
          </h2>
          <span className="text-[11px] text-amber-400 font-medium">Quick Access</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Customer Account 1 */}
          <button
            type="button"
            onClick={() => handleSelectAccount("customer")}
            className="p-4 rounded-xl text-left bg-stone-900 border border-stone-800 hover:border-amber-500/80 hover:bg-stone-900/90 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] group shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                Customer Account
              </span>
              <span className="text-xs text-stone-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">
                →
              </span>
            </div>
            <p className="text-sm font-semibold text-stone-100">Abebe Bikila</p>
            <p className="text-[11px] text-stone-400 truncate mt-1">customer@addiseats.local</p>
            <p className="text-[11px] text-emerald-400/90 mt-2 font-medium">Active Customer</p>
          </button>

          {/* Customer Account 2 */}
          <button
            type="button"
            onClick={() => handleSelectAccount("customerB")}
            className="p-4 rounded-xl text-left bg-stone-900 border border-stone-800 hover:border-amber-500/80 hover:bg-stone-900/90 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] group shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wide">
                Customer Account
              </span>
              <span className="text-xs text-stone-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">
                →
              </span>
            </div>
            <p className="text-sm font-semibold text-stone-100">Sara Haile</p>
            <p className="text-[11px] text-stone-400 truncate mt-1">sara@addiseats.local</p>
            <p className="text-[11px] text-blue-400/90 mt-2 font-medium">Active Customer</p>
          </button>

          {/* Kitchen Staff */}
          <button
            type="button"
            onClick={() => handleSelectAccount("staff")}
            className="p-4 rounded-xl text-left bg-stone-900 border border-stone-800 hover:border-amber-500/80 hover:bg-stone-900/90 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] group shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wide">
                Staff & Operations
              </span>
              <span className="text-xs text-stone-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">
                →
              </span>
            </div>
            <p className="text-sm font-semibold text-stone-100">Kitchen Head Chef</p>
            <p className="text-[11px] text-stone-400 truncate mt-1">kitchen@addiseats.local</p>
            <p className="text-[11px] text-purple-400/90 mt-2 font-medium">Kitchen & Dashboard</p>
          </button>
        </div>
      </div>

      {/* Standard Email Sign-In Form */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-lg">
        <div>
          <h2 className="text-base font-serif font-bold text-stone-100">
            Sign In with Email
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Access your orders, saved favorites, and delivery addresses.
          </p>
        </div>

        {errorMessage && (
          <div role="alert" className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="user-email" className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              id="user-email"
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g. customer@addiseats.local"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="user-password" className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              id="user-password"
              type="password"
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px]"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[44px] px-6 py-3 rounded-xl text-sm font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-98 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 shadow-md cursor-pointer"
          >
            Sign In →
          </button>
        </form>

        <div className="pt-2 border-t border-stone-800/80 text-center">
          <p className="text-[11px] text-stone-400">
            Addis Eats Educational Demonstration • All session data is stored locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
}
