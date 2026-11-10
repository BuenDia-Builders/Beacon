---
title: Examples
description: Runnable, validated real-world scenarios.
---

These live in [`examples/`](https://github.com/BuenDia-Builders/Beacon/tree/main/examples)
in the repo — clone it and run them, no extra setup beyond `npm install &&
npm run build`.

## Typo'd, reordered, and reworded memos

```bash
node examples/custom-text-memo.mjs
```

```text
"order 9f21 book" -> order-9f21 (score 1.000)
"ORDER-9F2I-BOOK" -> order-9f21 (score 0.933)
"pago ORDER-4B88-COURSE" -> order-4b88 (score 0.857)
"donate thanks!" -> donation (score 1.000)
```

## The safe reconciliation pattern

```bash
node examples/reconcile-with-second-signal.mjs
```

Only auto-confirms when the top-ranked memo match's amount agrees with the
incoming payment. A real conflict — the memo points at one invoice, the
amount points at another — goes to a human instead of guessing:

```text
{ status: 'confirmed', paymentId: 'inv-1001' }
{
  status: 'needs_review',
  reason: "top memo match's amount doesn't agree with the incoming amount",
  topMemoMatch: 'inv-1002'
}
```

## What not to do

```bash
node examples/dont-use-for-numeric-ids.mjs
```

Two different, unrelated auto-generated numeric memo IDs score as a
confident match — see [Limitations](/Beacon/guide/limitations/) for why.
