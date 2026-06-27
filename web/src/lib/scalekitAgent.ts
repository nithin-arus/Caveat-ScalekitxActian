import { ScalekitClient } from "@scalekit-sdk/node";
import { ConnectorStatus } from "@scalekit-sdk/node/lib/pkg/grpc/scalekit/v1/connected_accounts/connected_accounts_pb.js";
import { scalekitEnvUrl } from "@/lib/config";

const CONNECTION_NAME = "gmail";

let client: ScalekitClient | null = null;

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `${name} is not set. Fill in web/.env.local with your Scalekit credentials from app.scalekit.com -> Developers -> Settings -> API Credentials.`
    );
  }
  return value;
}

function getAgentKitClient(): ScalekitClient {
  if (!client) {
    client = new ScalekitClient(
      requireEnv("SCALEKIT_ENV_URL", scalekitEnvUrl()),
      requireEnv("SCALEKIT_CLIENT_ID", process.env.SCALEKIT_CLIENT_ID),
      requireEnv("SCALEKIT_CLIENT_SECRET", process.env.SCALEKIT_CLIENT_SECRET)
    );
  }
  return client;
}

function appUrl(): string {
  // RENDER_EXTERNAL_URL is auto-injected by Render on the public web service —
  // prefer it so the OAuth callback never points at a dead/local URL once deployed.
  return process.env.RENDER_EXTERNAL_URL || process.env.CAVEAT_APP_URL || "http://localhost:3000";
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildRawMessage(args: { to: string; subject: string; body: string }): string {
  const message = [
    `To: ${args.to}`,
    `Subject: ${args.subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    args.body,
  ].join("\r\n");
  return base64UrlEncode(message);
}

/**
 * The identifier each teammate should use for THEMSELVES when testing locally —
 * defaults to whoever is set in CAVEAT_DEMO_USER_ID, since one Scalekit identifier
 * maps to one connected Gmail account (sharing one means clobbering each other).
 */
export function demoIdentifier(fallback: string): string {
  return process.env.CAVEAT_DEMO_USER_ID || fallback;
}

export async function ensureGmailAuthorized(identifier: string): Promise<{ authorized: boolean; link?: string }> {
  const scalekit = getAgentKitClient();
  const { connectedAccount } = await scalekit.actions.getOrCreateConnectedAccount({
    connectionName: CONNECTION_NAME,
    identifier,
  });

  if (connectedAccount?.status === ConnectorStatus.ACTIVE) {
    return { authorized: true };
  }

  const { link } = await scalekit.actions.getAuthorizationLink({
    connectionName: CONNECTION_NAME,
    identifier,
    userVerifyUrl: `${appUrl()}/api/connections/callback?identifier=${encodeURIComponent(identifier)}`,
  });
  return { authorized: false, link };
}

export async function sendGmailAsUser(
  identifier: string,
  args: { to: string; subject: string; body: string }
): Promise<{ ok: true; auditId: string }> {
  const scalekit = getAgentKitClient();

  const { connectedAccount } = await scalekit.actions.getOrCreateConnectedAccount({
    connectionName: CONNECTION_NAME,
    identifier,
  });

  if (connectedAccount?.status !== ConnectorStatus.ACTIVE) {
    throw new Error(
      `Gmail is not connected (or access was revoked) for "${identifier}". Authorize it first, then retry.`
    );
  }

  const response = await scalekit.actions.request({
    connectionName: CONNECTION_NAME,
    identifier,
    path: "/gmail/v1/users/me/messages/send",
    method: "POST",
    body: { raw: buildRawMessage(args) },
  });

  return { ok: true, auditId: `scalekit:${connectedAccount.id}:${response.data?.id ?? "sent"}` };
}

export async function verifyGmailConnection(authRequestId: string, identifier: string) {
  const scalekit = getAgentKitClient();
  await scalekit.actions.verifyConnectedAccountUser({ authRequestId, identifier });
}
