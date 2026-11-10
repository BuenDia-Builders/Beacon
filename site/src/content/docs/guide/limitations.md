---
title: Limitations
description: Found by testing edge cases before publishing — read this before using Beacon for real money.
---

import { Aside } from "@astrojs/starlight/components";

<Aside type="danger" title="Do not use this against auto-generated numeric memo IDs">

Tested directly against `stellar/anchor-platform`, SDF's official reference
implementation. Its default SEP-6/24/31 memo generator produces a random
long integer per transaction, e.g. `4891023847562910384`. Two different,
unrelated payments differing only in their last digit:

```ts
match("4891023847562910384", ["4891023847562910385"]);
// [{ candidate: "4891023847562910385", score: 0.947 }]
```

0.947 looks like a confident match between two **completely unrelated**
payments. Exact match — what Anchor Platform already does — is the correct,
safe behavior for a random numeric ID. Beacon exists for the other case: a
human- or bank-relayed *text* reference, where a typo is the real failure
mode. See [Why](/Beacon/why/) for the validated use case.

</Aside>

## Short numeric suffixes with a shared prefix are ambiguous

```ts
match("INV-100", ["INV-200", "INV-300"]);
// [{ candidate: "INV-200", score: 0.857 }, { candidate: "INV-300", score: 0.857 }]
```

`INV-100`, `INV-200`, and `INV-300` are three different invoices, not typos
of each other — but the digits that distinguish them are a small fraction
of the whole string, so both wrong candidates score identically high.

**Until this has a real fix:** never auto-confirm on Beacon's result alone
when short, sequentially numbered codes are in the candidate pool. Use it to
narrow the field, then require a second signal — amount, sender account,
timestamp proximity — to pick one. Treat a tie, or a close top-two, as "ask
a human," not "pick index 0."

## Greedy token matching, not optimal

Each query token is assigned to the best *still unused* candidate token, in
the order tokens appear — not the true maximum-weight pairing (that would
need the Hungarian algorithm). Not yet observed to matter at memo length (a
handful of tokens); would need revisiting for long free-text fields.
