---
title: Roadmap
description: What's next, in order, with no promised dates.
---

**Today (v0.1, MVP):** `match(query, candidates, options)` — in-memory
fuzzy ranking, zero dependencies, 9 passing tests. Nothing below this line
is built.

- **M1 — Configurable scoring.** Expose the soft-match threshold and the
  whole-string/token-overlap weighting as `MatchOptions` instead of module
  constants, once a real integration needs different tuning than the
  default.
- **M2 — Batch matching.** `matchAll(queries, candidates, options)` that
  normalizes the candidate list once instead of per-call, for anchors
  reconciling a daily batch instead of one memo at a time.
- **M3 — CLI.** `npx @buendia-builders/beacon match "<query>" <candidates...>`
  for a quick terminal check without writing a script.
- **M4 — Persistent candidate index.** Only if M2's batch case shows it's
  worth it: an index that survives between calls instead of rebuilding
  normalized candidates every time.

No milestone here is scheduled. This page says what's next, not when.
