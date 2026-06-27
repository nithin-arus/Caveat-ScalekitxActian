# Caveat — Pre-Hackathon Build Plan

> Goal: build everything that needs **no sponsor API keys** now, so day-of (June 27) is wiring + choreography only. Sponsor seams stubbed behind interfaces so swapping in real Scalekit/Actian/Anthropic is a one-file change.

---

## 0. Guiding principle

Build against **interfaces**, not vendors. Three swappable adapters:

- `VectorStore` — local impl now (in-memory / SQLite + cosine), Actian impl day-of.
- `IdentityActions` — mock impl now (fake Gmail fetch/send + audit log), Scalekit impl day-of.
- `Reasoner` — mock impl now (canned analysis from fixtures), Anthropic impl when key arrives.

Everything above these interfaces (pipeline, UI, API) is built and tested NOW with zero keys.

---

## 1. Repo / monorepo layout

```
caveat/
  apps/
    web/                 # Next.js frontend + API routes (Kabir's turf)
  packages/
    core/                # the agent pipeline — pure TS, no vendor imports
      ingest.ts          # PDF/text -> raw text
      segment.ts         # text -> clauses (by numbered sections/headings)
      pipeline.ts        # orchestrates ingest->segment->embed->retrieve->reason->compose
      types.ts           # Clause, Analysis, RedFlag, RiskScore, Draft
    adapters/
      vector/
        VectorStore.ts   # interface
        LocalVectorStore.ts   # cosine over local embeddings (NOW)
        ActianVectorStore.ts  # stub, fill day-of
      identity/
        IdentityActions.ts    # interface (listInbox, fetchDoc, sendEmail, audit)
        MockIdentity.ts       # NOW
        ScalekitIdentity.ts   # stub, fill day-of
      reason/
        Reasoner.ts           # interface (analyzeClause)
        MockReasoner.ts       # NOW — returns fixture analysis
        ClaudeReasoner.ts     # stub, fill when ANTHROPIC_API_KEY ready
    embeddings/
      embed.ts           # all-MiniLM-L6-v2 via @xenova/transformers (local, no key!)
  data/
    playbook/            # clause playbook JSON (the moat — build by hand)
    fixtures/            # 3 sample leases + canned analyses
  worker/
    worker.ts            # job runner (NOW: in-proc queue; day-of: Render worker + Redis)
    watch.ts             # cron watcher (NOW: mock inbox scan)
  render.yaml            # 4-service blueprint (skeleton now, deploy hello-world day-of)
```

Monorepo via pnpm workspaces or npm workspaces. Web imports `core`, `core` imports interfaces only.

---

## 2. What to build NOW — priority order

### P0 — The moat (pure prep, no code deps)
1. **Clause playbook** (`data/playbook/lease.json`): 30–60 real lease clauses. Each entry:
   ```json
   {
     "id": "deposit-general-wear",
     "category": "security_deposit",
     "text": "Landlord may retain deposit for general wear and tear.",
     "rating": "red_flag",
     "favors": "landlord",
     "why": "Normal wear is legally the landlord's cost in most states.",
     "counter": "Strike 'general wear and tear'; deposit deductions limited to damage beyond normal wear."
   }
   ```
   Also build `offer_letter.json` set (vesting cliff, no acceleration, IP assignment, non-compete) for the SF pivot.
2. **3 sample leases** in `data/fixtures/`: one clean, one sketchy, one with a juicy gotcha. Plain text + PDF.

### P1 — Embeddings + local vector store (NO KEY NEEDED)
3. `embeddings/embed.ts` — `@xenova/transformers` runs `all-MiniLM-L6-v2` **fully local in Node**, 384-dim. Zero API key. This is the same model the Actian story uses, so retrieval quality matches day-of.
4. `LocalVectorStore.ts` — upsert + top-k cosine. Two collections: `user_contracts`, `clause_playbook`. Load playbook on boot.

### P2 — Pipeline (the real logic, fully testable now)
5. `ingest.ts` — `pdf-parse` for PDFs, passthrough for text fixtures.
6. `segment.ts` — clause splitter on numbered sections / headings (regex on `\n\d+\.` , `Section`, ALL-CAPS headings). Legal boundaries, not token windows.
7. `pipeline.ts` — wire: ingest → segment → embed → retrieve(playbook + user history) → `Reasoner.analyzeClause` → compose summary/risk/redlines.
8. `MockReasoner.ts` — returns deterministic analysis pulled from playbook match (so the whole pipeline runs end-to-end with no LLM). Swap to `ClaudeReasoner` later changes one line.

### P3 — Frontend shell (Kabir, parallel track)
9. Next.js app: **Connect/Upload** screen → **Analysis view** (risk score gauge, ranked red-flag list with plain-English why) → **Draft/Redline** panel with per-clause counter → **Approve & Send** button (calls MockIdentity, shows audit log row).
10. Wire UI to the **real pipeline output** running on mock adapters. Looks fully live; no keys.

### P4 — Worker + cron seams
11. `worker.ts` — accept a job, run pipeline, store result. In-proc now; Render worker day-of.
12. `watch.ts` — mock "found a new agreement in inbox" → runs pipeline → flags it. Same code Render cron runs day-of.

### P5 — Deploy topology (no keys)
13. `render.yaml` — the 4-service skeleton from PRD §7c (renamed `caveat-*`). Day-of: deploy hello-world to prove topology.

---

## 3. Adapter interfaces (lock these now)

```ts
// VectorStore.ts
interface VectorStore {
  upsert(collection: string, items: {id:string; text:string; meta:any}[]): Promise<void>;
  query(collection: string, text: string, k: number): Promise<{id:string; score:number; meta:any}[]>;
}

// IdentityActions.ts
interface IdentityActions {
  listInbox(userId: string): Promise<{id:string; subject:string}[]>;
  fetchDocument(userId: string, id: string): Promise<{name:string; text:string}>;
  sendEmail(userId: string, to: string, subject: string, body: string): Promise<{auditId:string}>;
  scope: "read_only" | "act";   // drives the read-only-refuses-to-send demo moment
}

// Reasoner.ts
interface Reasoner {
  analyzeClause(input: {clause:string; playbookMatch:any; userHistory:any[]}):
    Promise<{plainEnglish:string; risk:"low"|"med"|"high"; why:string; counter:string}>;
}
```

Demo moments fall out of the interface: `scope: "read_only"` → `sendEmail` throws → UI shows fail-closed. Swapping `MockIdentity`→`ScalekitIdentity` keeps the same UI.

---

## 4. Day-of checklist (keys in hand)
- [ ] `ScalekitIdentity.ts` — `listScopedTools` → map to real Gmail/Drive calls. (~90 min, do first, highest risk.)
- [ ] `ActianVectorStore.ts` — same interface, point at Actian container on Render private net.
- [ ] `ClaudeReasoner.ts` — Anthropic `messages.create`, pass clause + retrieved neighbors. Use latest model `claude-opus-4-8` (or `claude-sonnet-4-6` for speed/cost).
- [ ] Deploy `render.yaml`; verify cron fires.
- [ ] Rehearse unplug + revoke moments.

## 5. Definition of "done before event"
Run `npm run demo` locally with NO keys → uploads sketchy fixture lease → real clause split → real local embeddings → real retrieval → mock analysis → renders full UI with risk score, red flags, drafted redlines, and a working (mock) send + audit log. If that works, day-of is just swapping 3 adapter files.
