import type {
  FamilyProfile,
  GeneratedMealPlan,
  MealPlanDay,
  MealType,
  PlannedMeal,
  WorkLunchSuggestion,
} from "./types";
import { buildBudgetTips } from "./budget-tips";
import {
  filterCandidatesForProfile,
  pickDishFromCandidates,
  updateTagCounts,
} from "./dish-selection";
import { buildPrepTips } from "./prep-tips";
import { buildShoppingList } from "./shopping-list";

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
  if (notes.toLowerCase().includes("пять")) return 5;
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

  if (dinner.dish.batchCooking && dinner.dish.difficulty !== "easy") {
    notes.push("Блюдо можно приготовить заранее");
  }

  return notes.length > 0 ? notes.join(". ") : undefined;
}

function getMemberNamesByIds(profile: FamilyProfile, ids: string[]): string[] {
  return ids.map((id) => {
    if (id.startsWith("adult-")) {
      const idx = Number(id.replace("adult-", "")) - 1;
      return profile.adultNames[idx] ?? `Взрослый ${idx + 1}`;
    }
    const idx = Number(id.replace("child-", "")) - 1;
    return profile.childrenNames[idx] ?? `Ребёнок ${idx + 1}`;
  });
}

function mealMatchesSelectedMembers(
  dish: { forAdults: boolean; forChildren: boolean },
  selectedMemberIds: string[],
): boolean {
  const hasAdults = selectedMemberIds.some((id) => id.startsWith("adult-"));
  const hasChildren = selectedMemberIds.some((id) => id.startsWith("child-"));
  if (hasAdults && !dish.forAdults) return false;
  if (hasChildren && !dish.forChildren) return false;
  return true;
}

export function generateMealPlan(profile: FamilyProfile): GeneratedMealPlan {
  const usedRecentlyByMeal = new Map<MealType, Map<string, number>>();
  const dishHistoryByMeal = new Map<MealType, string[]>();
  const tagCounts = new Map<string, number>();
  const days: MealPlanDay[] = [];
  const workLunchSuggestions: WorkLunchSuggestion[] = [];
  const needsWorkLunch = hasWorkLunchSchedule(profile.scheduleNotes);
  const workDays = extractWorkDays(profile.scheduleNotes);
  let workLunchCount = 0;

  for (let d = 0; d < profile.days; d++) {
    const meals: PlannedMeal[] = [];
    const dayUsedIds = new Set<string>();

    for (const mealType of profile.mealTypes) {
      const selectedMembers = profile.dayMealMembers[d]?.[mealType] ?? [];
      if (selectedMembers.length === 0) continue;

      const preferTakeaway =
        mealType === "dinner" && needsWorkLunch && workLunchCount < workDays;

      const candidates = filterCandidatesForProfile(mealType, profile).filter((dish) =>
        mealMatchesSelectedMembers(dish, selectedMembers),
      );
      const recentForMeal =
        usedRecentlyByMeal.get(mealType) ?? new Map<string, number>();
      const historyForMeal = dishHistoryByMeal.get(mealType) ?? [];
      const dish = pickDishFromCandidates(
        candidates,
        recentForMeal,
        d,
        preferTakeaway,
        dayUsedIds,
        tagCounts,
        historyForMeal,
      );

      if (!dish) continue;

      recentForMeal.set(dish.id, d);
      usedRecentlyByMeal.set(mealType, recentForMeal);
      const nextHistory = [...historyForMeal];
      nextHistory[d] = dish.id;
      dishHistoryByMeal.set(mealType, nextHistory);
      dayUsedIds.add(dish.id);
      updateTagCounts(tagCounts, dish);

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

      meals.push({
        mealType,
        dish,
        note,
        forWhom: getMemberNamesByIds(profile, selectedMembers).join(", "),
      });
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

export function getPlanStats(plan: GeneratedMealPlan) {
  const allMeals = plan.days.flatMap((d) => d.meals);
  const uniqueDishes = new Set(allMeals.map((m) => m.dish.id));
  const batchCount = allMeals.filter((m) => m.dish.batchCooking).length;
  const takeawayCount = allMeals.filter((m) => m.dish.takeawayFriendly).length;
  const childFriendly = allMeals.filter((m) => m.dish.forChildren).length;

  return {
    totalMeals: allMeals.length,
    uniqueDishes: uniqueDishes.size,
    batchCount,
    takeawayCount,
    childFriendly,
  };
}
