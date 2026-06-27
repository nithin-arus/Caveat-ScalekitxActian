import { getSession } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { listCasesForSession } from "@/lib/server-store";
import { ApprovalsQueue } from "@/components/ApprovalsQueue";

export default async function ApprovalsPage() {
  const session = await getSession();
  const canApprove = hasPermission(session, "act:redline");
  const cases = listCasesForSession(session).filter((item) => item.status === "awaiting_approval");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-seal">Scalekit approval chain</p>
          <h1 className="text-3xl font-semibold tracking-tight">Attorney approvals</h1>
          <p className="max-w-3xl text-ink-muted">
            Routed cases for {session.tenant.name}. Reviewers can prepare the packet, but only an
            Approver or Supervisor with <span className="font-mono">act:redline</span> can send a
            redline as the organization.
          </p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Current identity</p>
          <p className="mt-2 text-lg font-semibold">{session.name}</p>
          <p className="text-sm text-ink-muted">{session.roles.join(", ") || "reviewer"}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="rounded bg-paper-muted px-3 py-2">
              <p className="font-mono text-lg">{cases.length}</p>
              <p className="text-ink-muted">queued</p>
            </div>
            <div className="rounded bg-paper-muted px-3 py-2">
              <p className="font-mono text-lg">{canApprove ? "ON" : "NO"}</p>
              <p className="text-ink-muted">send scope</p>
            </div>
          </div>
        </div>
      </div>

      <ApprovalsQueue initialCases={cases} session={session} canApprove={canApprove} />
    </div>
  );
}
