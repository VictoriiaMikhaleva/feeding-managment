import type {
  FamilyProfile,
  GeneratedMealPlan,
  MealType,
  SavedMenuEntry,
} from "./types";
import { normalizeFamilyProfile } from "./normalize-profile";
import { compactMealPlan, expandMealPlan } from "./plan-storage";
import {
  DEFAULT_FAMILY_PROFILE,
  MEAL_TYPE_ORDER,
} from "./types";

const PROFILE_KEY = "family-menu-profile";
const PLAN_KEY = "family-menu-plan";
const PLAN_SESSION_KEY = "family-menu-plan-session";
const HISTORY_KEY = "family-menu-history";
const CHECKED_KEY = "family-menu-checked";
const MAX_HISTORY = 5;

export class StorageQuotaError extends Error {
  constructor(message = "Недостаточно места в браузере для сохранения меню") {
    super(message);
    this.name = "StorageQuotaError";
  }
}

function safelyParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveIfChanged(key: string, nextValue: unknown, previousRaw?: string): void {
  if (typeof window === "undefined") return;
  const nextRaw = JSON.stringify(nextValue);
  if (previousRaw !== nextRaw) {
    safeSetItem(key, nextRaw);
  }
}

function pruneStorageForQuota(keepPlanId?: string): void {
  if (typeof window === "undefined") return;

  const historyRaw = localStorage.getItem(HISTORY_KEY);
  if (historyRaw) {
    const history = safelyParseJson<SavedMenuEntry[]>(historyRaw) ?? [];
    const trimmed = history.slice(0, 2).map((entry) => ({
      ...entry,
      plan: compactMealPlan(entry.plan),
    }));
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch {
      localStorage.removeItem(HISTORY_KEY);
    }
  }

  const checkedRaw = localStorage.getItem(CHECKED_KEY);
  if (checkedRaw && keepPlanId) {
    const checked = safelyParseJson<Record<string, string[]>>(checkedRaw) ?? {};
    const nextChecked: Record<string, string[]> = {};
    if (checked[keepPlanId]) {
      nextChecked[keepPlanId] = checked[keepPlanId];
    }
    try {
      localStorage.setItem(CHECKED_KEY, JSON.stringify(nextChecked));
    } catch {
      localStorage.removeItem(CHECKED_KEY);
    }
  } else {
    localStorage.removeItem(CHECKED_KEY);
  }
}

function safeSetItem(key: string, value: string, keepPlanId?: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.code === 22);

    if (!isQuota) throw error;

    pruneStorageForQuota(keepPlanId);

    try {
      localStorage.setItem(key, value);
    } catch {
      throw new StorageQuotaError();
    }
  }
}

function normalizeProfile(profile?: Partial<FamilyProfile>): FamilyProfile {
  const merged = {
    ...DEFAULT_FAMILY_PROFILE,
    ...(profile ?? {}),
  };

  return normalizeFamilyProfile(merged);
}

function mealTypeSortValue(mealType: MealType): number {
  return MEAL_TYPE_ORDER.indexOf(mealType);
}

function normalizePlan(plan: GeneratedMealPlan): GeneratedMealPlan {
  const normalizedDays = plan.days.map((day) => ({
    ...day,
    meals: [...day.meals].sort(
      (a, b) => mealTypeSortValue(a.mealType) - mealTypeSortValue(b.mealType),
    ),
  }));

  return {
    ...plan,
    days: normalizedDays,
    profile: normalizeProfile(plan.profile),
  };
}

function parseStoredPlan(raw: string): GeneratedMealPlan | null {
  const parsed = safelyParseJson<GeneratedMealPlan>(raw);
  if (!parsed) return null;
  const expanded = expandMealPlan(parsed);
  if (!expanded) return null;
  return normalizePlan(expanded);
}

export function saveProfile(profile: FamilyProfile): void {
  if (typeof window === "undefined") return;
  safeSetItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadProfile(): FamilyProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  const parsed = safelyParseJson<Partial<FamilyProfile>>(raw);
  if (!parsed) return null;

  const normalized = normalizeProfile(parsed);
  saveIfChanged(PROFILE_KEY, normalized, raw);
  return normalized;
}

