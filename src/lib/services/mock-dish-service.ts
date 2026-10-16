/**
 * Frontend Mock Dish Service (Days 38, 41, 48)
 * Decouples presentation from data source; provides in-memory session persistence,
 * search/filter/pagination, and role-guarded CRUD management for kitchen staff.
 */

import { FIXTURE_DISHES } from "../fixtures/dishes.ts";
import type { Dish } from "../fixtures/dishes.ts";
import type { DemoUser } from "../fixtures/users.ts";

export interface DishSearchParams {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  availability?: "all" | "available" | "sold_out";
}

export interface DishSearchResult {
  dishes: Dish[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateDishInput {
  name: string;
  category: "Traditional" | "Vegetarian" | "Breakfast" | "Drinks" | "Desserts";
  price: number; // Integer ETB
  description: string;
  image?: string;
  prepTime?: string;
  spicy?: boolean;
  featured?: boolean;
  ingredients?: string[];
  isAvailable?: boolean;
}

export interface DishServiceResult {
  success: boolean;
  dish?: Dish;
  error?: string;
}

const DISH_STORAGE_KEY = "addis_eats_dishes_catalog";

// In-memory dish store initialized with fixtures (persists during session, synced to localStorage)
let dishStore: Dish[] = FIXTURE_DISHES.map((d) => ({
  ...d,
  isAvailable: d.isAvailable ?? true,
}));

let isStorageLoaded = false;

function loadDishesFromStorage(): void {
  if (typeof window === "undefined" || isStorageLoaded) return;
  try {
    const raw = localStorage.getItem(DISH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        dishStore = parsed;
      }
    }
  } catch {
    // Storage access blocked or unavailable
  } finally {
    isStorageLoaded = true;
  }
}

function saveDishesToStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DISH_STORAGE_KEY, JSON.stringify(dishStore));
  } catch {
    // Storage quota exceeded or blocked
  }
}

/**
 * Retrieves all dishes in catalog
 */
export async function getAllDishes(): Promise<Dish[]> {
  loadDishesFromStorage();
  return dishStore.map((d) => ({ ...d }));
}

/**
 * Retrieves a single dish by unique ID
 */
export async function getDishById(id: string): Promise<Dish | null> {
  loadDishesFromStorage();
  const match = dishStore.find((d) => d.id === id);
  return match ? { ...match } : null;
}

/**
 * Searches, filters, and paginates dishes
 */
