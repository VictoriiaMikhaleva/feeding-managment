import type { Dish, FamilyProfile, PrepTip } from "./types";

export function buildPrepTips(dishes: Dish[], profile: FamilyProfile): PrepTip[] {
  const tips: PrepTip[] = [];
  const names = dishes.map((d) => d.name.toLowerCase());
  const hasRice = names.some((n) => n.includes("рис"));
  const hasBuckwheat = names.some(
    (n) => n.includes("гречк") || n.includes("гречка"),
  );
  const hasSyrniki = names.some((n) => n.includes("сырник"));
  const hasChicken = dishes.some((d) =>
    d.ingredients.some((i) => i.name.includes("курин")),
  );
  const hasCutlets = names.some(
    (n) => n.includes("котлет") || n.includes("тефтел"),
  );
  const hasJulienne = names.some((n) => n.includes("жульен"));
  const hasSalad = dishes.some((d) =>
    d.ingredients.some(
      (i) =>
        i.name.includes("огур") ||
        i.name.includes("помидор") ||
        i.name.includes("салат"),
    ),
  );
  const hasCasserole = dishes.some((d) => d.tags.includes("запеканка"));

  if (hasRice || hasBuckwheat) {
    tips.push({
      text: "Отварите рис или гречку сразу на 2 дня — сэкономите время в будни",
    });
  }

  if (hasSyrniki) {
    tips.push({
      text: "Сырники можно пожарить с запасом и хранить в холодильнике 2 дня",
    });
  }

  if (hasChicken && (hasCutlets || hasJulienne)) {
    tips.push({
      text: "Приготовьте курицу сразу для жульена и котлет — используйте разные части",
    });
  }

  if (hasSalad) {
    tips.push({
      text: "Нарежьте овощи для салатов на 2–3 дня и храните в контейнерах",
    });
  }

  if (hasCasserole || profile.cookWithLeftovers) {
    tips.push({
      text: "Запеканки и тушёные блюда готовьте в большой форме на несколько порций",
    });
  }

  if (profile.scheduleNotes.toLowerCase().includes("работ")) {
    tips.push({
      text: "Упакуйте 3–4 контейнера из остатков ужинов для обедов на работе",
    });
  }

  if (tips.length === 0) {
    tips.push({
      text: "Составьте план готовки на выходных: супы, крупы и запеканки держатся 2–3 дня",
    });
  }

  return tips;
}
