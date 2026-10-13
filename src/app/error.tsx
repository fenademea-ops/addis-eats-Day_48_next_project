"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Route Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-full bg-red-950/70 border border-red-800 flex items-center justify-center text-2xl text-red-300">
        ⚠️
      </div>
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-100">
          Something went wrong
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-2 max-w-md mx-auto">
          {error.message || "An unexpected error occurred while rendering this page."}
        </p>
      </div>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="min-h-[44px] px-6 py-2.5 rounded-lg text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="min-h-[44px] px-5 py-2.5 rounded-lg text-xs font-medium bg-stone-800 text-stone-300 hover:text-white flex items-center"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
