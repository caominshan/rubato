import { describe, expect, it } from "vitest";
import { demoProductEvents } from "@/lib/analytics/demo-data";
import { calculateAnalyticsMetrics, calculateFeedbackBreakdown, calculateFunnel } from "@/lib/analytics/metrics";
import type { ProductEvent } from "@/lib/analytics/schema";

describe("product analytics", () => {
  it("calculates the four dashboard metrics from clearly labelled demo events", () => {
    const metrics = calculateAnalyticsMetrics(demoProductEvents);

    expect(metrics.recommendationClickRate).toBe(75);
    expect(metrics.sourceOpenRate).toBe(66.7);
    expect(metrics.negativeFeedbackRate).toBe(25);
    expect(metrics.postFeedbackPlayRate).toBe(75);
    expect(demoProductEvents.every((event) => event.source === "demo")).toBe(true);
  });

  it("deduplicates repeated clicks within the same recommendation turn", () => {
    const repeatedSelection: ProductEvent = {
      id: "duplicate",
      name: "segment_selected",
      occurredAt: new Date().toISOString(),
      conversationId: "demo_conversation_1",
      turn: 1,
      segmentId: "demo_segment_1_1",
      source: "demo",
    };
    const metrics = calculateAnalyticsMetrics([...demoProductEvents, repeatedSelection]);

    expect(metrics.recommendationClickRate).toBe(75);
    expect(metrics.selectedSegments).toBe(12);
  });

  it("returns stable zero metrics when there are no local events", () => {
    expect(calculateAnalyticsMetrics([])).toMatchObject({
      recommendationClickRate: 0,
      sourceOpenRate: 0,
      negativeFeedbackRate: 0,
      postFeedbackPlayRate: 0,
      conversations: 0,
    });
  });

  it("builds a feedback distribution and an interaction funnel", () => {
    const feedback = calculateFeedbackBreakdown(demoProductEvents);
    const funnel = calculateFunnel(demoProductEvents);

    expect(feedback).toHaveLength(4);
    expect(feedback.every((item) => item.count === 1 && item.percentage === 25)).toBe(true);
    expect(funnel.map((item) => item.value)).toEqual([12, 12, 9, 5]);
  });
});
