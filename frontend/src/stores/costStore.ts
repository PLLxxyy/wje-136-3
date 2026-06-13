import { create } from 'zustand';
import { AppError, CostEntry } from '../types';

interface CostState {
  costs: CostEntry[];
  error?: AppError;
  setCosts: (costs: CostEntry[]) => void;
  setCostError: (error?: AppError) => void;
}

export const useCostStore = create<CostState>((set) => ({
  costs: [],
  setCosts: (costs) => set({ costs }),
  setCostError: (error) => set({ error }),
}));
