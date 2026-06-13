import { BadgeDollarSign, CircleAlert, ReceiptText } from 'lucide-react';
import { EChart, CostPieChart } from '../components/charts';
import { AlertBanner, StatCard } from '../components/common';
import { useChartTheme } from '../hooks/useChartTheme';
import { useCostStore } from '../stores/costStore';
import { useShipmentStore } from '../stores/shipmentStore';
import { CostType, COST_TYPE_LABELS } from '../types/enums';
import { formatDate } from '../utils/date';

export function CostAnalytics() {
  const costs = useCostStore((state) => state.costs);
  const shipments = useShipmentStore((state) => state.shipments);
  const theme = useChartTheme();
  const totalCost = costs.reduce((sum, cost) => sum + cost.amount, 0);
  const avgCost = shipments.length ? Math.round(totalCost / shipments.length) : 0;
  const costByShipment = shipments.map((shipment) => {
    const shipmentCost = costs.filter((cost) => cost.shipmentId === shipment.id).reduce((sum, cost) => sum + cost.amount, 0);
    return {
      shipment,
      cost: shipmentCost,
      unitCost: shipment.weightKg ? shipmentCost / shipment.weightKg : 0,
    };
  });
  const anomalies = costByShipment.filter((item) => item.unitCost > 2.2).slice(0, 4);

  const monthlyBuckets = new Map<string, number>();
  costs.forEach((cost) => {
    const key = formatDate(cost.date);
    monthlyBuckets.set(key, (monthlyBuckets.get(key) ?? 0) + cost.amount);
  });
  const trendLabels = Array.from(monthlyBuckets.keys()).sort();

  const trendOption = {
    color: [theme.palette[0]],
    tooltip: {
      trigger: 'axis',
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      textStyle: { color: theme.textColor },
    },
    grid: { left: 54, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: trendLabels,
      axisLabel: { color: theme.mutedTextColor },
      axisLine: { lineStyle: { color: theme.gridColor } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: theme.mutedTextColor, formatter: '¥{value}' },
      splitLine: { lineStyle: { color: theme.gridColor } },
    },
    series: [
      {
        name: '日成本',
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.14 },
        data: trendLabels.map((label) => monthlyBuckets.get(label) ?? 0),
      },
    ],
  };

  const unitCostOption = {
    color: [theme.palette[2]],
    tooltip: {
      trigger: 'axis',
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      textStyle: { color: theme.textColor },
    },
    grid: { left: 48, right: 20, top: 20, bottom: 70 },
    xAxis: {
      type: 'category',
      data: costByShipment.slice(0, 12).map((item) => item.shipment.waybillNo.slice(-4)),
      axisLabel: { color: theme.mutedTextColor },
      axisLine: { lineStyle: { color: theme.gridColor } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: theme.mutedTextColor, formatter: '¥{value}/kg' },
      splitLine: { lineStyle: { color: theme.gridColor } },
    },
    series: [
      {
        name: '单位成本',
        type: 'bar',
        barWidth: 18,
        data: costByShipment.slice(0, 12).map((item) => Number(item.unitCost.toFixed(2))),
      },
    ],
  };

  const maxCostType = Object.values(CostType)
    .map((type) => ({
      type,
      amount: costs.filter((cost) => cost.type === type).reduce((sum, cost) => sum + cost.amount, 0),
    }))
    .sort((a, b) => b.amount - a.amount)[0];

  return (
    <div className="space-y-6" data-page="cost-analytics">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Cost Analytics</p>
          <h1>成本分析</h1>
        </div>
        <p>跟踪成本构成、单位运输成本和异常费用偏离。</p>
      </header>

      {anomalies.length > 0 ? (
        <AlertBanner
          tone="danger"
          title={`异常成本 ${anomalies.length} 单`}
          message={`${anomalies[0].shipment.waybillNo} 单位成本 ¥${anomalies[0].unitCost.toFixed(2)}/kg，高于监控阈值。`}
        />
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="总成本" value={`¥${Math.round(totalCost).toLocaleString('zh-CN')}`} helper={`${costs.length} 条成本记录`} icon={<BadgeDollarSign className="h-5 w-5" />} />
        <StatCard label="单票均值" value={`¥${avgCost.toLocaleString('zh-CN')}`} helper="按运单数均摊" icon={<ReceiptText className="h-5 w-5" />} />
        <StatCard label="最高成本类型" value={maxCostType ? COST_TYPE_LABELS[maxCostType.type] : '-'} helper={maxCostType ? `¥${maxCostType.amount.toLocaleString('zh-CN')}` : undefined} trend="up" icon={<CircleAlert className="h-5 w-5" />} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <article className="panel p-5">
          <div className="section-title">
            <h2>成本构成饼图</h2>
            <span>按成本类型</span>
          </div>
          <CostPieChart costs={costs} />
        </article>

        <article className="panel p-5">
          <div className="section-title">
            <h2>月度成本趋势</h2>
            <span>模拟近周期</span>
          </div>
          <EChart option={trendOption} height={320} />
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="panel p-5">
          <div className="section-title">
            <h2>单位运输成本对比</h2>
            <span>¥/kg</span>
          </div>
          <EChart option={unitCostOption} height={320} />
        </article>

        <article className="panel overflow-hidden">
          <div className="table-head grid-cols-[0.9fr_0.7fr_0.7fr]">
            <span>异常运单</span>
            <span>单位成本</span>
            <span>总成本</span>
          </div>
          {anomalies.map((item) => (
            <div className="data-row grid-cols-[0.9fr_0.7fr_0.7fr]" key={item.shipment.id}>
              <span><strong>{item.shipment.waybillNo}</strong><small>{item.shipment.cargoName}</small></span>
              <span>¥{item.unitCost.toFixed(2)}/kg</span>
              <span>¥{item.cost.toLocaleString('zh-CN')}</span>
            </div>
          ))}
        </article>
      </section>
    </div>
  );
}
