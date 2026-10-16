"use client";

import React, { useState } from "react";
import Image from "next/image";
import useSWR, { useSWRConfig } from "swr";
import { useAuth } from "@/context/AuthContext";
import {
  getAllDishes,
  createDish,
  updateDish,
  deleteDish,
  toggleDishAvailability,
  resetDishesToDefault,
} from "@/lib/services/mock-dish-service";
import { Dish } from "@/lib/fixtures/dishes";
import { formatEtb } from "@/lib/format";

const CATEGORIES: Dish["category"][] = [
  "Traditional",
  "Vegetarian",
  "Breakfast",
  "Drinks",
  "Desserts",
];

const PRESET_IMAGES = [
  { label: "Kitfo", url: "/images/kitfo.png" },
  { label: "Doro Wot", url: "/images/doro-wot.png" },
  { label: "Beef Tibs", url: "/images/shekla-tibs.jpg" },
  { label: "Key Wat", url: "/images/siga-key-wat.jpg" },
  { label: "Shiro Tegabino", url: "/images/shiro.jpg" },
  { label: "Beyaynetu Platter", url: "/images/beyaynetu.jpg" },
  { label: "Gomen Wat", url: "/images/gomen.jpg" },
  { label: "Misir Wat", url: "/images/misir-wot.jpg" },
  { label: "Chechebsa", url: "/images/chechebsa.jpg" },
  { label: "Ful Mudammas", url: "/images/ful.jpg" },
  { label: "Buna Ceremony", url: "/images/buna.jpg" },
  { label: "Tej Honey Wine", url: "/images/tej.jpg" },
];

