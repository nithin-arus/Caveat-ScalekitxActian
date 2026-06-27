import { getSession } from "@/lib/session";
import { getCaseForSession } from "@/lib/server-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  const analysis = getCaseForSession(id, session);

  if (!analysis) return Response.json({ error: "Case not found" }, { status: 404 });
  return Response.json({ analysis, session });
}
