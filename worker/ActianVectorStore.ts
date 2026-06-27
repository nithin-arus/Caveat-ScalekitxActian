import type { RetrievedClause, VectorStore } from "../shared/contracts.ts";

export class ActianVectorStore implements VectorStore {
  constructor(private readonly url = process.env.ACTIAN_URL) {}

  async upsert(
    _items: { id: string; vector: number[]; meta: unknown }[],
    _collection: string
  ): Promise<void> {
    if (!this.url) {
      throw new Error("ACTIAN_URL is not configured; use the local mock vector store fallback.");
    }

    throw new Error("Actian VectorAI upsert is waiting on the event image/client contract.");
  }

  async query(_vector: number[], _k: number, _collection: string): Promise<RetrievedClause[]> {
    if (!this.url) {
      throw new Error("ACTIAN_URL is not configured; use the local mock vector store fallback.");
    }

    throw new Error("Actian VectorAI query is waiting on the event image/client contract.");
  }
}
