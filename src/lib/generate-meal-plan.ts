import { DISHES } from "./dishes";
import type {
  BudgetLevel,
  Dish,
  FamilyProfile,
  GeneratedMealPlan,
  MealPlanDay,
  MealType,
  PlannedMeal,
  WorkLunchSuggestion,
} from "./types";
import { buildBudgetTips } from "./budget-tips";
import { buildPrepTips } from "./prep-tips";
import { buildShoppingList } from "./shopping-list";

const BUDGET_ORDER: Record<BudgetLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

const REPEAT_COOLDOWN = 3;

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
  const allForbidden = [...forbidden, ...allergies];
  if (allForbidden.length === 0) return false;

  const haystack = [
    dish.name.toLowerCase(),
    ...dish.ingredients.map((i) => i.name.toLowerCase()),
    ...dish.tags.map((t) => t.toLowerCase()),
  ].join(" ");

  return allForbidden.some((word) => haystack.includes(word.toLowerCase()));
}

function scoreDish(
  dish: Dish,
  profile: FamilyProfile,
  favorites: string[],
): number {
  let score = 0;
  const haystack = [
    dish.name.toLowerCase(),
    ...dish.ingredients.map((i) => i.name.toLowerCase()),
    ...dish.tags,
  ].join(" ");

  for (const fav of favorites) {
    if (haystack.includes(fav.toLowerCase())) score += 3;
  }

  if (profile.childrenCount > 0 && dish.forChildren) score += 2;
  if (profile.adultsCount > 0 && dish.forAdults) score += 1;
  if (profile.cookWithLeftovers && dish.batchCooking) score += 2;
  if (profile.budget === "low" && dish.budget === "low") score += 1;

  if (
    profile.cuisinePreference !== "any" &&
    dish.cuisine?.includes(profile.cuisinePreference)
  ) {
    score += 2;
  }

  return score;
}

function filterCandidates(
  mealType: MealType,
  profile: FamilyProfile,
): Dish[] {
  const disliked = parseKeywords(profile.dislikedProducts);
  const allergies = parseKeywords(profile.allergies);
  const adultFavs = parseKeywords(profile.adultFavorites);
  const childFavs = parseKeywords(profile.childrenFavorites);
  const allFavorites = [...adultFavs, ...childFavs];

  return DISHES.filter((dish) => {
    if (dish.mealType !== mealType) return false;
    if (!dishMatchesBudget(dish, profile.budget)) return false;
    if (dishContainsForbidden(dish, disliked, allergies)) return false;

    if (profile.childrenCount > 0 && profile.adultsCount === 0) {
      return dish.forChildren;
    }
    if (profile.adultsCount > 0 && profile.childrenCount === 0) {
      return dish.forAdults;
    }

    return dish.forChildren || dish.forAdults;
  }).map((dish) => ({
    dish,
    score: scoreDish(dish, profile, allFavorites),
  }))
    .sort((a, b) => b.score - a.score)
    .map(({ dish }) => dish);
}

function pickDish(
  candidates: Dish[],
  usedRecently: Map<string, number>,
  dayIndex: number,
  preferTakeaway = false,
): Dish | null {
  if (candidates.length === 0) return null;

  const scored = candidates.map((dish, index) => {
    let score = candidates.length - index;
    const lastUsed = usedRecently.get(dish.id);
    if (lastUsed !== undefined && dayIndex - lastUsed < REPEAT_COOLDOWN) {
      score -= 10;
    }
    if (preferTakeaway && dish.takeawayFriendly) score += 5;
    if (dish.batchCooking) score += 1;
    return { dish, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.dish ?? null;
}

function hasWorkLunchSchedule(notes: string): boolean {
  const lower = notes.toLowerCase();
  return (
    lower.includes("работ") ||
    lower.includes("офис") ||
    lower.includes("обедает на работе") ||
    lower.includes("на работе")
  );
}

function extractWorkDays(notes: string): number {
  const match = notes.match(/(\d+)\s*дн/i);
  if (match) return Math.min(parseInt(match[1], 10), 5);
  if (notes.toLowerCase().includes("четыре")) return 4;
  if (notes.toLowerCase().includes("три")) return 3;
  return 4;
}

function buildDayComment(
  meals: PlannedMeal[],
  profile: FamilyProfile,
  dayIndex: number,
): string | undefined {
  const dinner = meals.find((m) => m.mealType === "dinner");
  if (!dinner) return undefined;

  const notes: string[] = [];

  if (profile.cookWithLeftovers && dinner.dish.batchCooking) {
    notes.push("Приготовьте с запасом — останется на следующий день");
  }

  if (
    hasWorkLunchSchedule(profile.scheduleNotes) &&
    dinner.dish.takeawayFriendly &&
    dayIndex < extractWorkDays(profile.scheduleNotes)
  ) {
    notes.push("Сделайте дополнительную порцию для обеда на работе");
  }

  if (dinner.dish.batchCooking) {
    notes.push("Блюдо можно приготовить заранее");
  }

  return notes.length > 0 ? notes.join(". ") : undefined;
}

export function generateMealPlan(profile: FamilyProfile): GeneratedMealPlan {
  const usedRecently = new Map<string, number>();
  const days: MealPlanDay[] = [];
  const workLunchSuggestions: WorkLunchSuggestion[] = [];
  const needsWorkLunch = hasWorkLunchSchedule(profile.scheduleNotes);
  const workDays = extractWorkDays(profile.scheduleNotes);
  let workLunchCount = 0;

  for (let d = 0; d < profile.days; d++) {
    const meals: PlannedMeal[] = [];

    for (const mealType of profile.mealTypes) {
      const preferTakeaway =
        mealType === "dinner" && needsWorkLunch && workLunchCount < workDays;

      const candidates = filterCandidates(mealType, profile);
      const dish = pickDish(candidates, usedRecently, d, preferTakeaway);

      if (!dish) continue;

      usedRecently.set(dish.id, d);

      let note: string | undefined;
      if (
        mealType === "dinner" &&
        needsWorkLunch &&
        dish.takeawayFriendly &&
        workLunchCount < workDays
      ) {
        note = "Оставьте порцию в контейнере на работу";
        workLunchSuggestions.push({
          day: d + 1,
          dishName: dish.name,
          note: `Контейнер с «${dish.name}» — обед на работу (день ${d + 1})`,
        });
        workLunchCount++;
      }

      meals.push({ mealType, dish, note });
    }

    days.push({
      day: d + 1,
      meals,
      comment: buildDayComment(meals, profile, d),
    });
  }

  const allDishes = days.flatMap((day) => day.meals.map((m) => m.dish));

  return {
    profile,
    days,
    shoppingList: buildShoppingList(allDishes, profile),
    prepTips: buildPrepTips(allDishes, profile),
    budgetTips: buildBudgetTips(profile),
    workLunchSuggestions,
    generatedAt: new Date().toISOString(),
  };
}
