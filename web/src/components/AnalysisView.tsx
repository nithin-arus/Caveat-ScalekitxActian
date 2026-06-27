"use client";

import { useMemo, useState } from "react";
import type { Analysis, Flag } from "@shared/contracts";
import { RiskGauge } from "@/components/RiskGauge";
import { severityColor } from "@/lib/data";
import { useSession } from "@/lib/session";

type SendState = "idle" | "sending" | "sent" | "blocked-role" | "blocked-revoked";

export function AnalysisView({ analysis }: { analysis: Analysis }) {
  const { user, tenant } = useSession();
  const sortedFlags = useMemo(
    () =>
      [...analysis.flags].sort((a, b) => {
        const order = { high: 0, med: 1, low: 2 };
        return order[a.severity] - order[b.severity];
      }),
    [analysis.flags]
  );

  const [selectedId, setSelectedId] = useState(sortedFlags[0]?.id);
  const selected: Flag | undefined = sortedFlags.find((f) => f.id === selectedId);

  const [revoked, setRevoked] = useState(false);
  const [sendState, setSendState] = useState<SendState>("idle");
  const [auditId, setAuditId] = useState<string | null>(null);

  function handleApprove() {
    if (revoked) {
      setSendState("blocked-revoked");
      return;
    }
    if (user.role !== "approver") {
      setSendState("blocked-role");
      return;
    }
    setSendState("sending");
    setTimeout(() => {
      setSendState("sent");
      setAuditId(`mock-${Math.random().toString(36).slice(2, 10)}`);
    }, 900);
  }

  function resetSendState() {
    setSendState("idle");
    setAuditId(null);
  }

  return (
    <div className="mx-auto max-w-6xl w-full px-6 py-12 flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-seal mb-1">
            Analysis — {tenant.name}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{analysis.title}</h1>
          <p className="mt-2 max-w-2xl text-ink-muted">{analysis.summary}</p>
        </div>
        <RiskGauge score={analysis.riskScore} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        {/* Ranked flag list */}
        <div className="space-y-3">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-ink-muted">
            Flagged clauses ({sortedFlags.length})
          </h2>
          {sortedFlags.map((flag) => {
            const colors = severityColor(flag.severity);
            const active = flag.id === selectedId;
            return (
              <button
                key={flag.id}
                onClick={() => {
                  setSelectedId(flag.id);
                  resetSendState();
                }}
                className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                  active ? "border-seal bg-paper-muted/70" : "border-ink/10 hover:bg-paper-muted/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {flag.severity}
                  </span>
                </div>
                <p className="text-sm font-medium leading-snug">{flag.clause.section}</p>
              </button>
            );
          })}
        </div>

        {/* Clause detail + redline panel */}
        {selected && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-ink/10 bg-paper p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{selected.clause.section}</h3>
                <span
                  className={`text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-full ${
                    severityColor(selected.severity).bg
                  } ${severityColor(selected.severity).text}`}
                >
                  {selected.severity} severity
                </span>
              </div>
              <blockquote className="border-l-2 border-ink/15 pl-4 text-ink-muted italic">
                &ldquo;{selected.clause.text}&rdquo;
              </blockquote>
              <div>
                <p className="text-sm font-semibold mb-1">Why this matters</p>
                <p className="text-sm text-ink-muted">{selected.reason}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-seal/20 bg-paper-muted/50 p-6 space-y-4">
              <p className="text-sm font-semibold text-seal">Drafted counter / redline</p>
              <p className="text-sm leading-relaxed">{selected.suggestedRedline}</p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-ink/10">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-ink-muted">Signed in as:</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.role === "approver" ? "bg-seal text-paper" : "bg-paper-muted text-ink"
                    }`}
                  >
                    {user.name}
                  </span>
                  <span className="text-xs text-ink-muted">
                    ({user.role === "approver" ? "Approver" : "Reviewer"} — switch in header)
                  </span>
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-ink-muted">
                  <input
                    type="checkbox"
                    checked={revoked}
                    onChange={(e) => {
                      setRevoked(e.target.checked);
                      resetSendState();
                    }}
                    className="accent-seal"
                  />
                  Simulate Scalekit access revoked
                </label>

                <button
                  onClick={handleApprove}
                  disabled={sendState === "sending"}
                  className="ml-auto rounded-full bg-seal text-paper px-5 py-2 text-sm font-medium hover:bg-seal-dark transition-colors disabled:opacity-60"
                >
                  {sendState === "sending" ? "Sending…" : "Approve & send"}
                </button>
              </div>

              {sendState === "sent" && (
                <p className="text-sm font-medium text-emerald-700">
                  Sent. Audit ID <code className="font-mono">{auditId}</code> — chain of custody:
                  approved by {user.name} on behalf of {tenant.name}.
                </p>
              )}
              {sendState === "blocked-role" && (
                <p className="text-sm font-medium text-amber-700">
                  Requires Attorney approval. Case Workers can flag and draft, but only an
                  SSO-verified Approver can send. Switch role in the header to demo.
                </p>
              )}
              {sendState === "blocked-revoked" && (
                <p className="text-sm font-medium text-red-700">
                  Failed closed: Scalekit access has been revoked for this org. No action taken.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
