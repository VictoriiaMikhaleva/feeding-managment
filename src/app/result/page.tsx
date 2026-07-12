"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { GeneratedMealPlan } from "@/lib/types";
import {
  loadHistoryEntry,
  loadMealPlan,
  saveMealPlan,
} from "@/lib/storage";
import { Button } from "@/components/Button";

const MealPlanResult = dynamic(
  () =>
    import("@/components/MealPlanResult").then((mod) => mod.MealPlanResult),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[40vh] items-center justify-center text-amber-700">
        Загрузка меню…
      </div>
    ),
  },
);

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const historyId = searchParams.get("id");
  const [plan, setPlan] = useState<GeneratedMealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    try {
      let loaded: GeneratedMealPlan | null = null;

      if (historyId) {
        const entry = loadHistoryEntry(historyId);
        loaded = entry?.plan ?? null;
        if (loaded) saveMealPlan(loaded);
      } else {
        loaded = loadMealPlan();
      }

      setPlan(loaded);
      setLoading(false);

      if (!loaded) {
        router.replace("/form");
      }
    } catch (error) {
      console.error("Failed to load meal plan:", error);
      setLoadError("Не удалось открыть меню. Попробуйте сгенерировать его снова.");
      setLoading(false);
    }
  }, [historyId, router]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-amber-700">
        Загрузка меню…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="mb-4 text-amber-800">{loadError}</p>
        <Link href="/form">
          <Button>Составить меню</Button>
        </Link>
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
        {" · "}
        {new Date(plan.generatedAt).toLocaleString("ru-RU")}
      </p>
      <MealPlanResult plan={plan} />
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-amber-700">
          Загрузка…
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
