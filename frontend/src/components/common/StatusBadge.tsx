import { statusColors } from '../../constants/chartColors';
import {
  SHIPMENT_STATUS_LABELS,
  ShipmentStatus,
  VEHICLE_STATUS_LABELS,
  VehicleStatus,
} from '../../types/enums';

type BadgeStatus = ShipmentStatus | VehicleStatus;

const labelMap: Record<BadgeStatus, string> = {
  ...SHIPMENT_STATUS_LABELS,
  ...VEHICLE_STATUS_LABELS,
};

interface StatusBadgeProps {
  status: BadgeStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold"
      style={{
        borderColor: `${statusColors[status]}55`,
        color: statusColors[status],
        background: `${statusColors[status]}14`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColors[status] }} />
      {labelMap[status]}
    </span>
  );
}
