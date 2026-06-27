import { getSession } from "@/lib/session";
import { listCasesForSession } from "@/lib/server-store";

export async function GET() {
  const session = await getSession();
  return Response.json({ cases: listCasesForSession(session), session });
}
