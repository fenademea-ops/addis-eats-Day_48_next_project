import React, { Suspense } from "react";
import { SignInView } from "./SignInView";

export const metadata = {
  title: "Sign In | Addis Eats",
  description: "Sign in to your Addis Eats account to manage orders, favorites, and track live deliveries in Addis Ababa.",
  alternates: {
    canonical: "/signin",
  },
  openGraph: {
    title: "Sign In | Addis Eats",
    description: "Sign in to your Addis Eats account to manage orders, favorites, and track live deliveries in Addis Ababa.",
    url: "/signin",
  },
};

export default function SignInPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
          Welcome to Addis Eats
        </h1>
        <p className="text-xs sm:text-sm text-stone-300">
          Choose an account below or enter your registered email to continue to your dining dashboard.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="max-w-2xl mx-auto h-64 bg-stone-900 rounded-2xl border border-stone-800 animate-pulse" />
        }
      >
        <SignInView />
      </Suspense>
    </div>
  );
}
