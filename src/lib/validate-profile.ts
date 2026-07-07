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

  for (const mealType of profile.mealTypes) {
    const participants = profile.mealParticipants[mealType];
    if (!participants?.adults && !participants?.children) {
      errors.push(
        `Для «${
          mealType === "breakfast"
            ? "Завтрака"
            : mealType === "lunch"
              ? "Обеда"
              : "Ужина"
        }» выберите хотя бы одного члена семьи`,
      );
    }
  }

  return errors;
}
