import React, { Suspense } from "react";
import { searchDishes } from "@/lib/services/mock-dish-service";
import { MenuBrowser } from "./MenuBrowser";

export const metadata = {
  title: "Menu | Addis Eats",
  description: "Browse authentic Ethiopian dishes with debounced search and category filtering.",
};

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const initialCategory = resolvedParams?.category || "All";
  const initialQuery = resolvedParams?.q || "";
  const initialPage = parseInt(resolvedParams?.page || "1", 10) || 1;

  const initialData = await searchDishes({
    category: initialCategory,
    query: initialQuery,
    page: initialPage,
    pageSize: 6,
  });

  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-11 bg-stone-900 border border-stone-800 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-stone-900 border border-stone-800 rounded-xl h-80" />
            ))}
          </div>
        </div>
      }
    >
      <MenuBrowser
        initialCategory={initialCategory}
        initialQuery={initialQuery}
        initialPage={initialPage}
        initialData={initialData}
      />
    </Suspense>
  );
}
