/** Ключевые слова аллергенов → ингредиенты/теги для фильтрации */
export const ALLERGY_EXPANSIONS: Record<string, string[]> = {
  лактоз: [
    "молоко",
    "творог",
    "сыр",
    "сметана",
    "кефир",
    "масло сливочное",
    "сгущёнка",
    "сгущенка",
    "йогурт",
  ],
  молок: [
    "молоко",
    "творог",
    "сыр",
    "сметана",
    "кефир",
    "масло сливочное",
    "сгущёнка",
    "сгущенка",
  ],
  глютен: [
    "мука",
    "макароны",
    "лапша",
    "хлеб",
    "манка",
    "вермишель",
    "пельмени",
    "блины",
    "оладьи",
  ],
  пшениц: ["мука", "макароны", "лапша", "хлеб", "манка", "вермишель"],
  орех: ["орех", "миндаль", "фундук", "арахис"],
  яйц: ["яйца", "яйцо", "омлет"],
  рыб: ["рыба", "рыбн", "тунец", "минтай", "треска"],
  морепродукт: ["рыба", "кревет", "кальмар", "мидии"],
  гриб: ["гриб", "шампиньон"],
  мед: ["мёд", "мед"],
};

export function expandAllergies(allergyText: string): string[] {
  const tokens = allergyText
    .toLowerCase()
    .split(/[,;.\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const expanded = new Set<string>(tokens);

  for (const token of tokens) {
    for (const [key, words] of Object.entries(ALLERGY_EXPANSIONS)) {
      if (token.includes(key) || key.includes(token)) {
        words.forEach((w) => expanded.add(w));
      }
    }
  }

  return [...expanded];
}
