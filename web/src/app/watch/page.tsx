import { sampleWatchEvents } from "@/lib/data";

const statusStyle: Record<string, string> = {
  new: "bg-paper-muted text-ink-muted",
  flagged: "bg-red-50 text-red-700",
  "awaiting-signature": "bg-amber-50 text-amber-700",
};

const statusLabel: Record<string, string> = {
  new: "New",
  flagged: "Flagged",
  "awaiting-signature": "Awaiting signature",
};

export default function WatchPage() {
  return (
    <div className="mx-auto max-w-3xl w-full px-6 py-16 flex flex-col gap-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Watch</h1>
        <p className="text-ink-muted">
          A scheduled job scans your connected inbox every 30 minutes for new agreements and
          chases anything awaiting signature. Running on a mock inbox scan now — same code path
          the Render cron service runs on build day.
        </p>
      </div>

      <div className="rounded-2xl border border-ink/10 bg-paper-muted/40 px-5 py-4 flex items-center justify-between text-sm">
        <span className="text-ink-muted">Next scheduled run</span>
        <span className="font-mono">*/30 * * * *</span>
      </div>

      <div className="space-y-3">
        {sampleWatchEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-ink/10 bg-paper px-5 py-4"
          >
            <div>
              <p className="font-medium">{event.title}</p>
              <p className="text-sm text-ink-muted">
                Detected {new Date(event.detectedAt).toLocaleString()} via {event.source}
              </p>
            </div>
            <span
              className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full whitespace-nowrap ${statusStyle[event.status]}`}
            >
              {statusLabel[event.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
