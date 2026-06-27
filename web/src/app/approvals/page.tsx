import Link from "next/link";
import { getSession } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { listCasesForSession } from "@/lib/server-store";

export default async function ApprovalsPage() {
  const session = await getSession();
  const canApprove = hasPermission(session, "act:redline");
  const cases = canApprove
    ? listCasesForSession(session).filter((item) => item.status === "awaiting_approval")
    : [];

  return (
    <div className="mx-auto max-w-5xl w-full px-6 py-16 flex flex-col gap-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-widest text-seal">Approver only</p>
        <h1 className="text-3xl font-semibold tracking-tight">Attorney approvals</h1>
        <p className="text-ink-muted">
          Routed cases for {session.tenant.name}. Reviewers can prepare the packet, but only an
          Approver with <span className="font-mono">act:redline</span> can send.
        </p>
      </div>

      {!canApprove && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Requires Attorney Approval. Sign in as an Approver to see this queue.
        </div>
      )}

      {canApprove && cases.length === 0 && (
        <div className="rounded-xl border border-ink/10 bg-paper-muted/50 px-5 py-8 text-center text-ink-muted">
          No cases are waiting for approval in this tenant.
        </div>
      )}

      <div className="grid gap-3">
        {cases.map((item) => (
          <Link
            key={item.id}
            href={`/analysis/${item.id}`}
            className="flex flex-col gap-3 rounded-lg border border-ink/10 bg-paper px-5 py-4 hover:border-seal/40 hover:bg-paper-muted/60 transition-colors sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-ink-muted">
                Routed by {item.routedBy ?? "Dana Reviewer"} · Risk {item.riskScore}
              </p>
            </div>
            <span className="rounded-full bg-seal px-4 py-2 text-sm font-medium text-paper">
              Review and send
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
