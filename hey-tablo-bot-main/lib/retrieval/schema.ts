import { z } from "zod";

const stringList = z.array(z.string()).default([]);

export const transcriptSegmentSchema = z.object({
  id: z.string().min(1),
  episode: z.number().int().positive(),
  title: z.string().min(1),
  titleZh: z.string().default(""),
  startSeconds: z.number().int().nonnegative(),
  endSeconds: z.number().int().nonnegative(),
  timestamp: z.string().regex(/^\d{1,2}:\d{2}(?::\d{2})?$/),
  quote: z.string().min(1),
  meaningZh: z.string().default(""),
  noteZh: z.string().default(""),
  context: z.string().default(""),
  topics: stringList,
  emotions: stringList,
  desiredEffects: stringList,
  toneTags: stringList,
  sourceVerified: z.boolean(),
  sourceUrl: z.string().url(),
}).superRefine((segment, context) => {
  if (segment.endSeconds < segment.startSeconds) {
    context.addIssue({
      code: "custom",
      path: ["endSeconds"],
      message: "endSeconds must be greater than or equal to startSeconds",
    });
  }
});

export const episodeSchema = z.object({
  id: z.string().min(1),
  episodeNumber: z.number().int().positive(),
  series: z.string(),
  title: z.string().min(1),
  publishedDate: z.string(),
  duration: z.string(),
  sourceUrl: z.string().url(),
  coreThemeZh: z.string(),
  summaryZh: z.string(),
  mainTopics: stringList,
  bestForSituations: stringList,
  emotionsBefore: stringList,
  desiredEffects: stringList,
  toneTags: stringList,
  sensitiveTopics: stringList,
  contentWarning: z.string(),
  scores: z.record(z.string(), z.number()),
  recommendationCopy: z.string(),
  confidence: z.string(),
}).passthrough();

export const transcriptSegmentsSchema = z.array(transcriptSegmentSchema);
export const episodesSchema = z.array(episodeSchema);

export type TranscriptSegment = z.infer<typeof transcriptSegmentSchema>;
export type Episode = z.infer<typeof episodeSchema>;

export type SearchDocument = TranscriptSegment & {
  searchText: string;
  tags: string;
};

export type ScoreBreakdown = {
  textRelevance: number;
  exactPhrase: number;
  tagOverlap: number;
  verifiedSource: number;
  total: number;
};

export type RankedSegment = TranscriptSegment & {
  score: number;
  scoreBreakdown: ScoreBreakdown;
  matchedTerms: string[];
};
