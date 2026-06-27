import { cookies } from "next/headers";
import type { SessionIdentity } from "@shared/contracts";
import { buildMockSession, tenantForOid } from "@/lib/data";

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

export function encodeMockSession(role: MockSessionCookie["role"], tenantId: string) {
  return Buffer.from(JSON.stringify({ role, tenantId }), "utf8").toString("base64url");
}

export async function getSession(): Promise<SessionIdentity> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (process.env.MOCK_AUTH !== "1" && accessToken) {
    const payload = decodeJwtPayload(accessToken);
    const oid = typeof payload?.oid === "string" ? payload.oid : "org_sf_tenants_union";
    const tenant = tenantForOid(oid);

    return {
      sub: typeof payload?.sub === "string" ? payload.sub : "scalekit_user",
      oid,
      tenantId: tenant.id,
      name: typeof payload?.name === "string" ? payload.name : "Scalekit User",
      email: typeof payload?.email === "string" ? payload.email : "user@example.com",
      roles: arrayOfStrings(payload?.roles),
      permissions: arrayOfStrings(payload?.permissions) as SessionIdentity["permissions"],
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
