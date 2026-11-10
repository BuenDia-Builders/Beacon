// Real-world case: an anchor with its own text-based memo scheme, like
// Deen-Bridge/dnb-backend's "DNB-BOOK-<id>" / "DNB-SADAQAH" (see
// benchmarks/dnb-backend.mjs for the full validation against their real
// matcher). Someone fat-fingers a reference typing it into their wallet.
//
// Run: node examples/custom-text-memo.mjs

import { match } from "../dist/src/index.js";

const pendingPayments = [
  { id: "order-9f21", expectedMemo: "ORDER-9F21-BOOK" },
  { id: "order-4b88", expectedMemo: "ORDER-4B88-COURSE" },
  { id: "donation", expectedMemo: "DONATE-THANKS" },
];

const incomingMemos = [
  "order 9f21 book",        // lowercase, space instead of hyphens
  "ORDER-9F2I-BOOK",        // typo: "I" instead of "1"
  "pago ORDER-4B88-COURSE", // bank app prepended text
  "donate thanks!",         // reworded + punctuation
];

for (const incoming of incomingMemos) {
  const [best] = match(
    incoming,
    pendingPayments.map((p) => p.expectedMemo),
    { threshold: 0.7 },
  );

  if (!best) {
    console.log(`"${incoming}" -> no match, falls to manual review`);
    continue;
  }

  const payment = pendingPayments.find((p) => p.expectedMemo === best.candidate);
  console.log(`"${incoming}" -> ${payment.id} (score ${best.score.toFixed(3)})`);
}
