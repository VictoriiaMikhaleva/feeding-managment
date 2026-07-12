"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FamilyProfile } from "@/lib/types";
import { generateMealPlan } from "@/lib/generate-meal-plan";
import { stashPlanForNavigation } from "@/lib/plan-handoff";
import {
  addToHistory,
  saveMealPlan,
  savePlanHandoff,
  saveProfile,
} from "@/lib/storage";
import { MenuForm } from "@/components/MenuForm";

function countMealsInPlan(plan: ReturnType<typeof generateMealPlan>): number {
  return plan.days.reduce((sum, day) => sum + day.meals.length, 0);
}

export default function FormPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (profile: FamilyProfile) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const plan = generateMealPlan(profile);

      if (countMealsInPlan(plan) === 0) {
        setSubmitError(
          "Не удалось подобрать блюда под ваши настройки. Ослабьте фильтры: добавьте способ приготовления или измените бюджет.",
        );
        setIsSubmitting(false);
        return;
      }

      stashPlanForNavigation(plan);
      savePlanHandoff(plan);
      saveMealPlan(plan);
      saveProfile(profile);

      try {
        addToHistory(plan);
      } catch {
        /* история необязательна для перехода на result */
      }

      router.push("/result/");

      window.setTimeout(() => {
        if (window.location.pathname.includes("/form")) {
          window.location.assign(
            window.location.pathname.replace(/\/form\/?$/, "/result/"),
          );
        }
      }, 1500);
    } catch (error) {
      console.error("Meal plan generation failed:", error);
      setSubmitError(
        "Не удалось сгенерировать меню. Попробуйте ещё раз или упростите параметры формы.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-amber-950">
        Составление меню
      </h1>
      <p className="mb-6 text-amber-800/70">
        Заполните параметры семьи — мы подберём блюда на выбранный период
      </p>
      {submitError && (
        <div
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {submitError}
        </div>
      )}
      <MenuForm onSubmit={handleSubmit} submitDisabled={isSubmitting} />
    </div>
  );
}
