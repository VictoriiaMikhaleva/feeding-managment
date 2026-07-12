import type { Dish, MealPlanDay } from "./types";

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

const MEAL_TYPE_FALLBACK: Record<Dish["mealType"], number> = {
  breakfast: 330,
  lunch: 430,
  dinner: 460,
};

export function getDishCalories(dish: Dish): number {
  return (
    dish.caloriesPerServing ??
    CALORIES_BY_DISH_ID[dish.id] ??
    MEAL_TYPE_FALLBACK[dish.mealType]
  );
}

export function formatDishCalories(dish: Dish): string {
  return `~${getDishCalories(dish)} ккал`;
}

export function getDayCaloriesTotal(day: MealPlanDay): number {
  return day.meals.reduce((sum, meal) => sum + getDishCalories(meal.dish), 0);
}

export function getPlanCaloriesAverage(plan: { days: MealPlanDay[] }): number {
  const totals = plan.days.map(getDayCaloriesTotal).filter((total) => total > 0);
  if (totals.length === 0) return 0;
  return Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
}