export async function searchDishes(params: DishSearchParams = {}): Promise<DishSearchResult> {
  loadDishesFromStorage();

  const query = (params.query || "").trim().toLowerCase();
  const category = (params.category || "All").trim();
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, params.pageSize || 6);
  const availability = params.availability || "all";

  let filtered = [...dishStore];

  // Category filter
  if (category && category !== "All") {
    filtered = filtered.filter((d) => d.category.toLowerCase() === category.toLowerCase());
  }

  // Availability filter
  if (availability === "available") {
    filtered = filtered.filter((d) => d.isAvailable !== false);
  } else if (availability === "sold_out") {
    filtered = filtered.filter((d) => d.isAvailable === false);
  }

  // Text search filter (name, description, ingredients)
  if (query) {
    filtered = filtered.filter((d) => {
      const matchName = d.name.toLowerCase().includes(query);
      const matchDesc = d.description.toLowerCase().includes(query);
      const matchIngredients = d.ingredients?.some((ing) => ing.toLowerCase().includes(query)) ?? false;
      return matchName || matchDesc || matchIngredients;
    });
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return {
    dishes: paginated,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Creates a new dish (Staff only)
 */
export async function createDish(
  input: CreateDishInput,
  user?: DemoUser | null
): Promise<DishServiceResult> {
  loadDishesFromStorage();

  // Role verification
  if (!user || user.role !== "staff") {
    return {
      success: false,
      error: "Unauthorized: Only kitchen staff members can add dishes to the menu.",
    };
  }

  // Field validation
  const name = input.name?.trim();
  if (!name || name.length < 2) {
    return { success: false, error: "Dish name must be at least 2 characters." };
  }

  const price = Math.round(Number(input.price));
  if (isNaN(price) || price <= 0) {
    return { success: false, error: "Price must be a positive integer in Ethiopian Birr (ETB)." };
  }

  const description = input.description?.trim();
  if (!description || description.length < 5) {
    return { success: false, error: "Description must be at least 5 characters long." };
  }

  // Generate unique URL slug / ID
  const baseId = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  let id = baseId || `dish-${Date.now()}`;
  let suffix = 1;
  while (dishStore.some((d) => d.id === id)) {
    id = `${baseId}-${suffix++}`;
  }

  const newDish: Dish = {
    id,
    name,
    category: input.category || "Traditional",
    price,
    description,
    image: input.image?.trim() || "/images/kitfo.png",
    prepTime: input.prepTime?.trim() || "15-20 min",
    spicy: Boolean(input.spicy),
    featured: Boolean(input.featured),
    ingredients: Array.isArray(input.ingredients) ? input.ingredients : [],
    isAvailable: input.isAvailable !== false,
  };

  dishStore = [newDish, ...dishStore];
  saveDishesToStorage();

  return {
    success: true,
    dish: newDish,
  };
}

/**
 * Updates an existing dish (Staff only)
 */
export async function updateDish(
  id: string,
  updates: Partial<Dish>,
  user?: DemoUser | null
): Promise<DishServiceResult> {
  loadDishesFromStorage();

  if (!user || user.role !== "staff") {
    return {
      success: false,
      error: "Unauthorized: Only kitchen staff members can modify menu items.",
    };
  }

  const index = dishStore.findIndex((d) => d.id === id);
  if (index === -1) {
    return { success: false, error: `Dish with ID '${id}' was not found.` };
  }

  const existing = dishStore[index];
  const updated: Dish = {
    ...existing,
    ...updates,
    id, // Preserve permanent ID
    price: updates.price !== undefined ? Math.round(Number(updates.price)) : existing.price,
  };

  dishStore[index] = updated;
  saveDishesToStorage();

  return {
    success: true,
    dish: updated,
  };
}

/**
 * Toggles a dish between Available (In Stock) and Sold Out (Staff only)
 */
export async function toggleDishAvailability(
  id: string,
  user?: DemoUser | null
): Promise<DishServiceResult> {
  loadDishesFromStorage();

  if (!user || user.role !== "staff") {
    return {
      success: false,
      error: "Unauthorized: Only kitchen staff members can adjust item availability.",
    };
  }

  const dish = dishStore.find((d) => d.id === id);
  if (!dish) {
    return { success: false, error: `Dish with ID '${id}' was not found.` };
  }

  const nextState = dish.isAvailable === false ? true : false;
  return updateDish(id, { isAvailable: nextState }, user);
}

/**
 * Deletes a dish from the active catalog (Staff only)
 */
export async function deleteDish(
  id: string,
  user?: DemoUser | null
): Promise<{ success: boolean; error?: string }> {
  loadDishesFromStorage();

  if (!user || user.role !== "staff") {
    return {
      success: false,
      error: "Unauthorized: Only kitchen staff members can delete menu items.",
    };
  }

  const index = dishStore.findIndex((d) => d.id === id);
  if (index === -1) {
    return { success: false, error: `Dish with ID '${id}' was not found.` };
  }

  dishStore = dishStore.filter((d) => d.id !== id);
  saveDishesToStorage();

  return { success: true };
}

/**
 * Resets dishes back to factory fixtures (Staff only)
 */
export async function resetDishesToDefault(
  user?: DemoUser | null
): Promise<{ success: boolean; dishes: Dish[]; error?: string }> {
  if (!user || user.role !== "staff") {
    return {
      success: false,
      dishes: [],
      error: "Unauthorized: Only kitchen staff members can reset the menu catalog.",
    };
  }

  dishStore = FIXTURE_DISHES.map((d) => ({
    ...d,
    isAvailable: d.isAvailable ?? true,
  }));
  saveDishesToStorage();

  return {
    success: true,
    dishes: [...dishStore],
  };
}
