import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { sampleAnalyses } from "../data/fixtures/analyses.ts";
import type { Analysis } from "../shared/contracts.ts";

type AnalysisJob = {
  id: string;
  source: string;
  inbox_id?: string;
  subject: string;
  from?: string;
  fixture: string;
  likely_contract_type?: "lease" | "offer_letter" | "unknown";
  priority?: "low" | "medium" | "high";
  reason?: string;
  enqueued_at?: string;
};

type WorkerResult = {
  job_id: string;
  status: "completed" | "failed";
  completed_at: string;
  input: AnalysisJob;
  analysis?: Analysis;
  error?: string;
};

const DEFAULT_QUEUE_FILE = "../data/generated/watch_jobs.jsonl";
const DEFAULT_RESULTS_FILE = "../data/generated/worker_results.json";

function env(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

function ensureParent(path: string) {
  mkdirSync(dirname(path), { recursive: true });
}

function readQueue(path: string): AnalysisJob[] {
  const resolved = resolve(path);
  if (!existsSync(resolved)) return [];

  return readFileSync(resolved, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as AnalysisJob);
}

function archiveQueue(path: string) {
  const resolved = resolve(path);
  if (!existsSync(resolved)) return null;

  const archived = `${resolved}.${new Date().toISOString().replace(/[:.]/g, "-")}.processed`;
  renameSync(resolved, archived);
  return archived;
}

function fixtureKey(fixture: string) {
  const key = basename(fixture, extname(fixture)).replaceAll("_", "-");
  const aliases: Record<string, string> = {
    "offer-letter-startup": "offer-startup"
  };

  return aliases[key] ?? key;
}

function analysisForJob(job: AnalysisJob): Analysis {
  const key = fixtureKey(job.fixture);
  const analysis = sampleAnalyses.find((item) => item.id === key);

  if (!analysis) {
    throw new Error(`No canned analysis found for fixture "${job.fixture}" (${key})`);
  }

  return {
    ...analysis,
    createdAt: new Date().toISOString()
  };
}

function runJob(job: AnalysisJob): WorkerResult {
  try {
    return {
      job_id: job.id,
      status: "completed",
      completed_at: new Date().toISOString(),
      input: job,
      analysis: analysisForJob(job)
    };
  } catch (error) {
    return {
      job_id: job.id,
      status: "failed",
      completed_at: new Date().toISOString(),
      input: job,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function writeResults(path: string, results: WorkerResult[]) {
  const resolved = resolve(path);
  ensureParent(resolved);

  const previous = existsSync(resolved)
    ? (JSON.parse(readFileSync(resolved, "utf8")) as WorkerResult[])
    : [];

  writeFileSync(resolved, JSON.stringify([...previous, ...results], null, 2), "utf8");
  return resolved;
}

function buildDemoJob(): AnalysisJob {
  return {
    id: `job-demo-${Date.now()}`,
    source: "demo",
    subject: "Lease agreement ready for review",
    fixture: "lease_sketchy.txt",
    likely_contract_type: "lease",
    priority: "high",
    reason: "Demo worker run against the sketchy lease fixture.",
    enqueued_at: new Date().toISOString()
  };
}

function main() {
  const queueFile = env("CAVEAT_QUEUE_FILE", DEFAULT_QUEUE_FILE);
  const resultsFile = env("CAVEAT_RESULTS_FILE", DEFAULT_RESULTS_FILE);
  const runOnce = env("CAVEAT_RUN_ONCE", "false") === "true";
  const jobs = runOnce ? [buildDemoJob()] : readQueue(queueFile);
  const results = jobs.map(runJob);
  const outputFile = writeResults(resultsFile, results);
  const archivedQueue = runOnce ? null : archiveQueue(queueFile);

  console.log(
    JSON.stringify(
      {
        event: "caveat.worker.completed",
        run_once: runOnce,
        jobs: jobs.length,
        completed: results.filter((result) => result.status === "completed").length,
        failed: results.filter((result) => result.status === "failed").length,
        output_file: outputFile,
        archived_queue: archivedQueue,
        results
      },
      null,
      2
    )
  );
}

main();
