# SPEC

## 1. Goals and non-goals

**Goal:** given one incoming payment memo/reference and a list of expected
ones, rank the expected ones by how likely they are to be the same thing a
human typed with a typo, extra words, or different order.

**Non-goals, v0.1:**

- Not a search engine. No index, no persistence, no file format. You call
  `match()` with the candidates you already have in memory.
- Not an indexer. Beacon does not read the Stellar ledger, Horizon, or RPC.
  It scores strings; where those strings come from is the caller's problem.
- Not a reconciliation system. It answers "which of these looks like a
  match", not "mark this payment as settled". The caller owns that decision.
- No locale-aware stemming or language-specific tokenization beyond ASCII
  folding. A memo in Spanish and one in English are scored the same way.

## 2. Scoring

Two independent signals, the better one wins:

- **Whole-string similarity** (normalized Levenshtein distance): catches a
  typo inside a single token, e.g. a reference code typed with one wrong
  character.
- **Token overlap** (greedy fuzzy token pairing, Dice coefficient): catches
  reordered words and extra context words around the same reference, e.g.
  `"pago factura 1234 juan"` against `"1234 factura"`.

Taking the max instead of blending them means a strong signal from either
axis is enough — a short exact-ish code doesn't need to also pass a
token-overlap test it structurally can't pass (one token has nothing to
reorder against), and a long reworded memo doesn't need near-perfect
character alignment.

## 3. Dependencies

Zero runtime dependencies. `levenshtein` and token overlap are ~60 lines of
plain TypeScript, not a wrapped library — there is no npm supply-chain
surface to audit here, by construction. See
[ADR-0001](adr/0001-no-runtime-dependencies.md).

## 4. Out of scope, revisit later

- Configurable scoring weights (today `SOFT_MATCH_THRESHOLD` is a constant).
- A CLI.
- Batch matching (N queries against the same candidate list, reusing
  normalization work).

None of these are built. See [ROADMAP.md](ROADMAP.md).

## 5. Known weaknesses

See [LIMITATIONS.md](LIMITATIONS.md) — found by testing edge cases before
publishing, not by a user in production. Most relevant: short, sequentially
numbered reference codes (`INV-100` vs `INV-200`) can score as equally
plausible matches. Don't auto-confirm on Beacon's output alone when that
shape of candidate is in play.
