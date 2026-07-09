"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { GeneratedMealPlan, MealType } from "@/lib/types";
import { generateMealPlan, getPlanStats } from "@/lib/generate-meal-plan";
import { swapMealDish } from "@/lib/meal-plan-actions";
import {
  downloadShoppingListPdf,
  downloadShoppingListTxt,
} from "@/lib/export-shopping-list";
import { downloadMealPlanPdf } from "@/lib/pdf/generate-meal-plan-pdf";
import { formatShoppingListForCopy } from "@/lib/shopping-list";
import {
  addToHistory,
  loadCheckedItems,
  saveCheckedItems,
  saveMealPlan,
} from "@/lib/storage";
import { Button } from "./Button";
import { Card } from "./Card";
import { SortableDayList } from "./SortableDayList";
import { ShoppingList } from "./ShoppingList";
import { PrepTips } from "./PrepTips";
import { BudgetTips } from "./BudgetTips";

type ResultTab = "menu" | "shopping" | "tips";

interface MealPlanResultProps {
  plan: GeneratedMealPlan;
}

function getAllMealSelectionKeys(plan: GeneratedMealPlan): Set<string> {
  return new Set(
    plan.days.flatMap((day) =>
      day.meals.map((meal) => `${day.day}-${meal.mealType}`),
    ),
  );
}

