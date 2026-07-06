"use client";

import type { MealPlanDay, MealType } from "@/lib/types";
import { DIFFICULTY_LABELS, MEAL_TYPE_LABELS } from "@/lib/types";
import { Card } from "./Card";
import { Button } from "./Button";

interface DayCardProps {
  day: MealPlanDay;
  onSwapMeal?: (day: number, mealType: MealType) => void;
}

export function DayCard({ day, onSwapMeal }: DayCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <h3 className="mb-3 flex items-center justify-between text-lg font-semibold text-amber-950">
        <span>День {day.day}</span>
        <span className="text-xs font-normal text-amber-600">
          {day.meals.length} приёма
        </span>
      </h3>
      <ul className="space-y-4">
        {day.meals.map((meal) => (
          <li
            key={`${day.day}-${meal.mealType}`}
            className="border-b border-amber-50 pb-3 last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
                  {MEAL_TYPE_LABELS[meal.mealType]}
                </p>
                <p className="font-medium text-amber-950">{meal.dish.name}</p>
                <p className="mt-0.5 text-xs text-amber-600/70">
                  {DIFFICULTY_LABELS[meal.dish.difficulty]}
                  {meal.dish.batchCooking && " · с запасом"}
                  {meal.dish.takeawayFriendly && " · в контейнер"}
                </p>
              </div>
              {onSwapMeal && (
                <Button
                  type="button"
                  variant="ghost"
                  className="shrink-0 px-2 py-1 text-xs"
                  onClick={() => onSwapMeal(day.day, meal.mealType)}
                  title="Заменить блюдо"
                >
                  ↻
                </Button>
              )}
            </div>

            {meal.note && (
              <p className="mt-1 text-sm text-amber-700/80">💡 {meal.note}</p>
            )}

            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-amber-600 hover:text-amber-800">
                Ингредиенты
              </summary>
              <ul className="mt-1 space-y-0.5 pl-2 text-xs text-amber-700">
                {meal.dish.ingredients.map((ing) => (
                  <li key={ing.name}>
                    {ing.name}
                    {ing.amount ? ` — ${ing.amount}` : ""}
                  </li>
                ))}
              </ul>
            </details>

            <div className="mt-2 flex flex-wrap gap-1">
              {meal.dish.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {day.comment && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          💬 {day.comment}
        </p>
      )}
    </Card>
  );
}
