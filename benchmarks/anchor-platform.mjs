// Validation against stellar/anchor-platform (SDF's official reference
// implementation, repoScore 94 — the implementation most real anchors run).
//
// Two findings, both from reading the real source, not guessing:
//
// 1. DefaultPaymentListener.java matches exclusively by exact memo string
//    (findAllBy...AndMemoAndStatus — a Spring Data derived query, SQL
//    equality). No fuzzy matching anywhere in the observer path. Same
//    pattern confirmed in dnb-backend.mjs; this is the ecosystem's own
//    reference implementation doing it too.
//
// 2. DepositInfoSelfGeneratorBase.generateMemoId() — the default memo for
//    SEP-6/24/31 self-generation — is `SecureRandom.nextLong(1, MAX_VALUE)`:
//    a long random NUMERIC id, not human-typed text. This is exactly the
//    shape flagged as dangerous in docs/LIMITATIONS.md. Confirmed below:
//    Beacon must NOT be pointed at this default scheme.

import { match } from "../dist/src/index.js";

console.log("--- finding 1: official exact-match behavior (same pattern as dnb-backend) ---");
console.log(
  "DefaultPaymentListener.java calls findAllByWithdrawAnchorAccountAndMemoAndStatus(toAccount, memo, status)",
);
console.log("— a derived Spring Data query, i.e. SQL `memo = ?`. No fuzzy path exists upstream.\n");

console.log("--- finding 2: DANGER when applied to the default self-generated memo ---");
console.log("Two different users, two different random SEP-31 MEMO_ID values from generateMemoId():\n");

const memoA = "4891023847562910384";
const memoB = "4891023847562910385"; // off by the last digit — a different payment, not a typo

const [top] = match(memoA, [memoB], { threshold: 0.5 });
console.log(`memoA = ${memoA}`);
console.log(`memoB = ${memoB}  (different payment, entirely unrelated to memoA)`);
console.log(`Beacon's score: ${top.score.toFixed(3)} — well above any reasonable threshold.\n`);

console.log(
  "Conclusion: Beacon is safe and useful for custom, human/bank-relayed text memos (see benchmarks/dnb-backend.mjs).",
);
console.log(
  "Beacon must NOT be used against Anchor Platform's own default numeric MEMO_ID scheme — there, exact match (what it already does) is the correct and safe behavior.",
);
