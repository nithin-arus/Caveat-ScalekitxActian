import type { Clause, Flag, Reasoner, RetrievedClause } from "../shared/contracts.ts";

export class ClaudeReasoner implements Reasoner {
  constructor(private readonly apiKey = process.env.ANTHROPIC_API_KEY) {}

  async analyzeClause(clause: Clause, neighbors: RetrievedClause[]): Promise<Flag | null> {
    if (!this.apiKey) return null;

    const strongest = neighbors[0];
    return {
      id: `claude-${clause.id}`,
      clause,
      reason:
        strongest?.counter ??
        "Claude reasoner is configured, but the live Anthropic call is intentionally stubbed for demo fallback safety.",
      severity: strongest?.label === "red-flag" ? "high" : "med",
      suggestedRedline:
        strongest?.counter ??
        "Replace with balanced, jurisdiction-aware language preserving tenant remedies.",
    };
  }

  async summarize(flags: Flag[]): Promise<{ summary: string; riskScore: number }> {
    const high = flags.filter((flag) => flag.severity === "high").length;
    const med = flags.filter((flag) => flag.severity === "med").length;

    return {
      summary: `${flags.length} clauses reviewed with ${high} high-severity and ${med} medium-severity findings.`,
      riskScore: Math.min(95, high * 18 + med * 9 + 12),
    };
  }
}
