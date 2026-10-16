"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { getAllDishes } from "@/lib/services/mock-dish-service";
import type { Dish } from "@/lib/fixtures/dishes";
import { DishCard } from "@/components/DishCard";

export function FavoritesView() {
  const { favorites, isHydrated, clearFavorites } = useFavorites();
  const { addItem } = useCart();
  const [allDishes, setAllDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addedAllSuccess, setAddedAllSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAllDishes().then((dishes) => {
      if (mounted) {
        setAllDishes(dishes);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!isHydrated || isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-stone-900 rounded-lg" />
        <div className="h-4 w-72 bg-stone-900 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-stone-900 border border-stone-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const favoriteDishes = allDishes.filter((dish) => favorites.includes(dish.id));
  const availableFavorites = favoriteDishes.filter((d) => d.isAvailable !== false);

  const handleAddAllToCart = () => {
    if (availableFavorites.length === 0) return;
    availableFavorites.forEach((dish) => {
      addItem(dish, 1);
    });
    setAddedAllSuccess(true);
    setTimeout(() => setAddedAllSuccess(false), 2500);
  };

  if (favoriteDishes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-3xl text-red-500 shadow-inner">
          ❤️
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
            No Favorites Saved Yet
          </h1>
          <p className="text-sm text-stone-400 mt-2 max-w-md mx-auto">
            You haven&apos;t saved any favorite dishes yet. Click the heart icon on any dish card to keep quick access to the Ethiopian dishes you love!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/menu"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-lg text-sm font-semibold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            Explore Addis Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">❤️</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
              Your Favorite Dishes
            </h1>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-red-950/80 text-red-300 border border-red-800/60">
              {favoriteDishes.length} {favoriteDishes.length === 1 ? "dish" : "dishes"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Personalized favorites saved to your browser for fast re-ordering.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {availableFavorites.length > 0 && (
            <button
              type="button"
              onClick={handleAddAllToCart}
              className={`min-h-[44px] px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 flex items-center gap-2 ${
                addedAllSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-500 text-stone-950 hover:bg-amber-400"
              }`}
            >
              <span>{addedAllSuccess ? "✓ Added All to Cart!" : "🛒 Add All Available to Cart"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={clearFavorites}
            className="min-h-[44px] px-3.5 py-2.5 rounded-lg text-xs font-medium text-stone-400 hover:text-red-400 hover:bg-stone-900 border border-stone-800 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400 flex items-center gap-1.5"
          >
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Grid of Favorite Dishes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteDishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>

      {/* Footer Helper Note */}
      <div className="p-4 bg-stone-900/60 border border-stone-800 rounded-xl flex items-center justify-between text-xs text-stone-400">
        <span>Looking for more dishes?</span>
        <Link
          href="/menu"
          className="text-amber-500 hover:text-amber-400 font-semibold transition-colors"
        >
          View Full Menu →
        </Link>
      </div>
    </div>
  );
}
