import type { IntegrationProvider, Tenant } from "./contracts";

export const VECTOR_DIMENSIONS = 384;
export const PLAYBOOK_COLLECTION = "clause_playbook";

export const tenants: Tenant[] = [
  {
    id: "sf-tu",
    oid: "org_sf_tenants_union",
    name: "SF Tenants Union",
    brand: "Mission Defense Desk",
    idpDomain: "sso.sftu.example",
    accent: "#7a1f2b",
    actianCollectionPrefix: "tenant-sf-tu",
    scalekitOrganizationId: "org_sf_tenants_union",
  },
  {
    id: "oak-legal",
    oid: "org_oakland_legal_aid",
    name: "Oakland Legal Aid",
    brand: "East Bay Housing Clinic",
    idpDomain: "idp.oaklegalaid.example",
    accent: "#245b47",
    actianCollectionPrefix: "tenant-oak-legal",
    scalekitOrganizationId: "org_oakland_legal_aid",
  },
];

export const integrationRoadmap: IntegrationProvider[] = [
  {
    key: "auth",
    name: "Scalekit SSO",
    provider: "scalekit",
    phase: "active",
    requiredEnv: ["SCALEKIT_ENV_URL", "SCALEKIT_CLIENT_ID", "SCALEKIT_CLIENT_SECRET"],
    notes: "Maps Scalekit org/user claims into Caveat tenants and RBAC permissions.",
  },
  {
    key: "data",
    name: "Actian VectorAI DB",
    provider: "actian",
    phase: "active",
    requiredEnv: ["ACTIAN_URL"],
    notes: "Stores the clause playbook plus tenant/user-scoped contract memory.",
  },
  {
    key: "gmail",
    name: "Gmail read/send",
    provider: "scalekit",
    phase: "prepared",
    requiredEnv: ["SCALEKIT_DEFAULT_CONNECTIONS"],
    notes: "Use after Scalekit scoped tools return gmail_messages_list and gmail_message_send.",
  },
  {
    key: "notifications",
    name: "Notifications",
    provider: "scalekit",
    phase: "planned",
    requiredEnv: ["NOTIFICATIONS_PROVIDER"],
    notes: "Reserved for Slack/email/SMS notifications once the auth and data path is live.",
  },
];

export function tenantForId(tenantId: string): Tenant {
  return tenants.find((tenant) => tenant.id === tenantId) ?? tenants[0];
}

export function tenantForOid(oid: string): Tenant {
  return tenants.find((tenant) => tenant.oid === oid || tenant.scalekitOrganizationId === oid) ?? tenants[0];
}

export function tenantMemoryCollection(tenantId: string, userId: string) {
  const tenant = tenantForId(tenantId);
  const normalizedUser = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${tenant.actianCollectionPrefix}-user-${normalizedUser}-contracts`;
}
