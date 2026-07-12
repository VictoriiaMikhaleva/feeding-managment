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
const PLAN_HANDOFF_KEY = "family-menu-plan-handoff";
const PROFILE_SESSION_KEY = "family-menu-profile-session";
const HISTORY_KEY = "family-menu-history";
const CHECKED_KEY = "family-menu-checked";
const MAX_HISTORY = 3;

/** In-tab fallback when both localStorage and sessionStorage are full or blocked. */
const memoryCache = {
  planPayload: null as string | null,
  profilePayload: null as string | null,
};

export class StorageQuotaError extends Error {
  constructor(message = "Недостаточно места в браузере для сохранения меню") {
    super(message);
    this.name = "StorageQuotaError";
  }
}

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.code === 22)
  );
}

function safelyParseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readPayload(
  localKey: string,
  sessionKey: string,
  memorySlot: "plan" | "profile",
): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(localKey) ??
    sessionStorage.getItem(sessionKey) ??
    (memorySlot === "plan"
      ? memoryCache.planPayload
      : memoryCache.profilePayload)
  );
}

/** Never throws — degrades local → session → memory. */
function persistPayload(
  localKey: string,
  sessionKey: string,
  value: string,
  memorySlot: "plan" | "profile",
  keepPlanId?: string,
): void {
  if (typeof window === "undefined") return;

  if (memorySlot === "plan") memoryCache.planPayload = value;
  else memoryCache.profilePayload = value;

  try {
    localStorage.setItem(localKey, value);
    sessionStorage.removeItem(sessionKey);
    return;
  } catch (error) {
    if (!isQuotaError(error)) return;
  }

  pruneStorageForQuota(keepPlanId);

  try {
    localStorage.setItem(localKey, value);
    sessionStorage.removeItem(sessionKey);
    return;
  } catch (error) {
    if (!isQuotaError(error)) return;
  }

  try {
    sessionStorage.setItem(sessionKey, value);
    return;
  } catch (error) {
    if (!isQuotaError(error)) return;
  }
}

function saveIfChanged(
  key: string,
  nextValue: unknown,
  previousRaw?: string,
  keepPlanId?: string,
): void {
  if (typeof window === "undefined") return;
  const nextRaw = JSON.stringify(nextValue);
  if (previousRaw === nextRaw) return;

  const sessionKey =
    key === PROFILE_KEY
      ? PROFILE_SESSION_KEY
      : key === PLAN_KEY
        ? PLAN_SESSION_KEY
        : key;
  const memorySlot = key === PLAN_KEY ? "plan" : "profile";
  persistPayload(key, sessionKey, nextRaw, memorySlot, keepPlanId);
}

