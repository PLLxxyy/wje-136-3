import { create } from 'zustand';
import { AppError, CostBudget, CostEntry } from '../types';
import { CostType } from '../types/enums';

interface CostState {
  costs: CostEntry[];
  budgets: CostBudget[];
  error?: AppError;
  setCosts: (costs: CostEntry[]) => void;
  setBudgets: (budgets: CostBudget[]) => void;
  setBudget: (type: CostType, month: string, budget: number) => void;
  setCostError: (error?: AppError) => void;
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
}));
