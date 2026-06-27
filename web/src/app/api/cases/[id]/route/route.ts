import { getSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac";
import { routeCaseToAttorney } from "@/lib/server-store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  try {
    requirePermission(session, "route:redline");
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 403 });
  }

  const result = routeCaseToAttorney(id, session);
  if (!result) return Response.json({ error: "Case not found" }, { status: 404 });
  return Response.json(result);
}
