import { createHmac, randomUUID } from "node:crypto";
import type { AuditEntry, SessionIdentity } from "@shared/contracts";

const secret = process.env.AUDIT_HMAC_SECRET ?? "caveat-demo-audit-secret";

export function signAuditEntry(entry: Omit<AuditEntry, "signature" | "verified">) {
  return createHmac("sha256", secret)
    .update(JSON.stringify(entry))
    .digest("hex")
    .slice(0, 32);
}

export function createAuditEntry(args: {
  action: AuditEntry["action"];
  detail: string;
  ok: boolean;
  session: SessionIdentity;
}): AuditEntry {
  const entry = {
    auditId: `aud_${randomUUID().slice(0, 8)}`,
    tenantId: args.session.tenantId,
    action: args.action,
    actor: args.session.name,
    actorRole: args.session.roles[0] ?? "unknown",
    detail: args.detail,
    timestamp: new Date().toISOString(),
    ok: args.ok,
  };

  return {
    ...entry,
    signature: signAuditEntry(entry),
    verified: true,
  };
}
