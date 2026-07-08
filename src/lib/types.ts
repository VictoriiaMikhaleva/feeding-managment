export type MealType = "breakfast" | "lunch" | "dinner";

export type BudgetLevel = "low" | "medium" | "high";

export type CuisinePreference =
  | "home"
  | "kids"
  | "russian"
  | "european"
  | "any";

export type Difficulty = "easy" | "medium" | "hard";
export type CookingMethod =
  | "oven"
  | "airfryer"
  | "stove"
  | "multicooker"
  | "microwave";

export type IngredientCategory =
  | "meat"
  | "dairy"
  | "grains"
  | "vegetables"
  | "frozen"
  | "other";

export interface Ingredient {
  name: string;
  amount?: string;
  category: IngredientCategory;
}

export interface Dish {
  id: string;
  name: string;
  mealType: MealType;
  forChildren: boolean;
  forAdults: boolean;
  budget: BudgetLevel;
  ingredients: Ingredient[];
  tags: string[];
  difficulty: Difficulty;
  batchCooking: boolean;
  takeawayFriendly?: boolean;
  cuisine?: CuisinePreference[];
  cookingMethods?: CookingMethod[];
}

export interface FamilyProfile {
  adultsCount: number;
  childrenCount: number;
  days: number;
  mealTypes: MealType[];
  adultNames: string[];
  childrenNames: string[];
  dayMealMembers: Array<Record<MealType, string[]>>;
  budget: BudgetLevel;
  adultFavorites: string;
  childrenFavorites: string;
  dislikedProducts: string;
  allergies: string;
  scheduleNotes: string;
  cookWithLeftovers: boolean;
  cuisinePreference: CuisinePreference;
  cookingMethods: CookingMethod[];
}

export interface PlannedMeal {
  mealType: MealType;
  dish: Dish;
  forWhom?: string;
  note?: string;
}

export interface MealPlanDay {
  day: number;
  meals: PlannedMeal[];
  comment?: string;
}

export interface ShoppingListItem {
  name: string;
  amount?: string;
}

export interface ShoppingListCategory {
  id: IngredientCategory;
  title: string;
  items: ShoppingListItem[];
}

export interface PrepTip {
  text: string;
}

export interface BudgetTip {
  text: string;
}

export interface WorkLunchSuggestion {
  day: number;
  dishName: string;
  note: string;
}

export interface GeneratedMealPlan {
  profile: FamilyProfile;
  days: MealPlanDay[];
  shoppingList: ShoppingListCategory[];
  prepTips: PrepTip[];
  budgetTips: BudgetTip[];
  workLunchSuggestions: WorkLunchSuggestion[];
  generatedAt: string;
}

export type VoiceInputState =
  | "idle"
  | "listening"
  | "processing"
  | "done"
  | "error"
  | "unsupported";

export interface ParsedVoiceProfile {
  adultsCount?: number;
  childrenCount?: number;
  days?: number;
  mealTypes?: MealType[];
  budget?: BudgetLevel;
  adultFavorites?: string;
  childrenFavorites?: string;
  dislikedProducts?: string;
  allergies?: string;
  scheduleNotes?: string;
  cookWithLeftovers?: boolean;
  cuisinePreference?: CuisinePreference;
  unparsedHints: string[];
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
};

export const MEAL_TYPE_ORDER: MealType[] = ["breakfast", "lunch", "dinner"];

export function orderMealTypes(mealTypes: MealType[]): MealType[] {
  const unique = new Set(mealTypes);
  return MEAL_TYPE_ORDER.filter((type) => unique.has(type));
}

export const COOKING_METHOD_LABELS: Record<CookingMethod, string> = {
  oven: "Духовка",
  airfryer: "Аэрогриль",
  stove: "Плита",
  multicooker: "Мультиварка",
  microwave: "Микроволновка",
};

export const COOKING_METHOD_ORDER: CookingMethod[] = [
  "oven",
  "airfryer",
  "stove",
  "multicooker",
  "microwave",
];

export function orderCookingMethods(methods: CookingMethod[]): CookingMethod[] {
  const unique = new Set(methods);
  return COOKING_METHOD_ORDER.filter((method) => unique.has(method));
}

export const WEEKDAY_LABELS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"] as const;

export function createDefaultDayMealMembers(
  days: number,
  adultsCount: number,
  childrenCount: number,
): Array<Record<MealType, string[]>> {
  const adultIds = Array.from({ length: adultsCount }, (_, i) => `adult-${i + 1}`);
  const childIds = Array.from({ length: childrenCount }, (_, i) => `child-${i + 1}`);
  const all = [...adultIds, ...childIds];
  return Array.from({ length: Math.max(1, days) }, () => ({
    breakfast: [...all],
    lunch: [...all],
    dinner: [...all],
  }));
}

export const BUDGET_LABELS: Record<BudgetLevel, string> = {
  low: "Экономный",
  medium: "Средний",
  high: "Свободный",
};

export const CUISINE_LABELS: Record<CuisinePreference, string> = {
  home: "Обычная домашняя",
  kids: "Детская",
  russian: "Русская",
  european: "Европейская",
  any: "Без разницы",
};

export const SHOPPING_CATEGORY_LABELS: Record<IngredientCategory, string> = {
  meat: "Мясо и рыба",
  dairy: "Молочные продукты",
  grains: "Крупы и макароны",
  vegetables: "Овощи и фрукты",
  frozen: "Заморозка",
  other: "Дополнительно",
};

export interface SavedMenuEntry {
  id: string;
  title: string;
  savedAt: string;
  plan: GeneratedMealPlan;
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Легко",
  medium: "Средне",
  hard: "Сложнее",
};

export const FORM_PRESETS: {
  id: string;
  label: string;
  profile: Partial<FamilyProfile>;
}[] = [
  {
    id: "couple",
    label: "Пара без детей",
    profile: {
      adultsCount: 2,
      childrenCount: 0,
      days: 7,
      mealTypes: ["breakfast", "dinner"],
      budget: "medium",
    },
  },
  {
    id: "family-kids",
    label: "Семья с детьми",
    profile: {
      adultsCount: 2,
      childrenCount: 2,
      days: 7,
      mealTypes: ["breakfast", "dinner"],
      budget: "low",
      cookWithLeftovers: true,
    },
  },
  {
    id: "work-lunch",
    label: "Обед на работе",
    profile: {
      adultsCount: 2,
      childrenCount: 1,
      days: 5,
      mealTypes: ["breakfast", "dinner"],
      budget: "low",
      scheduleNotes: "Муж 4 дня в неделю обедает на работе",
      cookWithLeftovers: true,
    },
  },
];

export const DEFAULT_FAMILY_PROFILE: FamilyProfile = {
  adultsCount: 2,
  childrenCount: 0,
  days: 7,
  mealTypes: ["breakfast", "dinner"],
  adultNames: ["Взрослый 1", "Взрослый 2"],
  childrenNames: [],
  dayMealMembers: createDefaultDayMealMembers(7, 2, 0),
  budget: "medium",
  adultFavorites: "",
  childrenFavorites: "",
  dislikedProducts: "",
  allergies: "",
  scheduleNotes: "",
  cookWithLeftovers: false,
  cuisinePreference: "any",
  cookingMethods: [...COOKING_METHOD_ORDER],
};
