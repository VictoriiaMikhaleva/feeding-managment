import type { FamilyProfile, GeneratedMealPlan } from "./types";

const PROFILE_KEY = "family-menu-profile";
const PLAN_KEY = "family-menu-plan";

export function saveProfile(profile: FamilyProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadProfile(): FamilyProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FamilyProfile;
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
    return JSON.parse(raw) as GeneratedMealPlan;
  } catch {
    return null;
  }
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(PLAN_KEY);
}
