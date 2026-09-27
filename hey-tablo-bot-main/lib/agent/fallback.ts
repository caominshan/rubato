import { recommendSegmentsTool } from "@/lib/tools";
import type { AgentSessionState, HeyTabloAgentOutput } from "./output";

export function createFallbackOutput(message: string, session?: AgentSessionState): HeyTabloAgentOutput {
  const matches = recommendSegmentsTool.execute({
    situation: message,
    desiredEffect: session?.constraints.desiredEffect,
    tone: session?.constraints.tone,
    limit: 3,
    verifiedOnly: false,
    excludeSegmentIds: session?.excludedSegmentIds,
  });
  const allVerified = matches.length > 0 && matches.every((match) => match.sourceVerified);

  return {
    answer: matches.length
      ? allVerified
        ? "模型暂时不可用，我先用本地检索为你找到了这些经过来源验证的片段。"
        : "模型暂时不可用，我先用本地检索找到了相关片段；其中部分来源仍待人工复核。"
      : "模型暂时不可用，本地检索也没有找到足够可靠的匹配。你可以换一种描述再试一次。",
    understoodNeed: message,
    recommendations: matches.map((match) => ({
      segmentId: match.id,
      episode: match.episode,
      title: match.title,
      timestamp: match.timestamp,
      quote: match.quote,
      meaningZh: match.meaningZh,
      reason: `本地检索命中了相关正文或情绪标签，综合得分 ${match.score}；来源${match.sourceVerified ? "已验证" : "待复核"}。`,
      sourceUrl: match.sourceUrl,
      sourceVerified: match.sourceVerified,
    })),
    confidence: allVerified && matches.length >= 2 ? "medium" : "low",
    caveat: allVerified
      ? "这是无模型降级结果，由 MiniSearch 与确定性排序生成。"
      : "这是无模型降级结果；UNVERIFIED 片段只能作为候选，正式引用前需要人工核对原视频。",
  };
}
