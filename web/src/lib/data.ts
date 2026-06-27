import { sampleAnalyses, sampleAuditLog, sampleWatchEvents } from "@data/fixtures/analyses";
import type { Analysis, Permission, SessionIdentity, Tenant } from "@shared/contracts";

export const tenants: Tenant[] = [
  {
    id: "sf-tu",
    oid: "org_sf_tenants_union",
    name: "SF Tenants Union",
    brand: "Mission Defense Desk",
    idpDomain: "sso.sftu.example",
    accent: "#7a1f2b",
  },
  {
    id: "oak-legal",
    oid: "org_oakland_legal_aid",
    name: "Oakland Legal Aid",
    brand: "East Bay Housing Clinic",
    idpDomain: "idp.oaklegalaid.example",
    accent: "#245b47",
  },
];

const caseTenants: Record<string, string> = {
  "lease-sketchy": "sf-tu",
  "lease-gotcha": "sf-tu",
  "lease-clean": "oak-legal",
  "offer-startup": "oak-legal",
};

export const mockPersonas: Array<{
  key: "reviewer" | "approver" | "admin";
  label: string;
  roles: string[];
  permissions: Permission[];
}> = [
  {
    key: "reviewer",
    label: "Dana Reviewer",
    roles: ["reviewer"],
    permissions: ["read:cases", "route:redline"],
  },
  {
    key: "approver",
    label: "Marcus Attorney",
    roles: ["approver"],
    permissions: ["read:cases", "route:redline", "act:redline"],
  },
  {
    key: "admin",
    label: "Priya Supervisor",
    roles: ["supervising-attorney"],
    permissions: ["read:cases", "route:redline", "act:redline", "view:radar"],
  },
];

export function tenantForId(tenantId: string): Tenant {
  return tenants.find((tenant) => tenant.id === tenantId) ?? tenants[0];
}

export function tenantForOid(oid: string): Tenant {
  return tenants.find((tenant) => tenant.oid === oid) ?? tenants[0];
}

export function decorateAnalysis(analysis: Analysis): Analysis {
  return {
    ...analysis,
    tenantId: analysis.tenantId ?? caseTenants[analysis.id] ?? tenants[0].id,
    status: analysis.status ?? (analysis.id === "lease-gotcha" ? "awaiting_approval" : "reviewed"),
  };
}

export function buildMockSession(
  role: "reviewer" | "approver" | "admin" = "reviewer",
  tenantId = tenants[0].id
): SessionIdentity {
  const tenant = tenantForId(tenantId);
  const persona = mockPersonas.find((item) => item.key === role) ?? mockPersonas[0];

  return {
    sub: `mock_${role}_${tenant.id}`,
    oid: tenant.oid,
    tenantId: tenant.id,
    name: persona.label,
    email: `${role}@${tenant.id}.example`,
    roles: persona.roles,
    permissions: persona.permissions,
    tenant,
    mode: "mock",
  };
}

export function getAllAnalyses(): Analysis[] {
  return sampleAnalyses.map(decorateAnalysis);
}

export function getAnalysis(id: string): Analysis | undefined {
  const analysis = sampleAnalyses.find((a) => a.id === id);
  return analysis ? decorateAnalysis(analysis) : undefined;
}

export { sampleAuditLog, sampleWatchEvents };

export function severityColor(severity: "low" | "med" | "high") {
  switch (severity) {
    case "high":
      return { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", ring: "ring-red-200" };
    case "med":
      return { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" };
    default:
      return { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" };
  }
}

export function riskLabel(score: number) {
  if (score >= 70) return { label: "High risk", color: "text-red-600" };
  if (score >= 35) return { label: "Moderate risk", color: "text-amber-600" };
  return { label: "Low risk", color: "text-emerald-600" };
}
