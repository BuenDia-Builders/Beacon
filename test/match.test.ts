import { test } from "node:test";
import assert from "node:assert/strict";
import { match, normalize, levenshteinSimilarity } from "../src/index.js";

test("exact match scores 1", () => {
  const results = match("payment 1234", ["payment 1234", "other"]);
  assert.equal(results[0].score, 1);
});

test("catches a typo inside a reference code", () => {
  const results = match("INV12E4", ["INV1234", "INV9999"]);
  assert.equal(results[0].candidate, "INV1234");
  assert.ok(results[0].score > 0.75, `expected > 0.75, got ${results[0].score}`);
});

test("catches reordered memos with extra words", () => {
  const results = match("pago factura 1234 juan perez", ["1234 factura"]);
  assert.ok(results.length > 0);
  assert.ok(results[0].score > 0.5, `expected > 0.5, got ${results[0].score}`);
});

test("drops candidates below threshold", () => {
  const results = match("abc", ["xyz999"], { threshold: 0.9 });
  assert.equal(results.length, 0);
});

test("respects limit", () => {
  const results = match("1234", ["1234", "1234a", "1234b", "1234c"], { threshold: 0, limit: 2 });
  assert.equal(results.length, 2);
});

test("normalize strips accents and punctuation", () => {
  assert.equal(normalize("Factura N°1234, Perú"), "factura n 1234 peru");
});

test("levenshteinSimilarity of identical strings is 1", () => {
  assert.equal(levenshteinSimilarity("abc", "abc"), 1);
});

test("two memos that are pure punctuation do not match each other", () => {
  const results = match("!!!", ["???", "abc"]);
  assert.equal(results.length, 0);
});

test("KNOWN LIMITATION: short numeric suffixes with a shared prefix are ambiguous", () => {
  // INV-100, INV-200 and INV-300 are three different invoices, not typos of
  // each other, but the numeric part is a small fraction of the string, so
  // whole-string similarity can't tell them apart. See docs/LIMITATIONS.md.
  // This test pins the current (undesirable) behavior so a change to the
  // scoring function has to touch this assertion on purpose.
  const results = match("INV-100", ["INV-200", "INV-300"], { threshold: 0 });
  assert.equal(results.length, 2);
  assert.equal(results[0].score, results[1].score);
  assert.ok(results[0].score > 0.5, "both score as plausible matches despite being wrong");
});
