import { getDishById } from "./dish-catalog";
import type {
  GeneratedMealPlan,
  MealPlanDay,
  PlannedMeal,
} from "./types";

function resolveDish(dishId: string) {
  return getDishById(dishId);
}

type CompactPlannedMeal = {
  mealType: PlannedMeal["mealType"];
  dishId: string;
  forWhom?: string;
  note?: string;
};

type CompactMealPlanDay = {
  day: number;
  meals: CompactPlannedMeal[];
  comment?: string;
};

export type CompactMealPlan = Omit<GeneratedMealPlan, "days"> & {
  days: CompactMealPlanDay[];
};

function isCompactMeal(
  meal: PlannedMeal | CompactPlannedMeal,
): meal is CompactPlannedMeal {
  return "dishId" in meal && typeof meal.dishId === "string";
}

export function compactMealPlan(plan: GeneratedMealPlan): CompactMealPlan {
  return {
    ...plan,
    days: plan.days.map((day) => ({
      day: day.day,
      comment: day.comment,
      meals: day.meals.map((meal) => ({
        mealType: meal.mealType,
        dishId: meal.dish.id,
        forWhom: meal.forWhom,
        note: meal.note,
      })),
    })),
  };
}

export function expandMealPlan(
  stored: CompactMealPlan | GeneratedMealPlan,
): GeneratedMealPlan | null {
  const days: MealPlanDay[] = [];

  for (const day of stored.days) {
    const meals: PlannedMeal[] = [];

    for (const meal of day.meals) {
      if (isCompactMeal(meal)) {
        const dish = resolveDish(meal.dishId);
        if (!dish) continue;
        meals.push({
          mealType: meal.mealType,
          dish,
          forWhom: meal.forWhom,
          note: meal.note,
        });
      } else {
        meals.push(meal);
      }
    }

    days.push({
      day: day.day,
      meals,
      comment: day.comment,
    });
  }

  if (days.every((day) => day.meals.length === 0)) {
    return null;
  }

  return {
    ...stored,
    days,
  } as GeneratedMealPlan;
}
