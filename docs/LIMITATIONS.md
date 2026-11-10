# Limitations

## Do not use this against auto-generated numeric memo IDs

Tested directly against `stellar/anchor-platform` (SDF's official reference
implementation, repoScore 94 in the ecosystem index — the implementation
most real anchors run). Its default SEP-6/24/31 memo generator
(`DepositInfoSelfGeneratorBase.generateMemoId()`) produces a random long
integer per transaction, e.g. `4891023847562910384`. Two different,
unrelated payments differing only in their last digit:

```ts
match("4891023847562910384", ["4891023847562910385"]);
// [{ candidate: "4891023847562910385", score: 0.947 }]
```

0.947 is a confident-looking match between two **completely unrelated**
payments. This is the short-numeric-suffix problem below, at a scale that
makes it worse: long shared digit runs by chance are common across random
IDs, and the scorer has no way to know the last digit is the only one that
matters.

**Exact match is the correct, safe behavior for a random numeric memo ID.**
Beacon exists for the other case: a human- or bank-system-relayed text
reference (an invoice code, a SEP-31 cross-border reference re-typed through
a legacy banking rail) where a typo is a real, observed failure mode — see
`benchmarks/dnb-backend.mjs` for that case validated against a real anchor.
Know which kind of memo your integration actually produces before pointing
Beacon at it.

Found by testing edge cases past the happy path, before publishing. Kept here
instead of quietly patched over, so anyone deciding whether to use v0.1 for
real money can see exactly where it's weak.

## Short numeric suffixes with a shared prefix are ambiguous

```ts
match("INV-100", ["INV-200", "INV-300"]);
// [{ candidate: "INV-200", score: 0.857 }, { candidate: "INV-300", score: 0.857 }]
```

`INV-100`, `INV-200`, and `INV-300` are three different invoices, not typos
of each other — but the digits that actually distinguish them are a small
fraction of the whole string, so both wrong candidates score identically
high. Beacon's scoring has no notion of "this part of the string is the
identifying part and matters more."

This is the opposite failure mode from the one Beacon exists to fix: instead
of a real match getting missed over a cosmetic difference, two *wrong*
matches look equally plausible. Silently picking the top-ranked result here
would misroute a payment.

**Until this has a real fix:**

- Never auto-confirm on Beacon's result alone when short, sequentially
  numbered codes are in the candidate pool. Use it to narrow the field, then
  require a second signal to pick one — amount, sender account, timestamp
  proximity, whatever the caller already has.
- Treat a tie, or a close top-two, as "ask a human", not as "pick index 0".
- `docs/ROADMAP.md` M1 (configurable scoring) is the place a fix for this
  would land — most likely weighting a trailing digit run more than
  surrounding text, once there's a second real integration to tune it
  against instead of one synthetic example.

A test in `test/match.test.ts` pins this exact behavior (`KNOWN LIMITATION:
short numeric suffixes...`) so a future scoring change has to touch that
assertion on purpose, not drift past it unnoticed.

## Greedy token matching, not optimal

`tokenFuzzyOverlap` assigns each query token to the best *still unused*
candidate token, in order. This is `O(n·m)` and good enough for memo-length
strings, but it is not the true maximum-weight matching (the Hungarian
algorithm) — a pathological token order can leave a better overall pairing
on the table. Not yet observed to matter at memo length (a handful of
tokens); would need revisiting if Beacon is ever pointed at long free-text
fields.
