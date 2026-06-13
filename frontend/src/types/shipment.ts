import { ShipmentStatus, TransportMode } from './enums';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Shipment {
  id: string;
  waybillNo: string;
  originWarehouseId: string;
  destinationAddress: string;
  cargoName: string;
  weightKg: number;
  volumeM3: number;
  mode: TransportMode;
  status: ShipmentStatus;
  departureTime: string;
  etaTime: string;
  actualArrivalTime?: string;
  carrier: string;
  currentLocation: GeoPoint;
}
