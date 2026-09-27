import { randomUUID } from "node:crypto";
import type { AgentFeedback, AgentSessionState, SessionConstraints } from "./output";

const FEEDBACK_CONSTRAINTS: Record<AgentFeedback, Partial<SessionConstraints>> = {
  too_preachy: {
    avoidAdvice: true,
    desiredEffect: "陪伴与共鸣，不要建议",
    tone: "自然、平等、轻松、不说教",
  },
  not_funny_enough: {
    desiredEffect: "更快获得笑点和轻松感",
    tone: "好笑、活泼、有即兴感",
  },
  too_heavy: {
    avoidHeavy: true,
    desiredEffect: "低负担地放松",
    tone: "轻盈、温暖、不沉重",
  },
  not_relevant: {
    broadenSearch: true,
    desiredEffect: "换一个更贴近日常处境的方向",
    tone: "具体、生活化、有代入感",
  },
};

export function createSession(message: string, conversationId?: string): AgentSessionState {
  return {
    conversationId: conversationId || randomUUID(),
    originalMessage: message,
    turn: 1,
    constraints: {
      avoidAdvice: false,
      avoidHeavy: false,
      broadenSearch: false,
      desiredEffect: "",
      tone: "",
    },
    excludedSegmentIds: [],
    feedbackHistory: [],
  };
}

export function applyFeedback(
  session: AgentSessionState,
  feedback: AgentFeedback,
): AgentSessionState {
  return {
    ...session,
    turn: session.turn + 1,
    constraints: {
      ...session.constraints,
      ...FEEDBACK_CONSTRAINTS[feedback],
    },
    feedbackHistory: [...session.feedbackHistory, feedback].slice(-8),
  };
}

export function addRecommendationsToExclusions(
  session: AgentSessionState,
  segmentIds: string[],
): AgentSessionState {
  return {
    ...session,
    excludedSegmentIds: [...new Set([...session.excludedSegmentIds, ...segmentIds])].slice(-30),
  };
}

export function buildPlanningInput(message: string, session: AgentSessionState): string {
  const constraints = [
    session.constraints.avoidAdvice ? "不要给建议或人生道理，只提供陪伴和共鸣" : "",
    session.constraints.avoidHeavy ? "排除沉重、高情绪强度的片段" : "",
    session.constraints.broadenSearch ? "换一个与上轮不同的主题和生活场景" : "",
    session.constraints.desiredEffect ? `期望效果：${session.constraints.desiredEffect}` : "",
    session.constraints.tone ? `语气：${session.constraints.tone}` : "",
  ].filter(Boolean);

  return [
    `原始需求：${session.originalMessage || message}`,
    constraints.length ? `更新约束：${constraints.join("；")}` : "更新约束：无",
    session.excludedSegmentIds.length
      ? `必须排除的历史片段：${session.excludedSegmentIds.join(", ")}`
      : "必须排除的历史片段：无",
    `当前轮次：${session.turn}`,
  ].join("\n");
}

export function isInsufficientRequest(message: string): boolean {
  const normalized = message.trim().replace(/[，。！？,.!?\s]/g, "");
  return new Set(["随便", "不知道", "都行", "推荐", "听什么", "看什么"]).has(normalized);
}
