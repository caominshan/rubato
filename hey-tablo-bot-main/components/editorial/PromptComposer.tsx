"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import type { HeyTabloAgentResponse } from "@/lib/agent/output";
import { trackProductEvent } from "@/lib/analytics/client";

const prompts = [
  { icon: "‹", title: "很累，只想有人陪", hint: "不要建议，低负担一点" },
  { icon: "↗", title: "通勤 20 分钟", hint: "提提神，快速进入" },
];

type PromptComposerProps = {
  compact?: boolean;
  onResponseChange: (response: HeyTabloAgentResponse | null) => void;
  onLoadingChange: (loading: boolean) => void;
};

export function PromptComposer({ compact = false, onResponseChange, onLoadingChange }: PromptComposerProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextValue = value.trim();
    if (!nextValue || isLoading) return;
    const conversationId = globalThis.crypto?.randomUUID?.() ?? `conversation_${Date.now()}`;

    setIsLoading(true);
    onLoadingChange(true);
    setError("");
    trackProductEvent("query_submitted", { conversationId, turn: 1 });

    try {
      const request = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: nextValue, conversationId }),
      });
      const payload = await request.json();
      if (!request.ok || !payload.ok) {
        throw new Error(payload.error?.message || "请求失败，请稍后再试。");
      }
      const nextResponse = payload as HeyTabloAgentResponse;
      trackProductEvent("recommendation_shown", {
        conversationId: nextResponse.session.conversationId,
        turn: nextResponse.session.turn,
        recommendationCount: nextResponse.result.recommendations.length,
      });
      onResponseChange(nextResponse);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "请求失败，请稍后再试。");
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div id="agent">
      {!compact ? (
        <>
          <div className="prompt-grid">
            {prompts.map((prompt) => (
              <button
                className="prompt-card"
                key={prompt.title}
                type="button"
                onClick={() => setValue(prompt.title + "，" + prompt.hint)}
              >
                <span className="prompt-icon">{prompt.icon}</span>
                <span>
                  <strong>{prompt.title}</strong>
                  <small>{prompt.hint}</small>
                </span>
              </button>
            ))}
          </div>

          <div className="last-session">
            <span>LAST SESSION / 最近一次</span>
            <strong>睡前低能量陪伴</strong>
            <button type="button">继续收听 ↗</button>
          </div>
        </>
      ) : null}

      <form className="composer" onSubmit={submit}>
        <label htmlFor="listener-prompt" className="sr-only">描述你现在想听的内容</label>
        <textarea
          id="listener-prompt"
          value={value}
          maxLength={300}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="说说你现在的状态……"
          rows={3}
        />
        <button type="submit" aria-label="提交收听需求" disabled={isLoading}>
          {isLoading ? "…" : "↑"}
        </button>
        <span className="composer-hint">Enter 发送 · Shift + Enter 换行</span>
        <span className="character-count">{value.length} / 300</span>
      </form>

      {error ? <p className="agent-error" role="alert">{error}</p> : null}

    </div>
  );
}
