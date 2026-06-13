import { useMemo } from 'react';
import { statusColors } from '../../constants/chartColors';
import { useChartTheme } from '../../hooks/useChartTheme';
import { FleetVehicle } from '../../types';
import { VEHICLE_STATUS_LABELS, VehicleStatus } from '../../types/enums';
import { EChart } from './EChart';

interface FleetStatusChartProps {
  fleet: FleetVehicle[];
}

export function FleetStatusChart({ fleet }: FleetStatusChartProps) {
  const theme = useChartTheme();
  const option = useMemo(() => {
    const data = Object.values(VehicleStatus).map((status) => ({
      name: VEHICLE_STATUS_LABELS[status],
      value: fleet.filter((vehicle) => vehicle.status === status).length,
      itemStyle: { color: statusColors[status] },
    }));

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        textStyle: { color: theme.textColor },
      },
      series: [
        {
          type: 'pie',
          radius: ['58%', '78%'],
          center: ['50%', '50%'],
          label: { color: theme.textColor },
          data,
        },
      ],
    };
  }, [fleet, theme]);

  return <EChart option={option} height={250} />;
}
