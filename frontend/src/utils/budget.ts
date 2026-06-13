import { CostBudget, CostEntry } from '../types';
import { CostType } from '../types/enums';
import { getCurrentMonth, isSameMonth } from './date';

export interface CostBudgetComparison {
  type: CostType;
  spent: number;
  budget: number;
  diff: number;
  ratio: number;
  isOver: boolean;
}

export function calculateMonthlyBudgetComparison(
  costs: CostEntry[],
  budgets: CostBudget[],
  month?: string,
): CostBudgetComparison[] {
  const targetMonth = month ?? getCurrentMonth();

  return Object.values(CostType).map((type) => {
    const spent = costs
      .filter((cost) => cost.type === type && isSameMonth(cost.date, targetMonth))
      .reduce((sum, cost) => sum + cost.amount, 0);
    const budget = budgets.find((b) => b.type === type && b.month === targetMonth)?.budget ?? 0;
    const diff = spent - budget;
    const ratio = budget > 0 ? (spent / budget) * 100 : 0;
    const isOver = spent > budget && budget > 0;

    return {
      type,
      spent,
      budget,
      diff,
      ratio,
      isOver,
    };
  });
}

export function getOverBudgetTypes(comparison: CostBudgetComparison[]): CostBudgetComparison[] {
  return comparison.filter((item) => item.isOver);
}

export function getTotalOverBudget(overBudgetTypes: CostBudgetComparison[]): number {
  return overBudgetTypes.reduce((sum, item) => sum + item.diff, 0);
}

export function getTotalBudget(comparison: CostBudgetComparison[]): number {
  return comparison.reduce((sum, item) => sum + item.budget, 0);
}

export function getTotalSpent(comparison: CostBudgetComparison[]): number {
  return comparison.reduce((sum, item) => sum + item.spent, 0);
}
