"use client";

import Link from "next/link";
import { useCase } from "@/lib/caseStore";

export function AuditLogView() {
  const { auditEntries } = useCase();

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 40px 90px" }}>
      <div style={{ paddingBottom: 24, borderBottom: "1px solid #DCD7CB", marginBottom: 8 }}>
        <div
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 10,
            letterSpacing: "0.2em",
            color: "#9A9384",
            textTransform: "uppercase",
            marginBottom: 13,
          }}
        >
          Chain of Custody · Scalekit Verifiable Log
        </div>
        <h1 style={{ fontFamily: "'Newsreader',Georgia,serif", fontWeight: 500, fontSize: 40, letterSpacing: "-0.015em", margin: "0 0 12px" }}>
          Audit Log
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "#79746A", maxWidth: 560, lineHeight: 1.55 }}>
          Every action on a client matter is cryptographically attributed to an SSO-authenticated identity. This is
          the legal record of who authorized the AI to act — and when.
        </p>
      </div>

      <div style={{ marginTop: 30 }}>
        {auditEntries.map((e) => (
          <div
            key={e.id}
            style={{
              display: "grid",
              gridTemplateColumns: "150px 1fr",
              gap: 28,
              padding: "22px 0",
              borderBottom: "1px solid #E4DFD3",
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 11,
                color: "#9A9384",
                lineHeight: 1.6,
                letterSpacing: "0.02em",
              }}
            >
              <div style={{ color: "#5C574C" }}>{e.date}</div>
              <div>{e.time}</div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 9, flexWrap: "wrap" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: e.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.005em" }}>{e.action}</span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 9,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: e.roleColor,
                    background: e.roleBg,
                    padding: "3px 8px",
                    borderRadius: 2,
                  }}
                >
                  {e.actorRole}
                </span>
              </div>
              <p style={{ margin: "0 0 11px", fontSize: 13.5, color: "#5C574C", lineHeight: 1.5, paddingLeft: 20 }}>
                {e.detail}
              </p>
              <div
                style={{
                  marginLeft: 20,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px 20px",
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 10,
                  color: "#A9A294",
                  letterSpacing: "0.03em",
                }}
              >
                <span>
                  <span style={{ color: "#C2BCAC" }}>ACTOR </span>
                  <span style={{ color: "#5C574C" }}>{e.actor}</span>
                </span>
                <span>
                  <span style={{ color: "#C2BCAC" }}>ID </span>
                  {e.id}
                </span>
                <span>
                  <span style={{ color: "#C2BCAC" }}>SIG </span>
                  {e.hash}
                </span>
                <span style={{ color: "#5E7257" }}>✓ verified</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 28 }}>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "11px 18px",
            background: "transparent",
            color: "#3A372F",
            border: "1px solid #DCD7CB",
            borderRadius: 3,
            fontSize: 12.5,
            fontWeight: 500,
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          ← Back to Case Review
        </Link>
      </div>
    </div>
  );
}
