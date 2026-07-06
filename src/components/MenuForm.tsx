"use client";

import { useState } from "react";
import type { FamilyProfile, MealType } from "@/lib/types";
import {
  BUDGET_LABELS,
  CUISINE_LABELS,
  DEFAULT_FAMILY_PROFILE,
  MEAL_TYPE_LABELS,
} from "@/lib/types";
import {
  mergeParsedIntoProfile,
  parseVoiceTextToFamilyProfile,
} from "@/lib/parse-voice";
import { Button } from "./Button";
import { Card } from "./Card";
import { VoiceInput } from "./VoiceInput";

interface MenuFormProps {
  initialProfile?: FamilyProfile;
  onSubmit: (profile: FamilyProfile) => void;
}

type FillMode = "manual" | "voice";

export function MenuForm({ initialProfile, onSubmit }: MenuFormProps) {
  const [fillMode, setFillMode] = useState<FillMode>("manual");
  const [profile, setProfile] = useState<FamilyProfile>(
    initialProfile ?? DEFAULT_FAMILY_PROFILE,
  );
  const [voiceHints, setVoiceHints] = useState<string[]>([]);
  const [voiceApplied, setVoiceApplied] = useState(false);

  const update = <K extends keyof FamilyProfile>(
    key: K,
    value: FamilyProfile[K],
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMealType = (type: MealType) => {
    setProfile((prev) => {
      const has = prev.mealTypes.includes(type);
      const mealTypes = has
        ? prev.mealTypes.filter((t) => t !== type)
        : [...prev.mealTypes, type];
      return { ...prev, mealTypes: mealTypes.length ? mealTypes : [type] };
    });
  };

  const handleVoiceApply = (text: string) => {
    const parsed = parseVoiceTextToFamilyProfile(text);
    setProfile((prev) => mergeParsedIntoProfile(parsed, prev));
    setVoiceHints(parsed.unparsedHints);
    setVoiceApplied(true);
    setFillMode("manual");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-amber-950">
          Как заполнить форму?
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={fillMode === "manual" ? "primary" : "outline"}
            onClick={() => setFillMode("manual")}
          >
            Заполнить вручную
          </Button>
          <Button
            type="button"
            variant={fillMode === "voice" ? "primary" : "outline"}
            onClick={() => setFillMode("voice")}
          >
            🎙️ Заполнить голосом
          </Button>
        </div>
      </Card>

      {fillMode === "voice" && <VoiceInput onApply={handleVoiceApply} />}

      {voiceApplied && (
        <div
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          <p className="font-medium">
            ⚠️ Проверьте данные перед генерацией меню
          </p>
          {voiceHints.map((hint) => (
            <p key={hint} className="mt-1 text-amber-800/80">
              {hint}
            </p>
          ))}
        </div>
      )}

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-amber-950">
          Состав семьи
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-amber-800">
              Количество взрослых
            </span>
            <input
              type="number"
              min={0}
              max={10}
              value={profile.adultsCount}
              onChange={(e) =>
                update("adultsCount", parseInt(e.target.value, 10) || 0)
              }
              className="w-full rounded-xl border border-amber-200 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-amber-800">
              Количество детей
            </span>
            <input
              type="number"
              min={0}
              max={10}
              value={profile.childrenCount}
              onChange={(e) =>
                update("childrenCount", parseInt(e.target.value, 10) || 0)
              }
              className="w-full rounded-xl border border-amber-200 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-amber-950">
          Параметры меню
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-amber-800">
              На сколько дней
            </span>
            <input
              type="number"
              min={1}
              max={14}
              value={profile.days}
              onChange={(e) =>
                update("days", parseInt(e.target.value, 10) || 1)
              }
              className="w-full rounded-xl border border-amber-200 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-amber-800">Бюджет</span>
            <select
              value={profile.budget}
              onChange={(e) =>
                update("budget", e.target.value as FamilyProfile["budget"])
              }
              className="w-full rounded-xl border border-amber-200 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              {Object.entries(BUDGET_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4">
          <span className="mb-2 block text-sm text-amber-800">
            Приёмы пищи в день
          </span>
          <div className="flex flex-wrap gap-2">
            {(["breakfast", "lunch", "dinner"] as MealType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleMealType(type)}
                className={[
                  "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  profile.mealTypes.includes(type)
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100",
                ].join(" ")}
              >
                {MEAL_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-sm text-amber-800">
            Предпочтения по кухне
          </span>
          <select
            value={profile.cuisinePreference}
            onChange={(e) =>
              update(
                "cuisinePreference",
                e.target.value as FamilyProfile["cuisinePreference"],
              )
            }
            className="w-full rounded-xl border border-amber-200 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            {Object.entries(CUISINE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={profile.cookWithLeftovers}
            onChange={(e) => update("cookWithLeftovers", e.target.checked)}
            className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-400"
          />
          <span className="text-sm text-amber-800">
            Хочу готовить с запасом на несколько дней
          </span>
        </label>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-amber-950">
          Вкусы и ограничения
        </h2>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-amber-800">
              Любимые продукты взрослых
            </span>
            <textarea
              value={profile.adultFavorites}
              onChange={(e) => update("adultFavorites", e.target.value)}
              placeholder="овощи, мясо, творог, блины…"
              rows={2}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-amber-800">
              Любимые продукты детей
            </span>
            <textarea
              value={profile.childrenFavorites}
              onChange={(e) => update("childrenFavorites", e.target.value)}
              placeholder="пельмени, наггетсы, ягоды…"
              rows={2}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-amber-800">
              Нелюбимые продукты
            </span>
            <textarea
              value={profile.dislikedProducts}
              onChange={(e) => update("dislikedProducts", e.target.value)}
              placeholder="печень, капуста…"
              rows={2}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-amber-800">
              Аллергии или ограничения
            </span>
            <textarea
              value={profile.allergies}
              onChange={(e) => update("allergies", e.target.value)}
              placeholder="лактоза, глютен, орехи…"
              rows={2}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-amber-800">
              Особенности расписания
            </span>
            <textarea
              value={profile.scheduleNotes}
              onChange={(e) => update("scheduleNotes", e.target.value)}
              placeholder="муж 4 дня в неделю обедает на работе…"
              rows={2}
              className="w-full rounded-xl border border-amber-200 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" className="px-8 py-3 text-base">
          Сгенерировать меню
        </Button>
      </div>

      <p className="text-xs text-amber-700/60">
        Меню носит рекомендательный характер. При аллергиях и медицинских
        ограничениях проконсультируйтесь со специалистом.
      </p>
    </form>
  );
}
