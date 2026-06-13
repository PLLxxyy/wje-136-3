import { AlertTriangle, DollarSign, PackageCheck, Truck, Warehouse } from 'lucide-react';
import { EChart, ShipmentTrendChart } from '../components/charts';
import { AlertBanner, StatCard, StatusRing } from '../components/common';
import { statusColors } from '../constants/chartColors';
import { useChartTheme } from '../hooks/useChartTheme';
import { useCostStore } from '../stores/costStore';
import { useFleetStore } from '../stores/fleetStore';
import { useShipmentStore } from '../stores/shipmentStore';
import { useWarehouseStore } from '../stores/warehouseStore';
import { COST_TYPE_LABELS, CostType, SHIPMENT_STATUS_LABELS, ShipmentStatus, VEHICLE_STATUS_LABELS, VehicleStatus } from '../types/enums';
import { getCurrentMonth, isSameMonth } from '../utils/date';

export function Dashboard() {
  const shipments = useShipmentStore((state) => state.shipments);
  const shipmentError = useShipmentStore((state) => state.error);
  const warehouses = useWarehouseStore((state) => state.warehouses);
  const fleet = useFleetStore((state) => state.fleet);
  const costs = useCostStore((state) => state.costs);
  const budgets = useCostStore((state) => state.budgets);
  const theme = useChartTheme();
  const currentMonth = getCurrentMonth();

  const inTransit = shipments.filter((shipment) => shipment.status === ShipmentStatus.InTransit).length;
  const delayed = shipments.filter((shipment) => {
    const eta = new Date(shipment.etaTime).getTime();
    return shipment.status !== ShipmentStatus.Delivered && eta < Date.now() + 36 * 60 * 60 * 1000;
  }).length;
  const highCapacity = warehouses.filter((warehouse) => warehouse.usedCapacityM3 / warehouse.totalCapacityM3 > 0.85).length;
  const fleetOnRoute = fleet.filter((vehicle) => vehicle.status === VehicleStatus.OnRoute).length;

  const overBudgetTypes = Object.values(CostType)
    .map((type) => {
      const spent = costs
        .filter((cost) => cost.type === type && isSameMonth(cost.date, currentMonth))
        .reduce((sum, cost) => sum + cost.amount, 0);
      const budget = budgets.find((b) => b.type === type && b.month === currentMonth)?.budget ?? 0;
      return {
        type,
        spent,
        budget,
        diff: spent - budget,
        isOver: spent > budget && budget > 0,
      };
    })
    .filter((item) => item.isOver);

  const totalOverBudget = overBudgetTypes.reduce((sum, item) => sum + item.diff, 0);

  const topWarehouseOption = {
    color: [theme.palette[0]],
    tooltip: {
      trigger: 'axis',
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      textStyle: { color: theme.textColor },
    },
    grid: { left: 44, right: 18, top: 18, bottom: 76 },
    xAxis: {
      type: 'category',
      data: warehouses
        .slice()
        .sort((a, b) => b.usedCapacityM3 / b.totalCapacityM3 - a.usedCapacityM3 / a.totalCapacityM3)
        .slice(0, 10)
        .map((warehouse) => warehouse.name.replace('枢纽', '')),
      axisLabel: { rotate: 32, color: theme.mutedTextColor, interval: 0 },
      axisLine: { lineStyle: { color: theme.gridColor } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: theme.mutedTextColor, formatter: '{value}%' },
      splitLine: { lineStyle: { color: theme.gridColor } },
    },
    series: [
      {
        name: '容量占用率',
        type: 'bar',
        barWidth: 18,
        data: warehouses
          .slice()
          .sort((a, b) => b.usedCapacityM3 / b.totalCapacityM3 - a.usedCapacityM3 / a.totalCapacityM3)
          .slice(0, 10)
          .map((warehouse) => Math.round((warehouse.usedCapacityM3 / warehouse.totalCapacityM3) * 100)),
      },
    ],
  };

  const vehicleSegments = Object.values(VehicleStatus).map((status) => ({
    label: VEHICLE_STATUS_LABELS[status],
    value: fleet.filter((vehicle) => vehicle.status === status).length,
    color: statusColors[status],
  }));

  const shipmentSegments = Object.values(ShipmentStatus).map((status) => ({
    label: SHIPMENT_STATUS_LABELS[status],
    value: shipments.filter((shipment) => shipment.status === status).length,
    color: statusColors[status],
  }));

  return (
    <div className="space-y-6" data-page="dashboard">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Logistics Command Center</p>
          <h1>物流总览仪表盘</h1>
        </div>
        <p>运输、仓储、车队三条运营链路的实时指挥视图。</p>
      </header>

      {shipmentError ? <AlertBanner tone="info" title="本地数据回退" message={shipmentError.message} /> : null}

      {overBudgetTypes.length > 0 ? (
        <AlertBanner
          tone="danger"
          title={`成本超支预警 ${overBudgetTypes.length} 项`}
          message={`${COST_TYPE_LABELS[overBudgetTypes[0].type]}超支 ¥${overBudgetTypes[0].diff.toLocaleString('zh-CN')}，本月累计超支 ¥${totalOverBudget.toLocaleString('zh-CN')}，请尽快核查成本异常。`}
        />
      ) : null}

      <AlertBanner
        tone={delayed > 4 ? 'danger' : 'warning'}
        title={`延误预警 ${delayed} 单`}
        message="预计 36 小时内到达但尚未签收的运单已进入重点跟踪队列。"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="今日在途运单" value={inTransit} helper="含公路、铁路、海运、空运" icon={<Truck className="h-5 w-5" />} />
        <StatCard label="延误预警" value={delayed} helper="ETA 临近或已超时" trend="up" icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="高位仓容量" value={highCapacity} helper="占用率超过 85%" trend="up" icon={<Warehouse className="h-5 w-5" />} />
        <StatCard label="执行中车辆" value={fleetOnRoute} helper="已绑定在途运单" icon={<PackageCheck className="h-5 w-5" />} />
        <StatCard
          label="本月成本超支"
          value={overBudgetTypes.length > 0 ? `${overBudgetTypes.length} 项` : '0 项'}
          helper={overBudgetTypes.length > 0 ? `超支 ¥${totalOverBudget.toLocaleString('zh-CN')}` : '预算执行正常'}
          trend={overBudgetTypes.length > 0 ? 'up' : 'flat'}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
        <article className="panel p-5">
          <div className="section-title">
            <h2>仓库容量 TOP10</h2>
            <span>按占用率排序</span>
          </div>
          <EChart option={topWarehouseOption} height={320} />
        </article>

        <article className="panel p-5">
          <div className="section-title">
            <h2>车辆状态环形图</h2>
            <span>{fleet.length} 台车辆</span>
          </div>
          <StatusRing segments={vehicleSegments} totalLabel="车辆总数" />
          <div className="mt-6 border-t border-line pt-5">
            <StatusRing segments={shipmentSegments} totalLabel="运单总数" />
          </div>
        </article>
      </section>

      <article className="panel p-5">
        <div className="section-title">
          <h2>运输状态趋势</h2>
          <span>按发货日期聚合</span>
        </div>
        <ShipmentTrendChart shipments={shipments} />
      </article>
    </div>
  );
}
