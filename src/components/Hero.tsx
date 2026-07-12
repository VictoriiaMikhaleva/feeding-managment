"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SavedMenuEntry } from "@/lib/types";
import { loadHistory, hasStoredMealPlan } from "@/lib/storage";
import { Button } from "./Button";
import { Card } from "./Card";
import {
  BenefitIconBadge,
  type BenefitIconId,
} from "./icons/BenefitIcons";

const benefits: {
  icon: BenefitIconId;
  title: string;
  text: string;
}[] = [
  {
    icon: "time",
    title: "Экономия времени",
    text: "Меню на несколько дней без долгих раздумий каждый вечер",
  },
  {
    icon: "budget",
    title: "Бюджетные блюда",
    text: "Подбор рецептов с учётом вашего уровня бюджета",
  },
  {
    icon: "family",
    title: "Дети и взрослые",
    text: "Учитываем вкусы всех членов семьи",
  },
  {
    icon: "cart",
    title: "Список покупок",
    text: "Готовый перечень продуктов по категориям",
  },
  {
    icon: "prep",
    title: "Заготовки",
    text: "Подсказки, что приготовить с запасом на несколько дней",
  },
];

export function Hero() {
  const [hasCurrentPlan, setHasCurrentPlan] = useState(false);
  const [history, setHistory] = useState<SavedMenuEntry[]>([]);

  useEffect(() => {
    try {
      setHasCurrentPlan(hasStoredMealPlan());
      setHistory(loadHistory().slice(0, 3));
    } catch (error) {
      console.warn("Failed to load saved menus:", error);
      setHasCurrentPlan(false);
      setHistory([]);
    }
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:py-14">
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-orange-100 via-amber-50 to-sky-100 p-6 shadow-xl shadow-orange-100/70 sm:p-10">
        <div className="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-pink-300/40 blur-xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-sky-300/35 blur-2xl" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_0.9fr]">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-amber-300/60 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Планировщик питания для семьи
            </p>
            <h1 className="mb-4 text-3xl font-extrabold leading-tight text-amber-950 sm:text-5xl">
              Семейное меню с учетом бюджета и предпочтений
            </h1>
            <p className="mb-7 max-w-2xl text-base text-amber-900/80 sm:text-lg">
              Меню для взрослых и детей, список покупок, выгрузка в PDF без
              ежедневной рутины.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/form">
                <Button className="px-8 py-3 text-base">Составить меню</Button>
              </Link>
              {hasCurrentPlan && (
                <Link href="/result">
                  <Button variant="outline" className="px-6 py-3 text-base">
                    Продолжить последнее меню
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                Экономия времени
              </p>
              <p className="mt-1 text-2xl font-bold text-amber-950">до 5 ч/нед.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                Форматы
              </p>
              <p className="mt-1 text-sm font-semibold text-amber-950">
                Меню + список продуктов + PDF
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                Гибкость
              </p>
              <p className="mt-1 text-sm font-semibold text-amber-950">
                С учетом вкусов каждого члена семьи и способа приготовления
              </p>
            </div>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <Card className="mt-7 border-amber-200/70" padding="sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-amber-950">
              Недавние меню
            </h2>
            <Link
              href="/history"
              className="text-sm font-medium text-amber-700 hover:text-amber-900"
            >
              Вся история →
            </Link>
          </div>
          <ul className="space-y-2">
            {history.map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/result?id=${encodeURIComponent(entry.id)}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-amber-800 hover:bg-amber-50"
                >
                  <span>{entry.title}</span>
                  <span className="text-amber-500">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b) => (
          <Card
            key={b.title}
            padding="sm"
            className="border-amber-200/70 bg-white/85 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <BenefitIconBadge id={b.icon} className="mb-3" />
            <h3 className="mb-1 font-semibold text-amber-950">{b.title}</h3>
            <p className="text-sm text-amber-800/70">{b.text}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-10 border-amber-200/80 bg-white/80" padding="sm">
        <h2 className="mb-3 text-lg font-semibold text-amber-950">Как это работает</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Шаг 1
            </p>
            <p className="mt-1 text-sm text-amber-900">Заполните форму по семье и бюджету</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Шаг 2
            </p>
            <p className="mt-1 text-sm text-amber-900">
              Получите готовое меню, замените блюда и отметьте приёмы для PDF
            </p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Шаг 3
            </p>
            <p className="mt-1 text-sm text-amber-900">Скачайте PDF и идите за покупками с готовым списком</p>
          </div>
        </div>
      </Card>

      <p className="mt-10 text-center text-xs text-amber-700/60">
        Меню носит рекомендательный характер. При аллергиях и медицинских
        ограничениях проконсультируйтесь со специалистом.
      </p>
    </section>
  );
}
