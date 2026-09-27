"use client";

import { useState } from "react";
import type { AgentFeedback, HeyTabloAgentResponse } from "@/lib/agent/output";
import episodes from "@/data/episodes.json";
import { trackProductEvent } from "@/lib/analytics/client";
import { HeroArtwork } from "./HeroArtwork";
import { PromptComposer } from "./PromptComposer";

export function ListeningExperience() {
  const [response, setResponse] = useState<HeyTabloAgentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  async function replan(feedback: AgentFeedback) {
    if (!response || isLoading) return;
    setIsLoading(true);
    setFeedbackError("");
    trackProductEvent("feedback_clicked", {
      conversationId: response.session.conversationId,
      turn: response.session.turn,
      feedback,
    });

    try {
      const request = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: response.session.originalMessage,
          conversationId: response.session.conversationId,
          feedback,
          session: response.session,
        }),
      });
      const payload = await request.json();
      if (!request.ok || !payload.ok) {
        throw new Error(payload.error?.message || "重新规划失败，请稍后再试。");
      }
      const nextResponse = payload as HeyTabloAgentResponse;
      trackProductEvent("recommendation_replanned", {
        conversationId: nextResponse.session.conversationId,
        turn: nextResponse.session.turn,
        feedback,
      });
      trackProductEvent("recommendation_shown", {
        conversationId: nextResponse.session.conversationId,
        turn: nextResponse.session.turn,
        recommendationCount: nextResponse.result.recommendations.length,
      });
      setResponse(nextResponse);
    } catch (cause) {
      setFeedbackError(cause instanceof Error ? cause.message : "重新规划失败，请稍后再试。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <section className={`hero ${response ? "hero-has-result" : ""}`} aria-label="Hey Tablo 推荐舞台">
        {response ? (
          <HeroResultStage
            key={response.trace.traceId}
            response={response}
            isReplanning={isLoading}
            feedbackError={feedbackError}
            onFeedback={replan}
          />
        ) : (
          <div className={`hero-idle ${isLoading ? "is-thinking" : ""}`}>
            <div className="eyebrow">YOUR LISTENING AGENT / 001</div>
            <h1>此刻，<br />想听什么？</h1>
            <div className="ghost-word" aria-hidden="true">listen</div>
            <HeroArtwork />
            <div className="micro-copy micro-copy-left">human curated<br />ai retrieved<br />for right now</div>
            <p className="hero-description">
              {isLoading ? "正在穿过 500 段声音，寻找此刻最合适的三段。" : "不需要知道节目名称。只说说你的状态、时间，或者不想听什么。"}
            </p>
            <div className="micro-copy micro-copy-right">A quiet way<br />into a long story.</div>
          </div>
        )}
      </section>

      <section className={`start-section ${response ? "start-section-result" : ""}`} aria-labelledby="start-title">
        <header className="section-heading">
          <span>{response ? "ASK ANOTHER" : "START WITH A FEELING"}</span>
          <h2 id="start-title">从一句真实的话开始</h2>
        </header>
        <PromptComposer compact={Boolean(response)} onResponseChange={setResponse} onLoadingChange={setIsLoading} />
      </section>
    </>
  );
}

const feedbackOptions: Array<{ value: AgentFeedback; label: string }> = [
  { value: "too_preachy", label: "太说教" },
  { value: "not_funny_enough", label: "不够好笑" },
  { value: "too_heavy", label: "太沉重" },
  { value: "not_relevant", label: "换个方向" },
];

