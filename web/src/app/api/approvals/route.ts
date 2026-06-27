import { getSession } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { listCasesForSession } from "@/lib/server-store";

export async function GET() {
  const session = await getSession();
  if (!hasPermission(session, "act:redline")) {
    return Response.json({ error: "Requires Attorney Approval", cases: [], session }, { status: 403 });
  }

  const cases = listCasesForSession(session).filter((item) => item.status === "awaiting_approval");
  return Response.json({ cases, session });
}