export function MealPlanResult({ plan: initialPlan }: MealPlanResultProps) {
  const router = useRouter();
  const [plan, setPlan] = useState(initialPlan);
  const [tab, setTab] = useState<ResultTab>("menu");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(() =>
    loadCheckedItems(plan.generatedAt),
  );
  const [pdfLoading, setPdfLoading] = useState(false);
  const [shoppingExportLoading, setShoppingExportLoading] = useState(false);
  const [selectedMealsForPdf, setSelectedMealsForPdf] = useState<Set<string>>(
    () => getAllMealSelectionKeys(initialPlan),
  );

  const stats = getPlanStats(plan);
  const totalMealsInPlan = plan.days.reduce((acc, day) => acc + day.meals.length, 0);
  const selectedMealsCount = selectedMealsForPdf.size;

  const persistPlan = useCallback((next: GeneratedMealPlan) => {
    setPlan(next);
    saveMealPlan(next);
  }, []);

  const handleRegenerate = () => {
    const regenerated = generateMealPlan(plan.profile);
    persistPlan(regenerated);
    setChecked(new Set());
    setSelectedMealsForPdf(getAllMealSelectionKeys(regenerated));
  };

  const handleSave = () => {
    saveMealPlan(plan);
    addToHistory(plan);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSwapMeal = (day: number, mealType: MealType) => {
    const next = swapMealDish(plan, day, mealType);
    persistPlan(next);
  };

  const handleToggleChecked = (name: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      saveCheckedItems(plan.generatedAt, [...next]);
      return next;
    });
  };

  const handleCopyShoppingList = async () => {
    const text = formatShoppingListForCopy(plan.shoppingList, checked);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handlePrint = () => {
    setTab("menu");
    setTimeout(() => window.print(), 150);
  };

  const handleDownloadPdf = async () => {
    if (selectedMealsForPdf.size === 0) return;
    setPdfLoading(true);
    try {
      await downloadMealPlanPdf(plan, selectedMealsForPdf);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleToggleMealForPdf = (day: number, mealType: MealType) => {
    const key = `${day}-${mealType}`;
    setSelectedMealsForPdf((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isMealSelectedForPdf = (day: number, mealType: MealType) =>
    selectedMealsForPdf.has(`${day}-${mealType}`);

  const handleSelectAllMealsForPdf = () => {
    setSelectedMealsForPdf(getAllMealSelectionKeys(plan));
  };

  const handleDownloadShoppingTxt = () => {
    downloadShoppingListTxt(plan, checked);
  };

  const handleDownloadShoppingPdf = async () => {
    setShoppingExportLoading(true);
    try {
      await downloadShoppingListPdf(plan);
    } finally {
      setShoppingExportLoading(false);
    }
  };

  const handleStartOver = () => router.push("/form");

  const tabs: { id: ResultTab; label: string }[] = [
    { id: "menu", label: "Меню" },
    { id: "shopping", label: "Покупки" },
    { id: "tips", label: "Советы" },
  ];

  return (
    <div className="space-y-6 print:space-y-4">
      <Card padding="sm" className="print:hidden">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-amber-800">
          <span>{stats.totalMeals} приёмов пищи</span>
          <span>{stats.uniqueDishes} разных блюд</span>
          <span>{stats.batchCount} с запасом</span>
          {stats.takeawayCount > 0 && (
            <span>{stats.takeawayCount} в контейнер</span>
          )}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button onClick={handleRegenerate}>Сгенерировать заново</Button>
        <Button variant="secondary" onClick={handleSave}>
          {saved ? "✓ Сохранено" : "Сохранить меню"}
        </Button>
        <Button
          variant="outline"
          onClick={handleDownloadShoppingPdf}
          disabled={shoppingExportLoading}
        >
          {shoppingExportLoading ? "Создаём PDF…" : "Список PDF"}
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          Печать
        </Button>
        <Button
          variant="outline"
          onClick={handleDownloadPdf}
          disabled={pdfLoading || selectedMealsForPdf.size === 0}
        >
          {pdfLoading ? "Создаём PDF…" : "PDF меню"}
        </Button>
        <Button variant="ghost" onClick={handleStartOver}>
          Начать заново
        </Button>
      </div>

      <div
        className="flex gap-1 rounded-xl bg-amber-100/60 p-1 print:hidden"
        role="tablist"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={[
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-white text-amber-900 shadow-sm"
                : "text-amber-700 hover:text-amber-900",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "menu" && (
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-amber-950">Меню по дням</h2>
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <span className="text-xs text-amber-700">
                В PDF: {selectedMealsCount} из {totalMealsInPlan}
              </span>
              <Button
                variant="outline"
                className="px-3 py-2 text-xs"
                onClick={handleSelectAllMealsForPdf}
              >
                Выбрать всё
              </Button>
            </div>
          </div>
          <p className="mb-3 text-sm text-amber-700 print:hidden">
            Перетащите ⠿ чтобы изменить порядок дней · ↻ — заменить блюдо
          </p>
          <SortableDayList
            plan={plan}
            onPlanChange={persistPlan}
            onSwapMeal={handleSwapMeal}
            isMealSelected={isMealSelectedForPdf}
            onToggleMealSelection={handleToggleMealForPdf}
          />

          {plan.workLunchSuggestions.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-semibold text-amber-950">
                🥡 Обеды на работу
              </h3>
              <ul className="space-y-2 rounded-2xl border border-amber-100 bg-white p-4">
                {plan.workLunchSuggestions.map((s, i) => (
                  <li key={i} className="text-sm text-amber-800">
                    <span className="font-medium">День {s.day}:</span> {s.note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {tab === "shopping" && (
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-amber-950">
              Список покупок
            </h2>
            <div className="flex flex-wrap gap-2 print:hidden">
              <Button
                variant="outline"
                className="px-3 py-2"
                onClick={handleCopyShoppingList}
              >
                {copied ? "✓ Скопировано" : "Копировать"}
              </Button>
              <Button
                variant="outline"
                className="px-3 py-2"
                onClick={handleDownloadShoppingTxt}
              >
                Скачать .txt
              </Button>
              <Button
                variant="outline"
                className="px-3 py-2"
                onClick={handleDownloadShoppingPdf}
                disabled={shoppingExportLoading}
              >
                {shoppingExportLoading ? "PDF…" : "Скачать PDF"}
              </Button>
            </div>
          </div>
          <ShoppingList
            categories={plan.shoppingList}
            checked={checked}
            onToggle={handleToggleChecked}
          />
        </section>
      )}

      {tab === "tips" && (
        <section className="grid gap-4 lg:grid-cols-2">
          <PrepTips tips={plan.prepTips} />
          <BudgetTips tips={plan.budgetTips} />
        </section>
      )}

      <p className="text-xs text-amber-700/60 print:hidden">
        Меню носит рекомендательный характер. При аллергиях и медицинских
        ограничениях проконсультируйтесь со специалистом.
      </p>

      <div className="hidden print:block">
        <section className="mt-8 break-before-page">
          <h2 className="mb-4 text-xl font-bold">Список покупок</h2>
          <ShoppingList
            categories={plan.shoppingList}
            checked={checked}
            onToggle={() => {}}
          />
        </section>
      </div>
    </div>
  );
}
