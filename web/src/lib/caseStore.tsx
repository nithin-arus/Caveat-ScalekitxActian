"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuditEntry as ServerAuditEntry, SessionIdentity } from "@shared/contracts";

export type Role = "paralegal" | "attorney" | "supervisor";
export type Level = "high" | "med" | "low";

export interface Clause {
  id: string;
  tag: string;
  ref: string;
  page: number;
  tox: number;
  level: Level;
  match: string;
  note: string;
  actor: string | null;
}

export interface AuditEntry {
  date: string;
  time: string;
  dot: string;
  actor: string;
  actorRole: string;
  roleColor: string;
  roleBg: string;
  action: string;
  detail: string;
  id: string;
  hash: string;
}

export const LEVELS: Record<Level, { color: string; bg: string; label: string }> = {
  high: { color: "#B23B2A", bg: "#F3E2DD", label: "High" },
  med: { color: "#B07D2A", bg: "#F1E7D3", label: "Medium" },
  low: { color: "#7A8C5E", bg: "#E8EAD9", label: "Low" },
};

export const CLAUSES: Clause[] = [
  {
    id: "C1",
    tag: "Surprise Fee",
    ref: "§12.4",
    page: 7,
    tox: 0.92,
    level: "high",
    match: "94%",
    note: 'Undisclosed $250/mo "convenience fee", adjustable at landlord discretion, never credited to rent.',
    actor: "Skyline Holdings LLC",
  },
  {
    id: "C2",
    tag: "Eviction Waiver",
    ref: "§31.0",
    page: 22,
    tox: 0.97,
    level: "high",
    match: "91%",
    note: "Tenant waives the right to contest eviction and to a jury trial. Newly flagged citywide as unenforceable.",
    actor: "Skyline Holdings LLC",
  },
  {
    id: "C3",
    tag: "Rent Escalation",
    ref: "§14.1",
    page: 9,
    tox: 0.64,
    level: "med",
    match: "78%",
    note: "Automatic 14% annual increase, compounding — exceeds the 2026 SF allowable cap of 1.7%.",
    actor: null,
  },
  {
    id: "C4",
    tag: "Fee Shifting",
    ref: "§44.2",
    page: 30,
    tox: 0.58,
    level: "med",
    match: "71%",
    note: "Tenant pays landlord legal fees regardless of the prevailing party.",
    actor: null,
  },
  {
    id: "C5",
    tag: "Entry w/o Notice",
    ref: "§26.5",
    page: 18,
    tox: 0.41,
    level: "low",
    match: "63%",
    note: "Landlord may enter the premises at any time without the statutory 24-hour notice.",
    actor: null,
  },
];

const CITYWIDE_MATCHES = 42;

const HEAT_VALUES = [6, 11, 5, 18, 9, 22, 7, 14, 28, 8, 19, 11, 6, 24, 9, 13, 7, 20, 10, 5, 16, 8, 12, 26, 7, 9, 15, 6];

interface PersonaInfo {
  name: string;
  sub: string;
  initials: string;
  dot: string;
  ring: string;
  bg: string;
  border: string;
  text: string;
  subColor: string;
  avatarBg: string;
  avatarColor: string;
}

export const PERSONAS: Record<Role, PersonaInfo> = {
  supervisor: {
    name: "Priya Shah",
    sub: "Supervisor · Radar",
    initials: "PS",
    dot: "#7A1F2B",
    ring: "rgba(122,31,43,0.16)",
    bg: "#F1E2E4",
    border: "#DFC2C7",
    text: "#5B1722",
    subColor: "#8A5961",
    avatarBg: "#E8CCD1",
    avatarColor: "#7A1F2B",
  },
  attorney: {
    name: "Marcus Vela",
    sub: "Attorney · Approver",
    initials: "MV",
    dot: "#5E7257",
    ring: "rgba(94,114,87,0.16)",
    bg: "#E9ECE2",
    border: "#CDD3C0",
    text: "#2F3A2A",
    subColor: "#6F7A66",
    avatarBg: "#DBE0D2",
    avatarColor: "#46603F",
  },
  paralegal: {
    name: "Dana Okafor",
    sub: "Paralegal · Reviewer",
    initials: "DO",
    dot: "#B07D2A",
    ring: "rgba(176,125,42,0.16)",
    bg: "#F1E9DA",
    border: "#E1D2B0",
    text: "#5E4A18",
    subColor: "#9A8A5E",
    avatarBg: "#E9DCC2",
    avatarColor: "#7A5E18",
  },
};

