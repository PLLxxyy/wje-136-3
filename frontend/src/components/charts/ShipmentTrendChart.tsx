import { useMemo } from 'react';
import { useChartTheme } from '../../hooks/useChartTheme';
import { Shipment } from '../../types';
import { ShipmentStatus } from '../../types/enums';
import { formatDate } from '../../utils/date';
import { EChart } from './EChart';

interface ShipmentTrendChartProps {
  shipments: Shipment[];
}

export function ShipmentTrendChart({ shipments }: ShipmentTrendChartProps) {
  const theme = useChartTheme();
  const option = useMemo(() => {
    const buckets = new Map<string, { transit: number; exception: number }>();
    shipments.forEach((shipment) => {
      const key = formatDate(shipment.departureTime);
      const current = buckets.get(key) ?? { transit: 0, exception: 0 };
      current.transit += shipment.status === ShipmentStatus.InTransit ? 1 : 0;
      current.exception += shipment.status === ShipmentStatus.Exception ? 1 : 0;
      buckets.set(key, current);
    });
    const labels = Array.from(buckets.keys()).sort();

    return {
      color: theme.palette,
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        textStyle: { color: theme.textColor },
      },
      legend: {
        top: 0,
        textStyle: { color: theme.mutedTextColor },
      },
      grid: { left: 32, right: 18, top: 44, bottom: 26 },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { lineStyle: { color: theme.gridColor } },
        axisLabel: { color: theme.mutedTextColor },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: theme.mutedTextColor },
        splitLine: { lineStyle: { color: theme.gridColor } },
      },
      series: [
        {
          name: '在途',
          type: 'line',
          smooth: true,
          areaStyle: { opacity: 0.12 },
          data: labels.map((label) => buckets.get(label)?.transit ?? 0),
        },
        {
          name: '异常',
          type: 'line',
          smooth: true,
          data: labels.map((label) => buckets.get(label)?.exception ?? 0),
        },
      ],
    };
  }, [shipments, theme]);

  return <EChart option={option} height={270} />;
}
