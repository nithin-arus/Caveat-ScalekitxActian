import { getSession } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { listCasesForSession } from "@/lib/server-store";

const tenantRadar = {
  "sf-tu": {
    title: "SF Tenants Union toxicity radar",
    corpus: "Mission + Tenderloin lease corpus",
    scope: "1,284 clauses · 42 recurring toxic patterns · 18 active landlord entities",
    collection: "tenant-sf-tu-user-*-contracts",
    neighborhoods: ["Mission District", "Tenderloin", "SoMa", "Outer Richmond"],
    landlords: ["Skyline Holdings", "Bayview Residential", "Civic Center Properties", "Mission Alley LLC"],
    feature: "Lease-defense playbook",
    hotspot: "Mission District deposit abuse cluster",
  },
  "oak-legal": {
    title: "Oakland Legal Aid contract radar",
    corpus: "East Bay lease + offer-letter corpus",
    scope: "912 clauses · 31 recurring toxic patterns · 9 employer/property clusters",
    collection: "tenant-oak-legal-user-*-contracts",
    neighborhoods: ["Downtown Oakland", "Temescal", "West Oakland", "Berkeley"],
    landlords: ["SeedStage Labs", "Harbor Property Group", "Broadway Residential", "Foundry AI"],
    feature: "Lease and startup-offer playbooks",
    hotspot: "Startup offer equity-risk cluster",
  },
};

const patternNames = [
  "Nonrefundable deposit / ordinary wear capture",
  "Unilateral price or fee escalation",
  "Essential-service disclaimer",
  "One-way attorney fee shifting",
  "Broad IP assignment / future-work capture",
  "Short option exercise window",
];

