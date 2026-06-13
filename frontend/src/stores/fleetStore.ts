import { create } from 'zustand';
import { AppError, FleetVehicle } from '../types';

interface FleetState {
  fleet: FleetVehicle[];
  error?: AppError;
  setFleet: (fleet: FleetVehicle[]) => void;
  setFleetError: (error?: AppError) => void;
}

export const useFleetStore = create<FleetState>((set) => ({
  fleet: [],
  setFleet: (fleet) => set({ fleet }),
  setFleetError: (error) => set({ error }),
}));
