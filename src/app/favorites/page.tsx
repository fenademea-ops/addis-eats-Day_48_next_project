import React from "react";
import type { Metadata } from "next";
import { FavoritesView } from "./FavoritesView";

export const metadata: Metadata = {
  title: "My Favorites | Addis Eats",
  description: "Browse and reorder your favorite authentic Ethiopian dishes at Addis Eats.",
};

export default function FavoritesPage() {
  return <FavoritesView />;
}
