import React, { Suspense } from "react";
import type { Metadata } from "next";
import { searchDishes } from "@/lib/services/mock-dish-service";
import { MenuBrowser } from "./MenuBrowser";

export const metadata: Metadata = {
  title: "Authentic Ethiopian Menu | Addis Eats",
  description: "Explore our rich menu of traditional wots, sizzling tibs, fasting beyaynetu platters, and Buna coffee delivered across Addis Ababa.",
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    type: "website",
    title: "Authentic Ethiopian Menu | Addis Eats",
    description: "Explore our rich menu of traditional wots, sizzling tibs, fasting beyaynetu platters, and Buna coffee delivered across Addis Ababa.",
    url: "/menu",
    siteName: "Addis Eats",
    images: [
      {
        url: "/images/menu-og.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Authentic Ethiopian Menu — Addis Eats",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Authentic Ethiopian Menu | Addis Eats",
    description: "Explore our rich menu of traditional wots, sizzling tibs, fasting beyaynetu platters, and Buna coffee delivered across Addis Ababa.",
    images: ["/images/menu-og.jpg"],
  },
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
