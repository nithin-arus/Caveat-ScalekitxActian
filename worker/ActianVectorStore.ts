import type { RetrievedClause, VectorStore } from "../shared/contracts.ts";
import { PLAYBOOK_COLLECTION, tenantMemoryCollection, VECTOR_DIMENSIONS } from "../shared/config.ts";

export class ActianVectorStore implements VectorStore {
  constructor(private readonly url = process.env.ACTIAN_URL) {}

  collectionForUser(tenantId: string, userId: string) {
    return tenantMemoryCollection(tenantId, userId);
  }

  get playbookCollection() {
    return process.env.ACTIAN_PLAYBOOK_COLLECTION ?? PLAYBOOK_COLLECTION;
  }

  async upsert(
    _items: { id: string; vector: number[]; meta: unknown }[],
    _collection: string
  ): Promise<void> {
    if (!this.url) {
      throw new Error("ACTIAN_URL is not configured; use the local mock vector store fallback.");
    }

    throw new Error(
      `Actian VectorAI upsert is prepared for ${VECTOR_DIMENSIONS}-dim cosine vectors at ${this.url}. Install actian-vectorai-client or the confirmed JS client, then call client.points.upsert(collection, points).`
    );
  }

  async query(_vector: number[], _k: number, _collection: string): Promise<RetrievedClause[]> {
    if (!this.url) {
      throw new Error("ACTIAN_URL is not configured; use the local mock vector store fallback.");
    }

    throw new Error(
      `Actian VectorAI query is prepared for ${VECTOR_DIMENSIONS}-dim cosine vectors at ${this.url}. Install actian-vectorai-client or the confirmed JS client, then call client.points.search(collection, { vector, limit: k }).`
    );
  }
}
