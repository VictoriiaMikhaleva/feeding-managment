import type { BudgetTip, FamilyProfile } from "./types";
import { getSeasonalTip } from "./seasonal";

export function buildBudgetTips(profile: FamilyProfile): BudgetTip[] {
  const tips: BudgetTip[] = [
    { text: getSeasonalTip() },
    {
      text: "Часть ягод можно брать замороженными — выгоднее свежих вне сезона",
    },
    {
      text: "Готовьте запеканки и тушёные блюда в большой форме — дешевле на порцию",
    },
  ];

  if (profile.scheduleNotes.toLowerCase().includes("работ")) {
    tips.push({
      text: "Используйте остатки ужина как обед на работу — меньше трат на кафе",
    });
  }

  if (profile.budget === "low") {
    tips.push({
      text: "Покупайте крупы и макароны оптом — основа бюджетного меню",
    });
    tips.push({
      text: "Замороженные овощи и полуфабрикаты — удобная альтернатива, если следить за акциями",
    });
    tips.push({
      text: "Планируйте 1–2 «простых» ужина в неделю: макароны, крупы, яичные блюда",
    });
  }

  if (profile.budget === "medium") {
    tips.push({
      text: "Чередуйте мясо и курицу — курица обычно выгоднее на семью",
    });
  }

  if (profile.budget === "high") {
    tips.push({
      text: "Можно добавить больше свежей рыбы и разнообразных овощей",
    });
  }

  if (profile.cookWithLeftovers) {
    tips.push({
      text: "Готовьте крупы и мясо сразу на 2 дня — меньше включений плиты в будни",
    });
  }

  return tips;
}
