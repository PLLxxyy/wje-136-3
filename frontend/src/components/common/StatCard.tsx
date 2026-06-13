import { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
  trend?: 'up' | 'down' | 'flat';
  icon?: ReactNode;
}

export function StatCard({ label, value, helper, trend = 'flat', icon }: StatCardProps) {
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight;
  const trendClass = trend === 'down' ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300';

  return (
    <section className="panel min-h-[120px] p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        {icon ? <div className="text-accent">{icon}</div> : null}
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <strong className="text-3xl font-semibold tracking-normal text-strong">{value}</strong>
        {trend !== 'flat' ? <TrendIcon className={`h-5 w-5 ${trendClass}`} /> : null}
      </div>
      {helper ? <p className="mt-3 text-xs leading-5 text-muted">{helper}</p> : null}
    </section>
  );
}
