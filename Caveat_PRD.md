# Caveat — Product Requirements & Build Doc
### Scalekit × Actian × Render Hackathon · "Agents in Production" · June 27, SF

> **Caveat is the lawyer in your pocket. It reads the contract, catches the traps, and writes your response — without your private documents ever leaving your control.**

---

## 1. Positioning

An AI agent that reviews any contract you're about to sign, explains it in plain English, flags every trap against real market norms and against contracts you've signed before, drafts your counter-offer or redline, and — with your approval — sends or signs it *as you*, with a full audit trail. Your documents are embedded and searched **locally**, never shipped to a cloud.

**Hero document for the demo:** residential leases.
**Pocket pivot for this SF room:** startup offer letters (vesting cliffs, no acceleration, IP-assignment, non-competes). Same engine, more emotional punch with this audience.

---

## 2. Problem / Why now

People sign more binding digital contracts than ever — leases, freelance/contractor agreements, job offers, terms of service — with almost no leverage. The other party wrote the document; the signer can't afford a $300–400/hr lawyer to review a lease nobody reads.

Three forces make this the moment:
1. **AI can finally read dense legal text reliably** and explain it at a 9th-grade reading level.
2. **Volume of personal contracts is exploding** (gig economy, remote offers, digital leases).
3. **Privacy is the adoption unlock.** People will *not* paste their lease or salary into a cloud chatbot. Local-first retrieval is what makes a tool trustworthy enough to actually use — and it's exactly what Actian enables.

**Pains:** dread of getting screwed · asymmetry (they wrote it) · no time · no money for a lawyer · fear of uploading something this private.
**Gains:** understand any contract in plain English · every trap flagged against market norms · a ready-to-send counter drafted for you · confidence to sign · your data stays yours.

---

## 3. Target user

Primary: renters (everyone, recurring, high anxiety). Secondary: freelancers, new grads / job switchers reviewing offers, small founders signing vendor/contractor agreements. All share the same shape: high-stakes document, low expertise, no budget, strong privacy instinct.

---

## 4. User flow (plain English)

1. **Connect / upload.** User connects Gmail or Google Drive (via Scalekit) or uploads a PDF directly. Caveat finds the contract.
2. **Analyze.** The agent parses the document, splits it into clauses, and for each clause retrieves the closest matches from (a) a red-flag clause playbook and (b) the user's own past contracts — all from the local Actian store.
3. **Explain.** Plain-English summary, a risk score, and a ranked list of "watch out for these" clauses with *why* each is unusual or unfavorable.
4. **Draft.** For each flagged clause, the agent drafts a suggested counter / redline, citing the market-standard alternative from the playbook.
5. **Act (with approval).** On the user's click, Caveat sends the redline email or routes for e-signature **as the user**, scoped and audited via Scalekit. Nothing is sent without explicit approval.
6. **Watch.** A scheduled job keeps an eye on the connected inbox for new agreements and on any contract awaiting signature.

---

## 5. Scope

**MVP (must work for the demo):**
- Upload a lease **or** pull one from Gmail/Drive via Scalekit.
- Clause splitting + local embedding into Actian.
- Clause-level retrieval against the red-flag playbook + user's past contracts.
- Plain-English summary + ranked red-flag list + risk score.
- Draft a redline/counter for the top flagged clauses.
- "Send as me" action through Scalekit (Gmail send is the safe default) with a visible audit log.
- Deployed on Render: web + worker + Actian private service + cron, one private network.

**Stretch (only if time):**
- DocuSign connector for true e-sign (confirm availability at event; else Gmail send-for-signature).
- Negotiation simulation ("if you ask for X, they'll likely counter with Y").
- On-device / quantized LLM for a fully air-gapped reasoning demo.
- Render Workflows for durable multi-step orchestration with retries (upgrade path from the background worker).
- Expose Caveat's own actions as an MCP server secured by Scalekit OAuth 2.1.

