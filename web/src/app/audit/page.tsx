import { sampleAuditLog } from "@/lib/data";

const actionLabel: Record<string, string> = {
  sendRedline: "Sent redline",
  fetchContract: "Fetched contract",
  revokeAccess: "Revoked access",
};

export default function AuditPage() {
  return (
    <div className="mx-auto max-w-3xl w-full px-6 py-16 flex flex-col gap-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Audit log</h1>
        <p className="text-ink-muted">
          Every action Fineprint takes on a client&apos;s behalf is attributed to a named, SSO-verified
          staffer — never a bot — and recorded here. Backed by Scalekit&apos;s 90-day audit trail on
          build day, this is the chain of custody that lets a firm trust an AI agent acted within
          scope.
        </p>
      </div>

      <div className="rounded-2xl border border-ink/10 divide-y divide-ink/10 overflow-hidden">
        {sampleAuditLog.map((entry) => (
          <div key={entry.auditId} className="flex items-start gap-4 p-5 bg-paper">
            <span
              className={`mt-1 h-2 w-2 rounded-full ${entry.ok ? "bg-emerald-500" : "bg-red-500"}`}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <p className="font-medium">{actionLabel[entry.action] ?? entry.action}</p>
                <span className="text-xs text-ink-muted">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-ink-muted mt-1">{entry.detail}</p>
              <p className="text-xs text-ink-muted mt-2">
                Actor: <span className="font-mono">{entry.actor}</span> · Audit ID{" "}
                <span className="font-mono">{entry.auditId}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
