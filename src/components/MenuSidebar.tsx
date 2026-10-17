"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, Category } from "@/lib/fixtures/dishes";

export function MenuSidebar() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "All";
  const navRef = useRef<HTMLElement>(null);

  const allCategories: Category[] = [...CATEGORIES];

  // All nav items: categories + Favorites link at the bottom
  const allLinks = [
    ...allCategories.map((cat) => ({
      key: cat,
      label: cat,
      href: cat === "All" ? "/menu" : `/menu?category=${encodeURIComponent(cat)}`,
      isCategory: true,
    })),
    {
      key: "favorites",
      label: "My Favorites",
      href: "/favorites",
      isCategory: false,
    },
  ];

  // Arrow key handler — moves focus through all links one by one
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!navRef.current) return;

    // Collect all <a> elements inside the nav in DOM order
    const linkEls = Array.from(
      navRef.current.querySelectorAll<HTMLElement>("a")
    );
    if (linkEls.length === 0) return;

    const activeEl = document.activeElement as HTMLElement;
    const currentIndex = linkEls.indexOf(activeEl);

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      // Move to next, wrap around to first
      const next = currentIndex < linkEls.length - 1 ? currentIndex + 1 : 0;
      linkEls[next]?.focus();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      // Move to previous, wrap around to last
      const prev = currentIndex > 0 ? currentIndex - 1 : linkEls.length - 1;
      linkEls[prev]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      linkEls[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      linkEls[linkEls.length - 1]?.focus();
    }
  };

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

      {/*
        All links have tabIndex={0} — both Tab AND arrow keys cycle through them.
        onKeyDown on the nav catches ArrowUp/Down/Left/Right and moves focus.
      */}
      <nav
        ref={navRef}
        aria-label="Dish category filter"
        aria-orientation="vertical"
        onKeyDown={handleKeyDown}
        className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0 scrollbar-none"
      >
        {allLinks.map((link) => {
          const isSelected =
            link.isCategory &&
            currentCategory.toLowerCase() === link.label.toLowerCase();

          if (link.key === "favorites") {
            return (
              <Link
                key="favorites"
                href="/favorites"
                prefetch={false}
                tabIndex={0}
                className="min-h-[44px] px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between whitespace-nowrap transition-colors text-stone-300 hover:bg-stone-800 hover:text-white border-t md:border-t border-stone-800/80 md:mt-2 md:pt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-red-400" aria-hidden="true">❤️</span>
                  <span>My Favorites</span>
                </span>
                <span
                  className="text-[10px] text-amber-500 font-semibold"
                  aria-hidden="true"
                >
                  View →
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={link.key}
              href={link.href}
              prefetch={false}
              tabIndex={0}
              aria-current={isSelected ? "page" : undefined}
              className={`min-h-[44px] px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isSelected
                  ? "bg-amber-500 text-stone-950 font-bold shadow-xs"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <span>{link.label}</span>
              {isSelected && (
                <span
                  className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-stone-950"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Keyboard usage hint */}
      <div className="hidden md:block mt-6 pt-4 border-t border-stone-800 text-[11px] text-stone-400 leading-normal">
        <p className="font-semibold text-stone-300 mb-1">Keyboard Navigation</p>
        <p>
          Use{" "}
          <kbd className="px-1 py-0.5 bg-stone-800 rounded font-semibold text-[10px]">Tab</kbd>{" "}
          or{" "}
          <kbd className="px-1 py-0.5 bg-stone-800 rounded font-semibold text-[10px]">↑</kbd>{" "}
          <kbd className="px-1 py-0.5 bg-stone-800 rounded font-semibold text-[10px]">↓</kbd>{" "}
          to cycle categories, then{" "}
          <kbd className="px-1 py-0.5 bg-stone-800 rounded font-semibold text-[10px]">Enter</kbd>{" "}
          to select.
        </p>
      </div>
    </aside>
  );
}
