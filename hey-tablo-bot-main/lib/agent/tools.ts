import { tool, type RunContext } from "@openai/agents";
import { z } from "zod";
import {
  getEpisodeTool,
  getSegmentContextTool,
  recommendSegmentsTool,
  searchTranscriptTool,
} from "@/lib/tools";
import type { AgentToolTrace } from "./output";

export type HeyTabloAgentContext = {
  toolCalls: AgentToolTrace[];
  excludedSegmentIds: string[];
};

function requireAgentContext(
  runContext: RunContext<unknown> | undefined,
): HeyTabloAgentContext {
  if (!runContext) throw new Error("Agent run context is missing.");
  const context = runContext.context;
  if (!context || typeof context !== "object" || !("toolCalls" in context)) {
    throw new Error("Hey Tablo agent context is invalid.");
  }
  return context as HeyTabloAgentContext;
}

function recordToolCall<TInput, TResult>(
  context: HeyTabloAgentContext,
  name: string,
  input: TInput,
  execute: () => TResult,
): TResult {
  const startedAt = Date.now();
  try {
    const result = execute();
    context.toolCalls.push({
      name,
      input,
      resultCount: Array.isArray(result) ? result.length : result === null ? 0 : 1,
      durationMs: Date.now() - startedAt,
      status: "completed",
    });
    return result;
  } catch (error) {
    context.toolCalls.push({
      name,
      input,
      resultCount: null,
      durationMs: Date.now() - startedAt,
      status: "failed",
    });
    throw error;
  }
}

export const transcriptSearchAgentTool = tool({
  name: "search_transcript",
  description: "Search Hey Tablo transcript moments. Use this before making factual recommendations.",
  parameters: z.object({
    query: z.string().min(1),
    limit: z.number().int().min(1).max(10),
    verifiedOnly: z.boolean(),
    episode: z.number().int().positive().nullable(),
  }),
  execute: async (input, runContext) => {
    const context = requireAgentContext(runContext);
    const effectiveInput = {
      query: input.query,
      limit: input.limit,
      verifiedOnly: input.verifiedOnly,
      episode: input.episode ?? undefined,
      excludeSegmentIds: context.excludedSegmentIds,
    };
    return recordToolCall(
      context,
      "search_transcript",
      effectiveInput,
      () => searchTranscriptTool.execute(effectiveInput),
    );
  },
});

export const episodeAgentTool = tool({
  name: "get_episode",
  description: "Get verified metadata for one Hey Tablo episode after a transcript result identifies it.",
  parameters: z.object({
    episodeNumber: z.number().int().positive(),
  }),
  execute: async (input, runContext) => recordToolCall(
    requireAgentContext(runContext),
    "get_episode",
    input,
    () => getEpisodeTool.execute(input),
  ),
});

export const segmentContextAgentTool = tool({
  name: "get_segment_context",
  description: "Read neighboring transcript moments before quoting a segment, to reduce out-of-context recommendations.",
  parameters: z.object({
    segmentId: z.string().min(1),
    neighborCount: z.number().int().min(0).max(3),
  }),
  execute: async (input, runContext) => recordToolCall(
    requireAgentContext(runContext),
    "get_segment_context",
    input,
    () => getSegmentContextTool.execute(input),
  ),
});

export const recommendationAgentTool = tool({
  name: "recommend_segments",
  description: "Find diverse, source-verified transcript recommendations for a listener's situation.",
  parameters: z.object({
    situation: z.string().min(1),
    desiredEffect: z.string(),
    tone: z.string(),
    limit: z.number().int().min(1).max(3),
    verifiedOnly: z.boolean(),
  }),
  execute: async (input, runContext) => {
    const context = requireAgentContext(runContext);
    const effectiveInput = {
      ...input,
      excludeSegmentIds: context.excludedSegmentIds,
    };
    return recordToolCall(
      context,
      "recommend_segments",
      effectiveInput,
      () => recommendSegmentsTool.execute(effectiveInput),
    );
  },
});

export const agentTools = [
  recommendationAgentTool,
  transcriptSearchAgentTool,
  segmentContextAgentTool,
  episodeAgentTool,
];
