import { DISHES } from "./dishes";
import { expandAllergies } from "./allergy-map";
import type { BudgetLevel, Dish, FamilyProfile, MealType } from "./types";
import { getDishCookingMethods } from "./cooking-methods";

const BUDGET_ORDER: Record<BudgetLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

const REPEAT_COOLDOWN = 3;
const TOP_CANDIDATES_POOL = 4;

function parseKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[,;.\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function dishMatchesBudget(dish: Dish, budget: BudgetLevel): boolean {
  return BUDGET_ORDER[dish.budget] <= BUDGET_ORDER[budget];
}

function dishContainsForbidden(
  dish: Dish,
  forbidden: string[],
  allergies: string[],
): boolean {
  const expandedAllergies = allergies.length
    ? expandAllergies(allergies.join(", "))
    : [];
  const allForbidden = [...forbidden, ...expandedAllergies];
  if (allForbidden.length === 0) return false;

  const haystack = [
    dish.name.toLowerCase(),
    ...dish.ingredients.map((i) => i.name.toLowerCase()),
    ...dish.tags.map((t) => t.toLowerCase()),
  ].join(" ");

  return allForbidden.some((word) => {
    const w = word.toLowerCase().trim();
    return w.length > 1 && haystack.includes(w);
  });
}

function scoreDish(
  dish: Dish,
  profile: FamilyProfile,
  adultFavs: string[],
  childFavs: string[],
): number {
  let score = 0;
  const haystack = [
    dish.name.toLowerCase(),
    ...dish.ingredients.map((i) => i.name.toLowerCase()),
    ...dish.tags,
  ].join(" ");

  for (const fav of adultFavs) {
    if (haystack.includes(fav.toLowerCase())) score += 3;
  }
  for (const fav of childFavs) {
    if (haystack.includes(fav.toLowerCase())) score += 4;
  }

  if (profile.childrenCount > 0 && dish.forChildren) score += 2;
  if (profile.adultsCount > 0 && dish.forAdults) score += 1;
  if (profile.cookWithLeftovers && dish.batchCooking) score += 3;
  if (profile.budget === "low" && dish.budget === "low") score += 2;
  if (profile.budget === "high" && dish.budget === "high") score += 1;

  if (
    profile.cuisinePreference !== "any" &&
    dish.cuisine?.includes(profile.cuisinePreference)
  ) {
    score += 3;
  }

  if (dish.difficulty === "easy") score += 1;

  return score;
}

export function filterCandidatesForProfile(
  mealType: MealType,
  profile: FamilyProfile,
): Dish[] {
  const disliked = parseKeywords(profile.dislikedProducts);
  const allergies = parseKeywords(profile.allergies);
  const adultFavs = parseKeywords(profile.adultFavorites);
  const childFavs = parseKeywords(profile.childrenFavorites);

  return DISHES.filter((dish) => {
    if (dish.mealType !== mealType) return false;
    if (!dishMatchesBudget(dish, profile.budget)) return false;
    if (dishContainsForbidden(dish, disliked, allergies)) return false;
    const dishMethods = getDishCookingMethods(dish);
    if (!dishMethods.some((method) => profile.cookingMethods.includes(method))) {
      return false;
    }

    if (profile.childrenCount > 0 && profile.adultsCount === 0) {
      return dish.forChildren;
    }
    if (profile.adultsCount > 0 && profile.childrenCount === 0) {
      return dish.forAdults;
    }

    return dish.forChildren || dish.forAdults;
  })
    .map((dish) => ({
      dish,
      score: scoreDish(dish, profile, adultFavs, childFavs),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ dish }) => dish);
}

function scoreForPick(
  dish: Dish,
  baseIndex: number,
  total: number,
  usedRecently: Map<string, number>,
  dayIndex: number,
  preferTakeaway: boolean,
  usedInPlan: Set<string>,
  tagCounts: Map<string, number>,
): number {
  let score = total - baseIndex;
  const lastUsed = usedRecently.get(dish.id);
  if (lastUsed !== undefined && dayIndex - lastUsed < REPEAT_COOLDOWN) {
    score -= 15;
  }
  if (usedInPlan.has(dish.id)) score -= 20;
  if (preferTakeaway && dish.takeawayFriendly) score += 6;
  if (dish.batchCooking) score += 2;

  for (const tag of dish.tags) {
    const count = tagCounts.get(tag) ?? 0;
    if (count >= 3) score -= 2;
  }

  return score;
}

/** Выбор из топ-кандидатов с лёгкой случайностью для разнообразия */
export function pickDishFromCandidates(
  candidates: Dish[],
  usedRecently: Map<string, number>,
  dayIndex: number,
  preferTakeaway = false,
  excludeIds: Set<string> = new Set(),
  tagCounts: Map<string, number> = new Map(),
): Dish | null {
  const available = candidates.filter((d) => !excludeIds.has(d.id));
  if (available.length === 0) return null;

  const scored = available.map((dish, index) => ({
    dish,
    score: scoreForPick(
      dish,
      index,
      available.length,
      usedRecently,
      dayIndex,
      preferTakeaway,
      excludeIds,
      tagCounts,
    ),
  }));

  scored.sort((a, b) => b.score - a.score);

  const pool = scored.slice(0, TOP_CANDIDATES_POOL);
  const totalWeight = pool.reduce((sum, item) => sum + Math.max(item.score, 1), 0);
  let roll = Math.random() * totalWeight;

  for (const item of pool) {
    roll -= Math.max(item.score, 1);
    if (roll <= 0) return item.dish;
  }

  return pool[0]?.dish ?? null;
}

export function updateTagCounts(
  tagCounts: Map<string, number>,
  dish: Dish,
): void {
  for (const tag of dish.tags) {
    tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }
}

export { REPEAT_COOLDOWN };
