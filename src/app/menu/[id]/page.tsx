import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { FIXTURE_DISHES } from "@/lib/fixtures/dishes";
import { getDishById } from "@/lib/services/mock-dish-service";
import { formatEtb } from "@/lib/format";
import { AddToCartControl } from "./AddToCartControl";

interface DishDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return FIXTURE_DISHES.map((dish) => ({
    id: dish.id,
  }));
}

export async function generateMetadata({
  params,
}: DishDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const dish = await getDishById(id);

  if (!dish) {
    return {
      title: "Dish Not Found | Addis Eats",
      description: "The requested dish is not available on the Addis Eats menu.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const ogImageUrl = `${siteUrl}/menu/${dish.id}/opengraph-image`;

  return {
    title: `${dish.name} | Addis Eats`,
    description: `${dish.name} - ${dish.description} Priced at ${formatEtb(dish.price)}.`,
    openGraph: {
      title: `${dish.name} - Authentic Ethiopian Cuisine | Addis Eats`,
      description: dish.description,
      url: `/menu/${dish.id}`,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${dish.name} at Addis Eats`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${dish.name} | Addis Eats`,
      description: dish.description,
      images: [ogImageUrl],
    },
  };
}

export default async function DishDetailPage({ params }: DishDetailPageProps) {
  const { id } = await params;
  const dish = await getDishById(id);

  if (!dish) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: dish.name,
    description: dish.description,
    image: `${siteUrl}${dish.image}`,
    offers: {
      "@type": "Offer",
      price: dish.price,
      priceCurrency: "ETB",
      availability: "https://schema.org/InStock",
    },
    suitableForDiet:
      dish.category === "Vegetarian"
        ? "https://schema.org/VegetarianDiet"
        : undefined,
  };

  return (
    <article className="space-y-6">
      {/* JSON-LD injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-stone-400">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/menu" className="hover:text-amber-400 transition-colors">
              Menu
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/menu?category=${encodeURIComponent(dish.category)}`}
              className="hover:text-amber-400 transition-colors"
            >
              {dish.category}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-stone-200 font-semibold truncate" aria-current="page">
            {dish.name}
          </li>
        </ol>
      </nav>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Dish Image Container - Priority LCP Image */}
          <div className="relative aspect-4/3 md:aspect-auto md:min-h-[420px] bg-stone-950">
            <Image
              src={dish.image}
              alt={dish.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            {dish.isAvailable === false && (
              <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-[2px] flex items-center justify-center z-10">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider bg-red-950/95 text-red-200 border border-red-800 shadow-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Dish Meta & Order Controls */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-amber-500/10 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-md border border-amber-500/20">
                  {dish.category}
                </span>
                {dish.spicy && (
                  <span className="bg-red-950/60 text-red-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-red-800/40">
                    🌶️ Spicy
                  </span>
                )}
                <span className="text-xs text-stone-400 ml-auto">
                  Prep: {dish.prepTime}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-tight">
                {dish.name}
              </h1>

              <p className="text-2xl font-bold font-mono text-amber-400 mt-2">
                {formatEtb(dish.price)}
              </p>

              <p className="text-sm text-stone-300 mt-4 leading-relaxed">
                {dish.description}
              </p>

              {/* Ingredients List */}
              {dish.ingredients && dish.ingredients.length > 0 && (
                <div className="mt-6 pt-5 border-t border-stone-800">
                  <h2 className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                    Key Ingredients & Spices
                  </h2>
                  <ul className="flex flex-wrap gap-1.5" aria-label="Key ingredients">
                    {dish.ingredients.map((ing) => (
                      <li
                        key={ing}
                        className="text-xs bg-stone-800/80 text-stone-300 px-2.5 py-1 rounded-md border border-stone-700/50"
                      >
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Interactive Add to Cart Controls */}
            <AddToCartControl dish={dish} />
          </div>
        </div>
      </div>
    </article>
  );
}
