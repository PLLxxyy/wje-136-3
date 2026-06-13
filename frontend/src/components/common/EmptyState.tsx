import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-line bg-panel-muted p-8 text-center">
      <div>
        <Inbox className="mx-auto h-8 w-8 text-muted" />
        <p className="mt-3 font-semibold text-strong">{title}</p>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}
