// Real-world case: never auto-confirm on the memo score alone (see
// docs/LIMITATIONS.md). Short, sequential invoice numbers are exactly the
// ambiguous shape documented there — this example shows the safe pattern:
// only auto-confirm when the TOP-ranked memo match's amount agrees with the
// incoming payment. Any other case (including "some other fuzzy candidate's
// amount happens to match") goes to a human, because the memo and the
// amount are telling you two different things.
//
// Run: node examples/reconcile-with-second-signal.mjs

import { match } from "../dist/src/index.js";

const pendingPayments = [
  { id: "inv-1001", expectedMemo: "FACTURA 1001 ACME SRL", amount: 150.0 },
  { id: "inv-1002", expectedMemo: "FACTURA 1002 ACME SRL", amount: 230.5 },
];

function reconcile(incomingMemo, incomingAmount) {
  const [best] = match(
    incomingMemo,
    pendingPayments.map((p) => p.expectedMemo),
    { threshold: 0.6 },
  );

  if (!best) return { status: "unreconciled", reason: "no memo match" };

  const topMatch = pendingPayments.find((p) => p.expectedMemo === best.candidate);
  if (topMatch.amount === incomingAmount) {
    return { status: "confirmed", paymentId: topMatch.id };
  }

  return {
    status: "needs_review",
    reason: "top memo match's amount doesn't agree with the incoming amount",
    topMemoMatch: topMatch.id,
  };
}

console.log(reconcile("factura 1001 acme", 150.0));
// -> confirmed: inv-1001 (memo and amount agree)

console.log(reconcile("factura 1002 acme srl", 150.0));
// -> needs_review: the memo's best match is inv-1002, but 150.0 is
//    inv-1001's amount, not inv-1002's (230.5) — a real conflict, not
//    something to silently resolve by picking whichever candidate's amount
//    happens to match.
