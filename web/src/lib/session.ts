import { cookies } from "next/headers";
import type { SessionIdentity } from "@shared/contracts";
import { tenantForOid } from "@shared/config";
import { buildMockSession } from "@/lib/data";

export const SESSION_COOKIE = "caveat_session";

type MockSessionCookie = {
  role?: "reviewer" | "approver" | "admin";
  tenantId?: string;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(normalized, "base64").toString("utf8");
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function firstString(payload: Record<string, unknown> | null, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = payload?.[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return fallback;
}

export function encodeMockSession(role: MockSessionCookie["role"], tenantId: string) {
  return Buffer.from(JSON.stringify({ role, tenantId }), "utf8").toString("base64url");
}

export async function getSession(): Promise<SessionIdentity> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (process.env.MOCK_AUTH !== "1" && accessToken) {
    const payload = decodeJwtPayload(accessToken);
    const oid = firstString(payload, ["oid", "org_id", "organization_id", "tenant_id"], "org_sf_tenants_union");
    const tenant = tenantForOid(oid);
    const roles = arrayOfStrings(payload?.roles);
    const permissions = arrayOfStrings(payload?.permissions) as SessionIdentity["permissions"];

    return {
      sub: firstString(payload, ["sub", "user_id"], "scalekit_user"),
      oid,
      tenantId: tenant.id,
      name: firstString(payload, ["name", "given_name", "email"], "Scalekit User"),
      email: firstString(payload, ["email", "preferred_username"], "user@example.com"),
      roles,
      permissions: permissions.length > 0 ? permissions : ["read:cases", "route:redline"],
      tenant,
      mode: "scalekit",
    };
  }

  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return buildMockSession();

  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as MockSessionCookie;
    return buildMockSession(parsed.role, parsed.tenantId);
  } catch {
    return buildMockSession();
  }
}
