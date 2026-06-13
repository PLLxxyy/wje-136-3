import { useMemo } from 'react';
import { costTypeColors } from '../../constants/chartColors';
import { useChartTheme } from '../../hooks/useChartTheme';
import { CostEntry } from '../../types';
import { COST_TYPE_LABELS, CostType } from '../../types/enums';
import { EChart } from './EChart';

interface CostPieChartProps {
  costs: CostEntry[];
}

export function CostPieChart({ costs }: CostPieChartProps) {
  const theme = useChartTheme();
  const option = useMemo(() => {
    const data = Object.values(CostType).map((type) => ({
      name: COST_TYPE_LABELS[type],
      value: costs.filter((cost) => cost.type === type).reduce((sum, cost) => sum + cost.amount, 0),
      itemStyle: { color: costTypeColors[type] },
    }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ¥{c} ({d}%)',
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        textStyle: { color: theme.textColor },
      },
      legend: {
        bottom: 0,
        textStyle: { color: theme.mutedTextColor },
      },
      series: [
        {
          name: '成本构成',
          type: 'pie',
          radius: ['42%', '70%'],
          center: ['50%', '44%'],
          label: { color: theme.textColor },
          data,
        },
      ],
    };
  }, [costs, theme]);

  return <EChart option={option} height={320} />;
}
