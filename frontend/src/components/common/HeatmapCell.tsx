interface HeatmapCellProps {
  label: string;
  value: number;
}

export function HeatmapCell({ label, value }: HeatmapCellProps) {
  const color = value > 88 ? '#dc2626' : value > 76 ? '#c0841a' : '#15925f';
  return (
    <div
      className="rounded-md border border-line px-3 py-2 text-sm"
      style={{ background: `color-mix(in srgb, ${color} ${Math.max(18, value * 0.68)}%, var(--panel-muted))` }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate font-medium text-strong">{label}</span>
        <strong className="text-strong">{Math.round(value)}%</strong>
      </div>
    </div>
  );
}
