import React, { Suspense } from "react";
import { MenuSidebar } from "@/components/MenuSidebar";

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-tight">
          Explore Our Menu
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 mt-1">
          Authentic dishes prepared fresh with prime ingredients and traditional Ethiopian spices.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Suspense
          fallback={
            <div className="w-full md:w-64 h-24 md:h-72 bg-stone-900 rounded-xl border border-stone-800 animate-pulse" />
          }
        >
          <MenuSidebar />
        </Suspense>

        <div className="flex-1 w-full min-w-0">{children}</div>
      </div>
    </div>
  );
}
