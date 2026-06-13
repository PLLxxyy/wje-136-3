import { BadgeDollarSign, CircleAlert, PencilLine, ReceiptText, Save, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { EChart, CostPieChart } from '../components/charts';
import { AlertBanner, StatCard } from '../components/common';
import { useChartTheme } from '../hooks/useChartTheme';
import { useCostStore } from '../stores/costStore';
import { useShipmentStore } from '../stores/shipmentStore';
import { CostType, COST_TYPE_LABELS } from '../types/enums';
import { formatDate, getCurrentMonth, isSameMonth } from '../utils/date';
import { saveBudget } from '../utils/db';

export function CostAnalytics() {
  const costs = useCostStore((state) => state.costs);
  const budgets = useCostStore((state) => state.budgets);
  const setBudget = useCostStore((state) => state.setBudget);
  const shipments = useShipmentStore((state) => state.shipments);
  const theme = useChartTheme();
  const currentMonth = getCurrentMonth();

  const [editingBudgets, setEditingBudgets] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

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

  const monthlyCostByType = Object.values(CostType).map((type) => {
    const spent = costs
      .filter((cost) => cost.type === type && isSameMonth(cost.date, currentMonth))
      .reduce((sum, cost) => sum + cost.amount, 0);
    const budget = budgets.find((b) => b.type === type && b.month === currentMonth)?.budget ?? 0;
    const diff = spent - budget;
    const ratio = budget > 0 ? (spent / budget) * 100 : 0;
    return {
      type,
      spent,
      budget,
      diff,
      ratio,
      isOver: spent > budget,
    };
  });

  const totalBudget = monthlyCostByType.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = monthlyCostByType.reduce((sum, item) => sum + item.spent, 0);
  const overBudgetTypes = monthlyCostByType.filter((item) => item.isOver);

  function handleBudgetEdit(type: CostType, value: string) {
    setEditingBudgets((prev) => ({ ...prev, [type]: value }));
  }

  function handleBudgetSave(type: CostType) {
    const value = Number(editingBudgets[type] ?? 0);
    if (value >= 0) {
      setBudget(type, currentMonth, value);
      const budget = {
        id: `BUDGET-${type}-${currentMonth}`,
        type,
        month: currentMonth,
        budget: value,
      };
      saveBudget(budget).catch(() => {});
    }
    setEditingBudgets((prev) => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
  }

  function toggleEditMode() {
    if (isEditing) {
      setEditingBudgets({});
    } else {
      const initial: Record<string, string> = {};
      monthlyCostByType.forEach((item) => {
        initial[item.type] = String(item.budget);
      });
      setEditingBudgets(initial);
    }
    setIsEditing(!isEditing);
  }

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

      {overBudgetTypes.length > 0 ? (
        <AlertBanner
          tone="danger"
          title={`本月 ${overBudgetTypes.length} 项成本超支`}
          message={`${COST_TYPE_LABELS[overBudgetTypes[0].type]} 超支 ¥${overBudgetTypes[0].diff.toLocaleString('zh-CN')}，请关注费用控制。`}
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

      <article className="panel p-5">
        <div className="section-title">
          <div>
            <h2>月度预算执行</h2>
            <span>{currentMonth} 预算对比</span>
          </div>
          <button
            onClick={toggleEditMode}
            className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm font-medium text-body transition-colors hover:bg-panel-muted"
          >
            {isEditing ? <Save className="h-4 w-4" /> : <PencilLine className="h-4 w-4" />}
            {isEditing ? '完成编辑' : '编辑预算'}
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {monthlyCostByType.map((item) => (
            <div key={item.type} className="rounded-lg border border-line p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-body">{COST_TYPE_LABELS[item.type]}</span>
                {item.isOver ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    超支
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <TrendingDown className="h-3.5 w-3.5" />
                    节余
                  </span>
                )}
              </div>

              <div className="mt-3">
                <p className="text-2xl font-semibold text-strong">¥{item.spent.toLocaleString('zh-CN')}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-muted">
                  <span>预算：
                    {isEditing ? (
                      <input
                        type="number"
                        value={editingBudgets[item.type] ?? String(item.budget)}
                        onChange={(e) => handleBudgetEdit(item.type, e.target.value)}
                        onBlur={() => handleBudgetSave(item.type)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleBudgetSave(item.type);
                          }
                        }}
                        className="ml-1 w-24 rounded border border-line bg-panel px-1.5 py-0.5 text-right text-xs text-body outline-none focus:border-accent"
                        autoFocus
                      />
                    ) : (
                      `¥${item.budget.toLocaleString('zh-CN')}`
                    )}
                  </span>
                  <span className={item.isOver ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
                    {item.isOver ? '+' : ''}{item.diff.toLocaleString('zh-CN')} ({item.ratio.toFixed(0)}%)
                  </span>
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-panel-muted">
                <div
                  className={`h-full rounded-full transition-all ${item.isOver ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(item.ratio, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
          <div>
            <p className="text-sm text-muted">月度总预算</p>
            <p className="text-xl font-semibold text-strong">¥{totalBudget.toLocaleString('zh-CN')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted">实际支出</p>
            <p className={`text-xl font-semibold ${totalSpent > totalBudget ? 'text-red-600 dark:text-red-400' : 'text-strong'}`}>
              ¥{totalSpent.toLocaleString('zh-CN')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted">差额</p>
            <p className={`text-xl font-semibold ${totalSpent > totalBudget ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {totalSpent > totalBudget ? '+' : ''}¥{(totalSpent - totalBudget).toLocaleString('zh-CN')}
            </p>
          </div>
        </div>
      </article>

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
