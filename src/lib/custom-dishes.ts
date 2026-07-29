import type { Dish, MealType } from "./types";

const CUSTOM_DISHES_KEY = "family-menu-custom-dishes";
const MAX_CUSTOM_DISHES = 30;

function safelyParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadCustomDishes(): Dish[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CUSTOM_DISHES_KEY);
  if (!raw) return [];
  const parsed = safelyParseJson<Dish[]>(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((d) => d?.id && d?.name && d?.mealType);
}

export function saveCustomDishes(dishes: Dish[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    CUSTOM_DISHES_KEY,
    JSON.stringify(dishes.slice(0, MAX_CUSTOM_DISHES)),
  );
}

export function addCustomDish(dish: Omit<Dish, "id" | "isCustom">): Dish {
  const dishes = loadCustomDishes();
  const entry: Dish = {
    ...dish,
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    isCustom: true,
  };
  saveCustomDishes([entry, ...dishes]);
  return entry;
}

export function removeCustomDish(id: string): void {
  saveCustomDishes(loadCustomDishes().filter((d) => d.id !== id));
}

export function parseIngredientsText(text: string): Dish["ingredients"] {
  return text
    .split(/[\n,;]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name) => ({ name, category: "other" as const }));
}

export function defaultCustomDish(mealType: MealType): Omit<Dish, "id" | "isCustom"> {
  return {
    name: "",
    mealType,
    forChildren: true,
    forAdults: true,
    budget: "medium",
    ingredients: [],
    tags: ["домашнее"],
    difficulty: "easy",
    batchCooking: false,
    takeawayFriendly: false,
    cuisine: ["home", "any"],
    cookingMethods: ["stove"],
    caloriesPerServing: 400,
    proteinPerServing: 20,
    fatPerServing: 15,
    carbsPerServing: 40,
  };
}
