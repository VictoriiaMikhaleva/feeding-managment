import type { MealPlanDay } from "@/lib/types";
import { MEAL_TYPE_LABELS } from "@/lib/types";
import { Card } from "./Card";

interface DayCardProps {
  day: MealPlanDay;
}

export function DayCard({ day }: DayCardProps) {
  return (
    <Card>
      <h3 className="mb-3 text-lg font-semibold text-amber-950">
        День {day.day}
      </h3>
      <ul className="space-y-3">
        {day.meals.map((meal) => (
          <li key={`${day.day}-${meal.mealType}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
              {MEAL_TYPE_LABELS[meal.mealType]}
            </p>
            <p className="font-medium text-amber-950">{meal.dish.name}</p>
            {meal.note && (
              <p className="mt-0.5 text-sm text-amber-700/80">💡 {meal.note}</p>
            )}
            <div className="mt-1 flex flex-wrap gap-1">
              {meal.dish.tags.slice(0, 4).map((tag) => (
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
