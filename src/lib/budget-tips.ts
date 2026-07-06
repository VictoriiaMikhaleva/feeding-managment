import type { BudgetTip, FamilyProfile } from "./types";

export function buildBudgetTips(profile: FamilyProfile): BudgetTip[] {
  const tips: BudgetTip[] = [
    {
      text: "Используйте сезонные овощи — они дешевле и вкуснее",
    },
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
      text: "Замороженные овощи и рыбные палочки — удобная альтернатива свежим продуктам",
    });
  }

  if (profile.budget === "high") {
    tips.push({
      text: "Можно добавить больше свежей рыбы и разнообразных овощей",
    });
  }

  return tips;
}
