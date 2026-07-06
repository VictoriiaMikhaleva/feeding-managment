"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { SavedMenuEntry } from "@/lib/types";
import { BUDGET_LABELS } from "@/lib/types";
import { downloadMealPlanPdf } from "@/lib/pdf/generate-meal-plan-pdf";
import {
  deleteHistoryEntry,
  loadHistory,
  saveMealPlan,
} from "@/lib/storage";
import { Button } from "./Button";
import { Card } from "./Card";

export function HistoryList() {
  const [entries, setEntries] = useState<SavedMenuEntry[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setEntries(loadHistory());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = (id: string) => {
    if (deletingId !== id) {
      setDeletingId(id);
      return;
    }
    deleteHistoryEntry(id);
    setDeletingId(null);
    refresh();
  };

  const handleOpen = (entry: SavedMenuEntry) => {
    saveMealPlan(entry.plan);
  };

  const handlePdf = async (entry: SavedMenuEntry) => {
    setPdfLoadingId(entry.id);
    try {
      await downloadMealPlanPdf(entry.plan);
    } finally {
      setPdfLoadingId(null);
    }
  };

  if (entries.length === 0) {
    return (
      <Card className="text-center">
        <p className="mb-4 text-amber-800">Сохранённых меню пока нет</p>
        <Link href="/form">
          <Button>Составить первое меню</Button>
        </Link>
      </Card>
    );
  }

  return (
    <ul className="space-y-4">
      {entries.map((entry) => {
        const p = entry.plan.profile;
        const savedDate = new Date(entry.savedAt).toLocaleString("ru-RU", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <li key={entry.id}>
            <Card>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-amber-950">
                    Меню на {p.days}{" "}
                    {p.days === 1 ? "день" : p.days < 5 ? "дня" : "дней"}
                  </h2>
                  <p className="mt-1 text-sm text-amber-700">
                    {p.adultsCount} взр.
                    {p.childrenCount > 0 && ` · ${p.childrenCount} дет.`}
                    {" · "}
                    {BUDGET_LABELS[p.budget]}
                  </p>
                  <p className="mt-1 text-xs text-amber-600/70">
                    Сохранено: {savedDate}
                  </p>
                  <p className="mt-2 text-xs text-amber-600">
                    {entry.plan.days.length} дней ·{" "}
                    {entry.plan.days.reduce((s, d) => s + d.meals.length, 0)}{" "}
                    приёмов пищи
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/result?id=${encodeURIComponent(entry.id)}`}
                    onClick={() => handleOpen(entry)}
                  >
                    <Button variant="primary">Открыть</Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => handlePdf(entry)}
                    disabled={pdfLoadingId === entry.id}
                  >
                    {pdfLoadingId === entry.id ? "PDF…" : "Скачать PDF"}
                  </Button>
                  <Button
                    variant={deletingId === entry.id ? "primary" : "ghost"}
                    onClick={() => handleDelete(entry.id)}
                    className={
                      deletingId === entry.id
                        ? "bg-red-600 hover:bg-red-700"
                        : "text-red-700 hover:bg-red-50"
                    }
                  >
                    {deletingId === entry.id ? "Подтвердить" : "Удалить"}
                  </Button>
                  {deletingId === entry.id && (
                    <Button
                      variant="ghost"
                      onClick={() => setDeletingId(null)}
                    >
                      Отмена
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
