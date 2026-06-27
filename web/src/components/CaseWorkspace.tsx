"use client";

import Link from "next/link";
import { LEVELS, useCase } from "@/lib/caseStore";

function HeatStrip({ values }: { values: number[] }) {
  return (
    <div style={{ display: "flex", gap: 3, margin: "20px 0 16px", height: 34, alignItems: "flex-end" }}>
      {values.map((v, i) => {
        const hot = v >= 18;
        const warm = v >= 11 && v < 18;
        const c = hot ? "#B23B2A" : warm ? "#9C7A3A" : "#4A463A";
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${v * 1.15 + 6}%`,
              minHeight: 4,
              background: c,
              borderRadius: 1,
            }}
          />
        );
      })}
    </div>
  );
}

export function CaseWorkspace() {
  const {
    role,
    persona,
    clauses,
    selectedClauseId,
    setSelectedClauseId,
    citywideMatches,
    heatValues,
    routed,
    sent,
    sentAuditId,
    sentHash,
    routeToAttorney,
    approveAndSend,
    resetCase,
    tenant,
  } = useCase();

  const isAttorney = role === "attorney";
  const isParalegal = role === "paralegal";

  return (
    <div style={{ maxWidth: 1340, margin: "0 auto", padding: "34px 40px 80px" }}>
      {/* Case header band */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 40,
          paddingBottom: 24,
          borderBottom: "1px solid #DCD7CB",
          flexWrap: "wrap",
        }}
      >
        <div style={{ maxWidth: 760 }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "#9A9384",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Case&nbsp;&nbsp;CR-2026-0414&nbsp;&nbsp;/&nbsp;&nbsp;Open · {tenant}
          </div>
          <h1
            style={{
              fontFamily: "'Newsreader',Georgia,serif",
              fontWeight: 500,
              fontSize: 42,
              lineHeight: 1.04,
              letterSpacing: "-0.015em",
              margin: "0 0 16px",
            }}
          >
            Delgado <span style={{ fontStyle: "italic", color: "#6E685C" }}>v.</span> Skyline Holdings&nbsp;LLC
          </h1>
          <div
            style={{
              display: "flex",
              gap: 26,
              flexWrap: "wrap",
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 11,
              color: "#79746A",
            }}
          >
            <span>
              <span style={{ color: "#A9A294" }}>DOC </span>1408 Mission St — Residential Lease.pdf
            </span>
            <span>
              <span style={{ color: "#A9A294" }}>PAGES </span>40
            </span>
            <span>
              <span style={{ color: "#A9A294" }}>ANALYST </span>Dana Okafor
            </span>
            <span>
              <span style={{ color: "#A9A294" }}>UPLOADED </span>Jun 27, 2026 · 09:14
            </span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "#9A9384",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Overall Risk
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, justifyContent: "flex-end" }}>
            <span
              style={{
                fontFamily: "'Newsreader',Georgia,serif",
                fontSize: 54,
                fontWeight: 500,
                lineHeight: 0.9,
                color: "#B23B2A",
              }}
            >
              87
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#9A9384" }}>/100</span>
          </div>
          <div
            style={{
              marginTop: 8,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 11px",
              background: "#F3E2DD",
              border: "1px solid #E2C9C1",
              borderRadius: 2,
            }}
          >
            <span style={{ width: 6, height: 6, background: "#B23B2A", borderRadius: "50%" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#8E2D20", letterSpacing: "0.02em" }}>
              HIGH · 2 critical clauses
            </span>
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.32fr 1fr",
          gap: 30,
          marginTop: 30,
          alignItems: "start",
        }}
        className="case-grid"
      >
        {/* LEFT: document viewer */}
        <div
          style={{
            border: "1px solid #DCD7CB",
            background: "#FCFBF7",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 1px 2px rgba(23,21,15,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "13px 18px",
              borderBottom: "1px solid #E4DFD3",
              background: "#F6F4EE",
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 10,
                letterSpacing: "0.2em",
                color: "#79746A",
                textTransform: "uppercase",
              }}
            >
              Document · Redline View
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 10,
                color: "#A9A294",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 9, height: 9, background: "#F3E2DD", boxShadow: "inset 0 -2px 0 #B23B2A", display: "inline-block" }} />
                High
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 9, height: 9, background: "#F1E7D3", boxShadow: "inset 0 -2px 0 #B07D2A", display: "inline-block" }} />
                Med
              </span>
            </div>
          </div>

          <div
            style={{
              maxHeight: 660,
              overflowY: "auto",
              padding: "34px 40px 44px",
              fontFamily: "'Newsreader',Georgia,serif",
              fontSize: 15,
              lineHeight: 1.78,
              color: "#2A2820",
              textAlign: "justify",
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "#B6AF9F",
                textTransform: "uppercase",
                textAlign: "left",
                marginBottom: 18,
              }}
            >
              Residential Lease Agreement — Excerpt (pp. 7–31)
            </div>

            <p style={{ margin: "0 0 6px" }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#9A9384", letterSpacing: "0.05em" }}>
                § 12.4&nbsp;&nbsp;ADDITIONAL CHARGES.
              </span>
            </p>
            <p style={{ margin: "0 0 22px" }}>
              In addition to the Base Rent, Tenant shall pay to Landlord a monthly{" "}
              <span style={{ background: "#F3E2DD", boxShadow: "inset 0 -2px 0 #B23B2A", padding: "0 2px", borderRadius: 1 }}>
                Administrative Convenience Fee of $250.00, which Landlord may adjust at its sole discretion and which
                shall not be credited toward rent, deposits, or any obligation hereunder
                <sup style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: "#B23B2A" }}>C1</sup>
              </span>
              . Such fee shall be deemed Additional Rent and non-payment shall constitute a material default under
              this Lease.
            </p>

            <p style={{ margin: "0 0 6px" }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#9A9384", letterSpacing: "0.05em" }}>
                § 14.1&nbsp;&nbsp;RENT ADJUSTMENT.
              </span>
            </p>
            <p style={{ margin: "0 0 22px" }}>
              Commencing on the first anniversary of the Commencement Date, the Base Rent shall{" "}
              <span style={{ background: "#F1E7D3", boxShadow: "inset 0 -2px 0 #B07D2A", padding: "0 2px", borderRadius: 1 }}>
                increase automatically by fourteen percent (14%) per annum, compounding, irrespective of any
                municipal or statutory limitation on rent increases
                <sup style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: "#B07D2A" }}>C3</sup>
              </span>
              . Tenant expressly agrees that any local rent-stabilization ordinance shall not apply to the Premises.
            </p>

            <p style={{ margin: "0 0 6px" }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#9A9384", letterSpacing: "0.05em" }}>
                § 26.5&nbsp;&nbsp;ACCESS.
              </span>
            </p>
            <p style={{ margin: "0 0 22px" }}>
              Landlord and its agents shall have the right to{" "}
              <span style={{ background: "#F1E7D3", boxShadow: "inset 0 -2px 0 #B07D2A", padding: "0 2px", borderRadius: 1 }}>
                enter the Premises at any time without prior notice
                <sup style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: "#B07D2A" }}>C5</sup>
              </span>{" "}
              to inspect, repair, or show the unit to prospective tenants or purchasers.
            </p>

            <p style={{ margin: "0 0 6px" }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#9A9384", letterSpacing: "0.05em" }}>
                § 31.0&nbsp;&nbsp;DISPUTE RESOLUTION.
              </span>
            </p>
            <p style={{ margin: "0 0 22px" }}>
              Tenant, on behalf of Tenant and all occupants, hereby{" "}
              <span style={{ background: "#F3E2DD", boxShadow: "inset 0 -2px 0 #B23B2A", padding: "0 2px", borderRadius: 1 }}>
                irrevocably waives any right to contest an eviction or unlawful-detainer action and waives the right
                to a trial by jury
                <sup style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: "#B23B2A" }}>C2</sup>
              </span>{" "}
              in connection with any proceeding arising under or related to this Lease. Tenant further consents to
              entry of judgment by confession.
            </p>

            <p style={{ margin: "0 0 6px" }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#9A9384", letterSpacing: "0.05em" }}>
                § 44.2&nbsp;&nbsp;ATTORNEYS&apos; FEES.
              </span>
            </p>
            <p style={{ margin: "0 0 8px" }}>
              In any action arising hereunder,{" "}
              <span style={{ background: "#F1E7D3", boxShadow: "inset 0 -2px 0 #B07D2A", padding: "0 2px", borderRadius: 1 }}>
                Tenant shall pay Landlord&apos;s reasonable attorneys&apos; fees and costs regardless of the
                prevailing party
                <sup style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: "#B07D2A" }}>C4</sup>
              </span>
              . This provision shall survive termination of the Lease.
            </p>
          </div>
        </div>

        {/* RIGHT column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Actian Toxicity Radar */}
          <div
            style={{
              background: "#17150F",
              color: "#EDE9DD",
              borderRadius: 3,
              padding: "22px 22px 20px",
              boxShadow: "0 1px 2px rgba(23,21,15,0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "#B7B0A0",
                  textTransform: "uppercase",
                }}
              >
                Toxicity Radar
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  color: "#8E887A",
                  textTransform: "uppercase",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#5E8E54",
                    animation: "fpPulse 1.6s ease-in-out infinite",
                  }}
                />
                Actian VectorAI · On-Prem
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <span style={{ fontFamily: "'Newsreader',Georgia,serif", fontSize: 58, fontWeight: 500, lineHeight: 0.85 }}>
                {citywideMatches}
              </span>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45, color: "#C8C2B4" }}>
                similar predatory clauses found in the <span style={{ color: "#EDE9DD" }}>Mission District</span>{" "}
                over the last 30 days.
              </p>
            </div>
            <HeatStrip values={heatValues} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 14,
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 9,
                letterSpacing: "0.1em",
                color: "#7E7868",
                textTransform: "uppercase",
                borderTop: "1px solid #2E2B22",
                paddingTop: 13,
              }}
            >
              <span>
                Vectorized <span style={{ color: "#C8C2B4" }}>38ms</span>
              </span>
              <span>
                Corpus <span style={{ color: "#C8C2B4" }}>10,412</span>
              </span>
              <span style={{ color: "#C8C2B4" }}>0 PII → cloud</span>
            </div>
          </div>

          {/* Flagged clauses */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "#9A9384",
                  textTransform: "uppercase",
                }}
              >
                Flagged Clauses
              </span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#9A9384" }}>
                {clauses.length} detected
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {clauses.map((item) => {
                const L = LEVELS[item.level];
                const selected = item.id === selectedClauseId;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedClauseId(item.id)}
                    style={{
                      border: `1px solid ${selected ? "#17150F" : "#E0DBCF"}`,
                      background: selected ? "#FCFBF7" : "#FAF8F2",
                      borderRadius: 3,
                      padding: "14px 15px 13px",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <span style={{ width: 3, height: 30, background: L.color, borderRadius: 2, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#221F18", letterSpacing: "-0.005em" }}>
                            {item.tag}
                          </div>
                          <div
                            style={{
                              fontFamily: "'IBM Plex Mono',monospace",
                              fontSize: 9.5,
                              color: "#A9A294",
                              letterSpacing: "0.04em",
                              marginTop: 2,
                            }}
                          >
                            {item.ref} · p.{item.page} · {item.id}
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono',monospace",
                          fontSize: 9,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: L.color,
                          background: L.bg,
                          padding: "3px 7px",
                          borderRadius: 2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {L.label}
                      </span>
                    </div>
                    <p style={{ margin: "11px 0 11px", fontSize: 12.5, lineHeight: 1.5, color: "#5C574C" }}>
                      {item.note}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, height: 4, background: "#E6E1D3", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.round(item.tox * 100)}%`, background: L.color }} />
                      </div>
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono',monospace",
                          fontSize: 9.5,
                          color: "#8E887A",
                          letterSpacing: "0.06em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ACTIAN <span style={{ color: L.color }}>{item.match}</span>
                      </span>
                    </div>
                    {item.actor && (
                      <div
                        style={{
                          marginTop: 10,
                          paddingTop: 10,
                          borderTop: "1px dashed #E2DDD0",
                          fontFamily: "'IBM Plex Mono',monospace",
                          fontSize: 9.5,
                          color: "#9A9384",
                          letterSpacing: "0.04em",
                        }}
                      >
                        BAD-ACTOR MATCH → <span style={{ color: "#8E2D20" }}>{item.actor}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RBAC ACTION PANEL */}
          <div style={{ border: "1px solid #C9C3B5", background: "#F8F6F0", borderRadius: 3, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "#79746A",
                  textTransform: "uppercase",
                }}
              >
                AI Counter-Action
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  color: "#A9A294",
                  textTransform: "uppercase",
                }}
              >
                Scalekit · RBAC
              </span>
            </div>

            {!sent && (
              <>
                <div
                  style={{
                    background: "#FCFBF7",
                    border: "1px solid #E4DFD3",
                    borderRadius: 3,
                    padding: "15px 16px",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: 9.5,
                      letterSpacing: "0.14em",
                      color: "#A9A294",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    Draft · Cease &amp; Desist
                  </div>
                  <p style={{ margin: 0, fontFamily: "'Newsreader',Georgia,serif", fontSize: 14, lineHeight: 1.6, color: "#36322A" }}>
                    Re: 1408 Mission St.{" "}
                    <span style={{ fontStyle: "italic" }}>
                      Two clauses in the enclosed lease (§12.4, §31.0) are unenforceable under SF Rent Ordinance §37.9
                      and Cal. Civ. Code §1953.
                    </span>{" "}
                    Demand is made to strike both within 10 days&hellip;
                  </p>
                </div>

                {isParalegal && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "11px 13px",
                        background: "#F1E7D3",
                        border: "1px solid #E3D4B2",
                        borderRadius: 3,
                      }}
                    >
                      <span style={{ fontSize: 14 }}>🔒</span>
                      <div style={{ lineHeight: 1.3 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#6E5212" }}>
                          Approve &amp; Send is locked
                        </div>
                        <div
                          style={{
                            fontFamily: "'IBM Plex Mono',monospace",
                            fontSize: 9.5,
                            color: "#9A8A5E",
                            letterSpacing: "0.04em",
                            marginTop: 2,
                          }}
                        >
                          RBAC · requires ATTORNEY (Approver) role
                        </div>
                      </div>
                    </div>
                    {routed ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                          padding: "11px 13px",
                          background: "#E4E7DC",
                          border: "1px solid #CDD3C0",
                          borderRadius: 3,
                          fontSize: 12.5,
                          color: "#3F4C39",
                        }}
                      >
                        <span style={{ color: "#5E7257" }}>✓</span> Routed to{" "}
                        <strong style={{ fontWeight: 600 }}>Marcus Vela</strong> — awaiting attorney approval.
                      </div>
                    ) : (
                      <button
                        onClick={routeToAttorney}
                        style={{
                          width: "100%",
                          padding: 13,
                          background: "#17150F",
                          color: "#F3F1EB",
                          border: "none",
                          borderRadius: 3,
                          fontSize: 13,
                          fontWeight: 600,
                          letterSpacing: "0.01em",
                          cursor: "pointer",
                        }}
                      >
                        Route to Lead Attorney for Approval →
                      </button>
                    )}
                  </div>
                )}

                {isAttorney && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "9px 12px",
                        background: "#E4E7DC",
                        border: "1px solid #CDD3C0",
                        borderRadius: 3,
                      }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#5E7257" }} />
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono',monospace",
                          fontSize: 9.5,
                          letterSpacing: "0.1em",
                          color: "#46603F",
                          textTransform: "uppercase",
                        }}
                      >
                        SAML SSO verified · Approver · M. Vela
                      </span>
                    </div>
                    {routed && (
                      <div style={{ fontSize: 12, color: "#79746A", lineHeight: 1.4 }}>
                        Routed by <strong style={{ fontWeight: 600, color: "#3A372F" }}>Dana Okafor</strong> (Reviewer)
                        · pending your authorization.
                      </div>
                    )}
                    <button
                      onClick={approveAndSend}
                      style={{
                        width: "100%",
                        padding: 14,
                        background: "#B23B2A",
                        color: "#FFF",
                        border: "none",
                        borderRadius: 3,
                        fontSize: 13.5,
                        fontWeight: 600,
                        letterSpacing: "0.01em",
                        cursor: "pointer",
                      }}
                    >
                      Approve &amp; Send Cease-and-Desist
                    </button>
                    <div
                      style={{
                        fontFamily: "'IBM Plex Mono',monospace",
                        fontSize: 9,
                        color: "#A9A294",
                        letterSpacing: "0.04em",
                        textAlign: "center",
                      }}
                    >
                      Scalekit will mint a signed audit entry on approval
                    </div>
                  </div>
                )}
              </>
            )}

            {sent && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "#5E7257",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                  <div style={{ lineHeight: 1.25 }}>
                    <div style={{ fontFamily: "'Newsreader',Georgia,serif", fontSize: 18, fontWeight: 500 }}>
                      Cease &amp; Desist deployed
                    </div>
                    <div style={{ fontSize: 12, color: "#79746A" }}>
                      Injected to landlord agent · chain of custody sealed
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    background: "#FCFBF7",
                    border: "1px solid #E4DFD3",
                    borderRadius: 3,
                    padding: "13px 14px",
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 10.5,
                    color: "#5C574C",
                    lineHeight: 1.9,
                    letterSpacing: "0.02em",
                  }}
                >
                  <div>
                    <span style={{ color: "#A9A294" }}>AUDIT ID </span>
                    {sentAuditId}
                  </div>
                  <div>
                    <span style={{ color: "#A9A294" }}>SIG </span>
                    {sentHash}
                  </div>
                  <div>
                    <span style={{ color: "#A9A294" }}>SIGNER </span>Marcus Vela · Approver
                  </div>
                  <div>
                    <span style={{ color: "#A9A294" }}>VIA </span>Scalekit SAML · sf-tenants.okta.com
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <Link
                    href="/audit"
                    style={{
                      flex: 1,
                      padding: 11,
                      background: "#17150F",
                      color: "#F3F1EB",
                      border: "none",
                      borderRadius: 3,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "center",
                      textDecoration: "none",
                      display: "block",
                    }}
                  >
                    View in Audit Log →
                  </Link>
                  <button
                    onClick={resetCase}
                    style={{
                      padding: "11px 14px",
                      background: "transparent",
                      color: "#79746A",
                      border: "1px solid #DCD7CB",
                      borderRadius: 3,
                      fontSize: 12.5,
                      cursor: "pointer",
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
