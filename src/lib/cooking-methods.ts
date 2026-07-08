import type { CookingMethod, Dish } from "./types";
import { COOKING_METHOD_LABELS, COOKING_METHOD_ORDER } from "./types";

const SOUP_OR_POT_KEYWORDS = [
  "суп",
  "каша",
  "плов",
  "гречка",
  "рагу",
  "подлив",
  "шакшука",
  "пюре",
  "туш",
];

const OVEN_KEYWORDS = ["запек", "лазан", "жульен"];
const PAN_KEYWORDS = ["сковород", "блины", "олад", "котлет", "тефтел", "драник"];

export function getDishCookingMethods(dish: Dish): CookingMethod[] {
  if (dish.cookingMethods && dish.cookingMethods.length > 0) {
    return COOKING_METHOD_ORDER.filter((m) => dish.cookingMethods?.includes(m));
  }

  const haystack = `${dish.name} ${dish.tags.join(" ")}`.toLowerCase();
  const methods = new Set<CookingMethod>();

  if (OVEN_KEYWORDS.some((key) => haystack.includes(key))) {
    methods.add("oven");
    methods.add("airfryer");
  }

  if (PAN_KEYWORDS.some((key) => haystack.includes(key))) {
    methods.add("stove");
  }

  if (SOUP_OR_POT_KEYWORDS.some((key) => haystack.includes(key))) {
    methods.add("stove");
    methods.add("multicooker");
  }

  if (
    haystack.includes("наггет") ||
    haystack.includes("рыбные палочки") ||
    haystack.includes("омлет") ||
    haystack.includes("овсянка")
  ) {
    methods.add("microwave");
  }

  if (haystack.includes("бутерброд") || haystack.includes("салат")) {
    methods.add("microwave");
    methods.add("stove");
  }

  if (methods.size === 0) {
    methods.add("stove");
  }

  return COOKING_METHOD_ORDER.filter((m) => methods.has(m));
}

export function formatCookingMethods(methods: CookingMethod[]): string {
  return methods.map((m) => COOKING_METHOD_LABELS[m]).join(", ");
}
