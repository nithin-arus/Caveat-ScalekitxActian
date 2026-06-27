import { integrationRoadmap, PLAYBOOK_COLLECTION, tenantMemoryCollection, VECTOR_DIMENSIONS } from "@shared/config";
import type { IntegrationKey, SessionIdentity } from "@shared/contracts";

function env(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

function csv(name: string, fallback: string) {
  return env(name, fallback)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function scalekitEnvUrl() {
  return env("SCALEKIT_ENV_URL", env("SCALEKIT_ENVIRONMENT_URL"));
}

export function appConfigForSession(session?: SessionIdentity) {
  return {
    appUrl: env("CAVEAT_APP_URL", "http://localhost:3000"),
    authMode: env("MOCK_AUTH", "1") === "0" ? "scalekit" : "mock",
    scalekit: {
      envUrl: scalekitEnvUrl(),
      clientId: env("SCALEKIT_CLIENT_ID"),
      defaultConnections: csv("SCALEKIT_DEFAULT_CONNECTIONS", "gmail,googledrive"),
      readOnlyScope: csv("SCALEKIT_READ_ONLY_SCOPE", "openid,profile,email,read"),
      actScope: csv("SCALEKIT_ACT_SCOPE", "openid,profile,email,read,send"),
    },
    actian: {
      url: env("ACTIAN_URL", "http://localhost:6574"),
      dimensions: Number(env("ACTIAN_VECTOR_DIMENSIONS", String(VECTOR_DIMENSIONS))),
      playbookCollection: env("ACTIAN_PLAYBOOK_COLLECTION", PLAYBOOK_COLLECTION),
      userContractsCollection: session
        ? tenantMemoryCollection(session.tenantId, session.sub)
        : "resolved-after-auth",
    },
    integrations: integrationRoadmap.map((integration) => ({
      ...integration,
      configured: integration.requiredEnv.every((key) => Boolean(env(key))),
    })),
  };
}

export function integrationIsConfigured(key: IntegrationKey) {
  return appConfigForSession().integrations.find((integration) => integration.key === key)?.configured ?? false;
}
