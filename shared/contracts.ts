// The seams. Everyone codes to these. Mocks implement them now; real adapters
// (Scalekit / Actian / Anthropic) swap in on build day with no other code changes.

export interface Clause {
  id: string;
  section: string;
  text: string;
}

export interface RetrievedClause {
  clause: Clause;
  score: number;
  source: "playbook" | "history";
  label?: "standard" | "unusual" | "red-flag";
  counter?: string;
}

export interface Flag {
  id: string;
  clause: Clause;
  reason: string;
  severity: "low" | "med" | "high";
  suggestedRedline: string;
}

export interface Analysis {
  id: string;
  tenantId?: string;
  title: string;
  summary: string;
  riskScore: number; // 0-100
  flags: Flag[];
  createdAt: string;
  status?: "new" | "reviewed" | "awaiting_approval" | "sent";
  routedBy?: string;
  routedAt?: string;
}

export interface AuditEntry {
  auditId: string;
  tenantId?: string;
  action: "sendRedline" | "fetchContract" | "routeToAttorney" | "analyze" | "revokeAccess";
  actor: string; // the real human, attributed
  actorRole?: string;
  detail: string;
  timestamp: string;
  ok: boolean;
  signature?: string;
  verified?: boolean;
}

export interface WatchEvent {
  id: string;
  detectedAt: string;
  source: string; // e.g. "gmail"
  title: string;
  status: "new" | "flagged" | "awaiting-signature";
}

// ---- the swappable seams (mock now, real on build day) ----

export interface ContractSource {
  // mock: local upload/fixtures | real: Scalekit (Gmail/Drive)
  fetchContract(ref: string): Promise<{ title: string; text: string }>;
  listAvailable(): Promise<{ ref: string; title: string }[]>;
}

export interface VectorStore {
  // mock: in-memory cosine | real: Actian VectorAI DB
  upsert(
    items: { id: string; vector: number[]; meta: unknown }[],
    collection: string
  ): Promise<void>;
  query(
    vector: number[],
    k: number,
    collection: string
  ): Promise<RetrievedClause[]>;
}

export interface Reasoner {
  // mock: canned | real: Anthropic API
  analyzeClause(
    clause: Clause,
    neighbors: RetrievedClause[]
  ): Promise<Flag | null>;
  summarize(
    flags: Flag[]
  ): Promise<{ summary: string; riskScore: number }>;
}

export interface Actor {
  // mock: console log | real: Scalekit "send as user"
  sendRedline(args: {
    to: string;
    subject: string;
    body: string;
  }): Promise<{ ok: boolean; auditId: string }>;
  scope: "read_only" | "act";
}

export type Permission = "read:cases" | "route:redline" | "act:redline" | "view:radar";

export interface Tenant {
  id: string;
  oid: string;
  name: string;
  brand: string;
  idpDomain: string;
  accent: string;
  actianCollectionPrefix: string;
  scalekitOrganizationId: string;
}

export interface SessionIdentity {
  sub: string;
  oid: string;
  tenantId: string;
  name: string;
  email: string;
  roles: string[];
  permissions: Permission[];
  tenant: Tenant;
  mode: "mock" | "scalekit";
}

export type IntegrationKey = "auth" | "data" | "gmail" | "notifications";

export interface IntegrationProvider {
  key: IntegrationKey;
  name: string;
  provider: "scalekit" | "actian" | "render" | "internal";
  phase: "active" | "prepared" | "planned";
  requiredEnv: string[];
  notes: string;
}
