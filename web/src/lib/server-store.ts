import type { Analysis, AuditEntry, SessionIdentity } from "@shared/contracts";
import { sampleAuditLog } from "@/lib/data";
import { createAuditEntry } from "@/lib/audit";
import { getAllAnalyses, getAnalysis } from "@/lib/data";

type CasePatch = Pick<Analysis, "status" | "routedAt" | "routedBy">;

const globalForStore = globalThis as typeof globalThis & {
  caveatCasePatches?: Record<string, CasePatch>;
  caveatAuditEntries?: AuditEntry[];
};

function patches() {
  globalForStore.caveatCasePatches ??= {};
  return globalForStore.caveatCasePatches;
}

function dynamicAuditEntries() {
  globalForStore.caveatAuditEntries ??= [];
  return globalForStore.caveatAuditEntries;
}

function tenantAuditFixtures(tenantId: string): AuditEntry[] {
  return sampleAuditLog.map((entry, index) => ({
    ...entry,
    tenantId: index === 0 ? "sf-tu" : "oak-legal",
    actorRole: entry.action === "sendRedline" ? "approver" : "reviewer",
    signature: `fixture-${entry.auditId}`,
    verified: true,
  })).filter((entry) => entry.tenantId === tenantId);
}

export function listCasesForSession(session: SessionIdentity) {
  return getAllAnalyses()
    .map((analysis) => ({ ...analysis, ...patches()[analysis.id] }))
    .filter((analysis) => analysis.tenantId === session.tenantId);
}

export function getCaseForSession(id: string, session: SessionIdentity) {
  const analysis = getAnalysis(id);
  if (!analysis || analysis.tenantId !== session.tenantId) return null;
  return { ...analysis, ...patches()[analysis.id] };
}

export function routeCaseToAttorney(id: string, session: SessionIdentity) {
  const analysis = getCaseForSession(id, session);
  if (!analysis) return null;

  patches()[id] = {
    status: "awaiting_approval",
    routedAt: new Date().toISOString(),
    routedBy: session.name,
  };

  const audit = createAuditEntry({
    action: "routeToAttorney",
    detail: `${session.name} routed ${analysis.title} to the attorney queue.`,
    ok: true,
    session,
  });
  dynamicAuditEntries().unshift(audit);

  return { analysis: { ...analysis, ...patches()[id] }, audit };
}

export function sendCaseRedline(id: string, session: SessionIdentity) {
  const analysis = getCaseForSession(id, session);
  if (!analysis) return null;

  patches()[id] = {
    ...patches()[id],
    status: "sent",
  };

  const audit = createAuditEntry({
    action: "sendRedline",
    detail: `${session.name} approved and sent the negotiated redline packet for ${analysis.title}.`,
    ok: true,
    session,
  });
  dynamicAuditEntries().unshift(audit);

  return { analysis: { ...analysis, ...patches()[id] }, audit };
}

export function listAuditForSession(session: SessionIdentity) {
  return [...dynamicAuditEntries(), ...tenantAuditFixtures(session.tenantId)].filter(
    (entry) => entry.tenantId === session.tenantId
  );
}
