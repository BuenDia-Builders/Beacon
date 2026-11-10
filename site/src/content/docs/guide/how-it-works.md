---
title: How it works
description: The two scoring signals Beacon combines, and why.
---

Beacon normalizes both strings (lowercase, strip accents and punctuation,
collapse whitespace), then scores the pair with two independent signals —
whichever one is stronger wins.

## Whole-string similarity

A normalized [Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance):
how many single-character edits turn one string into the other, divided by
the longer string's length. This is what catches a typo inside a single
reference code — `INV12E4` against `INV1234` — where there's nothing to
reorder, just one wrong character.

## Token overlap

Memos often come back reordered or padded with extra words a banking app
added (`"pago factura 1234 juan perez"` for an expected `"1234 factura"`).
Beacon tokenizes both strings and greedily pairs each query token with its
best unmatched candidate token — using the same Levenshtein similarity, so a
typo *inside* a token still counts as a soft match — then scores the pairing
with a Dice coefficient.

## Why the max, not a blend

```ts
return Math.max(wholeStringScore, tokenScore);
```

A short, near-exact code doesn't need to also pass a token-overlap test it
structurally can't pass — one token has nothing to reorder against. A long,
reworded memo doesn't need near-perfect character alignment either. Either
signal being strong is evidence enough; averaging them would punish a memo
for only triggering one of the two.

This also means the one place the score can go wrong — [two different
numeric IDs with a long shared digit run](/beacon/guide/limitations/) —
isn't a blending bug so much as both signals pointing the same (wrong) way
at once. That's a property of the inputs, not something a different
combination formula fixes.
