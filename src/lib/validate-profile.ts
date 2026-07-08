export function validateProfile(profile: import("./types").FamilyProfile): string[] {
  const errors: string[] = [];

  if (profile.adultsCount + profile.childrenCount < 1) {
    errors.push("Укажите хотя бы одного человека в семье");
  }

  if (profile.days < 1 || profile.days > 14) {
    errors.push("Количество дней — от 1 до 14");
  }

  if (profile.mealTypes.length === 0) {
    errors.push("Выберите хотя бы один приём пищи");
  }
  if (profile.cookingMethods.length === 0) {
    errors.push("Выберите хотя бы один способ приготовления");
  }

  if (profile.adultNames.length !== profile.adultsCount) {
    errors.push("Проверьте список взрослых: количество и имена не совпадают");
  }
  if (profile.childrenNames.length !== profile.childrenCount) {
    errors.push("Проверьте список детей: количество и имена не совпадают");
  }

  for (let day = 0; day < profile.days; day++) {
    for (const mealType of profile.mealTypes) {
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
