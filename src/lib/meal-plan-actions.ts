import type {
  FamilyProfile,
  GeneratedMealPlan,
  MealType,
  PlannedMeal,
} from "./types";
import { buildBudgetTips } from "./budget-tips";
import {
  filterCandidatesForProfile,
  pickDishFromCandidates,
} from "./dish-selection";
import { buildPrepTips } from "./prep-tips";
import { buildShoppingList } from "./shopping-list";

export function rebuildPlanMetadata(
  profile: FamilyProfile,
  days: GeneratedMealPlan["days"],
  workLunchSuggestions: GeneratedMealPlan["workLunchSuggestions"],
): Pick<
  GeneratedMealPlan,
  "shoppingList" | "prepTips" | "budgetTips" | "workLunchSuggestions"
> {
  const allDishes = days.flatMap((day) => day.meals.map((m) => m.dish));
  return {
    shoppingList: buildShoppingList(allDishes, profile),
    prepTips: buildPrepTips(allDishes, profile),
    budgetTips: buildBudgetTips(profile),
    workLunchSuggestions,
  };
}

export function swapMealDish(
  plan: GeneratedMealPlan,
  dayNumber: number,
  mealType: MealType,
): GeneratedMealPlan {
  const dayIndex = plan.days.findIndex((d) => d.day === dayNumber);
  if (dayIndex === -1) return plan;

  const day = plan.days[dayIndex];
  const mealIndex = day.meals.findIndex((m) => m.mealType === mealType);
  if (mealIndex === -1) return plan;

  const currentMeal = day.meals[mealIndex];
  const usedIds = new Set(
    plan.days.flatMap((d) => d.meals.map((m) => m.dish.id)),
  );
  usedIds.delete(currentMeal.dish.id);

  const usedRecently = new Map<string, number>();
  plan.days.forEach((d, i) => {
    d.meals.forEach((m) => usedRecently.set(m.dish.id, i));
  });

  const candidates = filterCandidatesForProfile(
    mealType,
    plan.profile,
  ).filter((d) => d.id !== currentMeal.dish.id);

  const newDish = pickDishFromCandidates(
    candidates,
    usedRecently,
    dayIndex,
    false,
    usedIds,
  );

  if (!newDish) return plan;

  const newMeals: PlannedMeal[] = [...day.meals];
  newMeals[mealIndex] = {
    ...currentMeal,
    dish: newDish,
    note: currentMeal.note,
  };

  const newDays = [...plan.days];
  newDays[dayIndex] = { ...day, meals: newMeals };

  const meta = rebuildPlanMetadata(
    plan.profile,
    newDays,
    plan.workLunchSuggestions,
  );

  return {
    ...plan,
    days: newDays,
    ...meta,
    generatedAt: new Date().toISOString(),
  };
}

export function formatMenuForCopy(plan: GeneratedMealPlan): string {
  const lines: string[] = [
    "СЕМЕЙНОЕ МЕНЮ",
    `${plan.profile.days} дн. · ${plan.profile.adultsCount} взр. · ${plan.profile.childrenCount} дет.`,
    "",
  ];

  for (const day of plan.days) {
    lines.push(`День ${day.day}`);
    for (const meal of day.meals) {
      const label =
        meal.mealType === "breakfast"
          ? "Завтрак"
          : meal.mealType === "lunch"
            ? "Обед"
            : "Ужин";
      lines.push(`  ${label}: ${meal.dish.name}`);
      if (meal.note) lines.push(`    → ${meal.note}`);
    }
    if (day.comment) lines.push(`  💬 ${day.comment}`);
    lines.push("");
  }

  return lines.join("\n");
}
