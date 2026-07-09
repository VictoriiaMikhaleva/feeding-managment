import type { FamilyProfile, MealType } from "./types";
import {
  COOKING_METHOD_ORDER,
  createDefaultDayMealMembers,
  orderCookingMethods,
  orderMealTypes,
} from "./types";

function pickMealMembers(
  savedIds: string[] | undefined,
  defaultIds: string[],
  validIds: Set<string>,
): string[] {
  const filtered = (savedIds ?? []).filter((id) => validIds.has(id));
  if (filtered.length > 0) return filtered;

  const defaultFiltered = defaultIds.filter((id) => validIds.has(id));
  if (defaultFiltered.length > 0) return defaultFiltered;

  return [...validIds];
}

export function normalizeFamilyProfile(profile: FamilyProfile): FamilyProfile {
  const adults = Math.max(0, profile.adultsCount);
  const children = Math.max(0, profile.childrenCount);
  const days = Math.max(1, Math.min(14, profile.days));

  const adultNames = Array.from(
    { length: adults },
    (_, i) => profile.adultNames[i] ?? `Взрослый ${i + 1}`,
  );
  const childrenNames = Array.from(
    { length: children },
    (_, i) => profile.childrenNames[i] ?? `Ребёнок ${i + 1}`,
  );
  const defaultMatrix = createDefaultDayMealMembers(days, adults, children);
  const validIds = new Set([
    ...adultNames.map((_, i) => `adult-${i + 1}`),
    ...childrenNames.map((_, i) => `child-${i + 1}`),
  ]);

  const dayMealMembers = Array.from({ length: days }, (_, dayIdx) => {
    const saved = profile.dayMealMembers[dayIdx];
    const defaults = defaultMatrix[dayIdx];
    const meals: MealType[] = ["breakfast", "lunch", "dinner"];

    return meals.reduce(
      (acc, mealType) => {
        acc[mealType] = pickMealMembers(
          saved?.[mealType],
          defaults?.[mealType] ?? [],
          validIds,
        );
        return acc;
      },
      {} as Record<MealType, string[]>,
    );
  });

  return {
    ...profile,
    adultsCount: adults,
    childrenCount: children,
    days,
    adultNames,
    childrenNames,
    mealTypes:
      orderMealTypes(profile.mealTypes ?? []).length > 0
        ? orderMealTypes(profile.mealTypes ?? [])
        : ["breakfast"],
    dayMealMembers,
    cookingMethods:
      orderCookingMethods(profile.cookingMethods ?? []).length > 0
        ? orderCookingMethods(profile.cookingMethods ?? [])
        : [...COOKING_METHOD_ORDER],
  };
}
