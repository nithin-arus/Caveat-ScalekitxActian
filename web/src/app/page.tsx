import Link from "next/link";

const moments = [
  {
    title: "Scalekit",
    body: "Multi-tenant RBAC: case workers flag clauses, only SSO-verified attorneys can approve a send — every action attributed in a verifiable audit trail.",
  },
  {
    title: "Actian",
    body: "Runs on-prem behind the clinic's firewall. Thousands of client leases cross-referenced against a toxicity database, zero PII touching the cloud.",
  },
  {
    title: "Render",
    body: "Web, worker, vector DB, and a cron watcher — one blueprint, one private network, ready to scale across every clinic on the platform.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 flex flex-col items-center text-center gap-8">
        {/* Spline hero scene mounts here on build day — @splinetool/react-spline */}
        <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-seal/30 bg-paper-muted shadow-inner">
          <span className="text-6xl">🪶</span>
        </div>
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-seal">
            Systemic defense for tenant advocates
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight max-w-3xl">
            Corporate landlords use software to exploit tenants. Fineprint is the enterprise
            software Legal Aid uses to fight back.
          </h1>
          <p className="max-w-xl mx-auto text-lg text-ink-muted">
            Every lease checked at scale against a citywide playbook of predatory clauses, with
            role-gated attorney approval and a verifiable chain of custody — without client data
            ever leaving your firewall.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/connect"
            className="rounded-full bg-seal px-7 py-3 text-paper font-medium hover:bg-seal-dark transition-colors"
          >
            Review a case
          </Link>
          <Link
            href="/watch"
            className="rounded-full border border-ink/15 px-7 py-3 font-medium hover:bg-paper-muted transition-colors"
          >
            See the watch panel
          </Link>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-paper-muted/60">
        <div className="mx-auto max-w-5xl px-6 py-14 grid gap-8 sm:grid-cols-3">
          {moments.map((m) => (
            <div key={m.title} className="space-y-2">
              <h3 className="font-semibold text-seal">{m.title}</h3>
              <p className="text-sm text-ink-muted">{m.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
