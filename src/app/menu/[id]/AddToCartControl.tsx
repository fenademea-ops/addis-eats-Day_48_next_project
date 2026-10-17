"use client";

import React, { useState } from "react";
import { Dish } from "@/lib/fixtures/dishes";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";

export function AddToCartControl({ dish }: { dish: Dish }) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite, isHydrated } = useFavorites();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const isFav = isHydrated && isFavorite(dish.id);

  // Professional Sold Out Presentation
  if (dish.isAvailable === false) {
    return (
      <div className="pt-6 border-t border-stone-800 space-y-4">
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60 flex items-start sm:items-center gap-3.5 text-stone-200 shadow-inner">
          <div className="w-9 h-9 rounded-full bg-red-900/80 border border-red-700/60 flex items-center justify-center shrink-0 text-red-300" aria-hidden="true">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-red-200">Currently Sold Out</h3>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                Unavailable
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Our kitchen has temporarily 86&apos;d this item while fresh local ingredients are being sourced and prepared. Check back shortly!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled
            className="flex-1 min-h-[48px] px-6 py-3 rounded-lg text-sm font-bold bg-stone-800/80 text-stone-400 cursor-not-allowed border border-stone-700/60 flex items-center justify-center gap-2 select-none"
            aria-label={`${dish.name} is currently sold out and unavailable to order`}
          >
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Item Sold Out — Currently Unavailable
          </button>

          <button
            type="button"
            onClick={() => toggleFavorite(dish.id)}
            className={`min-h-[48px] px-4 rounded-lg border text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
              isFav
                ? "bg-red-500/20 text-red-300 border-red-500/50"
                : "bg-stone-800 text-stone-300 border-stone-700 hover:text-white"
            }`}
            aria-label={isFav ? `Remove ${dish.name} from favorites` : `Save ${dish.name} to favorites`}
            aria-pressed={isFav}
          >
            <svg
              className={`w-4 h-4 ${isFav ? "fill-red-500 stroke-red-500" : "fill-none stroke-current"}`}
              viewBox="0 0 24 24"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="hidden sm:inline">{isFav ? "Favorited" : "Favorite"}</span>
          </button>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    addItem(dish, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 border-t border-stone-800">
      {/* Quantity Stepper */}
      <div className="flex items-center justify-between border border-stone-700 bg-stone-900 rounded-lg p-1 min-h-[44px]" role="group" aria-label={`Quantity stepper for ${dish.name}`}>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          className="min-h-[40px] min-w-[40px] rounded-md text-stone-300 hover:text-white hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
          aria-label={`Decrease quantity of ${dish.name}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <span
          className="px-4 text-sm font-bold text-stone-100 font-mono"
          aria-label={`Current quantity: ${quantity}`}
        >
          {quantity}
        </span>

        <button
          type="button"
          onClick={() => setQuantity((q) => q + 1)}
          className="min-h-[40px] min-w-[40px] rounded-md text-stone-300 hover:text-white hover:bg-stone-800 flex items-center justify-center transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
          aria-label={`Increase quantity of ${dish.name}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Add To Cart Button */}
      <button
        type="button"
        onClick={handleAdd}
        className={`flex-1 min-h-[44px] px-6 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer ${
          added
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
            : "bg-amber-500 text-stone-950 hover:bg-amber-400 active:scale-98 shadow-md shadow-amber-500/10"
        }`}
        aria-label={`Add ${quantity} ${dish.name} to cart`}
      >
        {added ? (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Added to Your Order!
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add {quantity > 1 ? `${quantity} items` : "to Cart"}
          </>
        )}
      </button>

      {/* Favorite Heart Button */}
      <button
        type="button"
        onClick={() => toggleFavorite(dish.id)}
        className={`min-h-[44px] px-4 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer ${
          isFav
            ? "bg-red-500/20 text-red-300 border-red-500/60 shadow-md shadow-red-500/10"
            : "bg-stone-900 text-stone-300 hover:text-white hover:bg-stone-800 border-stone-700"
        }`}
        aria-label={isFav ? `Remove ${dish.name} from favorites` : `Save ${dish.name} to favorites`}
        aria-pressed={isFav}
      >
        <svg
          className={`w-4 h-4 transition-transform ${isFav ? "fill-red-500 stroke-red-500 scale-110" : "fill-none stroke-current"}`}
          viewBox="0 0 24 24"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className="hidden sm:inline">{isFav ? "Favorited" : "Favorite"}</span>
      </button>
    </div>
  );
}
