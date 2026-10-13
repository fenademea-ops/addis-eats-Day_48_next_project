"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useHydrated } from "@/lib/use-hydrated";

interface FavoritesContextType {
  favorites: string[]; // dish IDs
  isFavorite: (dishId: string) => boolean;
  toggleFavorite: (dishId: string) => void;
  removeFavorite: (dishId: string) => void;
  clearFavorites: () => void;
  favoritesCount: number;
  isHydrated: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = "addis_eats_favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = useHydrated();
  const [favorites, setFavorites] = useState<string[]>([]);
  const isInitialLoadDone = useRef(false);

  // Load saved favorites from localStorage on mount (hydration safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          queueMicrotask(() => {
            setFavorites(parsed);
            isInitialLoadDone.current = true;
          });
          return;
        }
      }
    } catch {
      // Storage blocked
    }
    isInitialLoadDone.current = true;
  }, []);

  // Save to browser storage whenever favorites change
  useEffect(() => {
    if (!isInitialLoadDone.current) return;
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Storage quota or blocked
    }
  }, [favorites]);

  const isFavorite = (dishId: string) => {
    return favorites.includes(dishId);
  };

  const toggleFavorite = (dishId: string) => {
    setFavorites((prev) => {
      if (prev.includes(dishId)) {
        return prev.filter((id) => id !== dishId);
      }
      return [...prev, dishId];
    });
  };

  const removeFavorite = (dishId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== dishId));
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        clearFavorites,
        favoritesCount: favorites.length,
        isHydrated,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
