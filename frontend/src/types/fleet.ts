import { VehicleStatus, VehicleType } from './enums';
import { GeoPoint } from './shipment';

export interface FleetVehicle {
  plateNo: string;
  vehicleType: VehicleType;
  status: VehicleStatus;
  currentLocation: GeoPoint;
  currentShipmentId?: string;
  mileageKm: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  mileageTrend: Array<{
    date: string;
    mileageKm: number;
  }>;
}
