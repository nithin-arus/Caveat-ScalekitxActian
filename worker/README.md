# Caveat Worker

This worker is the Tejas-owned Render worker scaffold for the agent pipeline demo.

Current behavior:

- Reads analysis jobs from `CAVEAT_QUEUE_FILE` as newline-delimited JSON.
- Falls back to canned fixture analyses so it runs with no sponsor keys.
- Writes completed job results to `CAVEAT_RESULTS_FILE`.
- Archives the consumed queue file after a successful worker pass.

Run a single local demo job:

```sh
npm run demo
```

Run queued jobs after the cron watcher has enqueued findings:

```sh
WATCH_DRY_RUN=false npm --prefix ../cron run watch
npm run worker
```

Day-of swap:

- Replace the file queue with Render Key Value / Redis enqueue and dequeue calls.
- Keep the `AnalysisJob` shape stable so cron, worker, and UI remain unchanged.
- Replace the canned fixture lookup with the real parse -> embed -> retrieve -> reason pipeline.
