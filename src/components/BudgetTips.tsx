import type { BudgetTip } from "@/lib/types";
import { Card } from "./Card";

interface BudgetTipsProps {
  tips: BudgetTip[];
}

export function BudgetTips({ tips }: BudgetTipsProps) {
  return (
    <Card>
      <h3 className="mb-3 text-lg font-semibold text-amber-950">
        💡 Подсказки по экономии
      </h3>
      <ul className="space-y-2">
        {tips.map((tip, i) => (
          <li
            key={i}
            className="flex gap-2 text-sm text-amber-800 before:content-['•']"
          >
            {tip.text}
          </li>
        ))}
      </ul>
    </Card>
  );
}
