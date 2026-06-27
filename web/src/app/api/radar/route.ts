import { getSession } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { listCasesForSession } from "@/lib/server-store";
import { tenantMemoryCollection } from "@shared/config";

export async function GET() {
  const session = await getSession();
  if (!hasPermission(session, "view:radar")) {
    return Response.json({ error: "Radar requires supervising attorney access", session }, { status: 403 });
  }

  const cases = listCasesForSession(session);
  const highRiskFlags = cases.flatMap((item) =>
    item.flags
      .filter((flag) => flag.severity === "high" || flag.severity === "med")
      .map((flag) => ({ ...flag, caseTitle: item.title }))
  );
  const patterns = highRiskFlags.map((flag, index) => ({
    id: flag.id,
    clause: flag.clause.section,
    caseTitle: flag.caseTitle,
    neighborhood: session.tenantId === "sf-tu" ? (index % 2 === 0 ? "Mission District" : "Tenderloin") : (index % 2 === 0 ? "Downtown Oakland" : "Temescal"),
    count: 12 + index * 6 + (flag.severity === "high" ? 8 : 0),
    match: 0.96 - index * 0.03,
    actor: session.tenantId === "sf-tu" ? (index % 2 === 0 ? "Skyline Holdings" : "Bayview Residential") : (index % 2 === 0 ? "SeedStage Labs" : "Harbor Property Group"),
    severity: flag.severity,
  }));

  return Response.json({
    session,
    source: "Actian VectorAI tenant-scoped semantic radar (mock fallback)",
    collection: tenantMemoryCollection(session.tenantId, session.sub),
    playbookCollection: "clause_playbook",
    totalMatches: patterns.reduce((sum, item) => sum + item.count, 0),
    patterns,
  });
}
