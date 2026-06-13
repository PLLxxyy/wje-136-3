import { CostType, ShipmentStatus, VehicleStatus } from '../types/enums';

export const statusColors: Record<ShipmentStatus | VehicleStatus, string> = {
  [ShipmentStatus.Pending]: '#c0841a',
  [ShipmentStatus.InTransit]: '#2563eb',
  [ShipmentStatus.Delivered]: '#15925f',
  [ShipmentStatus.Exception]: '#dc2626',
  [ShipmentStatus.Returned]: '#7c3aed',
  [VehicleStatus.Idle]: '#15925f',
  [VehicleStatus.OnRoute]: '#2563eb',
  [VehicleStatus.Maintenance]: '#dc2626',
};

export const costTypeColors: Record<CostType, string> = {
  [CostType.Fuel]: '#2563eb',
  [CostType.Toll]: '#c0841a',
  [CostType.Labor]: '#15925f',
  [CostType.Maintenance]: '#dc2626',
  [CostType.Insurance]: '#7c3aed',
  [CostType.Other]: '#64748b',
};

export const chartPalette = [
  '#2563eb',
  '#15925f',
  '#c0841a',
  '#dc2626',
  '#7c3aed',
  '#0f766e',
  '#b45309',
  '#475569',
];
