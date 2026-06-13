import {
  CostEntry,
  FleetVehicle,
  Shipment,
  TrackingEvent,
  WarehouseCapacity,
} from '../types';
import {
  CostType,
  Region,
  ShipmentStatus,
  TrackingEventType,
  TransportMode,
  VehicleStatus,
  VehicleType,
} from '../types/enums';
import { daysFromNow } from '../utils/date';
import { regionCoordinates, regionList } from '../constants/regions';

export interface LogisticsSnapshot {
  shipments: Shipment[];
  warehouses: WarehouseCapacity[];
  fleet: FleetVehicle[];
  costs: CostEntry[];
  trackingEvents: TrackingEvent[];
}

const cargoNames = ['冷链药品', '新能源电池', '精密仪器', '服装箱包', '汽车零部件', '生鲜果蔬', '工业阀门', '工程设备'];
const carriers = ['安捷干线', '华运联配', '北斗快线', '港陆多式联运', '星桥冷链', '云仓车队'];
const cities = ['上海浦东', '广州南沙', '北京顺义', '成都龙泉', '西安未央', '沈阳浑南', '武汉东西湖', '杭州萧山'];
const statusCycle = [
  ShipmentStatus.InTransit,
  ShipmentStatus.InTransit,
  ShipmentStatus.Pending,
  ShipmentStatus.Delivered,
  ShipmentStatus.Exception,
  ShipmentStatus.Returned,
];
const modeCycle = [TransportMode.Road, TransportMode.Rail, TransportMode.Sea, TransportMode.Air];
const zoneNames = ['A 常温区', 'B 高架区', 'C 冷链区', 'D 暂存区', 'E 出库区'];

function offsetPoint(region: Region, index: number) {
  const base = regionCoordinates[region];
  return {
    lat: Number((base.lat + ((index % 5) - 2) * 0.34).toFixed(4)),
    lng: Number((base.lng + ((index % 7) - 3) * 0.42).toFixed(4)),
  };
}

function buildWarehouses(): WarehouseCapacity[] {
  return Array.from({ length: 12 }, (_, index) => {
    const region = regionList[index % regionList.length];
    const totalCapacityM3 = 28000 + index * 3500;
    const usedRate = 58 + ((index * 9) % 37);
    const usedCapacityM3 = Math.round((totalCapacityM3 * usedRate) / 100);

    return {
      id: `WH-${String(index + 1).padStart(3, '0')}`,
      name: `${regionCoordinates[region].hub}${index > 6 ? '二期' : '中心仓'}`,
      totalCapacityM3,
      usedCapacityM3,
      zones: zoneNames.map((name, zoneIndex) => ({
        name,
        occupancyRate: Math.min(98, Math.max(22, usedRate + (zoneIndex - 2) * 7 + (index % 3) * 3)),
      })),
      location: offsetPoint(region, index),
      region,
      trend: Array.from({ length: 14 }, (_, dayIndex) => ({
        date: daysFromNow(dayIndex - 13, 10),
        occupancyRate: Math.min(98, Math.max(35, usedRate - 11 + dayIndex * 1.4 + ((index + dayIndex) % 4) * 2)),
      })),
    };
  });
}

function buildShipments(warehouses: WarehouseCapacity[]): Shipment[] {
  return Array.from({ length: 30 }, (_, index) => {
    const warehouse = warehouses[index % warehouses.length];
    const status = statusCycle[index % statusCycle.length];
    const actualArrivalTime = status === ShipmentStatus.Delivered ? daysFromNow(-1 - (index % 3), 17) : undefined;

    return {
      id: `SHP-${String(index + 1).padStart(4, '0')}`,
      waybillNo: `LTL202606${String(1300 + index)}`,
      originWarehouseId: warehouse.id,
      destinationAddress: `${cities[(index + 3) % cities.length]}配送站 ${index + 1} 号月台`,
      cargoName: cargoNames[index % cargoNames.length],
      weightKg: 860 + index * 215 + (index % 4) * 120,
      volumeM3: Number((4.2 + index * 0.74).toFixed(1)),
      mode: modeCycle[index % modeCycle.length],
      status,
      departureTime: daysFromNow(-2 + (index % 4), 8 + (index % 5)),
      etaTime: daysFromNow(1 + (index % 5), 15),
      actualArrivalTime,
      carrier: carriers[index % carriers.length],
      currentLocation: offsetPoint(warehouse.region, index + 2),
    };
  });
}

