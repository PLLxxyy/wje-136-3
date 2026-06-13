import { create } from 'zustand';
import { AppError, WarehouseCapacity } from '../types';

interface WarehouseState {
  warehouses: WarehouseCapacity[];
  error?: AppError;
  setWarehouses: (warehouses: WarehouseCapacity[]) => void;
  setWarehouseError: (error?: AppError) => void;
}

export const useWarehouseStore = create<WarehouseState>((set) => ({
  warehouses: [],
  setWarehouses: (warehouses) => set({ warehouses }),
  setWarehouseError: (error) => set({ error }),
}));
