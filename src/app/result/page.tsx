"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { GeneratedMealPlan } from "@/lib/types";
import { loadMealPlan } from "@/lib/storage";
import { MealPlanResult } from "@/components/MealPlanResult";
import { Button } from "@/components/Button";
import Link from "next/link";

export default function ResultPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<GeneratedMealPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = loadMealPlan();
    setPlan(saved);
    setLoading(false);
    if (!saved) {
      router.replace("/form");
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-amber-700">
        Загрузка меню…
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="mb-4 text-amber-800">Меню не найдено</p>
        <Link href="/form">
          <Button>Составить меню</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-amber-950">Ваше меню</h1>
      <p className="mb-6 text-sm text-amber-700/70">
        {plan.profile.days} дней · {plan.profile.adultsCount} взрослых
        {plan.profile.childrenCount > 0 &&
          ` · ${plan.profile.childrenCount} детей`}
      </p>
      <MealPlanResult plan={plan} />
    </div>
  );
}
