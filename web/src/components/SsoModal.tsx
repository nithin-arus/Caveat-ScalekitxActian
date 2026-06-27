"use client";

import { useCase } from "@/lib/caseStore";

export function SsoModal() {
  const { showSso, closeSso, pickParalegal, pickAttorney, tenant } = useCase();

  if (!showSso) return null;

  return (
    <div
      onClick={closeSso}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(15,14,10,0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 430,
          maxWidth: "100%",
          background: "#F6F4EE",
          borderRadius: 5,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ background: "#17150F", color: "#EDE9DD", padding: "22px 26px" }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 9.5,
              letterSpacing: "0.2em",
              color: "#8E887A",
              textTransform: "uppercase",
              marginBottom: 9,
            }}
          >
            SAML Single Sign-On
          </div>
          <div style={{ fontFamily: "'Newsreader',Georgia,serif", fontSize: 22, fontWeight: 500 }}>
            {tenant.toLowerCase().replace(/\s+/g, "-")}.okta.com
          </div>
          <div style={{ fontSize: 12, color: "#9C968A", marginTop: 4 }}>
            Choose an identity to continue. Role &amp; permissions resolve from your directory.
          </div>
        </div>
        <div style={{ padding: "16px 20px 12px" }}>
          <button
            onClick={pickParalegal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: 14,
              border: "1px solid #DCD7CB",
              borderRadius: 3,
              background: "#FCFBF7",
              cursor: "pointer",
              marginBottom: 11,
              width: "100%",
              textAlign: "left",
            }}
          >
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#E9DCC2",
                color: "#7A5E18",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Newsreader',serif",
                fontSize: 16,
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              DO
            </span>
            <div style={{ flex: 1, lineHeight: 1.3 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#17150F" }}>Dana Okafor</div>
              <div style={{ fontSize: 11.5, color: "#79746A" }}>Paralegal · Case Reviewer</div>
            </div>
            <span
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 9,
                letterSpacing: "0.1em",
                color: "#9A8A5E",
                background: "#F1E7D3",
                padding: "4px 8px",
                borderRadius: 2,
                textTransform: "uppercase",
              }}
            >
              Reviewer
            </span>
          </button>
          <button
            onClick={pickAttorney}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: 14,
              border: "1px solid #DCD7CB",
              borderRadius: 3,
              background: "#FCFBF7",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
            }}
          >
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#DBE0D2",
                color: "#46603F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Newsreader',serif",
                fontSize: 16,
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              MV
            </span>
            <div style={{ flex: 1, lineHeight: 1.3 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#17150F" }}>Marcus Vela</div>
              <div style={{ fontSize: 11.5, color: "#79746A" }}>Lead Attorney · Approver</div>
            </div>
            <span
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 9,
                letterSpacing: "0.1em",
                color: "#46603F",
                background: "#E4E7DC",
                padding: "4px 8px",
                borderRadius: 2,
                textTransform: "uppercase",
              }}
            >
              Approver
            </span>
          </button>
        </div>
        <div
          style={{
            padding: "12px 24px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #E4DFD3",
            marginTop: 4,
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 9.5,
              letterSpacing: "0.14em",
              color: "#A9A294",
              textTransform: "uppercase",
            }}
          >
            Secured by Scalekit
          </span>
          <button
            onClick={closeSso}
            style={{ fontSize: 12, color: "#79746A", cursor: "pointer", background: "none", border: "none" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
