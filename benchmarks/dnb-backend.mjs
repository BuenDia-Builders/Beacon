// Validation against a real production matcher: Deen-Bridge/dnb-backend
// (https://github.com/Deen-Bridge/dnb-backend), src/services/stellar/reconciliationService.js.
// Its matcher (replicated below, unchanged) is exact: a memo that doesn't hit
// DONATION_MEMO or PURCHASE_MEMO_RE character-for-character becomes an
// UnreconciledPayment requiring manual review. This script checks how many of
// those manual-review cases Beacon would have resolved automatically.

import { match } from "../dist/src/index.js";

const DONATION_MEMO = "DNB-SADAQAH";
const PURCHASE_MEMO_RE = /^DNB-(BOOK|COURSE)-([A-Fa-f0-9]+)$/;

// matchByMemo doesn't stop at the regex: it then looks up a pending
// transaction (or item) whose Mongo _id ends in this exact 8-hex-char
// suffix (`itemId.toString().slice(-8)`). Replicated here as the one real
// pending item so a typo'd id is judged the way their DB lookup would.
const KNOWN_ITEM_SUFFIX = "1a2b3c4d";

function legacyMatch(memo) {
  if (memo === DONATION_MEMO) return "matched (donation)";
  const purchase = memo.match(PURCHASE_MEMO_RE);
  if (purchase && purchase[2].toLowerCase() === KNOWN_ITEM_SUFFIX) {
    return "matched (purchase)";
  }
  return "UNRECONCILED";
}

const expectedMemos = ["DNB-BOOK-1a2b3c4d", "DNB-COURSE-9f8e7d6c", "DNB-SADAQAH"];

const cases = [
  { typed: "dnb-book-1a2b3c4d", issue: "lowercase" },
  { typed: "DNB BOOK 1a2b3c4d", issue: "space instead of hyphen" },
  { typed: "DNB-BOOK-1a2b3c4e", issue: "one-char typo in the id" },
  { typed: "DMB-BOOK-1a2b3c4d", issue: "typo in the DNB prefix" },
  { typed: "pago DNB-COURSE-9f8e7d6c curso", issue: "bank app prepends/appends words" },
  { typed: "DNB-SADAQA", issue: "dropped last letter" },
  { typed: "donacion dnb sadaqah", issue: "reworded + lowercase" },
  { typed: "transferencia salario noviembre", issue: "negative control: unrelated memo" },
];

const pad = (s, n) => String(s).padEnd(n);

console.log(pad("typed memo", 32), pad("issue", 32), pad("dnb-backend today", 16), pad("beacon top match", 20), "score");
console.log("-".repeat(120));

let recovered = 0;
for (const { typed, issue } of cases) {
  const legacy = legacyMatch(typed);
  const [top] = match(typed, expectedMemos, { threshold: 0.5 });
  const resolvedByBeacon = legacy === "UNRECONCILED" && Boolean(top);
  if (resolvedByBeacon) recovered++;

  console.log(
    pad(JSON.stringify(typed), 32),
    pad(issue, 32),
    pad(legacy, 16),
    pad(top ? top.candidate : "(no match)", 20),
    top ? top.score.toFixed(3) : "-",
  );
}

console.log("-".repeat(120));
console.log(`${recovered}/${cases.length} cases that dnb-backend sends to manual review today, Beacon resolves automatically.`);
