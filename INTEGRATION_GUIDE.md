# Caveat Integration Guide

This repo is configured for the B2B Caveat pivot: Scalekit owns tenant identity and user-scoped actions, Actian VectorAI DB owns tenant/user-scoped contract memory, and Render hosts the app, worker, cron, queue, and private Actian service.

## Current Integration Phases

- `auth`: active path, ready for Scalekit SSO credentials.
- `data`: active path, ready for Actian VectorAI DB.
- `gmail`: prepared next step through Scalekit scoped tools.
- `notifications`: planned next step after auth/data/Gmail are stable.

The app exposes this state at `GET /api/config`.

## Scalekit Setup

1. Install the SDK in `web` once credentials are available:

   ```sh
   npm --prefix web install @scalekit-sdk/node
   ```

2. Set these env vars in `infra/.env` locally and in Render:

   ```sh
   MOCK_AUTH=0
   SCALEKIT_ENV_URL=https://<your-scalekit-env>
   SCALEKIT_CLIENT_ID=<client-id>
   SCALEKIT_CLIENT_SECRET=<client-secret>
   SCALEKIT_DEFAULT_CONNECTIONS=gmail,googledrive
   SCALEKIT_READ_ONLY_SCOPE=openid,profile,email,read
   SCALEKIT_ACT_SCOPE=openid,profile,email,read,send
   ```

3. Replace the stub in `web/src/lib/scalekit.ts` with the real client constructor:

   ```ts
   import { ScalekitClient } from "@scalekit-sdk/node";

   return new ScalekitClient(envUrl, clientId, clientSecret);
   ```

4. Configure the Scalekit callback URL:

   ```txt
   http://localhost:3000/api/auth/callback
   https://<render-web-url>/api/auth/callback
   ```

5. Make sure Scalekit org claims match `shared/config.ts` tenant `oid` values, or update those values to match Scalekit:

   ```txt
   org_sf_tenants_union
   org_oakland_legal_aid
   ```

6. For Gmail/Drive scoped tools, use `web/src/lib/scalekit-tools.ts`:

   - `scopedToolFilter("read_only")`: Gmail list + Drive fetch, no send.
   - `scopedToolFilter("act")`: Gmail list + Gmail send + Drive fetch.
   - `futureNotificationToolFilter()`: reserved for the later notifications phase.

## Actian Setup

1. Start Actian locally:

   ```sh
   docker compose --env-file infra/.env -f infra/docker-compose.yml --profile actian up caveat-actian
   ```

2. Keep these env vars:

   ```sh
   ACTIAN_IMAGE=actian/vectorai:latest
   ACTIAN_VECTORAI_ACCEPT_EULA=YES
   ACTIAN_URL=localhost:6574
   ACTIAN_VECTOR_DIMENSIONS=384
   ACTIAN_PLAYBOOK_COLLECTION=clause_playbook
   ```

3. Collection naming is prepared in `shared/config.ts`:

   - Playbook: `clause_playbook`
   - User contracts: `tenant-<tenant-id>-user-<scalekit-user-id>-contracts`

4. Install the confirmed client where you wire the live vector store. The Python client from the guide is:

   ```sh
   pip install actian-vectorai-client
   ```

   The current TS stub is `worker/ActianVectorStore.ts`; it already validates `ACTIAN_URL`, uses 384-dim vectors, and derives tenant/user collections.

5. Seed mock vectors now:

   ```sh
   node --experimental-strip-types data/seed.ts
   ```

   Then replace the generated-file write with Actian `collections.create` and `points.upsert` calls when the client is connected.

## Render Setup

`infra/render.yaml` is ready for:

- `caveat-web`
- `caveat-agent`
- `caveat-actian`
- `caveat-watch`
- `caveat-queue`

Set Scalekit and Anthropic secrets in Render with `sync: false`. Actian runs as a private image service with `ACTIAN_VECTORAI_ACCEPT_EULA=YES` and a disk mounted at `/var/lib/actian-vectorai`.

## Later Gmail And Notifications

After auth and Actian retrieval work:

1. Replace cron's mock inbox reader in `cron/watch.ts` with Scalekit Gmail list/fetch calls.
2. Replace `sendCaseRedline` in `web/src/lib/server-store.ts` with Scalekit Gmail send for users with `act:redline`.
3. Add notification delivery behind `futureNotificationToolFilter()` and keep it separate from the Gmail approval path so the demo still proves fail-closed send permissions.