function pruneStorageForQuota(keepPlanId?: string): void {
  if (typeof window === "undefined") return;

  const historyRaw = localStorage.getItem(HISTORY_KEY);
  if (historyRaw) {
    const history = safelyParseJson<SavedMenuEntry[]>(historyRaw) ?? [];
    const trimmed = history.slice(0, 1).map((entry) => ({
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

function planPayloadFrom(plan: GeneratedMealPlan): string {
  return JSON.stringify(compactMealPlan(normalizePlan(plan)));
}

/** Свежесгенерированное меню — надёжная передача form → result в одной вкладке */
export function savePlanHandoff(plan: GeneratedMealPlan): void {
  if (typeof window === "undefined") return;
  const payload = planPayloadFrom(plan);
  memoryCache.planPayload = payload;
  try {
    sessionStorage.setItem(PLAN_HANDOFF_KEY, payload);
  } catch {
    /* memory fallback remains */
  }
}

export function consumePlanHandoff(): GeneratedMealPlan | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(PLAN_HANDOFF_KEY);
  if (!raw) return null;

  sessionStorage.removeItem(PLAN_HANDOFF_KEY);
  const parsed = parseStoredPlan(raw);
  if (parsed) {
    memoryCache.planPayload = raw;
  }
  return parsed;
}

function loadPlanFromAnySource(): GeneratedMealPlan | null {
  if (typeof window === "undefined") return null;

  const handoff = consumePlanHandoff();
  if (handoff) return handoff;

  const rawSources = [
    memoryCache.planPayload,
    sessionStorage.getItem(PLAN_SESSION_KEY),
    localStorage.getItem(PLAN_KEY),
  ].filter((raw): raw is string => Boolean(raw));

  for (const raw of rawSources) {
    const normalized = parseStoredPlan(raw);
    if (normalized) {
      memoryCache.planPayload = JSON.stringify(compactMealPlan(normalized));
      return normalized;
    }
  }

  return null;
}

export function saveProfile(profile: FamilyProfile): void {
  const payload = JSON.stringify(normalizeProfile(profile));
  persistPayload(PROFILE_KEY, PROFILE_SESSION_KEY, payload, "profile");
}

export function loadProfile(): FamilyProfile | null {
  const raw = readPayload(PROFILE_KEY, PROFILE_SESSION_KEY, "profile");
  if (!raw) return null;
  const parsed = safelyParseJson<Partial<FamilyProfile>>(raw);
  if (!parsed) return null;

  const normalized = normalizeProfile(parsed);
  saveIfChanged(PROFILE_KEY, normalized, raw);
  return normalized;
}

export function saveMealPlan(plan: GeneratedMealPlan): void {
  const payload = planPayloadFrom(plan);
  persistPayload(PLAN_KEY, PLAN_SESSION_KEY, payload, "plan", plan.generatedAt);
}

export function loadMealPlan(): GeneratedMealPlan | null {
  const normalized = loadPlanFromAnySource();
  if (!normalized) return null;

  const compactRaw = JSON.stringify(compactMealPlan(normalized));
  if (localStorage.getItem(PLAN_KEY) !== compactRaw) {
    persistPayload(
      PLAN_KEY,
      PLAN_SESSION_KEY,
      compactRaw,
      "plan",
      normalized.generatedAt,
    );
  }
  return normalized;
}

export function addToHistory(plan: GeneratedMealPlan): void {
  if (typeof window === "undefined") return;

  try {
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
    persistPayload(
      HISTORY_KEY,
      HISTORY_KEY,
      JSON.stringify(compactHistory),
      "profile",
      plan.generatedAt,
    );
  } catch {
    /* history is optional */
  }
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

  const compactHistory = normalized.map((entry) => ({
    ...entry,
    plan: compactMealPlan(entry.plan),
  }));
  const compactRaw = JSON.stringify(compactHistory);
  if (raw !== compactRaw) {
    try {
      localStorage.setItem(HISTORY_KEY, compactRaw);
    } catch {
      /* keep normalized in memory for this read */
    }
  }
  return normalized;
}

export function loadHistoryEntry(id: string): SavedMenuEntry | null {
  return loadHistory().find((e) => e.id === id) ?? null;
}

export function deleteHistoryEntry(id: string): void {
  if (typeof window === "undefined") return;
  const updated = loadHistory().filter((e) => e.id !== id);
  try {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(
        updated.map((entry) => ({
          ...entry,
          plan: compactMealPlan(entry.plan),
        })),
      ),
    );
  } catch {
    /* ignore */
  }
}

export function saveCheckedItems(planId: string, checked: string[]): void {
  if (typeof window === "undefined") return;

  try {
    const all = loadAllChecked();
    all[planId] = checked;

    const ids = Object.keys(all);
    if (ids.length > 5) {
      for (const oldId of ids.slice(0, ids.length - 5)) {
        delete all[oldId];
      }
    }

    localStorage.setItem(CHECKED_KEY, JSON.stringify(all));
  } catch {
    /* checked state is optional */
  }
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

export function migrateStorage(): void {
  if (typeof window === "undefined") return;

  pruneStorageForQuota();

  const planRaw = localStorage.getItem(PLAN_KEY);
  if (planRaw) {
    const normalized = parseStoredPlan(planRaw);
    if (planRaw.includes('"ingredients"')) {
      if (normalized) {
        saveMealPlan(normalized);
      } else {
        localStorage.removeItem(PLAN_KEY);
      }
    } else if (!normalized) {
      localStorage.removeItem(PLAN_KEY);
    }
  }

  loadProfile();
  loadMealPlan();
  loadHistory();
}

export function clearAllHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(PLAN_KEY);
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(CHECKED_KEY);
  sessionStorage.removeItem(PLAN_SESSION_KEY);
  sessionStorage.removeItem(PLAN_HANDOFF_KEY);
  sessionStorage.removeItem(PROFILE_SESSION_KEY);
  memoryCache.planPayload = null;
  memoryCache.profilePayload = null;
}
