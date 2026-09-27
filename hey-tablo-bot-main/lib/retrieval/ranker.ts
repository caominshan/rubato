import type { ScoreBreakdown, SearchDocument } from "./schema";
import { normalizeText, tokenize } from "./normalize";

export const RANKING_WEIGHTS = {
  textRelevance: 6,
  exactPhrase: 2,
  tagOverlap: 0.8,
  verifiedSource: 0.75,
} as const;

export function calculateScore(
  document: SearchDocument,
  originalQuery: string,
  miniSearchScore: number,
  expandedQuery = originalQuery,
): ScoreBreakdown {
  const normalizedQuery = normalizeText(originalQuery);
  const searchable = normalizeText(`${document.searchText} ${document.tags}`);
  const queryTokens = tokenize(expandedQuery).filter((token) => token.length > 1);
  const tagTokens = new Set(tokenize(document.tags));
  const overlappingTags = queryTokens.filter((token) => tagTokens.has(token)).length;

  const textRelevance = Math.log1p(miniSearchScore) * RANKING_WEIGHTS.textRelevance;
  const exactPhrase = normalizedQuery.length > 1 && searchable.includes(normalizedQuery)
    ? RANKING_WEIGHTS.exactPhrase
    : 0;
  const tagOverlap = overlappingTags * RANKING_WEIGHTS.tagOverlap;
  const verifiedSource = document.sourceVerified ? RANKING_WEIGHTS.verifiedSource : 0;
  const total = textRelevance + exactPhrase + tagOverlap + verifiedSource;

  return {
    textRelevance: round(textRelevance),
    exactPhrase: round(exactPhrase),
    tagOverlap: round(tagOverlap),
    verifiedSource: round(verifiedSource),
    total: round(total),
  };
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
