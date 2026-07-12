import type { GeneratedMealPlan } from "./types";

/** План в памяти вкладки — надёжная передача form → result без гонок storage */
let pendingNavigationPlan: GeneratedMealPlan | null = null;

export function stashPlanForNavigation(plan: GeneratedMealPlan): void {
  pendingNavigationPlan = plan;
}

export function takeStashedPlan(): GeneratedMealPlan | null {
  const plan = pendingNavigationPlan;
  pendingNavigationPlan = null;
  return plan;
}

export function peekStashedPlan(): GeneratedMealPlan | null {
  return pendingNavigationPlan;
}

export function clearStashedPlan(): void {
  pendingNavigationPlan = null;
}
