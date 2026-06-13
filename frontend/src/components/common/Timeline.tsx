import { TrackingEvent } from '../../types';
import { formatDateTime } from '../../utils/date';

interface TimelineProps {
  events: TrackingEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <ol className="space-y-4">
      {events.map((event, index) => (
        <li className="grid grid-cols-[20px_1fr] gap-3" key={event.id}>
          <div className="flex flex-col items-center">
            <span className="mt-1 h-3 w-3 rounded-full bg-accent" />
            {index < events.length - 1 ? <span className="mt-2 h-full min-h-10 w-px bg-line" /> : null}
          </div>
          <div className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-strong">{event.location}</p>
              <time className="text-xs text-muted">{formatDateTime(event.time)}</time>
            </div>
            <p className="mt-1 text-sm leading-6 text-muted">{event.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
