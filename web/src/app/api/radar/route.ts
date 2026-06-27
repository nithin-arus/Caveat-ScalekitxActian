import { getSession } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { listCasesForSession } from "@/lib/server-store";

export async function GET() {
  const session = await getSession();
  if (!hasPermission(session, "view:radar")) {
    return Response.json({ error: "Radar requires supervising attorney access", session }, { status: 403 });
  }

  const cases = listCasesForSession(session);
  const highRiskFlags = cases.flatMap((item) => item.flags.filter((flag) => flag.severity === "high"));
  const patterns = highRiskFlags.map((flag, index) => ({
    id: flag.id,
    clause: flag.clause.section,
    neighborhood: index % 2 === 0 ? "Mission District" : "Tenderloin",
    count: 8 + index * 7,
    match: 0.91 - index * 0.04,
    landlord: index % 2 === 0 ? "Skyline Holdings" : "Bayview Residential",
  }));

  return Response.json({
    session,
    source: "Local Actian VectorAI adapter (mock fallback)",
    totalMatches: patterns.reduce((sum, item) => sum + item.count, 0),
    patterns,
  });
}
