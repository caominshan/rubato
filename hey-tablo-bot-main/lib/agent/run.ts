import { generateTraceId, Runner } from "@openai/agents";
import { createFallbackOutput } from "./fallback";
import {
  createHeyTabloAnswerAgent,
  createHeyTabloRetrievalAgent,
  HEY_TABLO_WORKFLOW_NAME,
} from "./hey-tablo-agent";
import {
  heyTabloAgentOutputSchema,
  type AgentFeedback,
  type AgentSessionState,
  type AgentToolTrace,
  type HeyTabloAgentResponse,
} from "./output";
import type { HeyTabloAgentContext } from "./tools";
import { getModelRuntimeConfig } from "./model-provider";
import {
  addRecommendationsToExclusions,
  applyFeedback,
  buildPlanningInput,
  createSession,
  isInsufficientRequest,
} from "./session";

export async function runHeyTabloAgent(
  message: string,
  options: {
    conversationId?: string;
    feedback?: AgentFeedback;
    session?: AgentSessionState;
  } = {},
): Promise<HeyTabloAgentResponse> {
  const startedAt = Date.now();
  const traceId = generateTraceId();
  const modelConfig = getModelRuntimeConfig();
  const { model, providerName } = modelConfig;
  const toolCalls: AgentToolTrace[] = [];
  const baseSession = options.session ?? createSession(message, options.conversationId);
  const session = options.feedback ? applyFeedback(baseSession, options.feedback) : baseSession;

  if (!options.feedback && isInsufficientRequest(message)) {
    return clarificationResponse({ session, traceId, model, providerName, startedAt });
  }

  const planningInput = buildPlanningInput(message, session);

  if (!modelConfig.apiKey) {
    return fallbackResponse({
      message,
      traceId,
      model,
      providerName,
      toolCalls,
      startedAt,
      session,
      code: "missing_api_key",
      errorMessage: `${modelConfig.missingKeyName} is not configured; returned deterministic retrieval instead.`,
    });
  }

  try {
    const context: HeyTabloAgentContext = {
      toolCalls,
      excludedSegmentIds: session.excludedSegmentIds,
    };
    const runner = new Runner({
      workflowName: HEY_TABLO_WORKFLOW_NAME,
      traceId,
      groupId: session.conversationId,
      traceIncludeSensitiveData: false,
      modelProvider: modelConfig.modelProvider,
      tracingDisabled: modelConfig.tracingDisabled,
    });
    const retrievalResult = await runner.run(createHeyTabloRetrievalAgent(model), planningInput, {
      context,
      maxTurns: 2,
    });

    if (!toolCalls.some((call) => call.status === "completed")) {
      throw new Error("Retrieval agent completed without a successful retrieval tool call.");
    }

    const answerInput = [
      `LISTENER REQUEST:\n${message}`,
      `SESSION PLAN:\n${planningInput}`,
      `RETRIEVAL EVIDENCE:\n${String(retrievalResult.finalOutput)}`,
    ].join("\n\n");

    const result = await runner.run(createHeyTabloAnswerAgent(model), answerInput, {
      context,
      maxTurns: 2,
    });
    const output = heyTabloAgentOutputSchema.parse(result.finalOutput);

    const nextSession = addRecommendationsToExclusions(
      session,
      output.recommendations.map((item) => item.segmentId),
    );

    return {
      ok: true,
      mode: "agent",
      result: output,
      trace: {
        traceId,
        responseId: result.lastResponseId ?? null,
        workflowName: HEY_TABLO_WORKFLOW_NAME,
        provider: providerName,
        model,
        toolCalls,
        durationMs: Date.now() - startedAt,
      },
      error: null,
      session: nextSession,
    };
  } catch (error) {
    return fallbackResponse({
      message,
      traceId,
      model,
      providerName,
      toolCalls,
      startedAt,
      session,
      code: "agent_run_failed",
      errorMessage: safeErrorMessage(error),
    });
  }
}

function fallbackResponse(input: {
  message: string;
  traceId: string;
  model: string;
  providerName: "openai" | "qwen";
  toolCalls: AgentToolTrace[];
  startedAt: number;
  code: string;
  errorMessage: string;
  session: AgentSessionState;
}): HeyTabloAgentResponse {
  const result = createFallbackOutput(input.message, input.session);
  return {
    ok: true,
    mode: "fallback",
    result,
    trace: {
      traceId: input.traceId,
      responseId: null,
      workflowName: HEY_TABLO_WORKFLOW_NAME,
      provider: input.providerName,
      model: input.model,
      toolCalls: input.toolCalls,
      durationMs: Date.now() - input.startedAt,
    },
    error: {
      code: input.code,
      message: input.errorMessage,
    },
    session: addRecommendationsToExclusions(
      input.session,
      result.recommendations.map((item) => item.segmentId),
    ),
  };
}

function clarificationResponse(input: {
  session: AgentSessionState;
  traceId: string;
  model: string;
  providerName: "openai" | "qwen";
  startedAt: number;
}): HeyTabloAgentResponse {
  const question = "你现在更想被陪伴、逗笑，还是安静想一想？";
  return {
    ok: true,
    mode: "fallback",
    result: {
      answer: question,
      understoodNeed: input.session.originalMessage,
      recommendations: [],
      confidence: "low",
      caveat: "当前描述不足以生成可靠推荐，先补充期望状态。",
      needsClarification: true,
      clarificationQuestion: question,
    },
    trace: {
      traceId: input.traceId,
      responseId: null,
      workflowName: HEY_TABLO_WORKFLOW_NAME,
      provider: input.providerName,
      model: input.model,
      toolCalls: [],
      durationMs: Date.now() - input.startedAt,
    },
    error: null,
    session: input.session,
  };
}

function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 240);
  return "Unknown agent error";
}