const TENANT_IDS: Record<string, string> = {
  "SF Tenants Union": "sf-tu",
  "Oakland Legal Aid": "oak-legal",
};

function roleFromSession(session: SessionIdentity): Role {
  if (session.permissions.includes("view:radar")) return "supervisor";
  return session.permissions.includes("act:redline") ? "attorney" : "paralegal";
}

function auditFromServer(entry: ServerAuditEntry): AuditEntry {
  const date = new Date(entry.timestamp);
  const isApprover = entry.actorRole?.includes("approver") || entry.actorRole?.includes("attorney");

  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: date.toLocaleTimeString("en-US", { hour12: false }),
    dot: entry.ok ? (isApprover ? "#5E7257" : "#B07D2A") : "#B23B2A",
    actor: entry.actor,
    actorRole: entry.actorRole ?? "System",
    roleColor: isApprover ? "#46603F" : "#9A8A5E",
    roleBg: isApprover ? "#E4E7DC" : "#F1E7D3",
    action: entry.action === "routeToAttorney" ? "Routed for attorney approval" : "Approved & sent — cease-and-desist",
    detail: entry.detail,
    id: entry.auditId,
    hash: entry.signature ?? "unsigned",
  };
}

interface CaseState {
  role: Role;
  tenant: string;
  selectedClauseId: string;
  routed: boolean;
  sent: boolean;
  sentAuditId: string | null;
  sentHash: string | null;
  actionError: string | null;
  showSso: boolean;
  clauses: Clause[];
  citywideMatches: number;
  heatValues: number[];
  persona: PersonaInfo;
  auditEntries: AuditEntry[];
  setSelectedClauseId: (id: string) => void;
  setTenant: (tenant: string) => void;
  openSso: () => void;
  closeSso: () => void;
  pickParalegal: () => void;
  pickAttorney: () => void;
  pickSupervisor: () => void;
  routeToAttorney: () => Promise<void>;
  approveAndSend: () => Promise<void>;
  resetCase: () => void;
}

const CaseContext = createContext<CaseState | null>(null);

