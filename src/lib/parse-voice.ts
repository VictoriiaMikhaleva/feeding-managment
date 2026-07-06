import type {
  BudgetLevel,
  CuisinePreference,
  MealType,
  ParsedVoiceProfile,
} from "./types";

const NUMBER_WORDS: Record<string, number> = {
  один: 1,
  одна: 1,
  одно: 1,
  одного: 1,
  одну: 1,
  два: 2,
  две: 2,
  двое: 2,
  двух: 2,
  три: 3,
  трое: 3,
  трёх: 3,
  трех: 3,
  четыре: 4,
  четверо: 4,
  четырёх: 4,
  четырех: 4,
  пять: 5,
  пятеро: 5,
  пяти: 5,
  шесть: 6,
  шестеро: 6,
  шести: 6,
  семь: 7,
  семеро: 7,
  семи: 7,
};

function extractNumber(text: string, context: RegExp): number | undefined {
  const match = text.match(context);
  if (!match) return undefined;

  const raw = match[1]?.toLowerCase();
  if (!raw) return undefined;

  if (/^\d+$/.test(raw)) return parseInt(raw, 10);
  return NUMBER_WORDS[raw];
}

function extractProductsAfter(
  text: string,
  markers: string[],
): string | undefined {
  const lower = text.toLowerCase();
  for (const marker of markers) {
    const idx = lower.indexOf(marker);
    if (idx === -1) continue;

    const after = text.slice(idx + marker.length).trim();
    const endMarkers = [
      "дети",
      "детей",
      "нелюб",
      "аллерг",
      "бюджет",
      "муж",
      "жена",
      "нужно меню",
      "на ",
    ];
    let end = after.length;
    for (const em of endMarkers) {
      const emIdx = after.toLowerCase().indexOf(em);
      if (emIdx > 0 && emIdx < end) end = emIdx;
    }

    const products = after
      .slice(0, end)
      .replace(/^(любят|нравятся|нравится)\s*/i, "")
      .replace(/\s+и\s+/g, ", ")
      .replace(/\.$/, "")
      .trim();

    if (products.length > 2) return products;
  }
  return undefined;
}

