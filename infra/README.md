# Caveat Infra

This folder is Tejas-owned scaffolding for local services, Render deployment, and day-of environment setup.

## Files

- `.env.example` lists every expected app, sponsor, queue, and cron variable.
- `docker-compose.yml` starts local Redis now and reserves an Actian service profile for the confirmed image.
- `render.yaml` defines the target Render topology: web, worker, Actian private service, cron, and key-value queue.

## Local Setup

From the repo root:

```sh
cp infra/.env.example infra/.env
docker compose --env-file infra/.env -f infra/docker-compose.yml up caveat-redis
```

The Actian service is behind a compose profile because the exact image is still a day-of confirmation item:

```sh
docker compose --env-file infra/.env -f infra/docker-compose.yml --profile actian up caveat-actian
```

## Data Seed

Generate local mock vector payloads from Tejas-owned data:

```sh
node --experimental-strip-types data/seed.ts
```

If the local Node version does not support type stripping, run the same file through `tsx` once the repo package setup exists.

## Day-Of Swap Checklist

1. Replace `ACTIAN_IMAGE_TODO` with the confirmed Actian image.
2. Fill Scalekit env vars.
3. Fill Anthropic env vars.
4. Confirm `ACTIAN_URL` and `REDIS_URL` resolve inside Render private networking.
5. Run the seed job against Actian.
6. Trigger `caveat-watch` manually once before the live demo.

## Notes

Keep real credentials out of git. Render secret values should use `sync: false` and be entered in the dashboard.