export function CaseProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("paralegal");
  const [tenant, setTenant] = useState("SF Tenants Union");
  const [selectedClauseId, setSelectedClauseId] = useState("C2");
  const [routed, setRouted] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentAuditId, setSentAuditId] = useState<string | null>(null);
  const [sentHash, setSentHash] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [serverAuditEntries, setServerAuditEntries] = useState<AuditEntry[]>([]);
  const [showSso, setShowSso] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((response) => response.json())
      .then((payload: { session?: SessionIdentity }) => {
        if (!payload.session) return;
        setRole(roleFromSession(payload.session));
        setTenant(payload.session.tenant.name);
      })
      .catch(() => undefined);
  }, []);

  const auditEntries = useMemo<AuditEntry[]>(() => {
    const entries: AuditEntry[] = [
      {
        date: "Jun 27 2026",
        time: "09:14:02",
        dot: "#7A8C5E",
        actor: "Dana Okafor",
        actorRole: "Reviewer",
        roleColor: "#9A8A5E",
        roleBg: "#F1E7D3",
        action: "Lease uploaded",
        detail:
          "1408 Mission St — Residential Lease.pdf (40 pp) ingested to on-prem store. No PII transmitted externally.",
        id: "AUD-1A0C44",
        hash: "0x9f2c4b81e0a7d35c2f",
      },
      {
        date: "Jun 27 2026",
        time: "09:14:40",
        dot: "#B23B2A",
        actor: "Actian VectorAI",
        actorRole: "System",
        roleColor: "#79746A",
        roleBg: "#E7E2D6",
        action: "Toxicity scan completed",
        detail: `5 predatory clauses flagged · 2 critical. Cross-referenced against ${CITYWIDE_MATCHES} citywide matches in the Mission District (38ms).`,
        id: "AUD-1A0C45",
        hash: "0x4d7e1b9a3c08f6021e",
      },
    ];
    if (routed) {
      entries.push({
        date: "Jun 27 2026",
        time: "09:21:13",
        dot: "#B07D2A",
        actor: "Dana Okafor",
        actorRole: "Reviewer",
        roleColor: "#9A8A5E",
        roleBg: "#F1E7D3",
        action: "Routed for attorney approval",
        detail:
          "Draft cease-and-desist forwarded to Marcus Vela (Approver). Reviewer role lacks send authority under RBAC policy.",
        id: "AUD-1A0C5C",
        hash: "0x77a0c4e9b21d8f4630",
      });
    }
    if (serverAuditEntries.length) {
      entries.push(...serverAuditEntries);
    } else if (sent && sentAuditId && sentHash) {
      entries.push({
        date: "Jun 27 2026",
        time: "09:24:58",
        dot: "#5E7257",
        actor: "Marcus Vela",
        actorRole: "Approver",
        roleColor: "#46603F",
        roleBg: "#E4E7DC",
        action: "Approved & sent — cease-and-desist",
        detail:
          "AI agent authorized to deliver counter-action to landlord. SAML-verified Approver identity; signed legal chain of custody sealed.",
        id: sentAuditId,
        hash: sentHash,
      });
    }
    return entries;
  }, [routed, sent, sentAuditId, sentHash, serverAuditEntries]);

  function signInAs(nextRole: Role, nextTenant = tenant) {
    const roleKey = nextRole === "supervisor" ? "admin" : nextRole === "attorney" ? "approver" : "reviewer";
    const tenantId = TENANT_IDS[nextTenant] ?? "sf-tu";
    window.location.href = `/api/auth/login?role=${roleKey}&tenant=${tenantId}`;
  }

  const value: CaseState = {
    role,
    tenant,
    selectedClauseId,
    routed,
    sent,
    sentAuditId,
    sentHash,
    actionError,
    showSso,
    clauses: CLAUSES,
    citywideMatches: CITYWIDE_MATCHES,
    heatValues: HEAT_VALUES,
    persona: PERSONAS[role],
    auditEntries,
    setSelectedClauseId,
    setTenant: (nextTenant) => signInAs(role, nextTenant),
    openSso: () => setShowSso(true),
    closeSso: () => setShowSso(false),
    pickParalegal: () => signInAs("paralegal"),
    pickAttorney: () => signInAs("attorney"),
    pickSupervisor: () => signInAs("supervisor"),
    routeToAttorney: async () => {
      setActionError(null);
      const response = await fetch("/api/cases/lease-gotcha/route", { method: "POST" });
      const payload = (await response.json()) as { error?: string; audit?: ServerAuditEntry };

      if (!response.ok) {
        setActionError(payload.error ?? "Route blocked by server policy.");
        return;
      }

      setRouted(true);
      if (payload.audit) {
        const auditEntry = auditFromServer(payload.audit);
        setServerAuditEntries((entries) => [...entries, auditEntry]);
      }
    },
    approveAndSend: async () => {
      setActionError(null);
      const response = await fetch("/api/cases/lease-gotcha/send", { method: "POST" });
      const payload = (await response.json()) as { error?: string; audit?: ServerAuditEntry };

      if (!response.ok) {
        setActionError(payload.error ?? "Send blocked by server policy.");
        return;
      }

      setSent(true);
      if (payload.audit) {
        setSentAuditId(payload.audit.auditId);
        setSentHash(payload.audit.signature ?? null);
        const auditEntry = auditFromServer(payload.audit);
        setServerAuditEntries((entries) => [...entries, auditEntry]);
      }
    },
    resetCase: () => {
      setSent(false);
      setRouted(false);
      setSentAuditId(null);
      setSentHash(null);
      setActionError(null);
      setServerAuditEntries([]);
    },
  };

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}

export function useCase() {
  const ctx = useContext(CaseContext);
  if (!ctx) throw new Error("useCase must be used within CaseProvider");
  return ctx;
}
