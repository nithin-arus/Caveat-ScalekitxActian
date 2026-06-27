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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-end">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-seal">Actian VectorAI radar</p>
          <h1 className="text-3xl font-semibold tracking-tight">{profile.title}</h1>
          <p className="max-w-2xl text-ink-muted">
            Tenant-scoped semantic matches from {session.tenant.name}&apos;s local corpus. This view
            is designed to make the Actian integration feel deep: every pattern is tied to a local
            collection, an approval queue, and a reusable redline.
          </p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Active collection</p>
          <p className="mt-2 font-mono text-sm text-seal">{profile.collection}</p>
          <p className="mt-3 text-sm text-ink-muted">{profile.scope}</p>
        </div>
      </div>

      {!canView && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Radar requires Supervisor access. Open the SSO switcher and choose Priya Shah to unlock
          macro-pattern analysis.
        </div>
      )}

      {canView && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Similar clauses", total],
              ["High-risk findings", highRisk],
              ["Average case risk", avgRisk],
              ["Queued approvals", cases.filter((item) => item.status === "awaiting_approval").length],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-ink/10 bg-paper p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="rounded-lg border border-ink/10 bg-paper p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Recurring toxicity patterns</h2>
                  <p className="text-sm text-ink-muted">{profile.corpus}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  local query
                </span>
              </div>
              <div className="grid gap-3">
                {patterns.map((pattern) => (
                  <div key={pattern.id} className="grid gap-2 rounded-md bg-paper-muted/50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{pattern.clause}</p>
                        <p className="text-sm text-ink-muted">
                          {pattern.neighborhood} · {pattern.landlord} · {pattern.caseTitle}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-seal">{pattern.count} hits</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-paper">
                      <div className="h-full bg-seal" style={{ width: `${pattern.match}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-ink-muted">
                      <span>{pattern.match}% semantic match from {pattern.sourceClause}</span>
                      <span>{pattern.severity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="flex flex-col gap-5">
              <div className="rounded-lg border border-ink/10 bg-paper p-5">
                <h2 className="font-semibold">Bad actor leaderboard</h2>
                <div className="mt-4 space-y-3">
                  {profile.landlords.map((landlord, index) => (
                    <div key={landlord} className="flex items-center justify-between text-sm">
                      <span>{landlord}</span>
                      <span className="font-mono text-seal">{48 - index * 9}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-ink/10 bg-paper p-5">
                <h2 className="font-semibold">Hotspot heat</h2>
                <p className="mt-1 text-sm text-ink-muted">{profile.hotspot}</p>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {heat.map((value, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded"
                      style={{
                        background: `rgba(122, 31, 43, ${0.14 + value / 80})`,
                      }}
                      title={`${value} matches`}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-ink/10 bg-paper p-5">
                <h2 className="font-semibold">Demo feature</h2>
                <p className="mt-2 text-sm text-ink-muted">{profile.feature}</p>
                <div className="mt-4 rounded-md bg-paper-muted p-4 text-sm">
                  Actian retrieval links one clause to prior tenant history, the playbook counter,
                  and the approval packet without crossing tenant boundaries.
                </div>
              </div>
            </aside>
          </div>

          <div className="rounded-lg border border-ink/10 bg-paper p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold">Approval-ready redlines</h2>
                <p className="text-sm text-ink-muted">
                  Top pattern counters can be pushed into the attorney queue and sent via scoped
                  Scalekit Gmail action.
                </p>
              </div>
              <a href="/approvals" className="rounded bg-ink px-4 py-2 text-sm font-semibold text-paper">
                Open approvals
              </a>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {patterns.slice(0, 3).map((pattern) => (
                <div key={pattern.id} className="rounded-md bg-paper-muted/70 p-4">
                  <p className="font-medium">{pattern.clause}</p>
                  <p className="mt-2 text-sm text-ink-muted">{pattern.redline}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
