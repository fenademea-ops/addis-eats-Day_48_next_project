import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FIXTURE_DISHES } from "@/lib/fixtures/dishes";
import { DishCard } from "@/components/DishCard";

export const metadata = {
  title: "Addis Eats | Authentic Ethiopian Food in Addis Ababa",
  description: "Experience the vibrant culinary heritage of Ethiopia. From special kitfo to rich doro wot and vegan beyaynetu feasts, delivered across Addis Ababa.",
};

import { SITE_URL } from "@/lib/site-config";

export default function HomePage() {
  const featuredDishes = FIXTURE_DISHES.filter((d) => d.featured).slice(0, 4);

  const siteUrl = SITE_URL;

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Addis Eats",
    image: `${siteUrl}/images/home.jpg`,
    description: "Authentic Ethiopian dining and food delivery experience across Addis Ababa.",
    servesCuisine: "Ethiopian",
    priceRange: "ETB 80 - ETB 520",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Cameroon Street, Bole Atlas",
      addressLocality: "Addis Ababa",
      addressCountry: "ET",
    },
    currenciesAccepted: "ETB",
    hasMenu: `${siteUrl}/menu`,
  };

  return (
    <div className="w-full space-y-16 py-6 sm:py-10">
      {/* Restaurant Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-stone-900 border border-stone-800 shadow-2xl min-h-[460px] flex items-center">
          {/* Background Ambient Art with unoptimized JPG for direct delivery and zero conversion */}
          <div className="absolute inset-0">
            <Image
              src="/images/Home.jpg"
              alt="Authentic Addis Eats Ethiopian feast table"
              fill
              priority
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
              className="object-cover object-center"
            />
          </div>
          {/* Dark gradient overlay for high text legibility while keeping image clearly visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/75 to-stone-950/40" />

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl p-8 sm:p-12 lg:p-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Authentic Ethiopian Cuisine & Buna Heritage
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-stone-100 tracking-tight leading-tight">
              Flavors of <span className="text-amber-400 italic">Addis Ababa</span>, Delivered to You.
            </h1>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
              From slow-simmered rich Doro Wot and seasoned special Kitfo to colorful fasting Beyaynetu platters and fresh clay pot Buna coffee ceremonies.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/menu"
                prefetch={false}
                className="min-h-[48px] px-8 py-3.5 rounded-xl text-sm font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                Browse Full Menu →
              </Link>

              <Link
                href="/cart"
                prefetch={false}
                className="min-h-[48px] px-6 py-3.5 rounded-xl text-sm font-semibold bg-stone-900/90 hover:bg-stone-800 text-stone-200 border border-stone-700 hover:border-stone-500 transition-all flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                View Your Cart
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Culinary Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/40 transition-all duration-200 space-y-2 shadow-sm group">
            <span className="text-3xl block group-hover:scale-110 transition-transform">🌶️</span>
            <h2 className="text-base font-bold text-stone-100 font-serif">Handcrafted Berbere & Spices</h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              Blended with highland korarima, sun-dried chili peppers, and traditional clarified niter kibbeh butter.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/40 transition-all duration-200 space-y-2 shadow-sm group">
            <span className="text-3xl block group-hover:scale-110 transition-transform">🌱</span>
            <h2 className="text-base font-bold text-stone-100 font-serif">Authentic Fasting Beyaynetu</h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              100% plant-based vegetarian delicacies served fresh on fermented sourdough teff injera.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/40 transition-all duration-200 space-y-2 shadow-sm group">
            <span className="text-3xl block group-hover:scale-110 transition-transform">☕</span>
            <h2 className="text-base font-bold text-stone-100 font-serif">Traditional Buna Ceremony</h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              Freshly roasted single-origin Yirgacheffe Arabica beans brewed in an authentic earthenware jebena.
            </p>
          </div>
        </div>
      </section>

      {/* Neighborhood Delivery Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1.5 text-center md:text-left">
            <h2 className="text-lg font-serif font-bold text-stone-100">
              Hot & Fresh Delivery Across Addis Ababa
            </h2>
            <p className="text-xs text-stone-400">
              Express courier dispatch to Bole, Kazanchis, Megenagna, Piassa, and Sarbet.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {["Bole", "Kazanchis", "Megenagna", "Piassa", "Sarbet"].map((area) => (
              <span
                key={area}
                className="px-3 py-1.5 rounded-full bg-stone-800 border border-stone-700/80 text-xs font-semibold text-amber-300"
              >
                📍 {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Specials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">
              Chef&apos;s Highlights
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
              Featured House Specials
            </h2>
          </div>

          <Link
            href="/menu"
            prefetch={false}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 min-h-[44px]"
          >
            Explore all {FIXTURE_DISHES.length} dishes →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} priority={false} />
          ))}
        </div>
      </section>
    </div>
  );
}
