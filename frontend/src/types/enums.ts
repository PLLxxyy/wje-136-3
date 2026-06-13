export enum ShipmentStatus {
  Pending = 'Pending',
  InTransit = 'InTransit',
  Delivered = 'Delivered',
  Exception = 'Exception',
  Returned = 'Returned',
}

export enum TransportMode {
  Road = 'Road',
  Rail = 'Rail',
  Sea = 'Sea',
  Air = 'Air',
}

export enum VehicleStatus {
  Idle = 'Idle',
  OnRoute = 'OnRoute',
  Maintenance = 'Maintenance',
}

export enum VehicleType {
  LightTruck = '轻卡',
  MediumTruck = '中卡',
  HeavyTruck = '重卡',
  ColdChain = '冷链车',
}

export enum CostType {
  Fuel = 'Fuel',
  Toll = 'Toll',
  Labor = 'Labor',
  Maintenance = 'Maintenance',
  Insurance = 'Insurance',
  Other = 'Other',
}

export enum TrackingEventType {
  Departure = 'Departure',
  Transit = 'Transit',
  Arrival = 'Arrival',
  Delay = 'Delay',
  Exception = 'Exception',
}

export enum Region {
  East = '华东',
  South = '华南',
  North = '华北',
  Southwest = '西南',
  Northwest = '西北',
  Northeast = '东北',
  Central = '华中',
}

export type ThemeMode = 'light' | 'dark';

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  [ShipmentStatus.Pending]: '待发运',
  [ShipmentStatus.InTransit]: '在途',
  [ShipmentStatus.Delivered]: '已签收',
  [ShipmentStatus.Exception]: '异常',
  [ShipmentStatus.Returned]: '退回',
};

export const TRANSPORT_MODE_LABELS: Record<TransportMode, string> = {
  [TransportMode.Road]: '公路',
  [TransportMode.Rail]: '铁路',
  [TransportMode.Sea]: '海运',
  [TransportMode.Air]: '空运',
};

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  [VehicleStatus.Idle]: '空闲',
  [VehicleStatus.OnRoute]: '执行中',
  [VehicleStatus.Maintenance]: '保养',
};

export const COST_TYPE_LABELS: Record<CostType, string> = {
  [CostType.Fuel]: '燃油',
  [CostType.Toll]: '路桥',
  [CostType.Labor]: '人工',
  [CostType.Maintenance]: '维修',
  [CostType.Insurance]: '保险',
  [CostType.Other]: '其他',
};
