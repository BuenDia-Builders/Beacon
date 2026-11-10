---
title: FAQ
description: Common questions about Beacon.
---

### Does Beacon read the Stellar ledger, Horizon, or RPC?

No. Beacon never touches the network. You pass it strings you already have
— the incoming memo, and your own list of expected memos — and it scores
them. Where those strings come from is entirely your integration's concern.

### Is this safe to auto-confirm payments with?

Not on its own, and not for every memo shape. Read
[Limitations](/beacon/guide/limitations/) — short numeric codes and
auto-generated numeric memo IDs are genuine failure modes, found by testing,
not theoretical. Use Beacon to narrow candidates, then confirm with a second
signal (amount, sender account).

### Why no configurable scoring weights in v0.1?

Because there's exactly one validated integration shape so far (custom text
memos, validated against a real anchor's matcher) and tuning weights against
one data point is guessing, not engineering. See the SCF-proposal evidence
in [Why](/beacon/why/) — [Roadmap](/beacon/roadmap/) M1 is where
configurability lands once there's a second real case to tune against.

### Why zero runtime dependencies?

Beacon is meant to run inside payment/anchor backends handling real money.
A supply-chain compromise in a transitive dependency of a reconciliation
tool is a worse outcome than writing ~90 lines of edit-distance code
ourselves. The whole algorithm fits in two files you can read in five
minutes: `normalize.ts` and `similarity.ts`.

### Is this an embedded database, like SQLite?

No — and it isn't trying to be. Beacon takes candidates you already hold in
memory and scores them against one query; there's no index, no file format,
no persistence. If a future version needs to hold a large candidate set
efficiently across many calls, that's a deliberate, separately-decided step
— see [Roadmap](/beacon/roadmap/) M4 — not where v0.1 starts.
