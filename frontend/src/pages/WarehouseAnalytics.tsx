import { Boxes, Gauge, ThermometerSun } from 'lucide-react';
import { EChart, WarehouseHeatmap } from '../components/charts';
import { HeatmapCell, StatCard } from '../components/common';
import { useChartTheme } from '../hooks/useChartTheme';
import { useWarehouseStore } from '../stores/warehouseStore';

export function WarehouseAnalytics() {
  const warehouses = useWarehouseStore((state) => state.warehouses);
  const theme = useChartTheme();
  const totalCapacity = warehouses.reduce((sum, warehouse) => sum + warehouse.totalCapacityM3, 0);
  const usedCapacity = warehouses.reduce((sum, warehouse) => sum + warehouse.usedCapacityM3, 0);
  const avgOccupancy = totalCapacity ? Math.round((usedCapacity / totalCapacity) * 100) : 0;
  const maxWarehouse = warehouses
    .slice()
    .sort((a, b) => b.usedCapacityM3 / b.totalCapacityM3 - a.usedCapacityM3 / a.totalCapacityM3)[0];

  const trendLabels = warehouses[0]?.trend.map((point) => point.date.slice(5, 10)) ?? [];
  const trendOption = {
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
    grid: { left: 40, right: 24, top: 48, bottom: 28 },
    xAxis: {
      type: 'category',
      data: trendLabels,
      axisLabel: { color: theme.mutedTextColor },
      axisLine: { lineStyle: { color: theme.gridColor } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: theme.mutedTextColor, formatter: '{value}%' },
      splitLine: { lineStyle: { color: theme.gridColor } },
    },
    series: warehouses.slice(0, 4).map((warehouse) => ({
      name: warehouse.name.replace('枢纽', ''),
      type: 'line',
      smooth: true,
      data: warehouse.trend.map((point) => Math.round(point.occupancyRate)),
    })),
  };

  return (
    <div className="space-y-6" data-page="warehouse-analytics">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Warehouse Analytics</p>
          <h1>仓库分析</h1>
        </div>
        <p>用热力图定位容量压力，把分区占用和趋势放在同一操作视图。</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="总容量" value={`${Math.round(totalCapacity / 1000)}k m³`} helper="全网仓容合计" icon={<Boxes className="h-5 w-5" />} />
        <StatCard label="平均占用率" value={`${avgOccupancy}%`} helper="按容量加权计算" trend={avgOccupancy > 80 ? 'up' : 'flat'} icon={<Gauge className="h-5 w-5" />} />
        <StatCard label="最高压力仓" value={maxWarehouse ? `${Math.round((maxWarehouse.usedCapacityM3 / maxWarehouse.totalCapacityM3) * 100)}%` : '-'} helper={maxWarehouse?.name} trend="up" icon={<ThermometerSun className="h-5 w-5" />} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="panel p-5">
          <div className="section-title">
            <h2>仓库/分区容量热力图</h2>
            <span>颜色越深占用越高</span>
          </div>
          <WarehouseHeatmap warehouses={warehouses} />
        </article>

        <article className="panel p-5">
          <div className="section-title">
            <h2>高压分区</h2>
            <span>按占用率筛选</span>
          </div>
          <div className="space-y-3">
            {warehouses
              .flatMap((warehouse) => warehouse.zones.map((zone) => ({ warehouse: warehouse.name, ...zone })))
              .sort((a, b) => b.occupancyRate - a.occupancyRate)
              .slice(0, 12)
              .map((zone) => (
                <HeatmapCell key={`${zone.warehouse}-${zone.name}`} label={`${zone.warehouse.replace('枢纽', '')} · ${zone.name}`} value={zone.occupancyRate} />
              ))}
          </div>
        </article>
      </section>

      <article className="panel p-5">
        <div className="section-title">
          <h2>容量趋势折线图</h2>
          <span>近 14 天</span>
        </div>
        <EChart option={trendOption} height={300} />
      </article>
    </div>
  );
}
