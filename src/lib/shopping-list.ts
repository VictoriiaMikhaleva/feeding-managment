import type { Dish, FamilyProfile, ShoppingListCategory } from "./types";
import { SHOPPING_CATEGORY_LABELS } from "./types";

const INGREDIENT_ALIASES: Record<string, string> = {
  "куриное филе": "курица",
  "куриный фарш": "курица (фарш)",
  "филе белой рыбы": "рыба",
  "рыбные палочки": "рыбные палочки",
  "тунец консервированный": "тунец",
  "горошек замороженный": "горошек",
  "овощи замороженные": "овощи (заморозка)",
  "фасоль консервированная": "фасоль",
  "перец болгарский": "перец",
  "масло сливочное": "масло",
};

function normalizeIngredientName(name: string): string {
  const lower = name.toLowerCase().trim();
  return INGREDIENT_ALIASES[lower] ?? name;
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function buildShoppingList(
  dishes: Dish[],
  profile: FamilyProfile,
): ShoppingListCategory[] {
  const multiplier = Math.max(
    1,
    Math.ceil((profile.adultsCount + profile.childrenCount * 0.7) / 2),
  );

  const aggregated = new Map<
    string,
    {
      name: string;
      amounts: string[];
      category: string;
      dishCount: number;
    }
  >();

  for (const dish of dishes) {
    const seenInDish = new Set<string>();
    for (const ing of dish.ingredients) {
      const normalized = normalizeIngredientName(ing.name);
      const key = normalized.toLowerCase();
      const existing = aggregated.get(key);

      if (existing) {
        if (ing.amount && !existing.amounts.includes(ing.amount)) {
          existing.amounts.push(ing.amount);
        }
        if (!seenInDish.has(key)) {
          existing.dishCount += 1;
          seenInDish.add(key);
        }
      } else {
        aggregated.set(key, {
          name: capitalizeFirst(normalized),
          amounts: ing.amount ? [ing.amount] : [],
          category: ing.category,
          dishCount: 1,
        });
        seenInDish.add(key);
      }
    }
  }

  const categories: ShoppingListCategory[] = (
    Object.keys(SHOPPING_CATEGORY_LABELS) as Array<
      keyof typeof SHOPPING_CATEGORY_LABELS
    >
  ).map((id) => ({
    id,
    title: SHOPPING_CATEGORY_LABELS[id],
    items: [],
  }));

  for (const item of aggregated.values()) {
    const cat = categories.find((c) => c.id === item.category);
    if (!cat) continue;

    let amount: string | undefined;
    if (item.amounts.length === 1) {
      amount =
        multiplier > 1
          ? `≈ ${item.amounts[0]} (×${multiplier} порций)`
          : item.amounts[0];
    } else if (item.amounts.length > 1) {
      amount = item.amounts.join(" + ");
      if (multiplier > 1) amount += ` (×${multiplier} порций)`;
    }

    if (item.dishCount > 1) {
      amount = amount
        ? `${amount} · в ${item.dishCount} блюдах`
        : `нужен в ${item.dishCount} блюдах`;
    }

    cat.items.push({ name: item.name, amount });
  }

  for (const cat of categories) {
    cat.items.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }

  return categories.filter((c) => c.items.length > 0);
}

export function formatShoppingListForCopy(
  list: ShoppingListCategory[],
  checked?: Set<string>,
): string {
  return list
    .map((cat) => {
      const items = cat.items
        .map((i) => {
          const mark = checked?.has(i.name) ? "✓ " : "  ";
          return `${mark}• ${i.name}${i.amount ? ` — ${i.amount}` : ""}`;
        })
        .join("\n");
      return `${cat.title}:\n${items}`;
    })
    .join("\n\n");
}
