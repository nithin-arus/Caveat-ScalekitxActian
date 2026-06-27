# Caveat Infra

This folder is Tejas-owned scaffolding for local services, Render deployment, and day-of environment setup.

## Files

- `.env.example` lists every expected app, sponsor, queue, and cron variable.
- `docker-compose.yml` starts local Redis now and reserves an Actian service profile for the confirmed image.
- `render.yaml` defines the target Render topology: web, worker, Actian private service, cron, and key-value queue.
- `../worker` consumes cron findings and writes demo analysis results without sponsor keys.

## Local Setup

From the repo root:

```sh
cp infra/.env.example infra/.env
docker compose --env-file infra/.env -f infra/docker-compose.yml up caveat-redis
```

The Actian VectorAI DB service is behind a compose profile so local mock demos can run without Docker startup cost:

```sh
docker compose --env-file infra/.env -f infra/docker-compose.yml --profile actian up caveat-actian
```

Local Actian defaults match the hackathon guide:

- Image: `actian/vectorai:latest`
- Client address: `localhost:6574`
- Required env: `ACTIAN_VECTORAI_ACCEPT_EULA=YES`
- Persistent data path: `/var/lib/actian-vectorai`

## Data Seed

Generate local mock vector payloads from Tejas-owned data:

```sh
node --experimental-strip-types data/seed.ts
```

If the local Node version does not support type stripping, run the same file through `tsx` once the repo package setup exists.

## Local Queue Demo

From the repo root:

```sh
WATCH_DRY_RUN=false npm --prefix cron run watch
npm --prefix worker run worker
```

The cron watcher writes jobs to `data/generated/watch_jobs.jsonl`. The worker consumes that file, writes results to `data/generated/worker_results.json`, and archives the processed queue.

## Day-Of Swap Checklist

1. Fill Scalekit env vars.
2. Fill Anthropic env vars.
3. Confirm `ACTIAN_URL` and `REDIS_URL` resolve inside Render private networking.
4. Run the seed job against Actian.
5. Trigger `caveat-watch` manually once before the live demo.
6. Run `caveat-agent` once and confirm completed jobs appear in the worker results or Redis-backed job store.

## Notes

Keep real credentials out of git. Render secret values should use `sync: false` and be entered in the dashboard.
