import React, { Suspense } from "react";
import { SignUpView } from "./SignUpView";

export const metadata = {
  title: "Create Account | Addis Eats",
  description: "Register for an Addis Eats account to enjoy fast food delivery and save your favorites in Addis Ababa.",
  alternates: {
    canonical: "/signup",
  },
  openGraph: {
    title: "Create Account | Addis Eats",
    description: "Register for an Addis Eats account to enjoy fast food delivery and save your favorites in Addis Ababa.",
    url: "/signup",
  },
};

export default function SignUpPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
      <Suspense
        fallback={
          <div className="max-w-xl mx-auto bg-stone-900 border border-stone-800 rounded-2xl p-8 animate-pulse space-y-4">
            <div className="h-8 w-48 bg-stone-800 rounded mx-auto" />
            <div className="h-64 bg-stone-950 rounded" />
          </div>
        }
      >
        <SignUpView />
      </Suspense>
    </div>
  );
}
