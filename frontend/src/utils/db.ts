import Dexie, { Table } from 'dexie';
import { CostEntry, FleetVehicle, Shipment, TrackingEvent, WarehouseCapacity } from '../types';

export class LogisticsDatabase extends Dexie {
  shipments!: Table<Shipment, string>;
  warehouses!: Table<WarehouseCapacity, string>;
  fleet!: Table<FleetVehicle, string>;
  costs!: Table<CostEntry, string>;
  trackingEvents!: Table<TrackingEvent, string>;

  constructor() {
    super('wje136-logistics-dashboard');
    this.version(1).stores({
      shipments: 'id, waybillNo, status, originWarehouseId',
      warehouses: 'id, region',
      fleet: 'plateNo, status, currentShipmentId',
      costs: 'id, shipmentId, type, date',
      trackingEvents: 'id, shipmentId, time',
    });
  }
}

export const db = new LogisticsDatabase();

export async function persistSnapshot(snapshot: {
  shipments: Shipment[];
  warehouses: WarehouseCapacity[];
  fleet: FleetVehicle[];
  costs: CostEntry[];
  trackingEvents: TrackingEvent[];
}): Promise<void> {
  try {
    await db.transaction('rw', [db.shipments, db.warehouses, db.fleet, db.costs, db.trackingEvents], async () => {
      await Promise.all([
        db.shipments.clear(),
        db.warehouses.clear(),
        db.fleet.clear(),
        db.costs.clear(),
        db.trackingEvents.clear(),
      ]);

      await Promise.all([
        db.shipments.bulkPut(snapshot.shipments),
        db.warehouses.bulkPut(snapshot.warehouses),
        db.fleet.bulkPut(snapshot.fleet),
        db.costs.bulkPut(snapshot.costs),
        db.trackingEvents.bulkPut(snapshot.trackingEvents),
      ]);
    });
  } catch (cause) {
    throw {
      code: 'INDEXEDDB_FAILED',
      message: 'IndexedDB 数据写入失败，已回退到内存数据。',
      cause,
    };
  }
}
