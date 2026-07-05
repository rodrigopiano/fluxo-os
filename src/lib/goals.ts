import type { Goal } from "@/lib/types";
import { nowInBrazil } from "@/lib/format";

export function goalProgress(goal: Goal): number {
  return goal.target_amount > 0 ? Math.min(goal.current_amount / goal.target_amount, 1) : 0;
}

/** Months needed to reach the target at the given monthly savings rate. Null if savings <= 0. */
export function monthsToTarget(goal: Goal, monthlySavings: number): number | null {
  const remaining = goal.target_amount - goal.current_amount;
  if (remaining <= 0) return 0;
  if (monthlySavings <= 0) return null;
  return Math.ceil(remaining / monthlySavings);
}

export function projectedDate(
  goal: Goal,
  monthlySavings: number,
  reference: Date = nowInBrazil(),
): Date | null {
  const months = monthsToTarget(goal, monthlySavings);
  if (months === null) return null;
  return new Date(reference.getFullYear(), reference.getMonth() + months, reference.getDate());
}
