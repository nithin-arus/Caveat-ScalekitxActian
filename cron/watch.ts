import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

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

const DEFAULT_INBOX = "./mock_inbox.json";

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

function main() {
  const inboxPath = env("WATCH_MOCK_INBOX", DEFAULT_INBOX);
  const limit = Number(env("WATCH_POLL_LIMIT", "10"));
  const dryRun = env("WATCH_DRY_RUN", "true") !== "false";
  const inbox = readInbox(inboxPath).slice(0, limit);
  const findings = inbox.map(classify).filter((item): item is WatchFinding => item !== null);

  const event = {
    event: "caveat.watch.completed",
    dry_run: dryRun,
    checked: inbox.length,
    found: findings.length,
    findings,
    next_action: dryRun
      ? "Would enqueue analysis jobs for each finding."
      : "Enqueue analysis jobs through the worker queue."
  };

  console.log(JSON.stringify(event, null, 2));
}

main();
