"use client";

import type { ShoppingListCategory } from "@/lib/types";
import { Card } from "./Card";

interface ShoppingListProps {
  categories: ShoppingListCategory[];
  checked: Set<string>;
  onToggle: (name: string) => void;
}

export function ShoppingList({
  categories,
  checked,
  onToggle,
}: ShoppingListProps) {
  if (categories.length === 0) {
    return (
      <Card>
        <p className="text-sm text-amber-700">Список покупок пуст</p>
      </Card>
    );
  }

  const total = categories.reduce((sum, c) => sum + c.items.length, 0);
  const done = categories.reduce(
    (sum, c) => sum + c.items.filter((i) => checked.has(i.name)).length,
    0,
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-amber-700">
        Отмечено: {done} из {total}
      </p>
      {categories.map((cat) => (
        <Card key={cat.id} padding="sm">
          <h3 className="mb-2 font-semibold text-amber-950">{cat.title}</h3>
          <ul className="space-y-2">
            {cat.items.map((item) => {
              const isChecked = checked.has(item.name);
              return (
                <li key={item.name}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg px-1 py-0.5 hover:bg-amber-50">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggle(item.name)}
                      className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-400"
                    />
                    <span
                      className={[
                        "flex flex-1 justify-between gap-2 text-sm",
                        isChecked
                          ? "text-amber-500 line-through"
                          : "text-amber-800",
                      ].join(" ")}
                    >
                      <span>{item.name}</span>
                      {item.amount && (
                        <span className="shrink-0 text-right text-xs text-amber-600/70">
                          {item.amount}
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}
    </div>
  );
}
