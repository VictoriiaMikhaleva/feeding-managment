"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FamilyProfile } from "@/lib/types";
import { generateMealPlan } from "@/lib/generate-meal-plan";
import { addToHistory, saveMealPlan, saveProfile, StorageQuotaError } from "@/lib/storage";
import { MenuForm } from "@/components/MenuForm";

export default function FormPage() {
  const router = useRouter();
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = (profile: FamilyProfile) => {
    setSaveError(null);
    const plan = generateMealPlan(profile);

    try {
      saveProfile(profile);
      saveMealPlan(plan);
      try {
        addToHistory(plan);
      } catch (error) {
        if (!(error instanceof StorageQuotaError)) throw error;
      }
    } catch (error) {
      if (error instanceof StorageQuotaError) {
        setSaveError(
          "Меню сгенерировано, но браузеру не хватило памяти для полного сохранения. История может не сохраниться.",
        );
      } else {
        throw error;
      }
    }

    router.push("/result");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-amber-950">
        Составление меню
      </h1>
      <p className="mb-6 text-amber-800/70">
        Заполните параметры семьи — мы подберём блюда на выбранный период
      </p>
      {saveError && (
        <div
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {saveError}
        </div>
      )}
      <MenuForm onSubmit={handleSubmit} />
    </div>
  );
}
