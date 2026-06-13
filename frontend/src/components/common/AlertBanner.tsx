import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { ReactNode } from 'react';

interface AlertBannerProps {
  title: string;
  message: string;
  tone?: 'warning' | 'danger' | 'info';
  action?: ReactNode;
}

const toneMap = {
  warning: {
    className: 'border-amber-300/70 bg-amber-50 text-amber-950 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100',
    icon: AlertTriangle,
  },
  danger: {
    className: 'border-red-300/70 bg-red-50 text-red-950 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-100',
    icon: ShieldAlert,
  },
  info: {
    className: 'border-blue-300/70 bg-blue-50 text-blue-950 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-100',
    icon: Info,
  },
};

export function AlertBanner({ title, message, tone = 'warning', action }: AlertBannerProps) {
  const Icon = toneMap[tone].icon;

  return (
    <div className={`flex items-start justify-between gap-4 rounded-lg border p-4 ${toneMap[tone].className}`}>
      <div className="flex min-w-0 gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6 opacity-85">{message}</p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
