# Why

Anchors and payment apps on Stellar track incoming payments by matching a
free-text memo against what they expected. SEP-29 (2020) let an anchor
require a memo, but a required memo can still be mistyped, reordered, or
padded with extra words — and Anchor Platform's Payment Observer tracks
transactions by exact expected-memo match, not fuzzy.

This is not a hypothetical gap. Teams that already won Stellar Community
Fund rounds are each building the same reconciliation logic from scratch:

- **Choppaddi Pay** (SCF #44): *"The reconciliation and monitoring layer is
  not optional, it is what makes the integration trustworthy at scale."*
- **surgepay** (SCF #41): ships its own reconciliation-mismatch alerting as
  a funded deliverable.
- **Prepaid Accounts & Billing for Stellar** (SCF #45): builds its own
  settlement daemon.

And there are 20 Live, SCF-funded anchors and 187 Live, SCF-funded payment
projects on Stellar as of November 2026 — each a potential user of a shared
piece of this, instead of writing it again.

Beacon is that shared piece: the "does this memo match, even with a typo"
function, as a small library instead of logic duplicated across anchors.

## Validated, and scoped, against real code

Tested directly against three real implementations' own source, not
hypothetical scenarios:

- **RozoAI/rozo-intents-contracts** (confirmed SCF-funded, $248,000 —
  `scfAwarded: true` via the ecosystem directory, not just a repo flag). Its
  G→C forwarder design routes a CEX withdrawal (Binance, Coinbase) by a
  user-typed memo through an exact Soroban storage-key lookup
  (`get_memo_destination`) — a typo doesn't fall to manual review, it
  leaves funds **stuck at the Proxy address** with no resolved destination.
  5 of 5 realistic CEX-memo typos that stick on-chain, Beacon resolves
  correctly, with a negative control staying (correctly) unresolved. See
  `benchmarks/rozo-forwarder.mjs`. This is the strongest validation so far:
  confirmed SCF funding, a human-typed memo (a CEX withdrawal field, the
  same failure class crypto users hit industry-wide), and higher stakes
  than a review queue.

- **Deen-Bridge/dnb-backend**, a live anchor with a custom text memo scheme
  (`DNB-BOOK-<id>`, `DNB-SADAQAH`). Not confirmed SCF-funded (`scfAwarded:
  false` in the ecosystem directory) — included because it's a real,
  active anchor backend, not for the SCF-funding argument. Its real
  matcher, replicated unchanged, sends 7 of 8 realistic typed-memo variants
  to manual review today. Beacon resolves all 7 automatically, with no
  false positive on a negative control. See `benchmarks/dnb-backend.mjs`.
- **stellar/anchor-platform**, SDF's official reference implementation
  (repoScore 94, the one most real anchors run — also not an SCF grantee,
  it's SDF's own infrastructure). Confirms the same exact-match-only
  pattern in its payment observer — and surfaces a real danger: its
  default memo scheme is a random numeric ID, not human-typed text, and
  Beacon conflates two different numeric IDs that happen to share most
  digits. See `benchmarks/anchor-platform.mjs` and
  [docs/LIMITATIONS.md](LIMITATIONS.md).

That last result sets the actual scope: Beacon is for a custom or
bank/exchange-relayed *text* reference a human can mistype — not a
general-purpose replacement for exact memo matching everywhere, and not
yet tested against a second confirmed-SCF repo beyond Rozo.
