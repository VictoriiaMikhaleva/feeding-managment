"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FamilyProfile, MealType } from "@/lib/types";
import {
  COOKING_METHOD_LABELS,
  COOKING_METHOD_ORDER,
  BUDGET_LABELS,
  CUISINE_LABELS,
  DEFAULT_FAMILY_PROFILE,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_ORDER,
  WEEKDAY_LABELS,
} from "@/lib/types";
import { normalizeFamilyProfile } from "@/lib/normalize-profile";
import { loadProfile } from "@/lib/storage";
import { validateProfile } from "@/lib/validate-profile";
import { Button } from "./Button";
import { Card } from "./Card";

interface MenuFormProps {
  initialProfile?: FamilyProfile;
  onSubmit: (profile: FamilyProfile) => void;
}

type Member = { id: string; role: "adult" | "child"; name: string };

export function MenuForm({ initialProfile, onSubmit }: MenuFormProps) {
  const [profile, setProfile] = useState<FamilyProfile>(
    initialProfile ?? DEFAULT_FAMILY_PROFILE,
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [loadedSaved, setLoadedSaved] = useState(false);
  const errorsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialProfile) return;
    const saved = loadProfile();
    if (saved) {
      setProfile(normalizeFamilyProfile(saved));
      setLoadedSaved(true);
    }
  }, [initialProfile]);

  const update = <K extends keyof FamilyProfile>(
    key: K,
    value: FamilyProfile[K],
  ) => {
    setProfile((prev) =>
      key === "days"
        ? normalizeFamilyProfile({ ...prev, days: value as number })
        : { ...prev, [key]: value },
    );
    setErrors([]);
  };

  const toggleMealType = (type: MealType) => {
    setProfile((prev) => {
      const has = prev.mealTypes.includes(type);
      const mealTypes = has
        ? prev.mealTypes.filter((t) => t !== type)
        : [...prev.mealTypes, type];
      return normalizeFamilyProfile({
        ...prev,
        mealTypes: mealTypes.length ? mealTypes : [type],
      });
    });
    setErrors([]);
  };

  const toggleCookingMethod = (method: (typeof COOKING_METHOD_ORDER)[number]) => {
    setProfile((prev) => {
      const currentMethods = prev.cookingMethods ?? [];
      const has = currentMethods.includes(method);
      const cookingMethods = has
        ? currentMethods.filter((m) => m !== method)
        : [...currentMethods, method];
      return normalizeFamilyProfile({
        ...prev,
        cookingMethods: cookingMethods.length ? cookingMethods : [method],
      });
    });
    setErrors([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedProfile = normalizeFamilyProfile(profile);
    const validationErrors = validateProfile(normalizedProfile);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setProfile(normalizedProfile);
      requestAnimationFrame(() => {
        errorsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    onSubmit(normalizedProfile);
  };

  const totalPeople = profile.adultsCount + profile.childrenCount;
  const members = useMemo<Member[]>(() => {
    const adults = profile.adultNames.map((name, i) => ({
      id: `adult-${i + 1}`,
      role: "adult" as const,
      name,
    }));
    const children = profile.childrenNames.map((name, i) => ({
      id: `child-${i + 1}`,
      role: "child" as const,
      name,
    }));
    return [...adults, ...children];
  }, [profile.adultNames, profile.childrenNames]);

  const updateCount = (type: "adults" | "children", value: number) => {
    setProfile((prev) => {
      const next = { ...prev };
      if (type === "adults") next.adultsCount = value;
      else next.childrenCount = value;
      return normalizeFamilyProfile(next);
    });
  };

  const updateMemberName = (memberId: string, value: string) => {
    setProfile((prev) => {
      const next = { ...prev };
      if (memberId.startsWith("adult-")) {
        const idx = Number(memberId.replace("adult-", "")) - 1;
        next.adultNames = [...next.adultNames];
        next.adultNames[idx] = value || `Взрослый ${idx + 1}`;
      } else {
        const idx = Number(memberId.replace("child-", "")) - 1;
        next.childrenNames = [...next.childrenNames];
        next.childrenNames[idx] = value || `Ребёнок ${idx + 1}`;
      }
      return next;
    });
  };

  const toggleDayMealMember = (dayIndex: number, mealType: MealType, memberId: string) => {
    setProfile((prev) => {
      const dayMealMembers = prev.dayMealMembers.map((d) => ({
        breakfast: [...d.breakfast],
        lunch: [...d.lunch],
        dinner: [...d.dinner],
      }));
      const set = new Set(dayMealMembers[dayIndex][mealType]);
      if (set.has(memberId)) set.delete(memberId);
      else set.add(memberId);
      dayMealMembers[dayIndex][mealType] = [...set];
      return normalizeFamilyProfile({ ...prev, dayMealMembers });
    });
    setErrors([]);
  };

  const toggleAllForMealDay = (dayIndex: number, mealType: MealType) => {
    setProfile((prev) => {
      const allIds = members.map((m) => m.id);
      const dayMealMembers = prev.dayMealMembers.map((d) => ({
        breakfast: [...d.breakfast],
        lunch: [...d.lunch],
        dinner: [...d.dinner],
      }));
      const current = dayMealMembers[dayIndex][mealType];
      dayMealMembers[dayIndex][mealType] =
        current.length === allIds.length ? [] : allIds;
      return normalizeFamilyProfile({ ...prev, dayMealMembers });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {loadedSaved && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
          Загружены сохранённые настройки — можно изменить и сгенерировать снова
        </div>
      )}

      {errors.length > 0 && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errors.map((err) => (
            <p key={err}>{err}</p>
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
                updateCount("adults", parseInt(e.target.value, 10) || 0)
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
                updateCount("children", parseInt(e.target.value, 10) || 0)
              }
              className="w-full rounded-xl border border-amber-200 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-amber-600">
          Всего в семье: {totalPeople}{" "}
          {totalPeople === 1 ? "человек" : totalPeople < 5 ? "человека" : "человек"}
        </p>
        {members.length > 0 && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {members.map((member) => (
              <label key={member.id} className="block">
                <span className="mb-1 block text-xs text-amber-700">
                  {member.role === "adult" ? "Взрослый" : "Ребёнок"}
                </span>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateMemberName(member.id, e.target.value)}
                  className="w-full rounded-lg border border-amber-200 px-3 py-1.5 text-sm focus:border-amber-400 focus:outline-none"
                />
              </label>
            ))}
          </div>
        )}
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
            <input
              type="range"
              min={1}
              max={14}
              value={profile.days}
              onChange={(e) =>
                update("days", parseInt(e.target.value, 10))
              }
              className="mt-2 w-full accent-amber-600"
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
            {MEAL_TYPE_ORDER.map((type) => (
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

        <div className="mt-4">
          <span className="mb-2 block text-sm text-amber-800">
            Способ приготовления
          </span>
          <div className="flex flex-wrap gap-2">
            {COOKING_METHOD_ORDER.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => toggleCookingMethod(method)}
                className={[
                  "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  (profile.cookingMethods ?? []).includes(method)
                    ? "bg-sky-600 text-white"
                    : "bg-sky-50 text-sky-800 hover:bg-sky-100",
                ].join(" ")}
              >
                {COOKING_METHOD_LABELS[method]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-white/70 p-3">
          <p className="mb-2 text-sm font-medium text-amber-900">
            Расписание по дням: кто ест каждый приём пищи
          </p>
          <div className="space-y-3">
            {Array.from({ length: profile.days }).map((_, dayIndex) => (
              <div key={dayIndex} className="rounded-lg border border-amber-100 bg-amber-50/50 p-2">
                <p className="mb-2 text-xs font-semibold text-amber-800">
                  {WEEKDAY_LABELS[dayIndex % 7]} · День {dayIndex + 1}
                </p>
                <div className="space-y-2">
                  {profile.mealTypes.map((type) => (
                    <div key={`${dayIndex}-${type}`} className="rounded-md bg-white p-2">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-700">
                          {MEAL_TYPE_LABELS[type]}
                        </span>
                        <button
                          type="button"
                          className="text-xs text-orange-600 hover:text-orange-800"
                          onClick={() => toggleAllForMealDay(dayIndex, type)}
                        >
                          Все/Никто
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {members.map((member) => {
                          const checked = profile.dayMealMembers[dayIndex]?.[type]?.includes(
                            member.id,
                          );
                          return (
                            <label
                              key={`${dayIndex}-${type}-${member.id}`}
                              className={[
                                "flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs",
                                checked ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-700",
                              ].join(" ")}
                            >
                              <input
                                type="checkbox"
                                checked={Boolean(checked)}
                                onChange={() => toggleDayMealMember(dayIndex, type, member.id)}
                                className="hidden"
                              />
                              {member.name}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
            <p className="mt-1 text-xs text-amber-600/70">
              Учитываются связанные продукты: лактоза → молочное, глютен → мука и
              макароны
            </p>
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

      <Card padding="sm" className="bg-amber-50/50">
        <p className="text-sm text-amber-800">
          <span className="font-medium">Итого:</span> меню на {profile.days} дн.
          для {totalPeople} чел., {profile.mealTypes.length} приёма пищи в день,{" "}
          бюджет «{BUDGET_LABELS[profile.budget]}»
        </p>
      </Card>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-amber-100 bg-[#fffbf5]/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <div className="flex flex-wrap gap-3">
          {errors.length > 0 && (
            <div
              ref={errorsRef}
              className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              <p className="mb-1 font-medium">Проверьте форму перед генерацией:</p>
              {errors.map((err) => (
                <p key={err}>{err}</p>
              ))}
            </div>
          )}
          <Button type="submit" fullWidth className="px-8 py-3 text-base sm:w-auto">
            Сгенерировать меню
          </Button>
        </div>
      </div>

      <p className="text-xs text-amber-700/60">
        Меню носит рекомендательный характер. При аллергиях и медицинских
        ограничениях проконсультируйтесь со специалистом.
      </p>
    </form>
  );
}
