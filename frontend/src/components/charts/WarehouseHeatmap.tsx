import { useMemo } from 'react';
import { useChartTheme } from '../../hooks/useChartTheme';
import { WarehouseCapacity } from '../../types';
import { EChart } from './EChart';

interface WarehouseHeatmapProps {
  warehouses: WarehouseCapacity[];
}

export function WarehouseHeatmap({ warehouses }: WarehouseHeatmapProps) {
  const theme = useChartTheme();

  const option = useMemo(() => {
    const warehouseNames = warehouses.slice(0, 10).map((warehouse) => warehouse.name.replace('枢纽', ''));
    const zoneNames = warehouses[0]?.zones.map((zone) => zone.name) ?? [];
    const values = warehouses.slice(0, 10).flatMap((warehouse, warehouseIndex) =>
      warehouse.zones.map((zone, zoneIndex) => [warehouseIndex, zoneIndex, zone.occupancyRate]),
    );

    return {
      tooltip: {
        position: 'top',
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        textStyle: { color: theme.textColor },
      },
      grid: { left: 88, right: 24, top: 16, bottom: 48 },
      xAxis: {
        type: 'category',
        data: warehouseNames,
        axisLabel: { color: theme.mutedTextColor, interval: 0, rotate: 25 },
        axisLine: { lineStyle: { color: theme.gridColor } },
      },
      yAxis: {
        type: 'category',
        data: zoneNames,
        axisLabel: { color: theme.mutedTextColor },
        axisLine: { lineStyle: { color: theme.gridColor } },
      },
      visualMap: {
        min: 20,
        max: 100,
        show: false,
        inRange: { color: ['#e8f6ef', '#f6c85f', '#d64545'] },
      },
      series: [
        {
          name: '占用率',
          type: 'heatmap',
          data: values,
          label: {
            show: true,
            formatter: ({ value }: { value: [number, number, number] }) => `${Math.round(value[2])}%`,
            color: '#172033',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.25)',
            },
          },
        },
      ],
    };
  }, [theme, warehouses]);

  return <EChart option={option} height={330} />;
}
