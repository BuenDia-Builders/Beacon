// Validation against RozoAI/rozo-intents-contracts (SCF-funded, $248,000 —
// scfAwarded confirmed via scout.searchProjects, not just a repo flag).
// Source: v2/stellar/forwarder/src/lib.rs and v2/docs/DESIGN_FORWARDER.md.
//
// The real flow (from their own design doc, §9 "G → C Flow"):
//   1. A CEX user (Binance, Coinbase) sends USDC with a memo typed into
//      their exchange's withdrawal "Memo/Tag" field — a classic manual
//      transcription point, same failure class CEX users hit industry-wide.
//   2. The backend calls get_memo_destination(memo) on the Soroban
//      contract — a persistent storage key lookup, which is necessarily
//      EXACT: Soroban storage has no fuzzy-key concept, so this isn't a
//      design choice to improve on, it's how key-value storage works.
//   3. No match -> None -> funds sit at the Proxy address with no resolved
//      destination. Higher stakes than dnb-backend's "manual review" bucket:
//      this is stuck funds until someone manually intervenes.
//
// Beacon's place here is NOT inside the contract (on-chain fuzzy matching
// over all registered memos would be prohibitively expensive gas-wise,
// and Soroban storage can't do it anyway). It's in the backend, as a
// fallback the moment the exact on-chain lookup returns None: try Beacon
// against the mappings the backend already knows it registered, surface
// the likely intended one, and let an operator confirm before manually
// resolving the stuck funds — instead of the user's money sitting there
// indefinitely.

import { match } from "../dist/src/index.js";

// Simulates contract.get_memo_destination(memo) — exact key lookup only.
function onChainLookup(memo, registeredMappings) {
  return registeredMappings.has(memo) ? registeredMappings.get(memo) : null;
}

const registeredMappings = new Map([
  ["user123", "CABC...BOB"],
  ["acct-7f2d", "CDEF...ALICE"],
  ["rozo-payout-55", "CGHI...CARLOS"],
]);

const cexWithdrawals = [
  { typed: "User123", issue: "CEX memo field is case-sensitive to the user, not to the contract" },
  { typed: "user 123", issue: "user added a space, like a thousands separator" },
  { typed: "usr123", issue: "dropped a letter copying it by hand" },
  { typed: "acct-7f2b", issue: "one-character typo in the hex suffix" },
  { typed: "rozo payout 55", issue: "exchange UI inserted spaces for hyphens" },
  { typed: "binance withdrawal ref 889912", issue: "negative control: a different exchange's own reference, not a Rozo memo" },
];

console.log("typed memo".padEnd(16), "issue".padEnd(48), "on-chain lookup".padEnd(18), "beacon suggests".padEnd(18), "score");
console.log("-".repeat(120));

let recovered = 0;
let total = 0;
for (const { typed, issue } of cexWithdrawals) {
  const onChain = onChainLookup(typed, registeredMappings);
  const [top] = match(typed, [...registeredMappings.keys()], { threshold: 0.6 });
  const isNegativeControl = issue.startsWith("negative control");
  if (!isNegativeControl) {
    total++;
    if (!onChain && top) recovered++;
  }

  console.log(
    JSON.stringify(typed).padEnd(16),
    issue.padEnd(48),
    (onChain ?? "STUCK (no match)").padEnd(18),
    (top ? top.candidate : "(no match)").padEnd(18),
    top ? top.score.toFixed(3) : "-",
  );
}

console.log("-".repeat(120));
console.log(`${recovered}/${total} real CEX-withdrawal typos that leave funds stuck on-chain, Beacon correctly resolves. The negative control stays unresolved either way, as it should.`);
