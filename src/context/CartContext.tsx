"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react";
import { Dish } from "@/lib/fixtures/dishes";
import { useHydrated } from "@/lib/use-hydrated";

export interface CartItem {
  dishId: string;
  name: string;
  price: number; // Integer ETB
  quantity: number;
  image: string;
  category: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (dish: Dish, quantity?: number) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  removeItem: (dishId: string) => void;
  clearCart: () => void;
  subtotal: number; // Integer ETB
  totalCount: number;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "addis_eats_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = useHydrated();
  const [items, setItems] = useState<CartItem[]>([]);
  const isInitialLoadDone = useRef(false);

  // Load saved cart from localStorage on mount (hydration safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          queueMicrotask(() => {
            setItems(parsed);
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

  // Save to browser storage whenever items update (only after initial load has finished)
  useEffect(() => {
    if (!isInitialLoadDone.current) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or quota exceeded
    }
  }, [items]);

  /**
   * Adds a dish to the cart. If the dish already exists, increments quantity
   * rather than creating confusing duplicate line items.
   */
  const addItem = (dish: Dish, quantity: number = 1) => {
    if (dish.isAvailable === false) {
      return; // Cannot add sold-out items to cart
    }
    const qtyToAdd = Math.max(1, Math.floor(quantity));
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.dishId === dish.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + qtyToAdd,
        };
        return next;
      }
      return [
        ...prev,
        {
          dishId: dish.id,
          name: dish.name,
          price: Math.round(dish.price),
          quantity: qtyToAdd,
          image: dish.image,
          category: dish.category,
        },
      ];
    });
  };

  /**
   * Updates the quantity of a line item. Removes item if quantity <= 0.
   */
  const updateQuantity = (dishId: string, quantity: number) => {
    const targetQty = Math.floor(quantity);
    setItems((prev) => {
      if (targetQty <= 0) {
        return prev.filter((i) => i.dishId !== dishId);
      }
      return prev.map((item) =>
        item.dishId === dishId ? { ...item, quantity: targetQty } : item
      );
    });
  };

  /**
   * Removes an item from the cart completely.
   */
  const removeItem = (dishId: string) => {
    setItems((prev) => prev.filter((i) => i.dishId !== dishId));
  };

  /**
   * Clears all items in the cart.
   */
  const clearCart = () => {
    setItems([]);
  };

  /**
   * Computes subtotal in integer whole ETB.
   */
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  /**
   * Computes total item count.
   */
  const totalCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        totalCount,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
