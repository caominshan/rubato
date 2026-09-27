import { z } from "zod";
import {
  episodes,
  getSegmentById,
  searchSegments,
  segments,
  type SearchOptions,
} from "@/lib/retrieval";

const listFilter = z.array(z.string()).optional();

export const searchTranscriptInputSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(20).default(8),
  episode: z.number().int().positive().optional(),
  verifiedOnly: z.boolean().default(false),
  topics: listFilter,
  emotions: listFilter,
  desiredEffects: listFilter,
  toneTags: listFilter,
  excludeSegmentIds: listFilter,
});

export const searchTranscriptTool = {
  name: "search_transcript",
  description: "Searches Hey Tablo transcript segments and returns ranked, cited results.",
  inputSchema: searchTranscriptInputSchema,
  execute(input: z.input<typeof searchTranscriptInputSchema>) {
    const parsed = searchTranscriptInputSchema.parse(input);
    return searchSegments(parsed.query, parsed);
  },
};

const getEpisodeInputSchema = z.object({
  episodeNumber: z.number().int().positive(),
});

export const getEpisodeTool = {
  name: "get_episode",
  description: "Returns one episode and the number of available transcript segments.",
  inputSchema: getEpisodeInputSchema,
  execute(input: z.input<typeof getEpisodeInputSchema>) {
    const { episodeNumber } = getEpisodeInputSchema.parse(input);
    const episode = episodes.find((item) => item.episodeNumber === episodeNumber);
    if (!episode) return null;
    return {
      ...episode,
      segmentCount: segments.filter((segment) => segment.episode === episodeNumber).length,
    };
  },
};

const getSegmentContextInputSchema = z.object({
  segmentId: z.string().min(1),
  neighborCount: z.number().int().min(0).max(5).default(1),
});

export const getSegmentContextTool = {
  name: "get_segment_context",
  description: "Returns a transcript segment with nearby segments from the same episode.",
  inputSchema: getSegmentContextInputSchema,
  execute(input: z.input<typeof getSegmentContextInputSchema>) {
    const { segmentId, neighborCount } = getSegmentContextInputSchema.parse(input);
    const target = getSegmentById(segmentId);
    if (!target) return null;
    const episodeSegments = segments
      .filter((segment) => segment.episode === target.episode)
      .sort((left, right) => left.startSeconds - right.startSeconds);
    const index = episodeSegments.findIndex((segment) => segment.id === segmentId);
    return {
      target,
      before: episodeSegments.slice(Math.max(0, index - neighborCount), index),
      after: episodeSegments.slice(index + 1, index + 1 + neighborCount),
    };
  },
};

const recommendSegmentsInputSchema = z.object({
  situation: z.string().min(1),
  desiredEffect: z.string().optional(),
  tone: z.string().optional(),
  verifiedOnly: z.boolean().default(true),
  limit: z.number().int().min(1).max(10).default(3),
  excludeSegmentIds: z.array(z.string()).max(30).optional(),
});

export const recommendSegmentsTool = {
  name: "recommend_segments",
  description: "Recommends diverse transcript moments for a listener situation without calling a model.",
  inputSchema: recommendSegmentsInputSchema,
  execute(input: z.input<typeof recommendSegmentsInputSchema>) {
    const parsed = recommendSegmentsInputSchema.parse(input);
    const query = [parsed.situation, parsed.desiredEffect, parsed.tone].filter(Boolean).join(" ");
    const searchOptions: SearchOptions = {
      verifiedOnly: parsed.verifiedOnly,
      limit: Math.min(50, parsed.limit * 8),
      excludeSegmentIds: parsed.excludeSegmentIds,
    };
    const candidates = searchSegments(query, searchOptions);
    const seenEpisodes = new Set<number>();

    return candidates.filter((candidate) => {
      if (seenEpisodes.has(candidate.episode)) return false;
      seenEpisodes.add(candidate.episode);
      return true;
    }).slice(0, parsed.limit);
  },
};

export const heyTabloTools = {
  search_transcript: searchTranscriptTool,
  get_episode: getEpisodeTool,
  get_segment_context: getSegmentContextTool,
  recommend_segments: recommendSegmentsTool,
} as const;
