type ScalekitLike = {
  getAuthorizationUrl?: (redirectUri: string, options: { scopes: string[] }) => Promise<string> | string;
  authenticateWithCode?: (code: string, redirectUri: string) => Promise<unknown>;
  getLogoutUrl?: (idToken: string, postLogoutRedirectUri: string) => Promise<string> | string;
};

export async function getScalekitClient(): Promise<ScalekitLike> {
  const envUrl = process.env.SCALEKIT_ENVIRONMENT_URL;
  const clientId = process.env.SCALEKIT_CLIENT_ID;
  const clientSecret = process.env.SCALEKIT_CLIENT_SECRET;

  if (!envUrl || !clientId || !clientSecret) {
    throw new Error("Scalekit env vars are not configured; set MOCK_AUTH=1 for local demo mode.");
  }

  throw new Error(
    "Install @scalekit-sdk/node and replace this stub with new Scalekit(envUrl, clientId, clientSecret)."
  );
}
