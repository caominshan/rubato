"use client";

import { useEffect, useMemo, useState } from "react";
import { clearLiveEvents, readLiveEvents } from "@/lib/analytics/client";
import { demoProductEvents } from "@/lib/analytics/demo-data";
import { calculateAnalyticsMetrics, calculateFeedbackBreakdown, calculateFunnel } from "@/lib/analytics/metrics";
import type { ProductEvent } from "@/lib/analytics/schema";

type DataMode = "demo" | "live";

const eventLabels: Record<ProductEvent["name"], string> = {
  query_submitted: "提交需求",
  recommendation_shown: "推荐曝光",
  segment_selected: "选择切片",
  source_opened: "打开来源",
  feedback_clicked: "负反馈",
  recommendation_replanned: "重新规划",
  memory_saved: "收藏记忆",
  translation_corrected: "修正翻译",
};

export function InsightsDashboard() {
  const [mode, setMode] = useState<DataMode>("demo");
  const [liveEvents, setLiveEvents] = useState<ProductEvent[]>([]);

  useEffect(() => {
    const sync = () => setLiveEvents(readLiveEvents());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("hey-tablo:analytics-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("hey-tablo:analytics-updated", sync);
    };
  }, []);

  const events = mode === "demo" ? demoProductEvents : liveEvents;
  const metrics = useMemo(() => calculateAnalyticsMetrics(events), [events]);
  const feedback = useMemo(() => calculateFeedbackBreakdown(events), [events]);
  const funnel = useMemo(() => calculateFunnel(events), [events]);
  const maxFunnel = Math.max(...funnel.map((item) => item.value), 1);
  const recentEvents = [...events].reverse().slice(0, 8);

  const cards = [
    {
      label: "推荐点击率",
      value: metrics.recommendationClickRate,
      numerator: metrics.selectedSegments,
      denominator: metrics.impressionTurns,
      note: "发生切片选择的推荐轮次 / 推荐曝光轮次",
    },
    {
      label: "来源打开率",
      value: metrics.sourceOpenRate,
      numerator: metrics.sourceOpens,
      denominator: metrics.selectedSegments,
      note: "打开原视频的切片 / 被选择的切片",
    },
    {
      label: "负反馈率",
      value: metrics.negativeFeedbackRate,
      numerator: metrics.feedbackCount,
      denominator: metrics.impressionTurns,
      note: "发生负反馈的推荐轮次 / 推荐曝光轮次",
    },
    {
      label: "反馈后播放率",
      value: metrics.postFeedbackPlayRate,
      numerator: events.filter((event) => event.name === "source_opened" && (event.turn ?? 1) > 1).length,
      denominator: metrics.successfulReplans,
      note: "重规划后打开来源的轮次 / 成功重规划轮次",
    },
  ];

  function resetLiveData() {
    clearLiveEvents();
    setLiveEvents([]);
  }

  return (
    <div className="insights-shell">
      <header className="insights-hero">
        <div>
          <span className="insights-eyebrow">PRODUCT INSIGHTS / 001</span>
          <h1>用户有没有<br />得到更好的推荐？</h1>
        </div>
        <div className="insights-controls">
          <span className={`data-status ${mode === "demo" ? "is-demo" : ""}`}>
            {mode === "demo" ? "DEMO DATA · 非真实运营数据" : `LOCAL DATA · ${liveEvents.length} EVENTS`}
          </span>
          <div className="data-toggle" aria-label="数据来源">
            <button className={mode === "demo" ? "is-active" : ""} type="button" onClick={() => setMode("demo")}>演示数据</button>
            <button className={mode === "live" ? "is-active" : ""} type="button" onClick={() => setMode("live")}>本机体验</button>
          </div>
          {mode === "live" && liveEvents.length > 0 ? (
            <button className="clear-data" type="button" onClick={resetLiveData}>清空本机事件</button>
          ) : null}
        </div>
      </header>

      {mode === "live" && events.length === 0 ? (
        <section className="empty-insights">
          <span>NO LOCAL EVENTS YET</span>
          <h2>先在 Agent 页面完成一次推荐。</h2>
          <p>提交需求、切换声音切片、打开来源或点击反馈后，事件会保存在当前浏览器中。</p>
          <a href="/">返回 Agent →</a>
        </section>
      ) : (
        <>
          <section className="metric-grid" aria-label="核心产品指标">
            {cards.map((card, index) => (
              <article className="metric-card" key={card.label}>
                <span>0{index + 1} / {card.label}</span>
                <strong>{card.value.toFixed(1)}<small>%</small></strong>
                <p>{card.note}</p>
                <footer>{card.numerator} / {card.denominator || 0}</footer>
              </article>
            ))}
          </section>

          <section className="insights-analysis-grid">
            <article className="analysis-panel funnel-panel">
              <header>
                <span>INTERACTION FUNNEL</span>
                <strong>{metrics.conversations} 次会话</strong>
              </header>
              <div className="funnel-list">
                {funnel.map((item, index) => (
                  <div key={item.label}>
                    <span>0{index + 1}</span>
                    <b>{item.label}</b>
                    <i><em style={{ width: `${(item.value / maxFunnel) * 100}%` }} /></i>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="analysis-panel feedback-panel">
              <header>
                <span>WHY USERS REPLAN</span>
                <strong>{metrics.feedbackCount} 次反馈</strong>
              </header>
              <div className="feedback-breakdown">
                {feedback.map((item) => (
                  <div key={item.feedback}>
                    <span>{item.label}</span>
                    <i><em style={{ width: `${item.percentage}%` }} /></i>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
              <p>负反馈不是失败日志，而是下一轮检索条件。重点观察反馈后是否继续选择并打开来源。</p>
            </article>
          </section>

          <section className="event-stream">
            <header>
              <div>
                <span>RECENT EVENT STREAM</span>
                <h2>最近发生了什么</h2>
              </div>
              <p>仅存储产品行为，不记录用户输入原文或任何模型密钥。</p>
            </header>
            <div className="event-table" role="table" aria-label="最近事件">
              <div className="event-row event-row-head" role="row">
                <span>事件</span><span>会话</span><span>轮次</span><span>时间</span>
              </div>
              {recentEvents.map((event) => (
                <div className="event-row" role="row" key={event.id}>
                  <strong>{eventLabels[event.name]}</strong>
                  <span>{event.conversationId?.replace("demo_conversation_", "DEMO-").slice(-10) ?? "—"}</span>
                  <span>TURN {event.turn ?? "—"}</span>
                  <time>{new Date(event.occurredAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</time>
                </div>
              ))}
            </div>
          </section>

          <aside className="insights-disclaimer">
            <strong>口径说明</strong>
            <p>演示数据只用于展示分析方法，不代表真实用户表现。正式对外使用时，应以线上埋点、去重规则和统一统计周期重新计算。</p>
          </aside>
        </>
      )}
    </div>
  );
}
