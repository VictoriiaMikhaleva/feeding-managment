import type { Dish, MealPlanDay } from "./types";

export interface DishNutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

/** Примерная калорийность одной порции (взрослый), ккал */
export const CALORIES_BY_DISH_ID: Record<string, number> = {
  "oatmeal-berries": 320,
  syrniki: 380,
  blini: 420,
  oladi: 350,
  "omelette-veg": 280,
  "cottage-cheese-berries": 290,
  "eggs-toast": 340,
  "cottage-casserole": 360,
  "milk-rice-porridge": 310,
  "sandwich-egg": 320,
  shakshuka: 260,
  "cottage-pancakes": 370,
  "chicken-noodle-soup": 380,
  "borscht-simple": 320,
  "buckwheat-chicken-lunch": 480,
  "tuna-salad": 420,
  "chicken-pilaf": 520,
  "mashed-potato-cutlets": 550,
  "veg-soup": 280,
  "pasta-cheese": 450,
  "soup-pea": 360,
  "pasta-pesto-chicken": 490,
  "lazy-lasagna": 520,
  "chicken-mushroom-julienne": 480,
  "pelmeni-salad": 540,
  "fish-sticks-rice": 450,
  "nuggets-mash": 520,
  "chicken-cutlets-buckwheat": 500,
  "pasta-mince": 480,
  "chicken-veg-stew": 420,
  "potato-casserole": 510,
  "rice-chicken-veg": 460,
  "meatball-soup": 390,
  "buckwheat-meat-sauce": 490,
  "baked-fish-veg": 380,
  "meatballs-tomato": 470,
  "chicken-pan-veg": 400,
  "bean-veg-stew": 350,
  "stew-beef-potato": 520,
  draniki: 430,
};

const MEAL_TYPE_FALLBACK: Record<Dish["mealType"], DishNutrition> = {
  breakfast: { calories: 330, protein: 14, fat: 12, carbs: 48 },
  lunch: { calories: 430, protein: 28, fat: 18, carbs: 55 },
  dinner: { calories: 460, protein: 26, fat: 16, carbs: 42 },
};

function estimateMacros(dish: Dish, calories: number): DishNutrition {
  const base = { ...MEAL_TYPE_FALLBACK[dish.mealType] };
  if (dish.tags.includes("мясо")) {
    base.protein += 8;
    base.calories += 60;
  }
  if (dish.tags.includes("рыба")) {
    base.protein += 6;
    base.fat += 4;
  }
  if (dish.tags.includes("овощи")) {
    base.carbs -= 5;
    base.fat -= 3;
  }
  const scale = base.calories > 0 ? calories / base.calories : 1;
  return {
    calories,
    protein: Math.max(0, Math.round(base.protein * scale)),
    fat: Math.max(0, Math.round(base.fat * scale)),
    carbs: Math.max(0, Math.round(base.carbs * scale)),
  };
}

export function getDishCalories(dish: Dish): number {
  return (
    dish.caloriesPerServing ??
    CALORIES_BY_DISH_ID[dish.id] ??
    MEAL_TYPE_FALLBACK[dish.mealType].calories
  );
}

export function getDishNutrition(dish: Dish): DishNutrition {
  const calories = getDishCalories(dish);
  if (
    dish.proteinPerServing != null &&
    dish.fatPerServing != null &&
    dish.carbsPerServing != null
  ) {
    return {
      calories,
      protein: dish.proteinPerServing,
      fat: dish.fatPerServing,
      carbs: dish.carbsPerServing,
    };
  }
  return estimateMacros(dish, calories);
}

export function formatDishCalories(dish: Dish): string {
  return `~${getDishCalories(dish)} ккал`;
}

export function formatDishNutrition(dish: Dish): string {
  const n = getDishNutrition(dish);
  return `~${n.calories} ккал · Б ${n.protein} Ж ${n.fat} У ${n.carbs}`;
}

export function getDayCaloriesTotal(day: MealPlanDay): number {
  return day.meals.reduce((sum, meal) => sum + getDishCalories(meal.dish), 0);
}

export function getDayNutritionTotal(day: MealPlanDay): DishNutrition {
  return day.meals.reduce(
    (acc, meal) => {
      const n = getDishNutrition(meal.dish);
      return {
        calories: acc.calories + n.calories,
        protein: acc.protein + n.protein,
        fat: acc.fat + n.fat,
        carbs: acc.carbs + n.carbs,
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );
}

export function formatDayNutritionShort(day: MealPlanDay): string {
  const n = getDayNutritionTotal(day);
  if (n.calories === 0) return "";
  return `~${n.calories} ккал · Б${n.protein} Ж${n.fat} У${n.carbs}`;
}

export function getPlanCaloriesAverage(plan: { days: MealPlanDay[] }): number {
  const totals = plan.days.map(getDayCaloriesTotal).filter((total) => total > 0);
  if (totals.length === 0) return 0;
  return Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
}

export function getPlanNutritionAverage(plan: { days: MealPlanDay[] }): DishNutrition {
  const days = plan.days.map(getDayNutritionTotal).filter((d) => d.calories > 0);
  if (days.length === 0) {
    return { calories: 0, protein: 0, fat: 0, carbs: 0 };
  }
  const sum = days.reduce(
    (acc, d) => ({
      calories: acc.calories + d.calories,
      protein: acc.protein + d.protein,
      fat: acc.fat + d.fat,
      carbs: acc.carbs + d.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );
  return {
    calories: Math.round(sum.calories / days.length),
    protein: Math.round(sum.protein / days.length),
    fat: Math.round(sum.fat / days.length),
    carbs: Math.round(sum.carbs / days.length),
  };
}
