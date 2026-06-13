import { create } from 'zustand';
import { AppError, Shipment, TrackingEvent } from '../types';

interface ShipmentState {
  shipments: Shipment[];
  trackingEvents: TrackingEvent[];
  error?: AppError;
  setShipments: (shipments: Shipment[]) => void;
  setTrackingEvents: (trackingEvents: TrackingEvent[]) => void;
  setShipmentError: (error?: AppError) => void;
}

export const useShipmentStore = create<ShipmentState>((set) => ({
  shipments: [],
  trackingEvents: [],
  setShipments: (shipments) => set({ shipments }),
  setTrackingEvents: (trackingEvents) => set({ trackingEvents }),
  setShipmentError: (error) => set({ error }),
}));
