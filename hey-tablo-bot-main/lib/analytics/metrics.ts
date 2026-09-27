import type { AgentFeedback } from "@/lib/agent/output";
import type { ProductEvent } from "./schema";

export type AnalyticsMetrics = {
  recommendationClickRate: number;
  sourceOpenRate: number;
  negativeFeedbackRate: number;
  postFeedbackPlayRate: number;
  impressionTurns: number;
  selectedSegments: number;
  sourceOpens: number;
  feedbackCount: number;
  successfulReplans: number;
  conversations: number;
};

const feedbackLabels: Record<AgentFeedback, string> = {
  too_preachy: "太说教",
  not_funny_enough: "不够好笑",
  too_heavy: "太沉重",
  not_relevant: "换个方向",
};

function eventTurnKey(event: ProductEvent) {
  return `${event.conversationId ?? "unknown"}:${event.turn ?? 1}`;
}

function percentage(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

export function calculateAnalyticsMetrics(events: ProductEvent[]): AnalyticsMetrics {
  const impressions = new Set(events.filter((event) => event.name === "recommendation_shown").map(eventTurnKey));
  const selectedTurns = new Set(events.filter((event) => event.name === "segment_selected").map(eventTurnKey));
  const selectedSegments = new Set(
    events
      .filter((event) => event.name === "segment_selected")
      .map((event) => `${eventTurnKey(event)}:${event.segmentId ?? "unknown"}`),
  );
  const sourceOpenedSegments = new Set(
    events
      .filter((event) => event.name === "source_opened")
      .map((event) => `${eventTurnKey(event)}:${event.segmentId ?? "unknown"}`),
  );
  const feedbackTurns = new Set(events.filter((event) => event.name === "feedback_clicked").map(eventTurnKey));
  const replannedTurns = new Set(events.filter((event) => event.name === "recommendation_replanned").map(eventTurnKey));
  const postFeedbackPlayedTurns = new Set(
    events
      .filter((event) => event.name === "source_opened" && (event.turn ?? 1) > 1)
      .map(eventTurnKey),
  );
  const conversations = new Set(events.map((event) => event.conversationId).filter(Boolean));

  return {
    recommendationClickRate: percentage(selectedTurns.size, impressions.size),
    sourceOpenRate: percentage(sourceOpenedSegments.size, selectedSegments.size),
    negativeFeedbackRate: percentage(feedbackTurns.size, impressions.size),
    postFeedbackPlayRate: percentage(postFeedbackPlayedTurns.size, replannedTurns.size),
    impressionTurns: impressions.size,
    selectedSegments: selectedSegments.size,
    sourceOpens: sourceOpenedSegments.size,
    feedbackCount: feedbackTurns.size,
    successfulReplans: replannedTurns.size,
    conversations: conversations.size,
  };
}

export function calculateFeedbackBreakdown(events: ProductEvent[]) {
  const counts = new Map<AgentFeedback, number>();
  for (const event of events) {
    if (event.name === "feedback_clicked" && event.feedback) {
      counts.set(event.feedback, (counts.get(event.feedback) ?? 0) + 1);
    }
  }

  const total = [...counts.values()].reduce((sum, count) => sum + count, 0);
  return (Object.keys(feedbackLabels) as AgentFeedback[]).map((feedback) => ({
    feedback,
    label: feedbackLabels[feedback],
    count: counts.get(feedback) ?? 0,
    percentage: percentage(counts.get(feedback) ?? 0, total),
  }));
}

export function calculateFunnel(events: ProductEvent[]) {
  const queryConversations = new Set(events.filter((event) => event.name === "query_submitted").map((event) => event.conversationId));
  const shownConversations = new Set(events.filter((event) => event.name === "recommendation_shown").map((event) => event.conversationId));
  const selectedConversations = new Set(events.filter((event) => event.name === "segment_selected").map((event) => event.conversationId));
  const openedConversations = new Set(events.filter((event) => event.name === "source_opened").map((event) => event.conversationId));

  return [
    { label: "提交需求", value: queryConversations.size },
    { label: "看到推荐", value: shownConversations.size },
    { label: "选择切片", value: selectedConversations.size },
    { label: "打开来源", value: openedConversations.size },
  ];
}
