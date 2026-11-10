---
title: Overview
description: What Beacon is and the problem it solves.
---

Anchors and payment apps on Stellar track incoming payments by matching a
free-text memo against what they expected. The official Anchor Platform and
every custom anchor backend we checked match that memo **exactly** — a
single typo, reordered word, or case difference and the payment falls
through to manual review.

Beacon is a small, dependency-free function that ranks a list of expected
memos by how likely each one is to be the same thing a human typed slightly
wrong:

```ts
import { match } from "@buendia-builders/beacon";

match("INV12E4", ["INV1234", "INV9999", "REF-1234"]);
// [{ candidate: "INV1234", score: 0.857 }]
```

It is not a search engine, an indexer, or a reconciliation system. It does
one thing: given a query string and a list of candidates already in memory,
score how similar each candidate is. What you do with that ranking —
auto-confirm, flag for review, combine with an amount/sender check — is up
to the integration.

See [How it works](/beacon/guide/how-it-works/) for the scoring itself, and
[Limitations](/beacon/guide/limitations/) for where it should **not** be
used.
