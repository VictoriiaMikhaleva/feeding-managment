"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dish, MealType } from "@/lib/types";
import {
  COOKING_METHOD_LABELS,
  COOKING_METHOD_ORDER,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_ORDER,
} from "@/lib/types";
import {
  addCustomDish,
  defaultCustomDish,
  loadCustomDishes,
  parseIngredientsText,
  removeCustomDish,
} from "@/lib/custom-dishes";
import { getDishCookingMethods } from "@/lib/cooking-methods";
import { formatDishNutrition, getDishNutrition } from "@/lib/dish-calories";
import { findSimilarDishes } from "@/lib/similar-dishes";
import { Button } from "./Button";
import { Card } from "./Card";

interface CustomDishesSectionProps {
  catalogMode: "all" | "custom_only";
  onCatalogModeChange: (mode: "all" | "custom_only") => void;
}

export function CustomDishesSection({
  catalogMode,
  onCatalogModeChange,
}: CustomDishesSectionProps) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<MealType>("dinner");
  const [ingredientsText, setIngredientsText] = useState("");
  const [calories, setCalories] = useState("400");
  const [protein, setProtein] = useState("20");
  const [fat, setFat] = useState("15");
  const [carbs, setCarbs] = useState("40");
  const [cookingMethods, setCookingMethods] = useState<string[]>(["stove"]);
  const [formError, setFormError] = useState<string | null>(null);

  const refresh = () => setDishes(loadCustomDishes());

  useEffect(() => {
    refresh();
  }, []);

  const parsedIngredients = useMemo(
    () => parseIngredientsText(ingredientsText),
    [ingredientsText],
  );

  const similarDishes = useMemo(
    () =>
      findSimilarDishes({
        ingredients: parsedIngredients,
        mealType,
        limit: 5,
        excludeIds: dishes.map((d) => d.id),
      }),
    [parsedIngredients, mealType, dishes],
  );

  const applySuggestion = (dish: Dish) => {
    const nutrition = getDishNutrition(dish);
    setName(dish.name);
    setMealType(dish.mealType);
    setIngredientsText(dish.ingredients.map((ing) => ing.name).join(", "));
    setCalories(String(nutrition.calories));
    setProtein(String(nutrition.protein));
    setFat(String(nutrition.fat));
    setCarbs(String(nutrition.carbs));
    setCookingMethods(getDishCookingMethods(dish));
    setFormError(null);
  };

  const toggleMethod = (method: (typeof COOKING_METHOD_ORDER)[number]) => {
    setCookingMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method],
    );
  };

  const handleAdd = () => {
    setFormError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("Укажите название блюда");
      return;
    }
    if (cookingMethods.length === 0) {
      setFormError("Выберите хотя бы один способ приготовления");
      return;
    }

    const base = defaultCustomDish(mealType);
    addCustomDish({
      ...base,
      name: trimmed,
      mealType,
      ingredients: parseIngredientsText(ingredientsText),
      cookingMethods: cookingMethods as Dish["cookingMethods"],
      caloriesPerServing: Number(calories) || 400,
      proteinPerServing: Number(protein) || 20,
      fatPerServing: Number(fat) || 15,
      carbsPerServing: Number(carbs) || 40,
    });

    setName("");
    setIngredientsText("");
    refresh();
  };

  return (
    <Card>
      <h2 className="mb-2 text-lg font-semibold text-amber-950">Мои блюда</h2>
      <p className="mb-4 text-sm text-amber-800/70">
        Добавьте свои рецепты — при вводе ингредиентов подскажем похожие блюда
        из каталога. Их можно взять за основу и отредактировать.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCatalogModeChange("all")}
          className={[
            "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
            catalogMode === "all"
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-800 hover:bg-amber-100",
          ].join(" ")}
        >
          Встроенные + мои
        </button>
        <button
          type="button"
          onClick={() => onCatalogModeChange("custom_only")}
          className={[
            "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
            catalogMode === "custom_only"
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-800 hover:bg-amber-100",
          ].join(" ")}
        >
          Только мои блюда
        </button>
      </div>

      {dishes.length > 0 && (
        <ul className="mb-4 space-y-2 rounded-xl border border-amber-100 bg-amber-50/40 p-3">
          {dishes.map((dish) => (
            <li
              key={dish.id}
              className="flex items-start justify-between gap-2 text-sm text-amber-900"
            >
              <span>
                <span className="font-medium">{dish.name}</span>
                <span className="text-amber-600">
                  {" "}
                  · {MEAL_TYPE_LABELS[dish.mealType]} · ~{dish.caloriesPerServing} ккал
                </span>
              </span>
              <button
                type="button"
                className="shrink-0 text-xs text-red-600 hover:text-red-800"
                onClick={() => {
                  removeCustomDish(dish.id);
                  refresh();
                }}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-3 rounded-xl border border-amber-200 bg-white/70 p-3">
        <p className="text-sm font-medium text-amber-900">Добавить блюдо</p>
        {formError && (
          <p className="text-sm text-red-700" role="alert">
            {formError}
          </p>
        )}
        <label className="block">
          <span className="mb-1 block text-xs text-amber-700">Название</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Курица с овощами"
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-amber-700">Приём пищи</span>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm"
          >
            {MEAL_TYPE_ORDER.map((type) => (
              <option key={type} value={type}>
                {MEAL_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-amber-700">
            Ингредиенты (через запятую или с новой строки)
          </span>
          <textarea
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm"
            placeholder="курица, рис, морковь"
          />
        </label>

        {similarDishes.length > 0 && (
          <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3">
            <p className="mb-2 text-sm font-medium text-sky-950">
              Похожие блюда по ингредиентам
            </p>
            <ul className="space-y-2">
              {similarDishes.map(({ dish, sharedIngredients }) => (
                <li
                  key={dish.id}
                  className="flex flex-col gap-2 rounded-lg border border-sky-100 bg-white/80 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 text-sm text-sky-950">
                    <p className="font-medium">{dish.name}</p>
                    <p className="text-sky-700/80">
                      {MEAL_TYPE_LABELS[dish.mealType]} ·{" "}
                      {formatDishNutrition(dish)}
                      {dish.isCustom ? " · ваше" : " · каталог"}
                    </p>
                    <p className="mt-1 text-xs text-sky-600">
                      Совпадают: {sharedIngredients.join(", ")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0 self-start sm:self-center"
                    onClick={() => applySuggestion(dish)}
                  >
                    Взять за основу
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-xs text-amber-700">Ккал</span>
            <input
              type="number"
              min={50}
              max={2000}
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full rounded-lg border border-amber-200 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-amber-700">Белки, г</span>
            <input
              type="number"
              min={0}
              max={200}
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="w-full rounded-lg border border-amber-200 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-amber-700">Жиры, г</span>
            <input
              type="number"
              min={0}
              max={200}
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              className="w-full rounded-lg border border-amber-200 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-amber-700">Углев., г</span>
            <input
              type="number"
              min={0}
              max={300}
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              className="w-full rounded-lg border border-amber-200 px-2 py-1.5 text-sm"
            />
          </label>
        </div>
        <div>
          <span className="mb-1 block text-xs text-amber-700">Способ приготовления</span>
          <div className="flex flex-wrap gap-2">
            {COOKING_METHOD_ORDER.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => toggleMethod(method)}
                className={[
                  "rounded-lg px-3 py-1.5 text-xs font-medium",
                  cookingMethods.includes(method)
                    ? "bg-sky-600 text-white"
                    : "bg-sky-50 text-sky-800",
                ].join(" ")}
              >
                {COOKING_METHOD_LABELS[method]}
              </button>
            ))}
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={handleAdd}>
          Добавить в мои блюда
        </Button>
      </div>
    </Card>
  );
}
