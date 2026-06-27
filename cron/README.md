# Caveat Cron Watcher

This folder contains Tejas-owned scaffolding for the "contract watch" demo moment.

Current behavior:

- Reads `mock_inbox.json`.
- Detects lease and offer-letter messages.
- Emits a structured event that the worker can later turn into analysis jobs.

Run from this folder:

```sh
npm run watch
```

Day-of swap:

- Replace the mock inbox reader with Scalekit Gmail/Drive calls.
- Keep the output shape stable so the worker queue does not change.
- Set `WATCH_DRY_RUN=false` when real queue enqueueing exists.
