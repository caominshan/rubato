import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/agent/route";

const originalApiKey = process.env.OPENAI_API_KEY;
const originalDashscopeApiKey = process.env.DASHSCOPE_API_KEY;
const originalProvider = process.env.MODEL_PROVIDER;

describe("POST /api/agent", () => {
  beforeEach(() => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.DASHSCOPE_API_KEY;
    process.env.MODEL_PROVIDER = "openai";
  });

  afterEach(() => {
    if (originalApiKey) process.env.OPENAI_API_KEY = originalApiKey;
    else delete process.env.OPENAI_API_KEY;
    if (originalDashscopeApiKey) process.env.DASHSCOPE_API_KEY = originalDashscopeApiKey;
    else delete process.env.DASHSCOPE_API_KEY;
    if (originalProvider) process.env.MODEL_PROVIDER = originalProvider;
    else delete process.env.MODEL_PROVIDER;
  });

  it("rejects invalid requests before running the agent", async () => {
    const response = await POST(new Request("http://localhost/api/agent", {
      method: "POST",
      body: JSON.stringify({ message: "" }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("invalid_request");
  });

  it("falls back to transparent deterministic retrieval when the model is unavailable", async () => {
    const response = await POST(new Request("http://localhost/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "失恋后很难过，想被陪伴" }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.mode).toBe("fallback");
    expect(payload.error.code).toBe("missing_api_key");
    expect(payload.result.recommendations.length).toBeGreaterThan(0);
    expect(payload.result.recommendations[0].episode).toBe(4);
    expect(payload.result.recommendations[0].sourceUrl).toMatch(/^https:\/\//);
    expect(payload.result.recommendations[0].sourceVerified).toBe(false);
    expect(payload.result.confidence).toBe("low");
    expect(payload.trace.traceId).toMatch(/^trace_/);
    expect(payload.trace.provider).toBe("openai");
  });

  it("reports the Qwen credential name when Qwen is selected", async () => {
    process.env.MODEL_PROVIDER = "qwen";

    const response = await POST(new Request("http://localhost/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "下饭看什么" }),
    }));
    const payload = await response.json();

    expect(payload.mode).toBe("fallback");
    expect(payload.error.code).toBe("missing_api_key");
    expect(payload.error.message).toContain("DASHSCOPE_API_KEY");
    expect(payload.trace.provider).toBe("qwen");
    expect(payload.trace.model).toBe("qwen-plus");
  });

  it("asks a clarification question instead of guessing from insufficient input", async () => {
    const response = await POST(new Request("http://localhost/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "随便" }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.result.needsClarification).toBe(true);
    expect(payload.result.recommendations).toHaveLength(0);
    expect(payload.result.clarificationQuestion).toContain("陪伴");
    expect(payload.trace.toolCalls).toHaveLength(0);
  });

  it("updates constraints and excludes the previous results after feedback", async () => {
    const firstResponse = await POST(new Request("http://localhost/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "一个人吃饭，想听点轻松的" }),
    }));
    const first = await firstResponse.json();
    const firstIds = first.result.recommendations.map((item: { segmentId: string }) => item.segmentId);

    const secondResponse = await POST(new Request("http://localhost/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: first.session.originalMessage,
        conversationId: first.session.conversationId,
        feedback: "too_preachy",
        session: first.session,
      }),
    }));
    const second = await secondResponse.json();
    const secondIds = second.result.recommendations.map((item: { segmentId: string }) => item.segmentId);

    expect(secondResponse.status).toBe(200);
    expect(second.session.conversationId).toBe(first.session.conversationId);
    expect(second.session.turn).toBe(2);
    expect(second.session.constraints.avoidAdvice).toBe(true);
    expect(second.session.feedbackHistory).toContain("too_preachy");
    expect(secondIds.length).toBeGreaterThan(0);
    expect(secondIds.every((id: string) => !firstIds.includes(id))).toBe(true);
  });
});