export function KitchenMenuManager() {
  const { user } = useAuth();
  const { mutate } = useSWRConfig();

  const { data: dishesData, mutate: mutateDishes, isLoading: loading } = useSWR(
    "kitchen-dishes",
    getAllDishes
  );
  const dishes = dishesData || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "sold_out">("all");

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [deletingDish, setDeletingDish] = useState<Dish | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<Dish["category"]>("Traditional");
  const [formPrice, setFormPrice] = useState<number>(350);
  const [formDescription, setFormDescription] = useState("");
  const [formPrepTime, setFormPrepTime] = useState("15-20 min");
  const [formSpicy, setFormSpicy] = useState(false);
  const [formImage, setFormImage] = useState("/images/kitfo.png");
  const [formIngredients, setFormIngredients] = useState("");
  const [formAvailable, setFormAvailable] = useState(true);
  const [formError, setFormError] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Invalidate SWR global dish cache across customer-facing pages
  const triggerGlobalMenuRevalidation = () => {
    mutate(
      (key) => Array.isArray(key) && key[0] === "dishes",
      undefined,
      { revalidate: true }
    );
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormName("");
    setFormCategory("Traditional");
    setFormPrice(350);
    setFormDescription("");
    setFormPrepTime("15-20 min");
    setFormSpicy(false);
    setFormImage("/images/kitfo.png");
    setFormIngredients("");
    setFormAvailable(true);
    setFormError("");
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (dish: Dish) => {
    setEditingDish(dish);
    setFormName(dish.name);
    setFormCategory(dish.category);
    setFormPrice(dish.price);
    setFormDescription(dish.description);
    setFormPrepTime(dish.prepTime);
    setFormSpicy(dish.spicy);
    setFormImage(dish.image);
    setFormIngredients(dish.ingredients ? dish.ingredients.join(", ") : "");
    setFormAvailable(dish.isAvailable !== false);
    setFormError("");
  };

  // Handle Quick Sold Out / Available Toggle
  const handleToggleAvailability = async (dish: Dish) => {
    setActionLoading(true);
    try {
      const result = await toggleDishAvailability(dish.id, user);
      if (result.success && result.dish) {
        mutateDishes();
        const statusLabel = result.dish.isAvailable ? "In Stock (Available)" : "Sold Out (86'd)";
        showToast(`"${dish.name}" is now marked as ${statusLabel}`);
        triggerGlobalMenuRevalidation();
      } else {
        showToast(result.error || "Failed to update availability", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Submit (Create)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formName.trim()) {
      setFormError("Please provide a dish name.");
      return;
    }
    if (!formPrice || formPrice <= 0) {
      setFormError("Price must be a positive integer in ETB.");
      return;
    }
    if (!formDescription.trim()) {
      setFormError("Please provide a description.");
      return;
    }

    setActionLoading(true);
    try {
      const parsedIngredients = formIngredients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await createDish(
        {
          name: formName.trim(),
          category: formCategory,
          price: Math.round(Number(formPrice)),
          description: formDescription.trim(),
          prepTime: formPrepTime.trim() || "15 min",
          spicy: formSpicy,
          image: formImage.trim() || "/images/kitfo.png",
          ingredients: parsedIngredients,
          isAvailable: formAvailable,
        },
        user
      );

      if (res.success && res.dish) {
        mutateDishes();
        setIsAddModalOpen(false);
        showToast(`"${res.dish.name}" added to the menu!`);
        triggerGlobalMenuRevalidation();
      } else {
        setFormError(res.error || "Failed to add dish.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Submit (Update)
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish) return;
    setFormError("");

    if (!formName.trim()) {
      setFormError("Please provide a dish name.");
      return;
    }
    if (!formPrice || formPrice <= 0) {
      setFormError("Price must be a positive integer in ETB.");
      return;
    }

    setActionLoading(true);
    try {
      const parsedIngredients = formIngredients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await updateDish(
        editingDish.id,
        {
          name: formName.trim(),
          category: formCategory,
          price: Math.round(Number(formPrice)),
          description: formDescription.trim(),
          prepTime: formPrepTime.trim(),
          spicy: formSpicy,
          image: formImage.trim(),
          ingredients: parsedIngredients,
          isAvailable: formAvailable,
        },
        user
      );

      if (res.success && res.dish) {
        mutateDishes();
        setEditingDish(null);
        showToast(`"${res.dish.name}" updated successfully.`);
        triggerGlobalMenuRevalidation();
      } else {
        setFormError(res.error || "Failed to update dish.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingDish) return;
    setActionLoading(true);
    try {
      const res = await deleteDish(deletingDish.id, user);
      if (res.success) {
        mutateDishes();
        showToast(`"${deletingDish.name}" removed from the menu.`);
        setDeletingDish(null);
        triggerGlobalMenuRevalidation();
      } else {
        showToast(res.error || "Failed to delete dish.", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reset Catalog
  const handleResetCatalog = async () => {
    setActionLoading(true);
    try {
      const res = await resetDishesToDefault(user);
      if (res.success) {
        mutateDishes();
        setIsResetConfirmOpen(false);
        showToast("Menu catalog restored to default dishes.");
        triggerGlobalMenuRevalidation();
      } else {
        showToast(res.error || "Failed to reset menu.", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered dishes
  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory =
      selectedCategory === "All" ||
      dish.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && dish.isAvailable !== false) ||
      (availabilityFilter === "sold_out" && dish.isAvailable === false);

    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      dish.name.toLowerCase().includes(query) ||
      dish.description.toLowerCase().includes(query) ||
      dish.ingredients?.some((ing) => ing.toLowerCase().includes(query));

    return matchesCategory && matchesAvailability && matchesQuery;
  });

  const totalDishes = dishes.length;
  const availableCount = dishes.filter((d) => d.isAvailable !== false).length;
  const soldOutCount = dishes.filter((d) => d.isAvailable === false).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-medium animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === "success"
              ? "bg-stone-900 border-amber-500/80 text-amber-200"
              : "bg-red-950 border-red-700 text-red-200"
          }`}
        >
          <span>{toast.type === "success" ? "✨" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Metrics & Action Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-400 font-medium">Total Menu Items</div>
            <div className="text-2xl font-bold font-mono text-stone-100 mt-1">
              {totalDishes}
            </div>
          </div>
          <span className="text-2xl">📋</span>
        </div>

        {/* Available / In Stock */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-400 font-medium">In Stock (Available)</div>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
              {availableCount}
            </div>
          </div>
          <span className="inline-flex w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Sold Out */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-red-400 font-medium">Sold Out (86&apos;d)</div>
            <div className="text-2xl font-bold font-mono text-red-300 mt-1">
              {soldOutCount}
            </div>
          </div>
          <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
            86&apos;d
          </span>
        </div>

        {/* Add New Dish Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openAddModal}
            className="flex-1 min-h-[48px] px-4 py-3 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 active:scale-98"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add New Dish
          </button>
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="min-h-[48px] px-3 py-3 rounded-xl text-xs font-medium bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors border border-stone-700/60"
            title="Reset catalog back to default fixture dishes"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes by name, description, ingredients..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-stone-950 border border-stone-700 text-stone-200 placeholder-stone-500 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            <svg
              className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Availability Pills */}
          <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-lg border border-stone-800 shrink-0">
            <button
              type="button"
              onClick={() => setAvailabilityFilter("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                availabilityFilter === "all"
                  ? "bg-stone-800 text-amber-400 font-semibold"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              All Statuses
            </button>
            <button
              type="button"
              onClick={() => setAvailabilityFilter("available")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                availabilityFilter === "available"
                  ? "bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800/60"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              ● In Stock Only
            </button>
            <button
              type="button"
              onClick={() => setAvailabilityFilter("sold_out")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                availabilityFilter === "sold_out"
                  ? "bg-red-950 text-red-300 font-semibold border border-red-800/60"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              ● Sold Out Only
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-800/80">
          <span className="text-[11px] text-stone-500 mr-2 font-medium">Category:</span>
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-amber-500 text-stone-950 font-bold"
                  : "bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-stone-900 rounded-xl border border-stone-800" />
          ))}
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center space-y-3">
          <div className="text-3xl">🍲</div>
          <h3 className="text-base font-semibold text-stone-200">No dishes match your filters</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Try adjusting your search query, selecting another category, or click &ldquo;Add New Dish&rdquo; to expand the menu.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDishes.map((dish) => {
            const isAvailable = dish.isAvailable !== false;
            return (
              <div
                key={dish.id}
                className={`bg-stone-900 border rounded-xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isAvailable
                    ? "border-stone-800 hover:border-stone-700"
                    : "border-red-900/40 bg-stone-900/60"
                }`}
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-stone-800 shrink-0 border border-stone-700/60">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      sizes="80px"
                      className={`object-cover ${!isAvailable ? "grayscale contrast-125 opacity-70" : ""}`}
                    />
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-300 bg-red-950/90 px-1 py-0.5 rounded border border-red-800">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`text-sm font-semibold truncate ${
                        !isAvailable ? "text-stone-400 line-through decoration-stone-600" : "text-stone-100"
                      }`}>
                        {dish.name}
                      </h3>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700/60">
                        {dish.category}
                      </span>
                      {dish.spicy && (
                        <span className="text-[11px] text-red-300 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-800/60">
                          🌶️ Spicy
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-400 line-clamp-1 max-w-xl">
                      {dish.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-stone-400">
                      <span className="font-mono font-bold text-amber-400">
                        {formatEtb(dish.price)}
                      </span>
                      <span>•</span>
                      <span>⏱️ {dish.prepTime}</span>
                      {dish.ingredients && dish.ingredients.length > 0 && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline text-stone-500 truncate max-w-xs">
                            {dish.ingredients.join(", ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Availability Toggle + Edit / Delete Controls */}
                <div className="flex items-center justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-stone-800">
                  {/* Real-time One-Click Sold Out Toggle Button */}
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleToggleAvailability(dish)}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                      isAvailable
                        ? "bg-emerald-950/90 text-emerald-300 border border-emerald-800 hover:bg-red-950 hover:text-red-300 hover:border-red-800"
                        : "bg-red-950/90 text-red-300 border border-red-800 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-800"
                    }`}
                    title={isAvailable ? "Click to 86 / Mark Sold Out" : "Click to Restock / Mark Available"}
                  >
                    <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-emerald-400" : "bg-red-400 animate-pulse"}`} />
                    <span>{isAvailable ? "In Stock (86 it)" : "Sold Out (Restock)"}</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(dish)}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 text-stone-200 hover:bg-stone-700 hover:text-white transition-colors border border-stone-700/60"
                  >
                    Edit
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setDeletingDish(dish)}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800/60 text-red-400 hover:bg-red-950 hover:text-red-300 transition-colors border border-red-900/40"
                    title="Remove from menu"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: ADD DISH ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h2 className="text-lg font-serif font-bold text-stone-100">Add New Dish to Menu</h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Dish Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Shiro Tegabino Special"
                  className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Dish["category"])}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Price (ETB) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Prep Time & Spicy */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Prep Time
                  </label>
                  <input
                    type="text"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(e.target.value)}
                    placeholder="e.g. 15-20 min"
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="formSpicy"
                    checked={formSpicy}
                    onChange={(e) => setFormSpicy(e.target.checked)}
                    className="w-4 h-4 rounded bg-stone-950 border-stone-700 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="formSpicy" className="text-xs font-medium text-stone-300">
                    🌶️ Spicy Dish
                  </label>
                </div>
              </div>

              {/* Image Picker */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Dish Image Preset
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setFormImage(preset.url)}
                      className={`p-1.5 rounded-lg border text-left text-[11px] truncate transition-colors flex items-center gap-1.5 ${
                        formImage === preset.url
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="Or enter custom image path (e.g. /images/kitfo.png)"
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 text-[11px] font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Appetizing culinary description of the dish..."
                  className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Key Ingredients */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Key Ingredients (comma-separated)
                </label>
                <input
                  type="text"
                  value={formIngredients}
                  onChange={(e) => setFormIngredients(e.target.value)}
                  placeholder="e.g. Chickpea flour, Berbere, Garlic, Clarified butter"
                  className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Initial Availability */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-stone-950 border border-stone-800">
                <div>
                  <div className="text-xs font-semibold text-stone-200">Initial Stock Availability</div>
                  <div className="text-[11px] text-stone-400">
                    {formAvailable ? "Item will immediately be available for ordering" : "Item will start in Sold Out state"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormAvailable((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-colors ${
                    formAvailable
                      ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                      : "bg-red-950 text-red-300 border-red-800"
                  }`}
                >
                  {formAvailable ? "● In Stock" : "● Sold Out"}
                </button>
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400"
                >
                  {actionLoading ? "Saving..." : "Save Dish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT DISH ================= */}
      {editingDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h2 className="text-lg font-serif font-bold text-stone-100">
                Edit Menu Item: {editingDish.name}
              </h2>
              <button
                type="button"
                onClick={() => setEditingDish(null)}
                className="text-stone-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Dish["category"])}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Price (ETB) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Prep Time
                  </label>
                  <input
                    type="text"
                    value={formPrepTime}
                    onChange={(e) => setFormPrepTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="editSpicy"
                    checked={formSpicy}
                    onChange={(e) => setFormSpicy(e.target.checked)}
                    className="w-4 h-4 rounded bg-stone-950 border-stone-700 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="editSpicy" className="text-xs font-medium text-stone-300">
                    🌶️ Spicy Dish
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Dish Image Preset
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setFormImage(preset.url)}
                      className={`p-1.5 rounded-lg border text-left text-[11px] truncate transition-colors flex items-center gap-1.5 ${
                        formImage === preset.url
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-300 text-[11px] font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Key Ingredients (comma-separated)
                </label>
                <input
                  type="text"
                  value={formIngredients}
                  onChange={(e) => setFormIngredients(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Live Availability Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-stone-950 border border-stone-800">
                <div>
                  <div className="text-xs font-semibold text-stone-200">Availability State</div>
                  <div className="text-[11px] text-stone-400">
                    {formAvailable ? "Active on customer menu" : "Sold Out — Customers cannot order this"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormAvailable((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-colors ${
                    formAvailable
                      ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                      : "bg-red-950 text-red-300 border-red-800"
                  }`}
                >
                  {formAvailable ? "● In Stock" : "● Sold Out"}
                </button>
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDish(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400"
                >
                  {actionLoading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deletingDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-red-800/80 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800 text-red-300 flex items-center justify-center text-xl mx-auto">
              🗑️
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-100">Delete Menu Item?</h3>
              <p className="text-xs text-stone-400">
                Are you sure you want to permanently remove <strong className="text-stone-200">{deletingDish.name}</strong> from the active Addis Eats menu?
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingDish(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-stone-800 text-stone-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-900/30"
              >
                {actionLoading ? "Deleting..." : "Yes, Delete Dish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: RESET CONFIRMATION ================= */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl mx-auto">
              ↺
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-100">Reset Menu Catalog?</h3>
              <p className="text-xs text-stone-400">
                This will restore the Addis Eats catalog back to the original Ethiopian culinary fixtures. Any custom dishes added during this demo session will be reset.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-stone-800 text-stone-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleResetCatalog}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400"
              >
                {actionLoading ? "Resetting..." : "Restore Defaults"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
