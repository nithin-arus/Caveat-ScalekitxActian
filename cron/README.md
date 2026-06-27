# Caveat Cron Watcher

This folder contains Tejas-owned scaffolding for the "contract watch" demo moment.

Current behavior:

- Reads `mock_inbox.json`.
- Detects lease and offer-letter messages.
- Emits a structured event.
- When `WATCH_DRY_RUN=false`, writes analysis jobs to `CAVEAT_QUEUE_FILE` for the worker.

Run from this folder:

```sh
npm run watch
```

Day-of swap:

- Replace the mock inbox reader with Scalekit Gmail/Drive calls.
- Keep the `AnalysisJob` output shape stable so the worker queue does not change.
- Replace the file queue with Render Key Value / Redis enqueueing.