function HeroResultStage({
  response,
  isReplanning,
  feedbackError,
  onFeedback,
}: {
  response: HeyTabloAgentResponse;
  isReplanning: boolean;
  feedbackError: string;
  onFeedback: (feedback: AgentFeedback) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const recommendations = response.result.recommendations;
  const activeItem = recommendations[activeIndex] ?? recommendations[0];
  const episode = episodes.find((item) => item.episodeNumber === activeItem?.episode);
  const nodePositions = [18, 50, 82];
  const activePosition = nodePositions[activeIndex] ?? 50;
  const bars = Array.from({ length: 64 }, (_, index) => 12 + ((index * 17 + index * index * 7) % 56));
  const episodeCover = getYoutubeThumbnail(episode?.youtubeUrl);

  if (!activeItem) {
    return (
      <div className="result-stage clarification-stage" role="status" aria-live="polite">
        <div className="result-stage-meta">
          <span>NEED A LITTLE MORE</span>
          <span>TURN {response.session.turn}</span>
        </div>
        <section className="clarification-card">
          <span>信息还不够</span>
          <h2>{response.result.clarificationQuestion ?? response.result.answer}</h2>
          <p>在下方补充一句你的状态、场景或不想听什么，我再开始检索。</p>
        </section>
      </div>
    );
  }

  return (
    <div className="result-stage" role="status" aria-live="polite">
      <div className="result-stage-meta">
        <span>HEY TABLO 想与你分享</span>
        <span>{activeIndex + 1} / {recommendations.length}</span>
      </div>
      <p className="slice-answer">{response.result.answer}</p>

      <div className="waveform-shell" aria-label="三个推荐声音切片">
        <div className="waveform-bars" aria-hidden="true">
          {bars.map((height, index) => (
            <i className={index / (bars.length - 1) * 100 <= activePosition ? "is-played" : ""} key={index} style={{ height }} />
          ))}
        </div>
        <div className="waveform-line" aria-hidden="true" />
        {recommendations.map((item, index) => (
          <button
            className={`slice-node ${index === activeIndex ? "is-active" : ""}`}
            key={item.segmentId}
            type="button"
            style={{ left: `${nodePositions[index] ?? 50}%` }}
            onClick={() => {
              setActiveIndex(index);
              trackProductEvent("segment_selected", {
                conversationId: response.session.conversationId,
                turn: response.session.turn,
                segmentId: item.segmentId,
                episode: item.episode,
              });
            }}
          >
            <span>0{index + 1}</span>
            <b>EP.{item.episode}</b>
            <small>{item.timestamp}</small>
          </button>
        ))}
      </div>

      <article className="slice-detail" key={activeItem.segmentId}>
        <div className="slice-cover">
          <img
            src={episodeCover}
            alt={`EP.${activeItem.episode} ${activeItem.title} 封面`}
            onError={(event) => { event.currentTarget.src = "/hey-tablo-podcast-cover.jpg"; }}
          />
          <span>EP.{activeItem.episode}</span>
        </div>
        <div className="slice-detail-body">
          <header>
            <div>
              <span className="slice-kicker">NOW SELECTED · EP.{activeItem.episode} / {activeItem.timestamp}</span>
              <h2>{activeItem.title}</h2>
            </div>
            <span className={`source-state ${activeItem.sourceVerified ? "is-verified" : ""}`}>
              {activeItem.sourceVerified ? "● SOURCE VERIFIED" : "○ NEEDS REVIEW"}
            </span>
          </header>
          <div className="slice-copy">
            <div className="slice-listen">
              <span className="slice-info-label">◉ 好听 · 本集内容</span>
              <p className="episode-summary">{episode?.summaryZh ?? activeItem.meaningZh}</p>
              <q>{activeItem.quote}</q>
              <p className="slice-translation">{activeItem.meaningZh}</p>
            </div>
          <div className="slice-why">
            <span>◌ 好玩 · 为什么推荐</span>
            <p>{activeItem.reason}</p>
            {episode?.recommendationCopy ? (
              <small>{episode.recommendationCopy}</small>
            ) : null}
          </div>
          </div>
          <footer>
            <div className="episode-signals">
              {episode?.toneTags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}
            </div>
            {episode ? <ScoreDots label="好笑" value={episode.scores.funny} /> : null}
            {episode ? <ScoreDots label="安慰" value={episode.scores.comfort} /> : null}
            {episode ? <ScoreDots label="思考" value={episode.scores.reflection} /> : null}
            <a
              href={activeItem.sourceUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackProductEvent("source_opened", {
                conversationId: response.session.conversationId,
                turn: response.session.turn,
                segmentId: activeItem.segmentId,
                episode: activeItem.episode,
              })}
            >▶ 播放这一段</a>
          </footer>
        </div>
        <div className="feedback-bar" aria-label="调整下一轮推荐">
          <span>{isReplanning ? "正在换一组声音…" : "不太对？告诉我哪里要改"}</span>
          <div className="feedback-actions">
            {feedbackOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={isReplanning}
                onClick={() => onFeedback(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {feedbackError ? <small>{feedbackError}</small> : null}
        </div>
      </article>
      <details className="stage-trace">
        <summary>TURN {response.session.turn} · {response.trace.provider.toUpperCase()} · {response.trace.toolCalls.length} TOOL · {(response.trace.durationMs / 1000).toFixed(1)}S</summary>
        <div>TRACE {response.trace.traceId.slice(-10)}</div>
        <div>EXCLUDED {response.session.excludedSegmentIds.length} SEGMENTS</div>
        {response.error ? <div>ERROR · {response.error.message}</div> : null}
      </details>
    </div>
  );
}

function getYoutubeThumbnail(youtubeUrl?: string) {
  if (!youtubeUrl) return "/hey-tablo-podcast-cover.jpg";
  const videoId = youtubeUrl.match(/(?:v=|youtu\.be\/)([\w-]{6,})/)?.[1];
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "/hey-tablo-podcast-cover.jpg";
}

function ScoreDots({ label, value }: { label: string; value: number }) {
  return (
    <div className="score-dots" aria-label={`${label} ${value}/5`}>
      <span>{label}</span>
      <i>{Array.from({ length: 5 }, (_, index) => <b className={index < value ? "is-on" : ""} key={index} />)}</i>
    </div>
  );
}
