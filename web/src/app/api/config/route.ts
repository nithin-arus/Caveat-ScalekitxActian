import { appConfigForSession } from "@/lib/config";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  const config = appConfigForSession(session);

  return Response.json({
    session,
    config: {
      authMode: config.authMode,
      scalekit: {
        configured: Boolean(config.scalekit.envUrl && config.scalekit.clientId),
        defaultConnections: config.scalekit.defaultConnections,
      },
      actian: config.actian,
      integrations: config.integrations,
    },
  });
}
