interface StatusRingProps {
  segments: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  totalLabel?: string;
}

export function StatusRing({ segments, totalLabel = '总计' }: StatusRingProps) {
  const total = segments.reduce((sum, item) => sum + item.value, 0) || 1;
  let cursor = 0;
  const gradient = segments
    .map((item) => {
      const start = cursor;
      const width = (item.value / total) * 100;
      cursor += width;
      return `${item.color} ${start}% ${cursor}%`;
    })
    .join(', ');

  return (
    <div className="flex items-center gap-4">
      <div
        className="grid h-28 w-28 shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
        aria-label={`${totalLabel}${total}`}
      >
        <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-panel text-center">
          <span className="text-2xl font-semibold text-strong">{total}</span>
        </div>
      </div>
      <div className="min-w-0 space-y-2">
        {segments.map((item) => (
          <div className="flex items-center justify-between gap-4 text-sm" key={item.label}>
            <span className="flex min-w-0 items-center gap-2 text-muted">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: item.color }} />
              <span className="truncate">{item.label}</span>
            </span>
            <strong className="text-strong">{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
