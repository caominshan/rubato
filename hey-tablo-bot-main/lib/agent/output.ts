import { z } from "zod";

export const agentRecommendationSchema = z.object({
  segmentId: z.string(),
  episode: z.number().int().positive(),
  title: z.string(),
  timestamp: z.string(),
  quote: z.string(),
  meaningZh: z.string(),
  reason: z.string(),
  sourceUrl: z.string().url(),
  sourceVerified: z.boolean(),
});

export const heyTabloAgentOutputSchema = z.object({
  answer: z.string(),
  understoodNeed: z.string(),
  recommendations: z.array(agentRecommendationSchema).max(3),
  confidence: z.enum(["high", "medium", "low"]),
  caveat: z.string(),
  needsClarification: z.boolean().optional(),
  clarificationQuestion: z.string().optional(),
});

export const agentFeedbackSchema = z.enum([
  "too_preachy",
  "not_funny_enough",
  "too_heavy",
  "not_relevant",
]);

export const sessionConstraintsSchema = z.object({
  avoidAdvice: z.boolean(),
  avoidHeavy: z.boolean(),
  broadenSearch: z.boolean(),
  desiredEffect: z.string().max(100),
  tone: z.string().max(100),
});

export const agentSessionSchema = z.object({
  conversationId: z.string().min(1).max(100),
  originalMessage: z.string().min(2).max(300),
  turn: z.number().int().min(1).max(20),
  constraints: sessionConstraintsSchema,
  excludedSegmentIds: z.array(z.string().min(1)).max(30),
  feedbackHistory: z.array(agentFeedbackSchema).max(8),
});

export const agentRequestSchema = z.object({
  message: z.string().trim().min(2).max(300),
  conversationId: z.string().trim().min(1).max(100).optional(),
  feedback: agentFeedbackSchema.optional(),
  session: agentSessionSchema.optional(),
});

export type HeyTabloAgentOutput = z.infer<typeof heyTabloAgentOutputSchema>;
export type AgentFeedback = z.infer<typeof agentFeedbackSchema>;
export type SessionConstraints = z.infer<typeof sessionConstraintsSchema>;
export type AgentSessionState = z.infer<typeof agentSessionSchema>;

export type AgentToolTrace = {
  name: string;
  input: unknown;
  resultCount: number | null;
  durationMs: number;
  status: "completed" | "failed";
};

export type HeyTabloAgentResponse = {
  ok: boolean;
  mode: "agent" | "fallback";
  result: HeyTabloAgentOutput;
  trace: {
    traceId: string;
    responseId: string | null;
    workflowName: string;
    provider: "openai" | "qwen";
    model: string;
    toolCalls: AgentToolTrace[];
    durationMs: number;
  };
  error: {
    code: string;
    message: string;
  } | null;
  session: AgentSessionState;
};
