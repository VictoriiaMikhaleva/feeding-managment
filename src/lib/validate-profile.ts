import { getDishCookingMethods } from "./cooking-methods";
import { getCatalogDishes } from "./dish-catalog";
import { loadCustomDishes } from "./custom-dishes";
import type { FamilyProfile } from "./types";

export function validateProfile(profile: FamilyProfile): string[] {
  const errors: string[] = [];
  const mealTypes = profile.mealTypes ?? [];
  const cookingMethods = profile.cookingMethods ?? [];
  const catalog = getCatalogDishes(profile);

  if (profile.adultsCount + profile.childrenCount < 1) {
    errors.push("Укажите хотя бы одного человека в семье");
  }

  if (profile.days < 1 || profile.days > 14) {
    errors.push("Количество дней — от 1 до 14 (до 2 недель)");
  }

  if (mealTypes.length === 0) {
    errors.push("Выберите хотя бы один приём пищи");
  }
  if (cookingMethods.length === 0) {
    errors.push("Выберите хотя бы один способ приготовления");
  }

  if (profile.dishCatalogMode === "custom_only" && loadCustomDishes().length === 0) {
    errors.push("Добавьте хотя бы одно своё блюдо или выберите «Встроенные + мои»");
  }

  for (const mealType of mealTypes) {
    const hasAtLeastOneDish = catalog.some((dish) => {
      if (dish.mealType !== mealType) return false;
      const methods = getDishCookingMethods(dish);
      return methods.some((method) => cookingMethods.includes(method));
    });

    if (!hasAtLeastOneDish) {
      const mealLabel =
        mealType === "breakfast"
          ? "завтрака"
          : mealType === "lunch"
            ? "обеда"
            : "ужина";
      errors.push(
        profile.dishCatalogMode === "custom_only"
          ? `Для ${mealLabel} нет своих блюд с выбранным способом приготовления`
          : `Для ${mealLabel} нет подходящих блюд под выбранные способы приготовления. Добавьте ещё один способ.`,
      );
    }
  }

  if (profile.adultNames.length !== profile.adultsCount) {
    errors.push("Проверьте список взрослых: количество и имена не совпадают");
  }
  if (profile.childrenNames.length !== profile.childrenCount) {
    errors.push("Проверьте список детей: количество и имена не совпадают");
  }

  for (let day = 0; day < profile.days; day++) {
    for (const mealType of mealTypes) {
      const selected = profile.dayMealMembers[day]?.[mealType] ?? [];
      if (selected.length === 0) {
        const mealLabel =
          mealType === "breakfast"
            ? "завтрака"
            : mealType === "lunch"
              ? "обеда"
              : "ужина";
        errors.push(`Для дня ${day + 1} выберите хотя бы одного участника для ${mealLabel}`);
      }
    }
  }

  return errors;
}
