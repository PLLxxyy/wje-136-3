import { create } from 'zustand';
import { AppError, CostBudget, CostEntry } from '../types';
import { CostType } from '../types/enums';
import { getCurrentMonth, isSameMonth } from '../utils/date';

export interface MonthlyBudgetComparison {
  type: CostType;
  spent: number;
  budget: number;
  diff: number;
  ratio: number;
  isOver: boolean;
}

interface CostState {
  costs: CostEntry[];
  budgets: CostBudget[];
  error?: AppError;
  setCosts: (costs: CostEntry[]) => void;
  setBudgets: (budgets: CostBudget[]) => void;
  setBudget: (type: CostType, month: string, budget: number) => void;
  setCostError: (error?: AppError) => void;
  getMonthlyBudgetComparison: (month?: string) => MonthlyBudgetComparison[];
  getOverBudgetTypes: (month?: string) => MonthlyBudgetComparison[];
}

export function computeMonthlyComparison(
  costs: CostEntry[],
  budgets: CostBudget[],
  month?: string,
): MonthlyBudgetComparison[] {
  const targetMonth = month ?? getCurrentMonth();
  return Object.values(CostType).map((type) => {
    const spent = costs
      .filter((cost) => cost.type === type && isSameMonth(cost.date, targetMonth))
      .reduce((sum, cost) => sum + cost.amount, 0);
    const budget = budgets.find((b) => b.type === type && b.month === targetMonth)?.budget ?? 0;
    const diff = spent - budget;
    const ratio = budget > 0 ? (spent / budget) * 100 : 0;
    return {
      type,
      spent,
      budget,
      diff,
      ratio,
      isOver: spent > budget,
    };
  });
}

export const useCostStore = create<CostState>((set, get) => ({
  costs: [],
  budgets: [],
  setCosts: (costs) => set({ costs }),
  setBudgets: (budgets) => set({ budgets }),
  setBudget: (type, month, budget) => {
    const { budgets } = get();
    const existing = budgets.find((b) => b.type === type && b.month === month);
    if (existing) {
      set({
        budgets: budgets.map((b) =>
          b.type === type && b.month === month ? { ...b, budget } : b,
        ),
      });
    } else {
      set({
        budgets: [...budgets, { id: `BUDGET-${type}-${month}`, type, month, budget }],
      });
    }
  },
  setCostError: (error) => set({ error }),
  getMonthlyBudgetComparison: (month) => {
    const { costs, budgets } = get();
    return computeMonthlyComparison(costs, budgets, month);
  },
  getOverBudgetTypes: (month) => {
    return get().getMonthlyBudgetComparison(month).filter((item) => item.isOver);
  },
}));