export function saveMealPlan(plan: GeneratedMealPlan): void {
  if (typeof window === "undefined") return;
  const compact = compactMealPlan(normalizePlan(plan));
  const payload = JSON.stringify(compact);

  try {
    safeSetItem(PLAN_KEY, payload, plan.generatedAt);
    sessionStorage.removeItem(PLAN_SESSION_KEY);
  } catch (error) {
    if (error instanceof StorageQuotaError) {
      sessionStorage.setItem(PLAN_SESSION_KEY, payload);
      return;
    }
    throw error;
  }
}

export function loadMealPlan(): GeneratedMealPlan | null {
  if (typeof window === "undefined") return null;
  const raw =
    localStorage.getItem(PLAN_KEY) ?? sessionStorage.getItem(PLAN_SESSION_KEY);
  if (!raw) return null;

  const normalized = parseStoredPlan(raw);
  if (!normalized) return null;

  if (localStorage.getItem(PLAN_KEY)) {
    saveIfChanged(PLAN_KEY, compactMealPlan(normalized), raw);
  }
  return normalized;
}

export function addToHistory(plan: GeneratedMealPlan): void {
  if (typeof window === "undefined") return;
  const history = loadHistory();
  const title = `${plan.profile.days} дн. · ${new Date(plan.generatedAt).toLocaleDateString("ru-RU")}`;
  const normalized = normalizePlan(plan);
  const entry: SavedMenuEntry = {
    id: plan.generatedAt,
    title,
    savedAt: new Date().toISOString(),
    plan: normalized,
  };

  const filtered = history.filter((h) => h.id !== entry.id);
  const updated = [entry, ...filtered].slice(0, MAX_HISTORY);
  const compactHistory = updated.map((item) => ({
    ...item,
    plan: compactMealPlan(item.plan),
  }));
  safeSetItem(HISTORY_KEY, JSON.stringify(compactHistory), plan.generatedAt);
}

export function loadHistory(): SavedMenuEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  const parsed = safelyParseJson<SavedMenuEntry[]>(raw);
  if (!parsed) return [];

  const normalized = parsed
    .map((entry) => {
      const expanded = expandMealPlan(entry.plan);
      if (!expanded) return null;
      return {
        ...entry,
        plan: normalizePlan(expanded),
      };
    })
    .filter((entry): entry is SavedMenuEntry => entry !== null);

  saveIfChanged(
    HISTORY_KEY,
    normalized.map((entry) => ({
      ...entry,
      plan: compactMealPlan(entry.plan),
    })),
    raw,
  );
  return normalized;
}

export function loadHistoryEntry(id: string): SavedMenuEntry | null {
  return loadHistory().find((e) => e.id === id) ?? null;
}

export function deleteHistoryEntry(id: string): void {
  if (typeof window === "undefined") return;
  const updated = loadHistory().filter((e) => e.id !== id);
  safeSetItem(
    HISTORY_KEY,
    JSON.stringify(
      updated.map((entry) => ({
        ...entry,
        plan: compactMealPlan(entry.plan),
      })),
    ),
  );
}

export function saveCheckedItems(planId: string, checked: string[]): void {
  if (typeof window === "undefined") return;
  const all = loadAllChecked();
  all[planId] = checked;

  const ids = Object.keys(all);
  if (ids.length > 10) {
    for (const oldId of ids.slice(0, ids.length - 10)) {
      delete all[oldId];
    }
  }

  safeSetItem(CHECKED_KEY, JSON.stringify(all), planId);
}

export function loadCheckedItems(planId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  const all = loadAllChecked();
  return new Set(all[planId] ?? []);
}

function loadAllChecked(): Record<string, string[]> {
  const raw = localStorage.getItem(CHECKED_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string[]>;
  } catch {
    return {};
  }
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(PLAN_KEY);
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(CHECKED_KEY);
}
