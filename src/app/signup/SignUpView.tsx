"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isSafeRedirectPath } from "@/lib/safe-redirect";
import { registerAccount } from "@/lib/account-storage";

export function SignUpView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  const rawNext = searchParams.get("next");
  const validatedNext = isSafeRedirectPath(rawNext);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [neighborhood, setNeighborhood] = useState("Bole");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleValidation = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName || fullName.trim().length < 2) {
      errors.fullName = "Please enter your full name (minimum 2 characters).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    const phonePattern = /^\+?[0-9\s-]{9,15}$/;
    if (!phone || !phonePattern.test(phone.trim())) {
      errors.phone = "Enter a valid phone number (e.g., +251 91 123 4567).";
    }

    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!handleValidation()) return;

    setIsSubmitting(true);

    try {
      const result = await registerAccount({
        name: fullName,
        email,
        phone,
        neighborhood,
        password,
      });

      if (!result.success) {
        setServerError(result.error || "Failed to register account.");
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);

      const signinUrl = validatedNext && validatedNext !== "/"
        ? `/signin?next=${encodeURIComponent(validatedNext)}&registered=true`
        : `/signin?registered=true`;

      setTimeout(() => {
        router.push(signinUrl);
      }, 1200);
    } catch {
      setServerError("An unexpected error occurred while saving your account.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
          Create an Account
        </h1>
        <p className="text-xs sm:text-sm text-stone-400">
          Join Addis Eats to track your orders, save favorite Ethiopian dishes, and order faster.
        </p>
      </div>

      {isAuthenticated && (
        <div role="status" className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 text-xs text-amber-200 flex items-center justify-between">
          <span>Currently signed in as <strong>{user?.name}</strong></span>
          <Link
            href="/signin"
            className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded p-1"
          >
            Switch Account
          </Link>
        </div>
      )}

      {serverError && (
        <div role="alert" className="p-4 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
          <span className="text-base" aria-hidden="true">⚠️</span>
          <span>{serverError}</span>
        </div>
      )}

      {isSuccess && (
        <div role="status" className="bg-emerald-950/80 border border-emerald-800 rounded-xl p-4 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in duration-200">
          <span className="text-base" aria-hidden="true">✓</span>
          <span>Account created successfully! Redirecting you to Sign In...</span>
        </div>
      )}

      {/* Registration Form */}
      <section aria-labelledby="signup-form-title" className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h2 id="signup-form-title" className="sr-only">Sign Up Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="full-name"
              className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5"
            >
              Full Name <span className="text-amber-500" aria-hidden="true">*</span>
            </label>
            <input
              id="full-name"
              type="text"
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={!!fieldErrors.fullName}
              aria-describedby={fieldErrors.fullName ? "fullname-error" : undefined}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Abebe Bikila"
              className={`w-full bg-stone-950 border rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] ${
                fieldErrors.fullName ? "border-red-500 ring-1 ring-red-500" : "border-stone-800"
              }`}
            />
            {fieldErrors.fullName && (
              <p id="fullname-error" role="alert" className="text-xs text-red-400 mt-1">{fieldErrors.fullName}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5"
            >
              Email Address <span className="text-amber-500" aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. abebe@example.com"
              className={`w-full bg-stone-950 border rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] ${
                fieldErrors.email ? "border-red-500 ring-1 ring-red-500" : "border-stone-800"
              }`}
            />
            {fieldErrors.email && (
              <p id="email-error" role="alert" className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5"
              >
                Phone Number <span className="text-amber-500" aria-hidden="true">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 91 123 4567"
                className={`w-full bg-stone-950 border rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] ${
                  fieldErrors.phone ? "border-red-500 ring-1 ring-red-500" : "border-stone-800"
                }`}
              />
              {fieldErrors.phone && (
                <p id="phone-error" role="alert" className="text-xs text-red-400 mt-1">{fieldErrors.phone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="neighborhood"
                className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5"
              >
                Primary Neighborhood
              </label>
              <select
                id="neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px]"
              >
                <option value="Bole">Bole</option>
                <option value="Kazanchis">Kazanchis</option>
                <option value="Megenagna">Megenagna</option>
                <option value="Piassa">Piassa</option>
                <option value="Sarbet">Sarbet</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5"
              >
                Password <span className="text-amber-500" aria-hidden="true">*</span>
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className={`w-full bg-stone-950 border rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] ${
                  fieldErrors.password ? "border-red-500 ring-1 ring-red-500" : "border-stone-800"
                }`}
              />
              {fieldErrors.password && (
                <p id="password-error" role="alert" className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5"
              >
                Confirm Password <span className="text-amber-500" aria-hidden="true">*</span>
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={fieldErrors.confirmPassword ? "confirmpassword-error" : undefined}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={`w-full bg-stone-950 border rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[44px] ${
                  fieldErrors.confirmPassword ? "border-red-500 ring-1 ring-red-500" : "border-stone-800"
                }`}
              />
              {fieldErrors.confirmPassword && (
                <p id="confirmpassword-error" role="alert" className="text-xs text-red-400 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="w-full min-h-[48px] px-6 py-3.5 rounded-xl text-sm font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-98 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 shadow-md cursor-pointer mt-2 disabled:opacity-60"
          >
            {isSubmitting ? "Creating Account..." : "Create My Account →"}
          </button>
        </form>

        <div className="pt-4 border-t border-stone-800 text-center">
          <p className="text-xs text-stone-400">
            Already have an account?{" "}
            <Link
              href={rawNext ? `/signin?next=${encodeURIComponent(rawNext)}` : "/signin"}
              className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded p-1"
            >
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