---

## 6. Architecture — division of labor

| Layer | Tool | Job |
|---|---|---|
| Identity / action | **Scalekit** | Acts *as the user* to read the contract from Gmail/Drive and to send the redline / sign. Scoped permissions + 90-day audit trail + live revocation. |
| Sovereign memory | **Actian VectorAI DB** | Local, private vector store of the user's contracts + the red-flag clause playbook. Clause-level semantic retrieval. Data never leaves the boundary. |
| Production | **Render** | Web app, the agent worker, the Actian private service, and a cron watcher — all on one private network with autoscaling. |

Each tool owns a moment in the demo where it is irreplaceable (see §9).

---

## 7. Technical integration

### 7a. Scalekit (the "act as you" layer)

- SDK: `@scalekit-sdk/node`. Init: `new ScalekitClient(envUrl, clientId, clientSecret)`.
- **Connectors confirmed in their out-of-the-box set:** Gmail, Google Drive, Outlook, Notion, and 100+ more. Use **Gmail** (find incoming contracts + send the redline) and **Google Drive** (fetch a stored contract).
- **E-sign:** confirm at the event whether DocuSign is a built-in connector. If yes, use it for true signature. If not, two fallbacks: (1) Scalekit custom-connector path, or (2) send-for-signature via Gmail. Don't block the MVP on e-sign — Gmail send is the safe default.
- **Per-user scoped tool calling pattern:**

```js
const { tools } = await sk.tools.listScopedTools(userId, {
  filter: {
    connectionNames: ["gmail", "googledrive"],
    toolNames: ["gmail_messages_list", "gmail_message_send", "googledrive_file_get"]
  },
  pageSize: 100,
});
const llmTools = tools.map(t => ({
  name: t.tool.definition.name,
  description: t.tool.definition.description,
  input_schema: t.tool.definition.input_schema,
}));
// pass llmTools to Anthropic messages.create; Scalekit resolves the user's
// credential server-side at call time — it never enters the LLM context.
```

- **Award-winning Scalekit moments to engineer in:**
  1. Two personas: a **read-only** scope (can analyze, cannot send) vs an **act** scope (can send/sign). Show the read-only agent refusing to send.
  2. Show the **audit log** attributing the sent redline to the real human, not a bot.
  3. **Revoke** access mid-demo and show the next action **fail closed** with a clear error while analysis still works.

### 7b. Actian VectorAI DB (the sovereign memory layer)

- Run as a **Docker container** (Python + JS SDKs; LangChain / LlamaIndex support). Confirm the exact image name and SDK calls at the event.
- **Two collections:**
  1. `user_contracts` — the user's own past + current contracts, chunked **by clause** (not by token window — clause boundaries matter for legal retrieval).
  2. `clause_playbook` — your curated library of standard / unusual / red-flag clauses, each tagged with category, a "favorable to whom" label, and a market-standard counter.
