# Examples

Runnable, no setup beyond `npm install && npm run build` in the repo root.

- **`custom-text-memo.mjs`** — the validated case: an anchor with its own
  text memo scheme, several realistic typed variants (lowercase, typo,
  reordered, reworded).
- **`reconcile-with-second-signal.mjs`** — the safe integration pattern:
  only auto-confirm when the top-ranked memo match agrees with a second
  signal (amount). Shows a real conflict case, not just the happy path.
- **`dont-use-for-numeric-ids.mjs`** — what *not* to do. Two different
  auto-generated numeric memo IDs scoring as a confident match, and why
  that matters.

```bash
node examples/custom-text-memo.mjs
node examples/reconcile-with-second-signal.mjs
node examples/dont-use-for-numeric-ids.mjs
```
