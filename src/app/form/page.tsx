"use client";

import { useRouter } from "next/navigation";
import type { FamilyProfile } from "@/lib/types";
import { generateMealPlan } from "@/lib/generate-meal-plan";
import { saveMealPlan, saveProfile } from "@/lib/storage";
import { MenuForm } from "@/components/MenuForm";

export default function FormPage() {
  const router = useRouter();

  const handleSubmit = (profile: FamilyProfile) => {
    saveProfile(profile);
    const plan = generateMealPlan(profile);
    saveMealPlan(plan);
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
      <MenuForm onSubmit={handleSubmit} />
    </div>
  );
}
