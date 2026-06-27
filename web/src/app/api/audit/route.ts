import { getSession } from "@/lib/session";
import { listAuditForSession } from "@/lib/server-store";

export async function GET() {
  const session = await getSession();
  return Response.json({ entries: listAuditForSession(session), session });
}
