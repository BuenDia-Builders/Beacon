# ADR-0001: No runtime dependencies

## Status

Accepted

## Context

String-similarity logic is a solved problem on npm (`fastest-levenshtein`,
`string-similarity`, `fuse.js`, ...). Beacon exists to be installed by
payment/anchor backends handling real money, often in regulated contexts
(see `docs/why.md`). A supply-chain compromise in a transitive dependency of
a reconciliation tool is a worse outcome than writing 60 lines of edit-distance
code ourselves.

## Decision

`package.json` carries zero runtime `dependencies`. The only entries are
`devDependencies` (`typescript`, `@types/node`), which never ship to
consumers. Levenshtein distance and token-overlap scoring are implemented
directly in `src/similarity.ts`.

## Consequences

- Anyone can audit the entire scoring algorithm by reading two files
  (`src/normalize.ts`, `src/similarity.ts`).
- No dependency updates, no lockfile drift, no transitive CVEs to track.
- If a future version needs a real search index (inverted index, BM25-style
  ranking over large candidate sets) that tradeoff gets revisited explicitly
  in a new ADR, not silently via `npm install something`.
