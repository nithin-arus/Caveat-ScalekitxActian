"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAllAnalyses } from "@/lib/data";
import { useSession } from "@/lib/session";

export default function ConnectPage() {
  const router = useRouter();
  const { tenant } = useSession();
  const analyses = getAllAnalyses().filter((a) => !a.tenantId || a.tenantId === tenant.id);
  const [uploading, setUploading] = useState(false);

  function handleMockUpload() {
    setUploading(true);
    setTimeout(() => {
      router.push(`/analysis/${analyses[0]?.id ?? "lease-sketchy"}`);
    }, 900);
  }

  return (
    <div className="mx-auto max-w-3xl w-full px-6 py-16 flex flex-col gap-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Intake a new case</h1>
        <p className="text-ink-muted">
          Pull a lease from a client&apos;s inbox or Drive (via Scalekit), or upload a PDF directly.
          Viewing cases for <span className="font-semibold text-seal">{tenant.name}</span> — switch
          tenants in the header to see another org&apos;s caseload.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <button
          type="button"
          disabled
          title="Wired to Scalekit on build day"
          className="rounded-2xl border border-ink/10 bg-paper-muted/60 p-6 text-left opacity-60 cursor-not-allowed"
        >
          <p className="font-semibold mb-1">Connect Gmail / Drive</p>
          <p className="text-sm text-ink-muted">
            Scalekit-scoped connector. Disabled in this pre-event build — wired live on June 27.
          </p>
        </button>

        <button
          type="button"
          onClick={handleMockUpload}
          className="rounded-2xl border border-seal/30 bg-paper p-6 text-left hover:border-seal hover:shadow-sm transition-all"
        >
          <p className="font-semibold mb-1">{uploading ? "Uploading…" : "Upload a PDF"}</p>
          <p className="text-sm text-ink-muted">
            {uploading
              ? "Parsing, segmenting, and running clause retrieval against the local Actian playbook…"
              : "Mock upload — drops you into the analysis of a sample case."}
          </p>
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Caseload — {tenant.name}</h2>
        <div className="grid gap-3">
          {analyses.map((a) => (
            <Link
              key={a.id}
              href={`/analysis/${a.id}`}
              className="flex items-center justify-between rounded-xl border border-ink/10 bg-paper px-5 py-4 hover:border-seal/40 hover:bg-paper-muted/60 transition-colors"
            >
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-ink-muted">{a.flags.length} clauses reviewed</p>
              </div>
              <span className="text-sm font-semibold text-seal">Risk {a.riskScore}</span>
            </Link>
          ))}
          {analyses.length === 0 && (
            <p className="text-sm text-ink-muted">No cases yet for this tenant.</p>
          )}
        </div>
      </div>
    </div>
  );
}