- **Embeddings:** start with `all-MiniLM-L6-v2` (384-dim, fast, runs locally; used in Actian's own reference projects). Upgrade to a 768-dim or legal-tuned model if quality needs it.
- **Why retrieval is *essential* (the Actian best-use argument):** for each clause in the new contract, you run two semantic searches — against `clause_playbook` to classify and find the counter, and against `user_contracts` to say "this differs from your last lease's termination clause." Without vector search there is no product. That's the difference between "best use" and "bolted on."
- **The unplug demo:** all retrieval runs against the local Actian container with zero cloud round-trip. Sever the network and analysis/retrieval still works (only the LLM reasoning call is external — name the on-device quantized model as the fully-air-gapped stretch, matching Actian's "AI that doesn't need the cloud to think").
- **Talking points to say out loud:** portable / local-first, sub-100ms, ~22x QPS at scale, HIPAA/GDPR-grade, runs on a laptop or a Raspberry Pi.

### 7c. Render (the production layer)

One Blueprint (`render.yaml`), one private network, four services:

- **`web`** — Next.js frontend + API (connect/upload, view analysis, approve redline). *(Kabir's home turf — fastest path.)*
- **`worker`** — the agent pipeline (parse → chunk → embed → retrieve from Actian → LLM analysis → draft). Long-running and async, so it survives heavy documents. **Agents belong in workers, not request handlers — this is the Render best-use argument.**
- **`actian`** (private service) — the VectorAI DB container, reachable only on the private network. Reinforces the data-sovereignty story: retrieval traffic never touches the public internet.
- **`cron`** — the "contract watch": every 30 min, scan the connected inbox (via Scalekit) for new agreements and chase any contract awaiting signature. Demonstrates autonomous action.
- Optional: managed **Postgres** for app state + an audit mirror; **Render Key Value** (Valkey/Redis) for the worker queue.

**Award-winning Render moments:** open the dashboard showing all four services on one private network; trigger the cron live; crash/restart the worker to show resilience; mention autoscaling for the "viral moment." Cite **Render Workflows** as the durable-orchestration upgrade path.

**`render.yaml` skeleton (confirm field names / image URL at the event):**

```yaml
services:
  - type: web
    name: caveat-web
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - { key: SCALEKIT_ENV_URL, sync: false }
      - { key: SCALEKIT_CLIENT_ID, sync: false }
      - { key: SCALEKIT_CLIENT_SECRET, sync: false }
      - { key: ANTHROPIC_API_KEY, sync: false }
      - key: ACTIAN_URL
        fromService: { type: pserv, name: caveat-actian, property: hostport }

  - type: worker
    name: caveat-agent
    runtime: node            # or python
    buildCommand: npm install
    startCommand: node worker.js
    envVars:
      - { key: ANTHROPIC_API_KEY, sync: false }
      - key: ACTIAN_URL
        fromService: { type: pserv, name: caveat-actian, property: hostport }
      - key: REDIS_URL
        fromService: { type: keyvalue, name: caveat-queue, property: connectionString }

  - type: pserv              # private service — Actian, not publicly exposed
    name: caveat-actian
    runtime: image
    image: { url: "actian/vectorai:latest" }
    disk: { name: actian-data, mountPath: /var/lib/actian-vectorai, sizeGB: 1 }
    envVars:
      - { key: ACTIAN_VECTORAI_ACCEPT_EULA, value: "YES" }

  - type: cron
    name: caveat-watch
    runtime: node
    schedule: "*/30 * * * *"
    buildCommand: npm install
    startCommand: node watch.js

  - type: keyvalue
    name: caveat-queue
    plan: free
```

---

## 8. The agent pipeline (step by step)

1. **Ingest** — receive a PDF (upload) or fetch via Scalekit (Gmail/Drive). Extract text.
2. **Segment** — split into clauses by structure (numbered sections / headings), not fixed token chunks.
3. **Embed** — embed each clause; upsert into `user_contracts`.
4. **Retrieve** — per clause: top-k from `clause_playbook` (classify + find counter) and top-k from `user_contracts` (compare to the user's history).
5. **Reason** — LLM call (Claude) with the clause + its retrieved neighbors → {plain-English meaning, risk level, why, suggested counter}.
6. **Compose** — assemble the summary, risk score, ranked red-flag list, and a draft redline email.
7. **Act on approval** — user approves → Scalekit sends/sign as the user → write to audit log.

---

## 9. Demo script (~3 min) — stage all three award moments

1. **Hook (15s):** "Here's a real lease. Would you catch the clause that lets the landlord keep your deposit for 'general wear'? Neither would most people. Watch."
2. **Connect + analyze (40s):** Pull the lease from Gmail *as the user* via Scalekit. Risk score appears; top 3 red flags with plain-English explanations. → *Actian retrieval is doing this.*
3. **ACTIAN MOMENT (30s):** "Notice your lease never left this machine." **Cut the network.** Re-run a clause comparison — still instant. "Air-gapped, sub-100ms, your private documents stay yours."
4. **Draft + SCALEKIT MOMENT (45s):** Show the drafted counter-offer. Try to send on the **read-only** persona → blocked. Switch to the **act** persona → sends as the user. Open the **audit log**: attributed to the real human. **Revoke access** → next action fails closed.
5. **RENDER MOMENT (30s):** Open the Render dashboard — web + worker + Actian + cron on one private network. Trigger the cron watcher live: "it just found a new agreement in the inbox and flagged it — no one asked it to."
6. **Close (10s):** "A lawyer in your pocket that acts for you, keeps your documents private, and runs itself. That's Caveat."

---

## 10. "Why we win each award" — say these on stage

- **Scalekit:** "We don't store passwords or act as a bot. We act *as the user*, scoped, and every action is in the audit log — and we can revoke it live. This is the production identity problem, solved."
- **Actian:** "Legal documents are the one thing people will never put in a cloud. We embed and search them locally — clause-level retrieval against a market playbook and your own history. Pull the cable and it still works. Vector search isn't a feature here; it's the product."
- **Render:** "An agent that reads, reasons, drafts, and watches your inbox can't live in a request handler. Web, worker, the vector DB, and a cron watcher — one Blueprint, one private network, zero DevOps."

---

## 11. Pre-hackathon prep — build this NOW (so day-of is finishing touches)

**This week (no sponsor tools needed):**
- [ ] **Clause playbook:** 30–60 real lease clauses, each labeled standard / unusual / red-flag, with a tenant-favorable counter. (Build the offer-letter set too if you want the pivot ready.) *This is your moat and it's pure prep.*
- [ ] **3 sample leases** (one clean, one sketchy, one with a juicy "gotcha") as demo fixtures.
- [ ] **Agent pipeline locally**, using any local vector store first: parse → clause-split → embed → retrieve → Claude analysis → draft redline. Get the *logic* right before touching the sponsors.
- [ ] **Frontend shell** in Next.js: upload, analysis view, red-flag list, approve button. Static/mock data is fine for now.

**Account / environment setup (do before, not at, the event):**
- [ ] Scalekit dev account; a test Gmail connector authorized; confirm the `listScopedTools` call returns Gmail tools.
- [ ] Pull the Actian Docker image; confirm it runs locally; load the playbook; confirm a query returns sane results.
- [ ] Render account; create the Blueprint skeleton (the 4 services above) deploying a "hello world" so the topology is proven.
- [ ] Anthropic API key in hand.

**Day-of runsheet (≈6 hrs build):**
1. *First 90 min — highest risk first:* wire Scalekit auth + one real scoped tool call (pull a lease from Gmail as the user). If this is solid, everything else is downstream.
2. *Next:* stand up Actian on Render as a private service; load the playbook + sample contracts.
3. *Next:* move the agent pipeline into the Render worker, pointed at Actian over the private network.
4. *Next:* deploy the whole Blueprint; verify cron fires.
5. *Last 90 min:* **demo choreography.** Rehearse the unplug + revoke moments until they're automatic. Presentation is 25% of the score — the moments must be muscle memory, not improvised.

---

## 12. Risks & de-risking

- **Scalekit e-sign uncertainty** → default to Gmail send; treat DocuSign as stretch.
- **Actian image / SDK unknowns** → confirm image name and a working query *before* the event; have a local fallback vector store wired behind the same interface so a last-minute Actian hiccup doesn't kill the demo.
- **"Is this a feature, not a company?"** → answer with the local-privacy + acts-as-you-with-audit combination; a cloud chatbot can do neither.
- **Live demo fragility** → pre-record a 20-second backup video of the unplug + revoke moments in case the venue network misbehaves.
- **Scope creep** → negotiation simulation, multi-doc, MCP server are all stretch. Protect the MVP path.
