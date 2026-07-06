"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SavedMenuEntry } from "@/lib/types";
import { loadHistory, loadMealPlan } from "@/lib/storage";
import { Button } from "./Button";
import { Card } from "./Card";

const benefits = [
  {
    icon: "⏱️",
    title: "Экономия времени",
    text: "Меню на несколько дней без долгих раздумий каждый вечер",
  },
  {
    icon: "💰",
    title: "Бюджетные блюда",
    text: "Подбор рецептов с учётом вашего уровня бюджета",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Дети и взрослые",
    text: "Учитываем вкусы всех членов семьи",
  },
  {
    icon: "🛒",
    title: "Список покупок",
    text: "Готовый перечень продуктов по категориям",
  },
  {
    icon: "📦",
    title: "Заготовки",
    text: "Подсказки, что приготовить с запасом на несколько дней",
  },
  {
    icon: "🎙️",
    title: "Голосовой ввод",
    text: "Расскажите о семье вслух — форма заполнится автоматически",
  },
];

export function Hero() {
  const [hasCurrentPlan, setHasCurrentPlan] = useState(false);
  const [history, setHistory] = useState<SavedMenuEntry[]>([]);

  useEffect(() => {
    setHasCurrentPlan(!!loadMealPlan());
    setHistory(loadHistory().slice(0, 3));
  }, []);

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
      <div className="text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-amber-600">
          Планировщик питания для семьи
        </p>
        <h1 className="mb-4 text-3xl font-bold leading-tight text-amber-950 sm:text-4xl">
          Семейное меню на неделю
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-amber-800/80">
          Составьте бюджетное меню с учётом вкусов взрослых и детей
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
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

      {history.length > 0 && (
        <Card className="mt-8" padding="sm">
          <h2 className="mb-3 text-sm font-semibold text-amber-950">
            Недавние меню
          </h2>
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
          <Card key={b.title} padding="sm">
            <div className="mb-2 text-2xl" aria-hidden>
              {b.icon}
            </div>
            <h3 className="mb-1 font-semibold text-amber-950">{b.title}</h3>
            <p className="text-sm text-amber-800/70">{b.text}</p>
          </Card>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-amber-700/60">
        Меню носит рекомендательный характер. При аллергиях и медицинских
        ограничениях проконсультируйтесь со специалистом.
      </p>
    </section>
  );
}
