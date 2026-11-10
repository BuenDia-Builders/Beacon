import { normalize, tokenize } from "./normalize.js";
import { levenshteinSimilarity, tokenFuzzyOverlap } from "./similarity.js";

export { normalize, tokenize } from "./normalize.js";
export { levenshtein, levenshteinSimilarity, tokenFuzzyOverlap } from "./similarity.js";

export interface MatchResult {
  candidate: string;
  score: number;
}

export interface MatchOptions {
  threshold?: number;
  limit?: number;
}

function scorePair(a: string, b: string): number {
  // Both sides can normalize to "" (e.g. a memo that's pure punctuation).
  // Two unrelated garbage memos must not score as a match just because
  // neither has any content left to compare.
  if (a.length === 0 && b.length === 0) return 0;
  if (a === b) return 1;
  const wholeStringScore = levenshteinSimilarity(a, b);
  const tokenScore = tokenFuzzyOverlap(tokenize(a), tokenize(b));
  return Math.max(wholeStringScore, tokenScore);
}

export function match(
  query: string,
  candidates: string[],
  options: MatchOptions = {},
): MatchResult[] {
  const threshold = options.threshold ?? 0.5;
  const limit = options.limit ?? 5;
  const normQuery = normalize(query);

  return candidates
    .map((candidate) => ({
      candidate,
      score: scorePair(normQuery, normalize(candidate)),
    }))
    .filter((r) => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
