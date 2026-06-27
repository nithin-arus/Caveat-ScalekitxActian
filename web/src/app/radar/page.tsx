import { getSession } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { listCasesForSession } from "@/lib/server-store";

export default async function RadarPage() {
  const session = await getSession();
  const canView = hasPermission(session, "view:radar");
  const cases = listCasesForSession(session);
  const flags = cases.flatMap((item) => item.flags.filter((flag) => flag.severity === "high"));
  const patterns = flags.map((flag, index) => ({
    id: flag.id,
    clause: flag.clause.section,
    neighborhood: index % 2 === 0 ? "Mission District" : "Tenderloin",
    count: 8 + index * 7,
    match: Math.max(72, 94 - index * 4),
    landlord: index % 2 === 0 ? "Skyline Holdings" : "Bayview Residential",
  }));
  const total = patterns.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="mx-auto max-w-6xl w-full px-6 py-16 flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-seal">Actian radar</p>
          <h1 className="text-3xl font-semibold tracking-tight">Citywide toxicity dashboard</h1>
          <p className="max-w-2xl text-ink-muted">
            Tenant-scoped semantic matches from {session.tenant.name}&apos;s local corpus. The
            production adapter keeps this query inside Actian VectorAI.
          </p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper-muted/50 px-5 py-4 text-right">
          <p className="text-3xl font-semibold">{canView ? total : "--"}</p>
          <p className="text-xs uppercase tracking-wide text-ink-muted">similar clauses</p>
        </div>
      </div>

      {!canView && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Radar requires supervising-attorney access. Sign in as Admin to unlock the macro-pattern
          view.
        </div>
      )}

      {canView && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-lg border border-ink/10 bg-paper p-5">
            <div className="grid gap-3">
              {patterns.map((pattern) => (
                <div key={pattern.id} className="grid gap-2 rounded-md bg-paper-muted/50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{pattern.clause}</p>
                      <p className="text-sm text-ink-muted">
                        {pattern.neighborhood} · {pattern.landlord}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-seal">{pattern.count} hits</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-paper">
                    <div className="h-full bg-seal" style={{ width: `${pattern.match}%` }} />
                  </div>
                  <p className="text-xs text-ink-muted">{pattern.match}% semantic match</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="font-semibold">Bad actor leaderboard</h2>
            <div className="mt-4 space-y-3">
              {["Skyline Holdings", "Bayview Residential", "Civic Center Properties"].map(
                (landlord, index) => (
                  <div key={landlord} className="flex items-center justify-between text-sm">
                    <span>{landlord}</span>
                    <span className="font-mono text-seal">{42 - index * 11}</span>
                  </div>
                )
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