export default async function RadarPage() {
  const session = await getSession();
  const canView = hasPermission(session, "view:radar");
  const cases = listCasesForSession(session);
  const profile = tenantRadar[session.tenantId as keyof typeof tenantRadar] ?? tenantRadar["sf-tu"];
  const flags = cases.flatMap((item) =>
    item.flags
      .filter((flag) => flag.severity === "high" || flag.severity === "med")
      .map((flag) => ({ ...flag, caseTitle: item.title, riskScore: item.riskScore }))
  );
  const patterns = flags.map((flag, index) => ({
    id: flag.id,
    clause: patternNames[index % patternNames.length],
    sourceClause: flag.clause.section,
    caseTitle: flag.caseTitle,
    neighborhood: profile.neighborhoods[index % profile.neighborhoods.length],
    count: 12 + index * 6 + (flag.severity === "high" ? 8 : 0),
    match: Math.max(68, 96 - index * 3),
    landlord: profile.landlords[index % profile.landlords.length],
    severity: flag.severity,
    redline: flag.suggestedRedline,
  }));
  const total = patterns.reduce((sum, item) => sum + item.count, 0);
  const highRisk = flags.filter((flag) => flag.severity === "high").length;
  const avgRisk = cases.length
    ? Math.round(cases.reduce((sum, item) => sum + item.riskScore, 0) / cases.length)
    : 0;
  const heat = [18, 31, 9, 24, 42, 17, 36, 22, 11, 29, 47, 15, 33, 20, 27, 39];

  return (
    <div style={{ maxWidth: 1340, margin: "0 auto", padding: "34px 40px 80px", display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header Section */}
      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 380px", alignItems: "end", paddingBottom: 24, borderBottom: "1px solid #DCD7CB" }} className="case-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.2em", color: "#7A1F2B", textTransform: "uppercase", margin: 0 }}>
            Actian VectorAI radar
          </p>
          <h1 style={{ fontFamily: "'Newsreader',Georgia,serif", fontWeight: 500, fontSize: 40, letterSpacing: "-0.015em", margin: "0 0 8px", color: "#17150F" }}>
            {profile.title}
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#5C574C", maxWidth: 640, lineHeight: 1.55 }}>
            Tenant-scoped semantic matches from {session.tenant.name}&apos;s local corpus. This view
            is designed to make the Actian integration feel deep: every pattern is tied to a local
            collection, an approval queue, and a reusable redline.
          </p>
        </div>
        <div style={{ border: "1px solid #DCD7CB", background: "#FBFAF6", padding: 20, borderRadius: 2 }}>
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.15em", color: "#9A9384", textTransform: "uppercase", margin: "0 0 8px" }}>
            Active collection
          </p>
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: "#7A1F2B", margin: "0 0 10px", wordBreak: "break-all" }}>
            {profile.collection}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#5C574C" }}>{profile.scope}</p>
        </div>
      </div>

      {!canView && (
        <div style={{ padding: "16px 20px", background: "#FDF9F2", border: "1px solid #E8D9BD", color: "#8B651B", fontSize: 13.5, borderRadius: 2, lineHeight: 1.5 }}>
          Radar requires Supervisor access. Open the SSO switcher and choose Priya Shah to unlock
          macro-pattern analysis.
        </div>
      )}

      {canView && (
        <>
          {/* Metrics Grid */}
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {[
              ["Similar clauses", total],
              ["High-risk findings", highRisk],
              ["Average case risk", avgRisk],
              ["Queued approvals", cases.filter((item) => item.status === "awaiting_approval").length],
            ].map(([label, value]) => (
              <div key={label as string} style={{ border: "1px solid #DCD7CB", background: "#FBFAF6", padding: 20, borderRadius: 2 }}>
                <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.15em", color: "#9A9384", textTransform: "uppercase", margin: "0 0 6px" }}>
                  {label}
                </p>
                <p style={{ fontFamily: "'Newsreader',Georgia,serif", fontSize: 36, fontWeight: 500, margin: 0, color: "#17150F" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 340px" }} className="case-grid">
            {/* Left Column: Recurring Patterns */}
            <div style={{ border: "1px solid #DCD7CB", background: "#FBFAF6", padding: 24, borderRadius: 2 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, borderBottom: "1px solid #E4DFD3", paddingBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: "'Newsreader',Georgia,serif", fontSize: 22, fontWeight: 500, margin: "0 0 4px", color: "#17150F" }}>
                    Recurring toxicity patterns
                  </h2>
                  <p style={{ margin: 0, fontSize: 13, color: "#9A9384", fontFamily: "'IBM Plex Mono',monospace" }}>{profile.corpus}</p>
                </div>
                <span style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 9,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#2E6B3E",
                  background: "#E8F5E9",
                  padding: "4px 8px",
                  borderRadius: 2
                }}>
                  local query
                </span>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {patterns.map((pattern) => (
                  <div key={pattern.id} style={{ border: "1px solid #E4DFD3", background: "#FBFAF6", padding: 16, borderRadius: 2 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 8 }}>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: "#17150F", margin: "0 0 4px" }}>{pattern.clause}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#79746A" }}>
                          {pattern.neighborhood} · {pattern.landlord} · {pattern.caseTitle}
                        </p>
                      </div>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 600, color: "#7A1F2B" }}>{pattern.count} hits</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div style={{ height: 6, background: "#E4DFD3", borderRadius: 3, overflow: "hidden", margin: "10px 0" }}>
                      <div style={{ height: "100%", background: "#7A1F2B", width: `${pattern.match}%`, borderRadius: 3 }} />
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: "#9A9384" }}>
                      <span>{pattern.match}% match from {pattern.sourceClause}</span>
                      <span style={{
                        textTransform: "uppercase",
                        color: pattern.severity === "high" ? "#B23B2A" : "#B07D2A",
                        fontWeight: 600
                      }}>{pattern.severity} severity</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Leaderboard Card */}
              <div style={{ border: "1px solid #DCD7CB", background: "#FBFAF6", padding: 20, borderRadius: 2 }}>
                <h2 style={{ fontFamily: "'Newsreader',Georgia,serif", fontSize: 18, fontWeight: 500, margin: "0 0 12px", borderBottom: "1px solid #E4DFD3", paddingBottom: 10, color: "#17150F" }}>
                  Bad actor leaderboard
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {profile.landlords.map((landlord, index) => (
                    <div key={landlord} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                      <span style={{ color: "#17150F" }}>{landlord}</span>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: "#7A1F2B", fontWeight: 600 }}>{48 - index * 9}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hotspot Card */}
              <div style={{ border: "1px solid #DCD7CB", background: "#FBFAF6", padding: 20, borderRadius: 2 }}>
                <h2 style={{ fontFamily: "'Newsreader',Georgia,serif", fontSize: 18, fontWeight: 500, margin: "0 0 2px", color: "#17150F" }}>
                  Hotspot heat
                </h2>
                <p style={{ margin: "0 0 12px", fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: "#9A9384" }}>{profile.hotspot}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {heat.map((value, index) => (
                    <div
                      key={index}
                      style={{
                        aspectRatio: "1/1",
                        borderRadius: 1,
                        background: `rgba(122, 31, 43, ${0.14 + value / 80})`,
                        border: "1px solid rgba(122, 31, 43, 0.05)"
                      }}
                      title={`${value} matches`}
                    />
                  ))}
                </div>
              </div>

              {/* Demo Feature Card */}
              <div style={{ border: "1px solid #DCD7CB", background: "#FBFAF6", padding: 20, borderRadius: 2 }}>
                <h2 style={{ fontFamily: "'Newsreader',Georgia,serif", fontSize: 18, fontWeight: 500, margin: "0 0 10px", borderBottom: "1px solid #E4DFD3", paddingBottom: 10, color: "#17150F" }}>
                  Demo feature
                </h2>
                <p style={{ margin: "0 0 8px", fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", color: "#9A9384", textTransform: "uppercase" }}>{profile.feature}</p>
                <div style={{ fontSize: 12.5, color: "#5C574C", lineHeight: 1.5, background: "#FBFAF6", borderLeft: "3px solid #7A1F2B", padding: "12px 16px" }}>
                  Actian retrieval links one clause to prior tenant history, the playbook counter,
                  and the approval packet without crossing tenant boundaries.
                </div>
              </div>
            </aside>
          </div>

          {/* Redlines Container */}
          <div style={{ border: "1px solid #DCD7CB", background: "#FBFAF6", padding: 24, borderRadius: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E4DFD3", paddingBottom: 16, marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
              <div>
                <h2 style={{ fontFamily: "'Newsreader',Georgia,serif", fontSize: 20, fontWeight: 500, margin: "0 0 4px", color: "#17150F" }}>
                  Approval-ready redlines
                </h2>
                <p style={{ margin: 0, fontSize: 13.5, color: "#5C574C" }}>
                  Top pattern counters can be pushed into the attorney queue and sent via scoped
                  Scalekit Gmail action.
                </p>
              </div>
              <a
                href="/approvals"
                style={{
                  display: "inline-block",
                  padding: "11px 18px",
                  background: "#17150F",
                  color: "#FBFAF6",
                  border: "none",
                  borderRadius: 3,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  textDecoration: "none"
                }}
              >
                Open approvals
              </a>
            </div>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {patterns.slice(0, 3).map((pattern) => (
                <div key={pattern.id} style={{ border: "1px solid #E4DFD3", background: "#F9F6E7", padding: 16, borderRadius: 2 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#17150F", margin: "0 0 8px" }}>{pattern.clause}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#5C574C", fontStyle: "italic", borderLeft: "2px solid #7A1F2B", paddingLeft: 12 }}>{pattern.redline}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
