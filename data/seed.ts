import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

type PlaybookEntry = {
  id: string;
  category: string;
  text: string;
  label: "standard" | "unusual" | "red-flag";
  favors: string;
  why: string;
  market_standard: string;
  counter: string;
  demo_hook: string;
};

type VectorItem = {
  id: string;
  collection: "clause_playbook" | "user_contracts";
  text: string;
  vector: number[];
  meta: Record<string, unknown>;
};

const ROOT = new URL(".", import.meta.url).pathname;
const PLAYBOOK_DIR = join(ROOT, "playbook");
const FIXTURE_DIR = join(ROOT, "fixtures");
const GENERATED_DIR = join(ROOT, "generated");
const VECTOR_SIZE = 384;

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function stableVector(text: string, dimensions = VECTOR_SIZE): number[] {
  const values: number[] = [];
  let counter = 0;

  while (values.length < dimensions) {
    const hash = createHash("sha256").update(`${counter}:${text}`).digest();
    for (const byte of hash) {
      const centered = byte / 127.5 - 1;
      values.push(Number(centered.toFixed(6)));
      if (values.length === dimensions) break;
    }
    counter += 1;
  }

  const norm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0)) || 1;
  return values.map((value) => Number((value / norm).toFixed(6)));
}

function splitFixtureIntoClauses(text: string): { section: string; text: string }[] {
  const body = text.replace(/\r\n/g, "\n").trim();
  const chunks = body
    .split(/\n(?=\d+\.\s+[A-Z])/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks
    .filter((chunk) => /^\d+\.\s+/.test(chunk))
    .map((chunk) => {
      const [headingLine, ...rest] = chunk.split("\n");
      return {
        section: headingLine.trim(),
        text: rest.join("\n").trim()
      };
    })
    .filter((clause) => clause.text.length > 0);
}

function buildPlaybookItems(domain: "lease" | "offer_letter", entries: PlaybookEntry[]): VectorItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    collection: "clause_playbook",
    text: entry.text,
    vector: stableVector(`${entry.category}\n${entry.text}\n${entry.why}\n${entry.counter}`),
    meta: {
      domain,
      category: entry.category,
      label: entry.label,
      favors: entry.favors,
      why: entry.why,
      market_standard: entry.market_standard,
      counter: entry.counter,
      demo_hook: entry.demo_hook
    }
  }));
}

function buildFixtureItems(): VectorItem[] {
  const files = readdirSync(FIXTURE_DIR).filter((file) => file.endsWith(".txt")).sort();
  const items: VectorItem[] = [];

  for (const file of files) {
    const fixtureId = basename(file, extname(file));
    const text = readFileSync(join(FIXTURE_DIR, file), "utf8");
    const clauses = splitFixtureIntoClauses(text);

    clauses.forEach((clause, index) => {
      items.push({
        id: `${fixtureId}-clause-${String(index + 1).padStart(2, "0")}`,
        collection: "user_contracts",
        text: clause.text,
        vector: stableVector(`${clause.section}\n${clause.text}`),
        meta: {
          fixture_id: fixtureId,
          fixture_file: file,
          section: clause.section,
          order: index + 1
        }
      });
    });
  }

  return items;
}

function main() {
  mkdirSync(GENERATED_DIR, { recursive: true });

  const leasePlaybook = readJson<PlaybookEntry[]>(join(PLAYBOOK_DIR, "lease.json"));
  const offerPlaybook = readJson<PlaybookEntry[]>(join(PLAYBOOK_DIR, "offer_letter.json"));
  const playbookItems = [
    ...buildPlaybookItems("lease", leasePlaybook),
    ...buildPlaybookItems("offer_letter", offerPlaybook)
  ];
  const fixtureItems = buildFixtureItems();
  const allItems = [...playbookItems, ...fixtureItems];

  writeFileSync(
    join(GENERATED_DIR, "mock_vector_store.json"),
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        embedding_model: "mock-stable-sha256-384",
        vector_size: VECTOR_SIZE,
        collections: {
          clause_playbook: playbookItems,
          user_contracts: fixtureItems
        }
      },
      null,
      2
    )
  );

  writeFileSync(
    join(GENERATED_DIR, "fixture_manifest.json"),
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        counts: {
          lease_playbook: leasePlaybook.length,
          offer_letter_playbook: offerPlaybook.length,
          fixture_clauses: fixtureItems.length,
          total_vectors: allItems.length
        },
        fixtures: fixtureItems.reduce<Record<string, number>>((acc, item) => {
          const fixtureId = String(item.meta.fixture_id);
          acc[fixtureId] = (acc[fixtureId] ?? 0) + 1;
          return acc;
        }, {})
      },
      null,
      2
    )
  );

  console.log(`Seeded ${allItems.length} vectors into ${GENERATED_DIR}`);
}

main();
