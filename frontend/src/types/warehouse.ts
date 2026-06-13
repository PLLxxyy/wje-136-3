import { Region } from './enums';
import { GeoPoint } from './shipment';

export interface WarehouseZone {
  name: string;
  occupancyRate: number;
}

export interface WarehouseCapacity {
  id: string;
  name: string;
  totalCapacityM3: number;
  usedCapacityM3: number;
  zones: WarehouseZone[];
  location: GeoPoint;
  region: Region;
  trend: Array<{
    date: string;
    occupancyRate: number;
  }>;
}
