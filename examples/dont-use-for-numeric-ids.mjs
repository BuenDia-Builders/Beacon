// What NOT to do (see docs/LIMITATIONS.md, validated against
// stellar/anchor-platform's default memo scheme). Auto-generated random
// numeric memo IDs are not the problem Beacon solves — exact match is
// already correct and safe for them.
//
// Run: node examples/dont-use-for-numeric-ids.mjs

import { match } from "../dist/src/index.js";

const paymentA = "4891023847562910384"; // real pending payment
const paymentB = "4891023847562910385"; // a DIFFERENT, unrelated payment

const [top] = match(paymentA, [paymentB]);

console.log(`Incoming memo:  ${paymentA}`);
console.log(`Unrelated memo: ${paymentB}`);
console.log(`Beacon's score: ${top.score.toFixed(3)} (confidently wrong)`);
console.log();
console.log("These are two different payments, not a typo of the same one.");
console.log("For auto-generated numeric IDs, use exact string equality instead.");
