export type MealType = "breakfast" | "lunch" | "dinner";

export type BudgetLevel = "low" | "medium" | "high";

export type CuisinePreference =
  | "home"
  | "kids"
  | "russian"
  | "european"
  | "any";

export type Difficulty = "easy" | "medium" | "hard";

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
}

export interface FamilyProfile {
  adultsCount: number;
  childrenCount: number;
  days: number;
  mealTypes: MealType[];
  budget: BudgetLevel;
  adultFavorites: string;
  childrenFavorites: string;
  dislikedProducts: string;
  allergies: string;
  scheduleNotes: string;
  cookWithLeftovers: boolean;
  cuisinePreference: CuisinePreference;
}

export interface PlannedMeal {
  mealType: MealType;
  dish: Dish;
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
  budget: "medium",
  adultFavorites: "",
  childrenFavorites: "",
  dislikedProducts: "",
  allergies: "",
  scheduleNotes: "",
  cookWithLeftovers: false,
  cuisinePreference: "any",
};
