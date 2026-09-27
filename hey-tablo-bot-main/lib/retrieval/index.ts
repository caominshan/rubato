import MiniSearch, { type SearchResult } from "minisearch";
import rawEpisodes from "@/data/episodes.json";
import rawSegments from "@/data/transcript-segments.json";
import { calculateScore } from "./ranker";
import { expandQuery, normalizeText, tokenize, toSearchDocument } from "./normalize";
import {
  episodesSchema,
  transcriptSegmentsSchema,
  type Episode,
  type RankedSegment,
  type SearchDocument,
  type TranscriptSegment,
} from "./schema";

export const episodes: Episode[] = episodesSchema.parse(rawEpisodes);
export const segments: TranscriptSegment[] = transcriptSegmentsSchema.parse(rawSegments);

const documents = segments.map(toSearchDocument);
const documentsById = new Map(documents.map((document) => [document.id, document]));

const index = new MiniSearch<SearchDocument>({
  fields: ["quote", "meaningZh", "noteZh", "context", "title", "titleZh", "tags"],
  storeFields: ["episode", "sourceVerified"],
  tokenize,
  processTerm: (term) => normalizeText(term),
  searchOptions: {
    boost: {
      quote: 4,
      meaningZh: 3.2,
      context: 2.5,
      noteZh: 2,
      titleZh: 1.8,
      title: 1.4,
      tags: 2.8,
    },
    combineWith: "OR",
    prefix: (term) => term.length >= 3,
    fuzzy: (term) => term.length >= 5 ? 0.15 : false,
  },
});

index.addAll(documents);

export type SearchFilters = {
  episode?: number;
  verifiedOnly?: boolean;
  topics?: string[];
  emotions?: string[];
  desiredEffects?: string[];
  toneTags?: string[];
  excludeSegmentIds?: string[];
};

export type SearchOptions = SearchFilters & {
  limit?: number;
};

export function searchSegments(query: string, options: SearchOptions = {}): RankedSegment[] {
  const cleanQuery = normalizeText(query);
  if (!cleanQuery) return [];

  const expandedQuery = expandQuery(cleanQuery);
  const results = index.search(expandedQuery, {
    filter: (result) => matchesFilters(result, options),
  });

  return results
    .map((result) => rankResult(result, cleanQuery, expandedQuery))
    .filter((result): result is RankedSegment => result !== null)
    .sort((left, right) => right.score - left.score || left.startSeconds - right.startSeconds)
    .slice(0, clamp(options.limit ?? 8, 1, 50));
}

function matchesFilters(result: SearchResult, filters: SearchFilters): boolean {
  const document = documentsById.get(String(result.id));
  if (!document) return false;
  if (filters.excludeSegmentIds?.includes(document.id)) return false;
  if (filters.episode !== undefined && document.episode !== filters.episode) return false;
  if (filters.verifiedOnly && !document.sourceVerified) return false;
  if (!hasAny(document.topics, filters.topics)) return false;
  if (!hasAny(document.emotions, filters.emotions)) return false;
  if (!hasAny(document.desiredEffects, filters.desiredEffects)) return false;
  if (!hasAny(document.toneTags, filters.toneTags)) return false;
  return true;
}

function rankResult(
  result: SearchResult,
  originalQuery: string,
  expandedQuery: string,
): RankedSegment | null {
  const document = documentsById.get(String(result.id));
  if (!document) return null;
  const breakdown = calculateScore(document, originalQuery, result.score, expandedQuery);

  return {
    ...stripSearchFields(document),
    score: breakdown.total,
    scoreBreakdown: breakdown,
    matchedTerms: [...new Set(Object.keys(result.match))],
  };
}

function stripSearchFields(document: SearchDocument): TranscriptSegment {
  const { searchText: _searchText, tags: _tags, ...segment } = document;
  return segment;
}

function hasAny(values: string[], expected?: string[]): boolean {
  if (!expected?.length) return true;
  const normalized = new Set(values.map(normalizeText));
  return expected.some((value) => normalized.has(normalizeText(value)));
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function getSegmentById(id: string): TranscriptSegment | undefined {
  const document = documentsById.get(id);
  return document ? stripSearchFields(document) : undefined;
}
