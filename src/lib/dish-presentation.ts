import type { Dish, MealType } from "./types";

export interface DishPresentation {
  description: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  cookTimeMin: number;
  benefit: string;
  imageGradient: [string, string];
  imageAccent: string;
}

const MEAL_BASE: Record<
  MealType,
  { cal: number; protein: number; fat: number; carbs: number; time: number }
> = {
  breakfast: { cal: 380, protein: 14, fat: 12, carbs: 48, time: 20 },
  lunch: { cal: 520, protein: 28, fat: 18, carbs: 55, time: 40 },
  dinner: { cal: 480, protein: 26, fat: 16, carbs: 42, time: 45 },
};

const BENEFIT_BY_TAG: Record<string, string> = {
  мясо: "Богато белком",
  рыба: "Лёгкий белок и Омега-3",
  творог: "Источник кальция",
  яйца: "Энергия на утро",
  овощи: "Много клетчатки",
  крупы: "Долгая сытость",
  быстро: "Быстро готовится",
  запеканка: "Сытно и уютно",
};

const GRADIENT_BY_TAG: Record<string, [string, string]> = {
  мясо: ["#E8D5C4", "#C4A882"],
  рыба: ["#D4E4E8", "#8BB8C4"],
  творог: ["#F5F0E8", "#E8DCC8"],
  яйца: ["#FFF4D6", "#F0D78C"],
  овощи: ["#E2EDD8", "#9BB87A"],
  крупы: ["#F3E6D0", "#D4B896"],
  default: ["#F5EDE4", "#D9C4B0"],
};

const ACCENT_BY_MEAL: Record<MealType, string> = {
  breakfast: "#C4783B",
  lunch: "#6B8E4E",
  dinner: "#8B5A3C",
};

function buildDescription(dish: Dish): string {
  const ing = dish.ingredients
    .slice(0, 4)
    .map((i) => i.name)
    .join(", ");
  const base =
    dish.mealType === "breakfast"
      ? "Сбалансированный завтрак для бодрого начала дня."
      : dish.mealType === "lunch"
        ? "Питательный обед, который надолго дарит сытость."
        : "Домашний ужин — сытный, но не тяжёлый.";

  if (dish.forChildren && dish.forAdults) {
    return `${base} Подходит всей семье. Основа: ${ing}.`;
  }
  if (dish.forChildren) {
    return `Детское любимое блюдо с привычными вкусами. Состав: ${ing}.`;
  }
  return `${base} Основные ингредиенты: ${ing}.`;
}

function pickBenefit(dish: Dish, mealType: MealType): string {
  for (const tag of dish.tags) {
    if (BENEFIT_BY_TAG[tag]) return BENEFIT_BY_TAG[tag];
  }
  if (mealType === "breakfast") return "Энергия на утро";
  if (mealType === "dinner") return "Лёгкий вечерний приём пищи";
  return "Сбалансированный обед";
}

function pickGradient(dish: Dish): [string, string] {
  for (const tag of dish.tags) {
    if (GRADIENT_BY_TAG[tag]) return GRADIENT_BY_TAG[tag];
  }
  return GRADIENT_BY_TAG.default;
}

function adjustNutrition(dish: Dish, mealType: MealType) {
  const base = { ...MEAL_BASE[mealType] };
  if (dish.tags.includes("мясо")) {
    base.protein += 8;
    base.cal += 60;
  }
  if (dish.tags.includes("рыба")) {
    base.protein += 6;
    base.fat += 4;
  }
  if (dish.tags.includes("овощи")) {
    base.carbs -= 5;
    base.fat -= 3;
  }
  if (dish.tags.includes("быстро")) {
    base.time = Math.max(10, base.time - 15);
  }
  if (dish.difficulty === "hard") base.time += 25;
  if (dish.difficulty === "easy") base.time -= 10;
  if (dish.batchCooking) base.time += 10;
  return base;
}

export function getDishPresentation(
  dish: Dish,
  mealType: MealType,
): DishPresentation {
  const nutrition = adjustNutrition(dish, mealType);
  return {
    description: buildDescription(dish),
    calories: nutrition.cal,
    protein: nutrition.protein,
    fat: nutrition.fat,
    carbs: nutrition.carbs,
    cookTimeMin: nutrition.time,
    benefit: pickBenefit(dish, mealType),
    imageGradient: pickGradient(dish),
    imageAccent: ACCENT_BY_MEAL[mealType],
  };
}

export function formatIngredientsShort(dish: Dish): string {
  return dish.ingredients
    .map((i) => (i.amount ? `${i.name} (${i.amount})` : i.name))
    .slice(0, 5)
    .join(" · ");
}