export function parseVoiceTextToFamilyProfile(
  text: string,
): ParsedVoiceProfile {
  const lower = text.toLowerCase();
  const result: ParsedVoiceProfile = { unparsedHints: [] };

  result.adultsCount =
    extractNumber(lower, /(\d+|один|одна|два|две|двое|три|четыре|пять|шесть|семь)\s*(?:взросл)/i) ??
    extractNumber(lower, /(?:нас|у нас)\s+(\d+|двое|трое|четверо|пятеро)/i) ??
    (/(?:я|мы)\s+вдвоём|вдвоем/i.test(lower) ? 2 : undefined);

  result.childrenCount =
    extractNumber(
      lower,
      /(\d+|один|одна|два|две|двое|три|четыре|пять)\s*(?:дет|реб)/i,
    ) ??
    extractNumber(lower, /(?:и|плюс)\s+(\d+|двое|трое)\s*(?:дет|реб)/i);

  result.days =
    extractNumber(lower, /(?:на|меню на)\s*(\d+|один|два|две|три|четыре|пять|шесть|семь)\s*дн/i) ??
    extractNumber(lower, /(\d+|пять|семь)\s*дн/i);

  const mealTypes: MealType[] = [];
  if (/завтрак/i.test(lower)) mealTypes.push("breakfast");
  if (/обед/i.test(lower)) mealTypes.push("lunch");
  if (/ужин/i.test(lower)) mealTypes.push("dinner");

  if (mealTypes.length > 0) {
    result.mealTypes = mealTypes;
  } else if (/три приёма|три приема|полный день/i.test(lower)) {
    result.mealTypes = ["breakfast", "lunch", "dinner"];
  }

  if (/бюджетн|экономн|дешёв|дешев|недорог/i.test(lower)) {
    result.budget = "low" as BudgetLevel;
  } else if (/свободн|не огранич|дорог/i.test(lower)) {
    result.budget = "high" as BudgetLevel;
  } else if (/средн/i.test(lower)) {
    result.budget = "medium" as BudgetLevel;
  }

  // «завтраки и ужины» без отдельного «обеда»
  if (/завтрак/i.test(lower) && /ужин/i.test(lower) && !/обед/i.test(lower)) {
    result.mealTypes = ["breakfast", "dinner"];
  }

  result.adultFavorites = extractProductsAfter(text, [
    "взрослые любят",
    "взрослым нравятся",
    "взрослые любят",
    "любят овощи",
  ]);

  if (!result.adultFavorites) {
    const adultMatch = lower.match(
      /взрослые?\s+(?:любят|нравятся?)\s+([^.]+?)(?:\.|дети|нелюб|бюджет|$)/i,
    );
    if (adultMatch) result.adultFavorites = adultMatch[1].trim();
  }

  result.childrenFavorites = extractProductsAfter(text, [
    "дети любят",
    "детям нравятся",
    "дети любят",
  ]);

  if (!result.childrenFavorites) {
    const childMatch = lower.match(
      /дети\s+(?:любят|нравятся?)\s+([^.]+?)(?:\.|нелюб|бюджет|нужен|$)/i,
    );
    if (childMatch) result.childrenFavorites = childMatch[1].trim();
  }

  const dislikeMatch = lower.match(
    /(?:нелюбим|не любим|не нравится)\s+([^.]+?)(?:\.|аллерг|$)/i,
  );
  if (dislikeMatch) result.dislikedProducts = dislikeMatch[1].trim();

  const allergyMatch = lower.match(
    /(?:аллерг|непереносим|ограничен)\w*\s*(?:на|—|-)?\s*([^.]+?)(?:\.|$)/i,
  );
  if (allergyMatch) result.allergies = allergyMatch[1].trim();

  if (/муж.*работ|обедает на работе|на работе/i.test(lower)) {
    const daysMatch = lower.match(/(\d+|четыре|три|пять)\s*дн/i);
    const daysWord = daysMatch?.[1] ?? "4";
    const daysNum = NUMBER_WORDS[daysWord] ?? parseInt(daysWord, 10) ?? 4;
    result.scheduleNotes = `Муж ${daysNum} дня в неделю обедает на работе`;
  } else if (/жена.*работ/i.test(lower)) {
    result.scheduleNotes = "Жена обедает на работе";
  } else if (/работ/i.test(lower)) {
    result.scheduleNotes = "Часть семьи обедает на работе";
  }

  if (/с запасом|заготовк|на несколько дней/i.test(lower)) {
    result.cookWithLeftovers = true;
  } else if (/без запаса/i.test(lower)) {
    result.cookWithLeftovers = false;
  }

  if (/русск/i.test(lower)) result.cuisinePreference = "russian" as CuisinePreference;
  else if (/европейск/i.test(lower)) result.cuisinePreference = "european" as CuisinePreference;
  else if (/детск/i.test(lower) && /кухн/i.test(lower)) result.cuisinePreference = "kids" as CuisinePreference;
  else if (/домашн/i.test(lower)) result.cuisinePreference = "home" as CuisinePreference;

  const recognized = [
    result.adultsCount !== undefined,
    result.childrenCount !== undefined,
    result.days !== undefined,
    result.mealTypes !== undefined,
    result.budget !== undefined,
  ];

  if (recognized.filter(Boolean).length < 2) {
    result.unparsedHints.push(
      "Не все данные распознаны. Проверьте количество людей, дней и приёмы пищи.",
    );
  }

  if (!result.adultFavorites && !result.childrenFavorites) {
    const generalLikes = lower.match(
      /любят\s+([^.]+?)(?:\.|дети|бюджет|нужен|$)/i,
    );
    if (generalLikes) {
      result.adultFavorites = generalLikes[1].trim();
      result.unparsedHints.push(
        "Продукты добавлены в «Любимые взрослых» — уточните при необходимости.",
      );
    }
  }

  return result;
}

export function mergeParsedIntoProfile(
  parsed: ParsedVoiceProfile,
  current: import("./types").FamilyProfile,
): import("./types").FamilyProfile {
  return {
    ...current,
    adultsCount: parsed.adultsCount ?? current.adultsCount,
    childrenCount: parsed.childrenCount ?? current.childrenCount,
    days: parsed.days ?? current.days,
    mealTypes: parsed.mealTypes ?? current.mealTypes,
    budget: parsed.budget ?? current.budget,
    adultFavorites: parsed.adultFavorites ?? current.adultFavorites,
    childrenFavorites: parsed.childrenFavorites ?? current.childrenFavorites,
    dislikedProducts: parsed.dislikedProducts ?? current.dislikedProducts,
    allergies: parsed.allergies ?? current.allergies,
    scheduleNotes: parsed.scheduleNotes ?? current.scheduleNotes,
    cookWithLeftovers:
      parsed.cookWithLeftovers ?? current.cookWithLeftovers,
    cuisinePreference: parsed.cuisinePreference ?? current.cuisinePreference,
  };
}
