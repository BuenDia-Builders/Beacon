export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

export function levenshteinSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/**
 * Greedy best-match pairing between token sets, counting a pair as a soft
 * match once its similarity clears SOFT_MATCH_THRESHOLD. This is what lets a
 * typo inside a single reference code (e.g. "INV12E4" vs "INV1234") still
 * register as token overlap, not just whole-string similarity.
 */
const SOFT_MATCH_THRESHOLD = 0.75;

export function tokenFuzzyOverlap(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 && tokensB.length === 0) return 1;
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const usedB = new Set<number>();
  let matchedWeight = 0;

  for (const tokenA of tokensA) {
    let bestIdx = -1;
    let bestScore = 0;
    tokensB.forEach((tokenB, idx) => {
      if (usedB.has(idx)) return;
      const score = tokenA === tokenB ? 1 : levenshteinSimilarity(tokenA, tokenB);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    });
    if (bestIdx !== -1 && bestScore >= SOFT_MATCH_THRESHOLD) {
      usedB.add(bestIdx);
      matchedWeight += bestScore;
    }
  }

  return (2 * matchedWeight) / (tokensA.length + tokensB.length);
}
