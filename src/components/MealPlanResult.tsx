"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GeneratedMealPlan } from "@/lib/types";
import { generateMealPlan } from "@/lib/generate-meal-plan";
import { formatShoppingListForCopy } from "@/lib/shopping-list";
import { saveMealPlan } from "@/lib/storage";
import { Button } from "./Button";
import { DayCard } from "./DayCard";
import { ShoppingList } from "./ShoppingList";
import { PrepTips } from "./PrepTips";
import { BudgetTips } from "./BudgetTips";

interface MealPlanResultProps {
  plan: GeneratedMealPlan;
}

export function MealPlanResult({ plan: initialPlan }: MealPlanResultProps) {
  const router = useRouter();
  const [plan, setPlan] = useState(initialPlan);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleRegenerate = () => {
    const newPlan = generateMealPlan(plan.profile);
    setPlan(newPlan);
    saveMealPlan(newPlan);
  };

  const handleSave = () => {
    saveMealPlan(plan);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopyShoppingList = async () => {
    const text = formatShoppingListForCopy(plan.shoppingList);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleStartOver = () => {
    router.push("/form");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleRegenerate}>Сгенерировать заново</Button>
        <Button variant="secondary" onClick={handleSave}>
          {saved ? "✓ Сохранено" : "Сохранить меню"}
        </Button>
        <Button variant="outline" onClick={handleCopyShoppingList}>
          {copied ? "✓ Скопировано" : "Скопировать список покупок"}
        </Button>
        <Button variant="ghost" onClick={handleStartOver}>
          Начать заново
        </Button>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-amber-950">
          Меню по дням
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {plan.days.map((day) => (
            <DayCard key={day.day} day={day} />
          ))}
        </div>
      </section>

      {plan.workLunchSuggestions.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold text-amber-950">
            🥡 Обеды на работу
          </h2>
          <ul className="space-y-2 rounded-2xl border border-amber-100 bg-white p-4">
            {plan.workLunchSuggestions.map((s, i) => (
              <li key={i} className="text-sm text-amber-800">
                <span className="font-medium">День {s.day}:</span> {s.note}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-semibold text-amber-950">
          Список покупок
        </h2>
        <ShoppingList categories={plan.shoppingList} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <PrepTips tips={plan.prepTips} />
        <BudgetTips tips={plan.budgetTips} />
      </div>

      <p className="text-xs text-amber-700/60">
        Меню носит рекомендательный характер. При аллергиях и медицинских
        ограничениях проконсультируйтесь со специалистом.
      </p>
    </div>
  );
}
