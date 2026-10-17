"use client";

import React from "react";
import { SWRConfig } from "swr";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider, useCart } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";

function CartA11yLiveRegion() {
  const { announcement } = useCart();
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      id="a11y-cart-status"
    >
      {announcement}
    </div>
  );
}

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
          <FavoritesProvider>
            {children}
            <CartA11yLiveRegion />
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </SWRConfig>
  );
}
