"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCase } from "@/lib/caseStore";

const TENANTS = ["SF Tenants Union", "Oakland Legal Aid"];

export function TopBar() {
  const { tenant, setTenant, persona, openSso } = useCase();
  const pathname = usePathname();

  const navStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 12.5,
    letterSpacing: "0.01em",
    cursor: "pointer",
    paddingBottom: 3,
    textDecoration: "none",
    color: active ? "#17150F" : "#9A9384",
    fontWeight: active ? 600 : 500,
    borderBottom: active ? "1.5px solid #17150F" : "1.5px solid transparent",
  });

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(243,241,235,0.86)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #DCD7CB",
      }}
    >
      <div
        style={{
          maxWidth: 1340,
          margin: "0 auto",
          padding: "0 40px",
          height: 66,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Link href="/" style={{ display: "flex", alignItems: "baseline", gap: 10, textDecoration: "none" }}>
            <span
              style={{
                fontFamily: "'Newsreader',Georgia,serif",
                fontSize: 23,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                color: "#17150F",
              }}
            >
              Fineprint
            </span>
            <span
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 9.5,
                letterSpacing: "0.22em",
                color: "#9A9384",
                textTransform: "uppercase",
              }}
            >
              Systemic Defense
            </span>
          </Link>
          <div style={{ height: 22, width: 1, background: "#DCD7CB" }} />
          <select
            value={tenant}
            onChange={(e) => setTenant(e.target.value)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              border: "1px solid #DCD7CB",
              borderRadius: 2,
              background: "#FBFAF6",
              fontSize: 12.5,
              fontWeight: 500,
              color: "#3A372F",
              cursor: "pointer",
            }}
          >
            {TENANTS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Link href="/" style={navStyle(pathname === "/")}>
              Case Review
            </Link>
            <Link href="/audit" style={navStyle(pathname === "/audit")}>
              Audit Log
            </Link>
          </div>
          <div style={{ height: 22, width: 1, background: "#DCD7CB" }} />
          <button
            onClick={openSso}
            title="Switch user via SSO"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "7px 13px 7px 11px",
              border: `1px solid ${persona.border}`,
              borderRadius: 2,
              background: persona.bg,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: persona.dot,
                boxShadow: `0 0 0 3px ${persona.ring}`,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: persona.text }}>{persona.name}</span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 8.5,
                  letterSpacing: "0.16em",
                  color: persona.subColor,
                  textTransform: "uppercase",
                }}
              >
                {persona.sub}
              </span>
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: persona.subColor, marginLeft: 2 }}>
              ⇄
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
