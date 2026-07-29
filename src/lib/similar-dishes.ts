import { DISHES } from "./dishes";
import { loadCustomDishes } from "./custom-dishes";
import { ingredientsMatch } from "./ingredient-tokens";
import type { Dish, Ingredient, MealType } from "./types";

export interface SimilarDishMatch {
  dish: Dish;
  /** Ингредиенты из ввода пользователя, совпавшие с блюдом */
  sharedIngredients: string[];
  score: number;
}

export interface FindSimilarDishesOptions {
  ingredients: Ingredient[];
  mealType?: MealType;
  limit?: number;
  /** Включать уже сохранённые пользовательские блюда */
  includeCustom?: boolean;
  excludeIds?: string[];
}

function countSharedIngredients(
  userIngredients: Ingredient[],
  dish: Dish,
): string[] {
  const shared: string[] = [];

  for (const userIng of userIngredients) {
    const userName = userIng.name.trim();
    if (userName.length < 2) continue;

    const hasMatch = dish.ingredients.some((dishIng) =>
      ingredientsMatch(userName, dishIng.name),
    );

    if (hasMatch) {
      shared.push(userName);
    }
  }

  return shared;
}

function scoreMatch(
  shared: string[],
  userCount: number,
  dish: Dish,
  mealType?: MealType,
): number {
  if (shared.length === 0 || userCount === 0) return 0;

  const overlapRatio = shared.length / userCount;
  const coverageRatio =
    dish.ingredients.length > 0
      ? shared.length / dish.ingredients.length
      : 0;
  const mealBonus = mealType && dish.mealType === mealType ? 12 : 0;

  return (
    shared.length * 18 +
    overlapRatio * 30 +
    coverageRatio * 10 +
    mealBonus
  );
}

export function findSimilarDishes(
  options: FindSimilarDishesOptions,
): SimilarDishMatch[] {
  const {
    ingredients,
    mealType,
    limit = 5,
    includeCustom = true,
    excludeIds = [],
  } = options;

  const userIngredients = ingredients.filter((ing) => ing.name.trim().length >= 2);
  if (userIngredients.length === 0) return [];

  const exclude = new Set(excludeIds);
  const pool: Dish[] = [...DISHES];
  if (includeCustom) {
    pool.push(...loadCustomDishes());
  }

  const matches: SimilarDishMatch[] = [];

  for (const dish of pool) {
    if (exclude.has(dish.id)) continue;

    const sharedIngredients = countSharedIngredients(userIngredients, dish);
    if (sharedIngredients.length === 0) continue;

    const score = scoreMatch(
      sharedIngredients,
      userIngredients.length,
      dish,
      mealType,
    );

    matches.push({ dish, sharedIngredients, score });
  }

  return matches
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.sharedIngredients.length - a.sharedIngredients.length;
    })
    .slice(0, limit);
}
