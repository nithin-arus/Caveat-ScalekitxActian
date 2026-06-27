"use client";

import { useState } from "react";
import type { Analysis, AuditEntry, SessionIdentity } from "@shared/contracts";

type Props = {
  initialCases: Analysis[];
  session: SessionIdentity;
  canApprove: boolean;
};

type SendState = {
  status: "idle" | "sending" | "sent" | "blocked";
  message?: string;
  audit?: AuditEntry;
};

function severityCount(caseItem: Analysis, severity: "high" | "med" | "low") {
  return caseItem.flags.filter((flag) => flag.severity === severity).length;
}

export function ApprovalsQueue({ initialCases, session, canApprove }: Props) {
  const [cases, setCases] = useState(initialCases);
  const [sendState, setSendState] = useState<Record<string, SendState>>({});

  async function sendRedline(id: string) {
    setSendState((state) => ({ ...state, [id]: { status: "sending", message: "Sending scoped action..." } }));

    const response = await fetch(`/api/cases/${id}/send`, { method: "POST" });
    const payload = (await response.json()) as { error?: string; audit?: AuditEntry; analysis?: Analysis };

    if (!response.ok) {
      setSendState((state) => ({
        ...state,
        [id]: { status: "blocked", message: payload.error ?? "Scalekit action blocked by policy." },
      }));
      return;
    }

    setCases((items) => items.filter((item) => item.id !== id));
    setSendState((state) => ({
      ...state,
      [id]: {
        status: "sent",
        message: "Sent as the approver. Audit row sealed.",
        audit: payload.audit,
      },
    }));
  }

  return (
    <div className="grid gap-5">
      {!canApprove && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Read-only reviewer scope is active. The queue is visible in demo mode, but send actions fail
          closed until you switch to an Approver or Supervisor identity.
        </div>
      )}

      {cases.length === 0 && (
        <div className="rounded-lg border border-ink/10 bg-paper-muted/50 px-5 py-8 text-center text-ink-muted">
          No cases are waiting for approval in {session.tenant.name}.
        </div>
      )}

      {cases.map((item) => {
        const state = sendState[item.id] ?? { status: "idle" };
        const high = severityCount(item, "high");
        const med = severityCount(item, "med");

        return (
          <article key={item.id} className="rounded-lg border border-ink/10 bg-paper p-5 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-seal">
                    {item.tenantId} · Awaiting approval
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">{item.title}</h2>
                </div>
                <p className="max-w-3xl text-sm leading-6 text-ink-muted">{item.summary}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-red-50 px-3 py-1 font-semibold text-red-700">
                    {high} high-risk clauses
                  </span>
                  <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                    {med} medium-risk clauses
                  </span>
                  <span className="rounded-full bg-paper-muted px-3 py-1 font-semibold text-ink-muted">
                    Risk score {item.riskScore}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                    Actian matches attached
                  </span>
                </div>
              </div>

              <div className="min-w-64 rounded-md border border-ink/10 bg-paper-muted/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Scoped action</p>
                <p className="mt-2 text-sm">
                  Actor: <span className="font-semibold">{session.name}</span>
                </p>
                <p className="text-sm">
                  Scope:{" "}
                  <span className={canApprove ? "font-semibold text-emerald-700" : "font-semibold text-amber-700"}>
                    {canApprove ? "act:redline" : "read-only"}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => sendRedline(item.id)}
                  disabled={state.status === "sending"}
                  className="mt-4 w-full rounded bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-seal disabled:cursor-wait disabled:opacity-60"
                >
                  {state.status === "sending" ? "Sending..." : "Approve and Send"}
                </button>
                {state.message && (
                  <p
                    className={`mt-3 text-sm ${
                      state.status === "blocked"
                        ? "text-red-700"
                        : state.status === "sent"
                          ? "text-emerald-700"
                          : "text-ink-muted"
                    }`}
                  >
                    {state.message}
                  </p>
                )}
                {state.audit && (
                  <p className="mt-2 break-all font-mono text-[11px] text-ink-muted">
                    {state.audit.auditId} · {state.audit.signature}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {item.flags.slice(0, 4).map((flag) => (
                <div key={flag.id} className="rounded-md border border-ink/10 bg-background/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{flag.clause.section}</p>
                    <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-700">
                      {flag.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-ink-muted">{flag.reason}</p>
                  <p className="mt-3 border-l-2 border-seal pl-3 text-sm leading-5">{flag.suggestedRedline}</p>
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
