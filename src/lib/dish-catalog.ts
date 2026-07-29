import { DISHES } from "./dishes";
import { loadCustomDishes } from "./custom-dishes";
import type { Dish, FamilyProfile } from "./types";

export function getCatalogDishes(profile?: Pick<FamilyProfile, "dishCatalogMode">): Dish[] {
  const custom = loadCustomDishes();
  if (profile?.dishCatalogMode === "custom_only") {
    return custom;
  }
  return [...DISHES, ...custom];
}

export function getDishById(id: string): Dish | undefined {
  const custom = loadCustomDishes();
  return (
    DISHES.find((d) => d.id === id) ?? custom.find((d) => d.id === id)
  );
}

export function buildDishMap(): Map<string, Dish> {
  const map = new Map<string, Dish>();
  for (const dish of DISHES) map.set(dish.id, dish);
  for (const dish of loadCustomDishes()) map.set(dish.id, dish);
  return map;
}
