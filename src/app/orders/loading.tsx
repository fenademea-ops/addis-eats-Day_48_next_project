import React from "react";

export default function OrdersLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-stone-800 rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-stone-900 rounded animate-pulse" />
      </div>

      <div className="rounded-xl border border-stone-800 bg-stone-900 overflow-hidden p-4 space-y-4">
        <div className="h-6 w-32 bg-stone-800 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="h-12 bg-stone-950/60 border border-stone-800/80 rounded-lg animate-pulse flex items-center justify-between px-4"
            >
              <div className="w-24 h-4 bg-stone-800 rounded" />
              <div className="w-32 h-4 bg-stone-800 rounded" />
              <div className="w-20 h-4 bg-stone-800 rounded" />
              <div className="w-16 h-4 bg-stone-800 rounded" />
              <div className="w-16 h-4 bg-stone-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