function buildFleet(shipments: Shipment[]): FleetVehicle[] {
  const plates = ['沪A-7L26', '粤B-91K8', '京C-62F0', '川A-0P18', '陕A-53M9', '辽B-87C2', '鄂A-19Q6', '浙A-5N40', '苏E-2X31', '津A-8S27', '鲁Q-4T65', '皖A-6H12'];
  const vehicleTypes = [VehicleType.HeavyTruck, VehicleType.MediumTruck, VehicleType.ColdChain, VehicleType.LightTruck];
  const statusList = [VehicleStatus.OnRoute, VehicleStatus.OnRoute, VehicleStatus.Idle, VehicleStatus.Maintenance];

  return plates.map((plateNo, index) => {
    const shipment = shipments.find((item, shipmentIndex) => shipmentIndex % plates.length === index && item.status === ShipmentStatus.InTransit);
    const status = shipment ? VehicleStatus.OnRoute : statusList[index % statusList.length];
    const mileageKm = 34200 + index * 4380;

    return {
      plateNo,
      vehicleType: vehicleTypes[index % vehicleTypes.length],
      status,
      currentLocation: shipment?.currentLocation ?? { lat: 29.5 + index * 0.8, lng: 108.7 + index * 1.2 },
      currentShipmentId: shipment?.id,
      mileageKm,
      lastMaintenanceDate: daysFromNow(-42 - index * 3, 9),
      nextMaintenanceDate: daysFromNow(18 + index * 2, 9),
      mileageTrend: Array.from({ length: 10 }, (_, dayIndex) => ({
        date: daysFromNow(dayIndex - 9, 18),
        mileageKm: mileageKm - (9 - dayIndex) * (180 + index * 8),
      })),
    };
  });
}

function buildCosts(shipments: Shipment[]): CostEntry[] {
  const costTypes = Object.values(CostType);

  return shipments.flatMap((shipment, shipmentIndex) =>
    costTypes.slice(0, 4 + (shipmentIndex % 3)).map((type, costIndex) => ({
      id: `COST-${shipment.id}-${costIndex}`,
      shipmentId: shipment.id,
      type,
      amount: Math.round(460 + shipment.weightKg * 0.18 + shipment.volumeM3 * 28 + costIndex * 360 + (shipmentIndex % 5) * 95),
      date: daysFromNow(-20 + ((shipmentIndex + costIndex) % 22), 12),
      note: costIndex === 3 && shipment.status === ShipmentStatus.Exception ? '绕行与等待产生额外成本' : '自动归集成本',
    })),
  );
}

function buildTrackingEvents(shipments: Shipment[], warehouses: WarehouseCapacity[]): TrackingEvent[] {
  return shipments.flatMap((shipment, shipmentIndex) => {
    const warehouse = warehouses.find((item) => item.id === shipment.originWarehouseId) ?? warehouses[0];
    const hasIssue = shipment.status === ShipmentStatus.Exception || shipment.status === ShipmentStatus.Returned;
    const delivered = shipment.status === ShipmentStatus.Delivered;
    const baseEvents: TrackingEvent[] = [
      {
        id: `TRK-${shipment.id}-1`,
        shipmentId: shipment.id,
        type: TrackingEventType.Departure,
        location: warehouse.name,
        time: shipment.departureTime,
        description: `${shipment.cargoName} 已完成出库复核并装车。`,
      },
      {
        id: `TRK-${shipment.id}-2`,
        shipmentId: shipment.id,
        type: TrackingEventType.Transit,
        location: cities[(shipmentIndex + 2) % cities.length],
        time: daysFromNow(-1 + (shipmentIndex % 2), 14),
        description: `${shipment.carrier} 回传在途定位，运输方式为 ${shipment.mode}。`,
      },
    ];

    if (hasIssue) {
      baseEvents.push({
        id: `TRK-${shipment.id}-3`,
        shipmentId: shipment.id,
        type: shipment.status === ShipmentStatus.Exception ? TrackingEventType.Exception : TrackingEventType.Delay,
        location: cities[(shipmentIndex + 4) % cities.length],
        time: daysFromNow(0, 11),
        description: shipment.status === ShipmentStatus.Exception ? '节点发现温控偏差，已触发客服与仓配联动。' : '客户改约导致退回干线仓。',
      });
    }

    if (delivered) {
      baseEvents.push({
        id: `TRK-${shipment.id}-4`,
        shipmentId: shipment.id,
        type: TrackingEventType.Arrival,
        location: shipment.destinationAddress,
        time: shipment.actualArrivalTime ?? shipment.etaTime,
        description: '客户签收完成，回单已同步。',
      });
    }

    return baseEvents;
  });
}

export function createMockData(): LogisticsSnapshot {
  const warehouses = buildWarehouses();
  const shipments = buildShipments(warehouses);
  const fleet = buildFleet(shipments);
  const costs = buildCosts(shipments);
  const trackingEvents = buildTrackingEvents(shipments, warehouses);

  return {
    shipments,
    warehouses,
    fleet,
    costs,
    trackingEvents,
  };
}
