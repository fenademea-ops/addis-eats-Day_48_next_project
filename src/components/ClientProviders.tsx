"use client";

import React from "react";
import { SWRConfig } from "swr";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 3000,
        keepPreviousData: true,
      }}
    >
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>{children}</FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </SWRConfig>
  );
}
