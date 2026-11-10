---
title: Why
description: The documented gap Beacon fills, and how it was validated.
---

SEP-29 (2020) let an anchor require a memo on incoming payments, but a
required memo can still be mistyped, reordered, or padded with extra words —
and the official Anchor Platform's payment observer tracks transactions by
**exact** expected-memo match, not fuzzy.

This is not hypothetical. Teams that already won Stellar Community Fund
rounds are each building the same reconciliation logic from scratch:

- **Choppaddi Pay** (SCF #44): *"The reconciliation and monitoring layer is
  not optional, it is what makes the integration trustworthy at scale."*
- **surgepay** (SCF #41): ships its own reconciliation-mismatch alerting as
  a funded deliverable.
- **Prepaid Accounts & Billing for Stellar** (SCF #45): builds its own
  settlement daemon.

And as of November 2026 there are 20 Live, SCF-funded anchors and 187 Live,
SCF-funded payment projects on Stellar — each a potential user of a shared
piece of this, instead of writing it again.

## Validated against real code, not hypotheticals

- **RozoAI/rozo-intents-contracts** (confirmed SCF-funded, $248,000). Its
  G→C forwarder routes a CEX withdrawal (Binance, Coinbase) by a
  user-typed memo through an exact Soroban storage-key lookup — a typo
  doesn't fall to manual review, it leaves funds **stuck at the Proxy
  address**. 5 of 5 realistic CEX-memo typos that stick on-chain, Beacon
  resolves correctly, with a negative control staying unresolved. The
  strongest validation so far: confirmed SCF funding, a human-typed memo,
  higher stakes than a review queue.
- **Deen-Bridge/dnb-backend**, a live anchor with a custom text memo scheme
  (`DNB-BOOK-<id>`, `DNB-SADAQAH`). Not confirmed SCF-funded — included for
  being a real, active anchor backend. Its real matcher, replicated
  unchanged, sends 7 of 8 realistic typed-memo variants to manual review
  today. Beacon resolves all 7, with no false positive on a negative
  control.
- **stellar/anchor-platform**, SDF's official reference implementation (not
  an SCF grantee — SDF's own infrastructure). Confirms the same
  exact-match-only pattern — and surfaces a real danger: its default memo
  scheme is a random numeric ID, not human-typed text, and Beacon
  conflates two different numeric IDs that happen to share most digits.
  See [Limitations](/Beacon/guide/limitations/).

That last result sets the actual scope: Beacon is for a custom or
bank/exchange-relayed *text* reference a human can mistype — not a
general-purpose replacement for exact memo matching everywhere.
