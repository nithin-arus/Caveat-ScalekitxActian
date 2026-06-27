import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type InboxItem = {
  id: string;
  subject: string;
  from: string;
  received_at: string;
  fixture: string | null;
  status: "new" | "ignored";
};

type WatchFinding = {
  inbox_id: string;
  subject: string;
  from: string;
  fixture: string;
  likely_contract_type: "lease" | "offer_letter" | "unknown";
  priority: "low" | "medium" | "high";
  reason: string;
};

type AnalysisJob = {
  id: string;
  source: "cron";
  inbox_id: string;
  subject: string;
  from: string;
  fixture: string;
  likely_contract_type: WatchFinding["likely_contract_type"];
  priority: WatchFinding["priority"];
  reason: string;
  enqueued_at: string;
};

const DEFAULT_INBOX = "./mock_inbox.json";
const DEFAULT_QUEUE_FILE = "../data/generated/watch_jobs.jsonl";

function env(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

function readInbox(path: string): InboxItem[] {
  const resolved = resolve(path);
  if (!existsSync(resolved)) {
    throw new Error(`Mock inbox not found at ${resolved}`);
  }
  return JSON.parse(readFileSync(resolved, "utf8")) as InboxItem[];
}

function classify(item: InboxItem): WatchFinding | null {
  if (item.status !== "new" || !item.fixture) return null;

  const subject = item.subject.toLowerCase();
  const fixture = item.fixture.toLowerCase();

  if (subject.includes("lease") || fixture.includes("lease")) {
    return {
      inbox_id: item.id,
      subject: item.subject,
      from: item.from,
      fixture: item.fixture,
      likely_contract_type: "lease",
      priority: "high",
      reason: "Detected a lease-like document that should be reviewed before signing."
    };
  }

  if (subject.includes("offer") || fixture.includes("offer")) {
    return {
      inbox_id: item.id,
      subject: item.subject,
      from: item.from,
      fixture: item.fixture,
      likely_contract_type: "offer_letter",
      priority: "high",
      reason: "Detected an offer letter with compensation, equity, and IP terms."
    };
  }

  return {
    inbox_id: item.id,
    subject: item.subject,
    from: item.from,
    fixture: item.fixture,
    likely_contract_type: "unknown",
    priority: "medium",
    reason: "Detected a document-like inbox item that may need contract review."
  };
}

function toJob(finding: WatchFinding, now: string): AnalysisJob {
  return {
    id: `job-${finding.inbox_id}-${now.replace(/[^0-9]/g, "")}`,
    source: "cron",
    inbox_id: finding.inbox_id,
    subject: finding.subject,
    from: finding.from,
    fixture: finding.fixture,
    likely_contract_type: finding.likely_contract_type,
    priority: finding.priority,
    reason: finding.reason,
    enqueued_at: now
  };
}

function enqueueJobs(queueFile: string, jobs: AnalysisJob[]) {
  const resolved = resolve(queueFile);
  mkdirSync(dirname(resolved), { recursive: true });

  for (const job of jobs) {
    appendFileSync(resolved, `${JSON.stringify(job)}\n`, "utf8");
  }

  return resolved;
}

function main() {
  const inboxPath = env("WATCH_MOCK_INBOX", DEFAULT_INBOX);
  const limit = Number(env("WATCH_POLL_LIMIT", "10"));
  const dryRun = env("WATCH_DRY_RUN", "true") !== "false";
  const queueFile = env("CAVEAT_QUEUE_FILE", DEFAULT_QUEUE_FILE);
  const inbox = readInbox(inboxPath).slice(0, limit);
  const findings = inbox.map(classify).filter((item): item is WatchFinding => item !== null);
  const now = new Date().toISOString();
  const jobs = findings.map((finding) => toJob(finding, now));
  const queuedTo = dryRun || jobs.length === 0 ? null : enqueueJobs(queueFile, jobs);

  const event = {
    event: "caveat.watch.completed",
    dry_run: dryRun,
    checked: inbox.length,
    found: findings.length,
    findings,
    queued: dryRun ? 0 : jobs.length,
    queue_file: queuedTo,
    next_action: dryRun
      ? "Would enqueue analysis jobs for each finding."
      : jobs.length > 0
        ? "Analysis jobs enqueued for the worker."
        : "No new analysis jobs to enqueue."
  };

  console.log(JSON.stringify(event, null, 2));
}

main();
