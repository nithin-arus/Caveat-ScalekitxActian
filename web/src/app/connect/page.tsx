"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAllAnalyses } from "@/lib/data";

export default function ConnectPage() {
  const router = useRouter();
  const analyses = getAllAnalyses();
  const [uploading, setUploading] = useState(false);

  function handleMockUpload() {
    setUploading(true);
    setTimeout(() => {
      router.push(`/analysis/${analyses[0].id}`);
    }, 900);
  }

  return (
    <div className="mx-auto max-w-3xl w-full px-6 py-16 flex flex-col gap-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Connect or upload a contract</h1>
        <p className="text-ink-muted">
          Pull a contract from Gmail or Drive (via Scalekit), or upload a PDF directly. For now,
          everything below runs on local fixtures.
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
              ? "Parsing, segmenting, and running clause retrieval…"
              : "Mock upload — drops you into the analysis of a sample lease."}
          </p>
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Or pick a sample contract</h2>
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
        </div>
      </div>
    </div>
  );
}
