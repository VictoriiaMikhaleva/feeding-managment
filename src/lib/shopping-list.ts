import type { Dish, FamilyProfile, ShoppingListCategory } from "./types";
import { SHOPPING_CATEGORY_LABELS } from "./types";

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
    { name: string; amount?: string; category: string }
  >();

  for (const dish of dishes) {
    for (const ing of dish.ingredients) {
      const key = ing.name.toLowerCase();
      const existing = aggregated.get(key);
      if (existing) {
        aggregated.set(key, {
          ...existing,
          amount: existing.amount
            ? `${existing.amount} + ${ing.amount ?? ""}`
            : ing.amount,
        });
      } else {
        aggregated.set(key, {
          name: ing.name,
          amount: ing.amount,
          category: ing.category,
        });
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
    if (cat) {
      const amount =
        multiplier > 1 && item.amount
          ? `≈ ${item.amount} (×${multiplier} порций)`
          : item.amount;
      cat.items.push({ name: item.name, amount });
    }
  }

  return categories.filter((c) => c.items.length > 0);
}

export function formatShoppingListForCopy(
  list: ShoppingListCategory[],
): string {
  return list
    .map(
      (cat) =>
        `${cat.title}:\n${cat.items
          .map((i) => `  • ${i.name}${i.amount ? ` — ${i.amount}` : ""}`)
          .join("\n")}`,
    )
    .join("\n\n");
}
