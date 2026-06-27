import { NextResponse, type NextRequest } from "next/server";
import { encodeMockSession, SESSION_COOKIE } from "@/lib/session";
import { tenants } from "@/lib/data";
import { appConfigForSession, scalekitEnvUrl } from "@/lib/config";

const roles = new Set(["reviewer", "approver", "admin"]);

export async function GET(request: NextRequest) {
  const roleParam = request.nextUrl.searchParams.get("role") ?? "reviewer";
  const tenantParam = request.nextUrl.searchParams.get("tenant") ?? tenants[0].id;
  const role = roles.has(roleParam) ? (roleParam as "reviewer" | "approver" | "admin") : "reviewer";
  const tenantId = tenants.some((tenant) => tenant.id === tenantParam) ? tenantParam : tenants[0].id;

  if (process.env.MOCK_AUTH !== "0") {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set({
      name: SESSION_COOKIE,
      value: encodeMockSession(role, tenantId),
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    return response;
  }

  const envUrl = scalekitEnvUrl();
  const clientId = process.env.SCALEKIT_CLIENT_ID;
  const redirectUri = new URL("/api/auth/callback", request.url).toString();
  const config = appConfigForSession();

  if (!envUrl || !clientId) {
    return Response.json({ error: "Scalekit is not configured" }, { status: 500 });
  }

  const url = new URL("/authorize", envUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scalekit.readOnlyScope.join(" "));
  url.searchParams.set("state", Buffer.from(JSON.stringify({ role, tenantId }), "utf8").toString("base64url"));
  return NextResponse.redirect(url);
}
