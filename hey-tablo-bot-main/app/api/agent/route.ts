import { agentRequestSchema } from "@/lib/agent/output";
import { runHeyTabloAgent } from "@/lib/agent/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        ok: false,
        error: {
          code: "invalid_json",
          message: "请求格式不正确，请刷新后重试。",
        },
      },
      { status: 400 },
    );
  }

  const parsed = agentRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "invalid_request",
          message: "请输入 2–300 个字符的收听需求。",
          issues: parsed.error.issues,
        },
      },
      { status: 400 },
    );
  }

  try {
    const response = await runHeyTabloAgent(parsed.data.message, {
      conversationId: parsed.data.conversationId,
      feedback: parsed.data.feedback,
      session: parsed.data.session,
    });

    return Response.json(response, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      {
        ok: false,
        error: {
          code: "internal_error",
          message: "服务暂时开小差了，请稍后再试。",
        },
      },
      { status: 500 },
    );
  }
}
