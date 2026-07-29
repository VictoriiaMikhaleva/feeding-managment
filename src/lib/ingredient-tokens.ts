/** Синонимы для списка покупок и сопоставления ингредиентов */
export const INGREDIENT_ALIASES: Record<string, string> = {
  "куриное филе": "курица",
  "куриный фарш": "курица",
  "копчёности или курица": "курица",
  "филе белой рыбы": "рыба",
  "рыбные палочки": "рыба",
  "тунец консервированный": "тунец",
  "горошек замороженный": "горошек",
  "овощи замороженные": "овощи",
  "фасоль консервированная": "фасоль",
  "перец болгарский": "перец",
  "масло сливочное": "масло",
  "овсяные хлопья": "овсянка",
};

const INGREDIENT_ROOTS: Array<[RegExp, string]> = [
  [/курин|куриц/, "курица"],
  [/говядин|говяж/, "говядина"],
  [/свинин|свин/, "свинина"],
  [/фарш/, "фарш"],
  [/рыб|тунец|лосос|минтай|треск|наггет/, "рыба"],
  [/рис/, "рис"],
  [/греч/, "гречка"],
  [/макарон|паст/, "макароны"],
  [/картоф|пюре/, "картофель"],
  [/морков/, "морковь"],
  [/лук/, "лук"],
  [/капуст/, "капуста"],
  [/помидор|томат/, "помидоры"],
  [/перец/, "перец"],
  [/гриб/, "грибы"],
  [/творог/, "творог"],
  [/яйц/, "яйца"],
  [/молок/, "молоко"],
  [/сметан/, "сметана"],
  [/кефир/, "кефир"],
  [/мук/, "мука"],
  [/овсян/, "овсянка"],
  [/сыр/, "сыр"],
  [/фасол/, "фасоль"],
  [/горош/, "горошек"],
  [/овощ/, "овощи"],
  [/масл/, "масло"],
  [/сахар/, "сахар"],
  [/мёд|мед/, "мёд"],
  [/ягод/, "ягоды"],
  [/зелен/, "зелень"],
  [/огур/, "огурец"],
  [/копч/, "копчёности"],
  [/булгур/, "булгур"],
  [/нут/, "нут"],
  [/чечевиц/, "чечевица"],
  [/сосиск/, "сосиски"],
  [/пельмен/, "пельмени"],
];

export function normalizeIngredientName(name: string): string {
  const lower = name.toLowerCase().trim();
  return INGREDIENT_ALIASES[lower] ?? name;
}

function splitCompoundIngredient(name: string): string[] {
  return name
    .split(/\s+или\s+|\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Канонические «токены» ингредиента для сравнения блюд */
export function getIngredientTokens(name: string): string[] {
  const tokens = new Set<string>();

  for (const part of splitCompoundIngredient(name)) {
    const lower = part.toLowerCase().trim();
    if (!lower) continue;

    const aliased = INGREDIENT_ALIASES[lower];
    if (aliased) {
      tokens.add(aliased.toLowerCase());
      continue;
    }

    let matched = false;
    for (const [pattern, token] of INGREDIENT_ROOTS) {
      if (pattern.test(lower)) {
        tokens.add(token);
        matched = true;
      }
    }

    if (!matched) {
      const word = lower.replace(/[^\p{L}\-]+/gu, " ").trim().split(/\s+/)[0];
      if (word && word.length >= 3) {
        tokens.add(word);
      }
    }
  }

  return [...tokens];
}

export function ingredientsMatch(a: string, b: string): boolean {
  const tokensA = getIngredientTokens(a);
  const tokensB = getIngredientTokens(b);

  if (tokensA.some((token) => tokensB.includes(token))) {
    return true;
  }

  const normA = normalizeIngredientName(a).toLowerCase();
  const normB = normalizeIngredientName(b).toLowerCase();
  if (normA.length >= 3 && normB.length >= 3) {
    return normA.includes(normB) || normB.includes(normA);
  }

  return false;
}
