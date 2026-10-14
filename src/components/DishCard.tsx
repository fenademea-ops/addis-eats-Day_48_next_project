"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Dish } from "@/lib/fixtures/dishes";
import { formatEtb } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";

interface DishCardProps {
  dish: Dish;
  priority?: boolean;
}

export function DishCard({ dish, priority = false }: DishCardProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite, isHydrated } = useFavorites();
  const [justAdded, setJustAdded] = useState(false);
  const isFav = isHydrated && isFavorite(dish.id);

  const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Stop propagation so clicking the button adds to cart without triggering card navigation
    e.stopPropagation();
    addItem(dish, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(dish.id);
  };

  return (
    <article className="group relative flex flex-col bg-stone-900 border border-stone-800 rounded-xl overflow-hidden hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-200">
      {/* Dish Image Container */}
      <div className="relative w-full aspect-4/3 bg-stone-800 overflow-hidden">
        <Link
          href={`/menu/${dish.id}`}
          className="absolute inset-0 z-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
          aria-label={`View ${dish.name} details`}
        >
          <Image
            src={dish.image}
            alt={dish.name}
            fill
            sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 50vw, 360px"
            priority={priority}
            quality={75}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {dish.category && (
          <span className="pointer-events-none absolute top-3 left-3 bg-stone-900/85 backdrop-blur-xs text-amber-400 text-xs font-medium px-2.5 py-1 rounded-md border border-stone-700/50 shadow-xs z-20">
            {dish.category}
          </span>
        )}

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`absolute top-2.5 right-2.5 z-30 min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full backdrop-blur-md transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
            isFav
              ? "bg-red-500/20 text-red-400 border border-red-500/60 scale-105 shadow-md shadow-red-500/20"
              : "bg-stone-900/80 text-stone-400 hover:text-red-400 hover:bg-stone-900 border border-stone-700/60"
          }`}
          aria-label={isFav ? `Remove ${dish.name} from favorites` : `Save ${dish.name} to favorites`}
          title={isFav ? "Saved to Favorites" : "Add to Favorites"}
        >
          <svg
            className={`w-4 h-4 transition-transform ${isFav ? "fill-red-500 stroke-red-500" : "fill-none stroke-current"}`}
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {dish.spicy && (
          <span
            className="pointer-events-none absolute top-12 left-3 bg-red-950/85 text-red-300 text-xs font-medium px-2 py-0.5 rounded-md border border-red-800/50 z-20"
            title="Spicy dish"
          >
            🌶️ Spicy
          </span>
        )}

        {/* Professional Sold Out Image Overlay */}
        {dish.isAvailable === false && (
          <div className="pointer-events-none absolute inset-0 bg-stone-950/75 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-950/90 text-red-200 border border-red-800/90 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            href={`/menu/${dish.id}`}
            className="focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
          >
            <h3
              className={`text-base font-semibold transition-colors ${
                dish.isAvailable === false
                  ? "text-stone-300 line-through decoration-stone-500"
                  : "text-stone-100 group-hover:text-amber-400"
              }`}
            >
              {dish.name}
            </h3>
          </Link>
          <span
            className={`text-base font-bold font-mono shrink-0 ${
              dish.isAvailable === false ? "text-stone-400" : "text-amber-400"
            }`}
          >
            {formatEtb(dish.price)}
          </span>
        </div>

        <p className="text-xs text-stone-300 line-clamp-2 mb-4 leading-relaxed flex-1">
          {dish.description}
        </p>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-stone-800/80 mt-auto">
          {/* Direct View Details Link */}
          <Link
            href={`/menu/${dish.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-300 hover:text-amber-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded px-1.5 py-1 transition-colors"
            aria-label={`View details of ${dish.name}`}
          >
            <span>Details</span>
            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Sold Out vs Active Add Button */}
          {dish.isAvailable === false ? (
            <button
              type="button"
              disabled
              className="min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold bg-stone-800/80 text-stone-400 cursor-not-allowed border border-stone-700/60 flex items-center gap-1.5 select-none"
              aria-label={`${dish.name} is currently sold out`}
            >
              <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Sold Out
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddClick}
              className={`min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 shadow-sm ${
                justAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-95"
              }`}
              aria-label={`Add ${dish.name} to cart`}
            >
              {justAdded ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
