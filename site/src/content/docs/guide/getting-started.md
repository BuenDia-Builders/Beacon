---
title: Getting started
description: Install Beacon and run your first match.
---

## Install

```bash
npm install @buendia-builders/beacon
```

## Match a memo

```ts
import { match } from "@buendia-builders/beacon";

const results = match("pago factura 1234 juan perez", [
  "1234 factura",
  "5678 factura",
]);

// [{ candidate: "1234 factura", score: 0.571... }]
```

`match(query, candidates, options?)` returns candidates ranked by
similarity, highest score first.

| Option | Default | What it does |
| --- | --- | --- |
| `threshold` | `0.5` | Candidates scoring below this are dropped. |
| `limit` | `5` | Maximum number of results returned. |

## A realistic reconciliation loop

```ts
import { match } from "@buendia-builders/beacon";

function reconcile(incomingMemo, pendingPayments) {
  const [best] = match(
    incomingMemo,
    pendingPayments.map((p) => p.expectedMemo),
    { threshold: 0.75 },
  );

  if (!best) return { status: "unreconciled", memo: incomingMemo };

  const matchedPayment = pendingPayments.find(
    (p) => p.expectedMemo === best.candidate,
  );

  // Never auto-confirm on the memo score alone — check a second signal
  // (amount, sender account) before promoting the payment.
  return { status: "candidate", payment: matchedPayment, score: best.score };
}
```

Next: [How it works](/beacon/guide/how-it-works/) explains the scoring, and
[Limitations](/beacon/guide/limitations/) covers what this loop should check
before trusting `best` on its own.
