"use client";

import { useState } from "react";
import type { Analysis, AuditEntry, SessionIdentity } from "@shared/contracts";

type Props = {
  initialCases: Analysis[];
  session: SessionIdentity;
  canApprove: boolean;
};

type SendState = {
  status: "idle" | "sending" | "sent" | "blocked" | "needs-auth";
  message?: string;
  audit?: AuditEntry;
  link?: string;
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
    const payload = (await response.json()) as {
      error?: string;
      audit?: AuditEntry;
      analysis?: Analysis;
      needsAuth?: boolean;
      link?: string;
    };

    if (!response.ok) {
      setSendState((state) => ({
        ...state,
        [id]: { status: "blocked", message: payload.error ?? "Scalekit action blocked by policy." },
      }));
      return;
    }

    if (payload.needsAuth) {
      setSendState((state) => ({
        ...state,
        [id]: {
          status: "needs-auth",
          message: "Gmail isn't connected for this identity yet. Authorize once, then retry.",
          link: payload.link,
        },
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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {!canApprove && (
        <div style={{ padding: "16px 20px", background: "#FDF9F2", border: "1px solid #E8D9BD", color: "#8B651B", fontSize: 13.5, borderRadius: 2, lineHeight: 1.5 }}>
          Read-only reviewer scope is active. The queue is visible in demo mode, but send actions fail
          closed until you switch to an Approver or Supervisor identity.
        </div>
      )}

      {cases.length === 0 && (
        <div style={{ border: "1px solid #DCD7CB", background: "#F3F1EB", padding: "40px 20px", textAlign: "center", color: "#9A9384", borderRadius: 2, fontSize: 14 }}>
          No cases are waiting for approval in {session.tenant.name}.
        </div>
      )}

      {cases.map((item) => {
        const state = sendState[item.id] ?? { status: "idle" };
        const high = severityCount(item, "high");
        const med = severityCount(item, "med");

        return (
          <article
            key={item.id}
            style={{
              border: "1px solid #DCD7CB",
              background: "#FBFAF6",
              padding: 24,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              gap: 24
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                <div>
                  <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.15em", color: "#7A1F2B", textTransform: "uppercase", margin: "0 0 4px" }}>
                    {item.tenantId} · Awaiting approval
                  </p>
                  <h2 style={{ fontFamily: "'Newsreader',Georgia,serif", fontSize: 24, fontWeight: 500, margin: 0, color: "#17150F" }}>
                    {item.title}
                  </h2>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, color: "#5C574C", lineHeight: 1.55, maxWidth: 680 }}>
                  {item.summary}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  <span style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.05em",
                    color: "#A82F24",
                    background: "#FDF5F5",
                    border: "1px solid #EFA7A0",
                    padding: "3px 8px",
                    borderRadius: 2
                  }}>
                    {high} high-risk
                  </span>
                  <span style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.05em",
                    color: "#8B651B",
                    background: "#FDF9F2",
                    border: "1px solid #E8D9BD",
                    padding: "3px 8px",
                    borderRadius: 2
                  }}>
                    {med} med-risk
                  </span>
                  <span style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.05em",
                    color: "#5C574C",
                    background: "#F3F1EB",
                    border: "1px solid #DCD7CB",
                    padding: "3px 8px",
                    borderRadius: 2
                  }}>
                    Score {item.riskScore}
                  </span>
                  <span style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 9.5,
                    letterSpacing: "0.05em",
                    color: "#2E6B3E",
                    background: "#E8F5E9",
                    border: "1px solid #A3D9B1",
                    padding: "3px 8px",
                    borderRadius: 2
                  }}>
                    Actian matches
                  </span>
                </div>
              </div>

              <div style={{ border: "1px solid #DCD7CB", background: "#F3F1EB", padding: 16, borderRadius: 2, minWidth: 260 }}>
                <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.15em", color: "#9A9384", textTransform: "uppercase", margin: "0 0 10px", borderBottom: "1px solid #DCD7CB", paddingBottom: 6 }}>
                  Scoped action
                </p>
                <p style={{ margin: "0 0 4px", fontSize: 13, color: "#17150F" }}>
                  Actor: <span style={{ fontWeight: 600 }}>{session.name}</span>
                </p>
                <p style={{ margin: "0 0 12px", fontSize: 13, color: "#17150F" }}>
                  Scope:{" "}
                  <span style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontWeight: 600,
                    color: canApprove ? "#2E6B3E" : "#8B651B"
                  }}>
                    {canApprove ? "act:redline" : "read-only"}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => sendRedline(item.id)}
                  disabled={state.status === "sending" || state.status === "sent" || !canApprove}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    background: state.status === "sent" ? "#2E6B3E" : (state.status === "sending" ? "#9A9384" : "#17150F"),
                    color: "#FBFAF6",
                    border: "none",
                    borderRadius: 2,
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: (state.status === "sending" || state.status === "sent" || !canApprove) ? "not-allowed" : "pointer",
                    opacity: (!canApprove && state.status !== "sent") ? 0.5 : 1
                  }}
                >
                  {state.status === "sending" ? "Sending..." : (state.status === "sent" ? "Sent ✓" : "Approve and Send")}
                </button>
                
                {state.message && (
                  <p
                    style={{
                      margin: "10px 0 0",
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: state.status === "blocked" ? "#A82F24" : (state.status === "sent" ? "#2E6B3E" : "#5C574C")
                    }}
                  >
                    {state.message}
                  </p>
                )}

                {state.status === "needs-auth" && state.link && (
                  <a
                    href={state.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", marginTop: 6, fontSize: 11.5, color: "#8E2D20", wordBreak: "break-all" }}
                  >
                    {state.link}
                  </a>
                )}

                {state.audit && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed #DCD7CB", fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: "#9A9384", wordBreak: "break-all" }}>
                    <div>ID: {state.audit.auditId}</div>
                    <div style={{ marginTop: 2 }}>SIG: {state.audit.signature}</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", marginTop: 8 }}>
              {item.flags.slice(0, 4).map((flag) => (
                <div key={flag.id} style={{ border: "1px solid #E4DFD3", background: "#F3F1EB", padding: 16, borderRadius: 2 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: "#17150F", margin: 0 }}>{flag.clause.section}</p>
                    <span style={{
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: 9,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: flag.severity === "high" ? "#A82F24" : "#8B651B",
                      background: flag.severity === "high" ? "#FDF5F5" : "#FDF9F2",
                      border: flag.severity === "high" ? "1px solid #EFA7A0" : "1px solid #E8D9BD",
                      padding: "2px 6px",
                      borderRadius: 2
                    }}>
                      {flag.severity}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "#5C574C", lineHeight: 1.5 }}>{flag.reason}</p>
                  <p style={{ margin: 0, fontStyle: "italic", borderLeft: "2px solid #7A1F2B", paddingLeft: 12, fontSize: 12.5, color: "#17150F", lineHeight: 1.45 }}>
                    {flag.suggestedRedline}
                  </p>
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
