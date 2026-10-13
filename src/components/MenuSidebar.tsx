"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, Category } from "@/lib/fixtures/dishes";

export function MenuSidebar() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "All";

  return (
    <aside
      className="w-full md:w-64 shrink-0 bg-stone-900/60 border border-stone-800 rounded-xl p-5 h-fit backdrop-blur-xs"
      aria-label="Menu Categories"
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-800">
        <h2 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
          Categories
        </h2>
        <span className="text-[11px] text-amber-500 font-medium">Addis Flavors</span>
      </div>

      <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0 scrollbar-none" aria-label="Dish category filter">
        {CATEGORIES.map((cat: Category) => {
          const isSelected = currentCategory.toLowerCase() === cat.toLowerCase();
          const targetUrl = cat === "All" ? "/menu" : `/menu?category=${encodeURIComponent(cat)}`;

          return (
            <Link
              key={cat}
              href={targetUrl}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between whitespace-nowrap transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isSelected
                  ? "bg-amber-500 text-stone-950 font-bold shadow-xs"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
              aria-current={isSelected ? "true" : undefined}
            >
              <span>{cat}</span>
              {isSelected && (
                <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-stone-950" />
              )}
            </Link>
          );
        })}

        {/* Quick link to Favorites */}
        <Link
          href="/favorites"
          className="min-h-[44px] px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between whitespace-nowrap transition-colors text-stone-300 hover:bg-stone-800 hover:text-white border-t md:border-t border-stone-800/80 md:mt-2 md:pt-3 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <span className="flex items-center gap-1.5">
            <span className="text-red-400">❤️</span>
            <span>My Favorites</span>
          </span>
          <span className="text-[10px] text-amber-500 font-semibold font-mono">View →</span>
        </Link>
      </nav>

      {/* Helpful hint for educational scope */}
      <div className="hidden md:block mt-6 pt-4 border-t border-stone-800 text-[11px] text-stone-400 leading-normal">
        <p className="font-semibold text-stone-300 mb-1">Persistent Layout</p>
        <p>This sidebar is mounted in <code className="text-amber-400 font-mono">/menu/layout.tsx</code> and remains mounted across menu and detail routes.</p>
      </div>
    </aside>
  );
}
