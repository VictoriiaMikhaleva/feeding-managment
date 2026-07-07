import type {
  FamilyProfile,
  GeneratedMealPlan,
  SavedMenuEntry,
} from "./types";
import { DEFAULT_FAMILY_PROFILE } from "./types";

const PROFILE_KEY = "family-menu-profile";
const PLAN_KEY = "family-menu-plan";
const HISTORY_KEY = "family-menu-history";
const CHECKED_KEY = "family-menu-checked";
const MAX_HISTORY = 20;

function normalizeProfile(profile?: Partial<FamilyProfile>): FamilyProfile {
  return {
    ...DEFAULT_FAMILY_PROFILE,
    ...(profile ?? {}),
  };
}

function normalizePlan(plan: GeneratedMealPlan): GeneratedMealPlan {
  return {
    ...plan,
    profile: normalizeProfile(plan.profile),
  };
}

export function saveProfile(profile: FamilyProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadProfile(): FamilyProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return normalizeProfile(JSON.parse(raw) as Partial<FamilyProfile>);
  } catch {
    return null;
  }
}

export function saveMealPlan(plan: GeneratedMealPlan): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
}

export function loadMealPlan(): GeneratedMealPlan | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PLAN_KEY);
  if (!raw) return null;
  try {
    return normalizePlan(JSON.parse(raw) as GeneratedMealPlan);
  } catch {
    return null;
  }
}

export function addToHistory(plan: GeneratedMealPlan): void {
  if (typeof window === "undefined") return;
  const history = loadHistory();
  const title = `${plan.profile.days} дн. · ${new Date(plan.generatedAt).toLocaleDateString("ru-RU")}`;
  const entry: SavedMenuEntry = {
    id: plan.generatedAt,
    title,
    savedAt: new Date().toISOString(),
    plan,
  };

  const filtered = history.filter((h) => h.id !== entry.id);
  const updated = [entry, ...filtered].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function loadHistory(): SavedMenuEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as SavedMenuEntry[]).map((entry) => ({
      ...entry,
      plan: normalizePlan(entry.plan),
    }));
  } catch {
    return [];
  }
}

export function loadHistoryEntry(id: string): SavedMenuEntry | null {
  return loadHistory().find((e) => e.id === id) ?? null;
}

export function deleteHistoryEntry(id: string): void {
  if (typeof window === "undefined") return;
  const updated = loadHistory().filter((e) => e.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function saveCheckedItems(planId: string, checked: string[]): void {
  if (typeof window === "undefined") return;
  const all = loadAllChecked();
  all[planId] = checked;
  localStorage.setItem(CHECKED_KEY, JSON.stringify(all));
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
