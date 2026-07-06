import type { ShoppingListCategory } from "@/lib/types";
import { Card } from "./Card";

interface ShoppingListProps {
  categories: ShoppingListCategory[];
}

export function ShoppingList({ categories }: ShoppingListProps) {
  if (categories.length === 0) {
    return (
      <Card>
        <p className="text-sm text-amber-700">Список покупок пуст</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((cat) => (
        <Card key={cat.id} padding="sm">
          <h3 className="mb-2 font-semibold text-amber-950">{cat.title}</h3>
          <ul className="space-y-1">
            {cat.items.map((item) => (
              <li
                key={item.name}
                className="flex justify-between gap-2 text-sm text-amber-800"
              >
                <span>{item.name}</span>
                {item.amount && (
                  <span className="shrink-0 text-amber-600/70">
                    {item.amount}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
