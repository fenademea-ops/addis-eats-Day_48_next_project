"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { searchDishes } from "@/lib/services/mock-dish-service";
import type { DishSearchResult } from "@/lib/services/mock-dish-service";
import { DishCard } from "@/components/DishCard";
import Link from "next/link";

interface MenuBrowserProps {
  initialCategory?: string;
  initialQuery?: string;
  initialPage?: number;
  initialData?: DishSearchResult;
}

export function MenuBrowser({
  initialCategory = "All",
  initialQuery = "",
  initialPage = 1,
  initialData,
}: MenuBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || initialCategory;
  const currentQuery = searchParams.get("q") || initialQuery;
  const currentPage = parseInt(searchParams.get("page") || `${initialPage}`, 10) || 1;

  // Local input state for smooth typing before debouncing
  const [searchTerm, setSearchTerm] = useState(currentQuery);
  const [isPending, startTransition] = useTransition();

  // Keep search input in sync if URL changes externally
  const [prevQuery, setPrevQuery] = useState(currentQuery);
  if (prevQuery !== currentQuery) {
    setPrevQuery(currentQuery);
    setSearchTerm(currentQuery);
  }

  // Debounced URL update
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== currentQuery) {
        startTransition(() => {
          const params = new URLSearchParams(searchParams.toString());
          if (searchTerm.trim()) {
            params.set("q", searchTerm.trim());
          } else {
            params.delete("q");
          }
          // Reset page to 1 on search change
          params.set("page", "1");
          router.replace(`/menu?${params.toString()}`, { scroll: false });
        });
      }
    }, 350); // 350ms debounce

    return () => clearTimeout(handler);
  }, [searchTerm, currentQuery, searchParams, router]);

  // SWR Query key includes all relevant parameters: category, debounced query, page
  const swrKey = ["dishes", currentCategory, currentQuery, currentPage];

  const fetcher = async () => {
    return searchDishes({
      category: currentCategory,
      query: currentQuery,
      page: currentPage,
      pageSize: 6,
    });
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR(swrKey, fetcher, {
    fallbackData: initialData,
    revalidateOnMount: false,
    keepPreviousData: true,
  });

  const dishes = data?.dishes || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.total || 0;

  // Function to create pagination URL
  const createPageUrl = useCallback(
    (pageNumber: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", pageNumber.toString());
      return `/menu?${params.toString()}`;
    },
    [searchParams]
  );

  return (
    <div className="space-y-6">
      {/* Search Input Bar */}
      <div className="relative">
        <label htmlFor="dish-search" className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
          Search Dishes
        </label>
        <div className="relative">
          <input
            id="dish-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search wot, tibs, coffee, shiro, ingredients..."
            aria-describedby="search-summary"
            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 pl-11 text-stone-100 placeholder-stone-400 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:border-transparent transition-all shadow-xs"
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400" aria-hidden="true">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {(isValidating || isPending) && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center" aria-hidden="true">
              <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Badges & Summary (Announced to screen readers on update) */}
      <div id="search-summary" role="status" aria-live="polite" className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-300">
        <div>
          <span>
            Showing <strong className="text-stone-100">{dishes.length}</strong> of{" "}
            <strong className="text-stone-100">{totalCount}</strong> dishes
          </span>
          {currentCategory !== "All" && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-stone-800 text-amber-300 border border-stone-700 font-medium">
              Category: {currentCategory}
            </span>
          )}
          {currentQuery && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-stone-800 text-amber-300 border border-stone-700 font-medium">
              Query: &quot;{currentQuery}&quot;
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/favorites"
            className="text-stone-200 hover:text-red-400 transition-colors font-medium flex items-center gap-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded p-1"
          >
            <span className="text-red-400" aria-hidden="true">❤️</span>
            <span>View Saved Favorites</span>
          </Link>

          {(currentCategory !== "All" || currentQuery) && (
            <Link
              href="/menu"
              className="text-amber-400 hover:text-amber-300 transition-colors font-medium ml-2 border-l border-stone-800 pl-3 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded p-1"
            >
              Clear filters
            </Link>
          )}
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && !data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse" aria-busy="true">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-stone-900 border border-stone-800 rounded-xl h-80" />
          ))}
        </div>
      )}

      {/* Error / Retry State */}
      {error && (
        <div role="alert" className="bg-red-950/40 border border-red-800/60 rounded-xl p-8 text-center space-y-3">
          <p className="text-red-300 text-sm font-semibold">
            Unable to load dishes from mock service.
          </p>
          <p className="text-stone-400 text-xs">
            {error.message || "An unexpected error occurred while querying fixture data."}
          </p>
          <button
            type="button"
            onClick={() => mutate()}
            className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400 min-h-[44px] cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && dishes.length === 0 && (
        <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-800 flex items-center justify-center text-amber-500 text-xl" aria-hidden="true">
            🔍
          </div>
          <h2 className="text-base font-semibold text-stone-200">
            No dishes match your selection
          </h2>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category from the sidebar.
          </p>
          <Link
            href="/menu"
            className="inline-block px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg transition-colors min-h-[44px] flex items-center justify-center mx-auto w-fit focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            Reset Menu Filters
          </Link>
        </div>
      )}

      {/* Loaded Dishes Grid */}
      {dishes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Menu dishes list">
          {dishes.map((dish, idx) => (
            <DishCard key={dish.id} dish={dish} priority={idx === 0} deferred={idx >= 2} />
          ))}
        </div>
      )}

      {/* Numbered Pagination (Real Links matching URL query parameters) */}
      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-1.5 pt-6 border-t border-stone-800"
          aria-label="Dish pagination"
        >
          {/* Previous Page Link */}
          {currentPage > 1 ? (
            <Link
              href={createPageUrl(currentPage - 1)}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-medium bg-stone-900 border border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Go to previous page"
            >
              ← Prev
            </Link>
          ) : (
            <span
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-medium bg-stone-900/50 border border-stone-800/40 text-stone-600 cursor-not-allowed flex items-center justify-center select-none"
              aria-disabled="true"
            >
              ← Prev
            </span>
          )}

          {/* Numbered Page Links */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isCurrent = pageNum === currentPage;
            return (
              <Link
                key={pageNum}
                href={createPageUrl(pageNum)}
                className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isCurrent
                    ? "bg-amber-500 text-stone-950 shadow-xs"
                    : "bg-stone-900 border border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-white"
                }`}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`Page ${pageNum}`}
              >
                {pageNum}
              </Link>
            );
          })}

          {/* Next Page Link */}
          {currentPage < totalPages ? (
            <Link
              href={createPageUrl(currentPage + 1)}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-medium bg-stone-900 border border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-white transition-colors flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Go to next page"
            >
              Next →
            </Link>
          ) : (
            <span
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg text-xs font-medium bg-stone-900/50 border border-stone-800/40 text-stone-600 cursor-not-allowed flex items-center justify-center select-none"
              aria-disabled="true"
            >
              Next →
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
