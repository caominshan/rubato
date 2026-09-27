import type { ProductEvent, ProductEventName } from "./schema";

const feedbacks = ["too_preachy", "not_funny_enough", "too_heavy", "not_relevant"] as const;
const events: ProductEvent[] = [];
let sequence = 0;

function add(
  name: ProductEventName,
  conversationId: string,
  minute: number,
  details: Partial<ProductEvent> = {},
) {
  events.push({
    id: `demo_${String(++sequence).padStart(3, "0")}`,
    name,
    conversationId,
    occurredAt: new Date(Date.UTC(2026, 8, 25, 12, minute)).toISOString(),
    source: "demo",
    ...details,
  });
}

for (let index = 0; index < 12; index += 1) {
  const conversationId = `demo_conversation_${index + 1}`;
  const baseMinute = index * 5;
  add("query_submitted", conversationId, baseMinute, { turn: 1 });
  add("recommendation_shown", conversationId, baseMinute + 1, { turn: 1, recommendationCount: 3 });

  if (index < 9) {
    add("segment_selected", conversationId, baseMinute + 2, {
      turn: 1,
      segmentId: `demo_segment_${index + 1}_1`,
      episode: (index % 6) + 1,
    });
  }

  if (index < 5) {
    add("source_opened", conversationId, baseMinute + 3, {
      turn: 1,
      segmentId: `demo_segment_${index + 1}_1`,
      episode: (index % 6) + 1,
    });
  }

  if (index < 4) {
    const feedback = feedbacks[index];
    add("feedback_clicked", conversationId, baseMinute + 3, { turn: 1, feedback });
    add("recommendation_replanned", conversationId, baseMinute + 4, { turn: 2, feedback });
    add("recommendation_shown", conversationId, baseMinute + 4, { turn: 2, recommendationCount: 3 });

    if (index < 3) {
      add("segment_selected", conversationId, baseMinute + 4, {
        turn: 2,
        segmentId: `demo_segment_${index + 1}_2`,
        episode: index + 10,
      });
      add("source_opened", conversationId, baseMinute + 4, {
        turn: 2,
        segmentId: `demo_segment_${index + 1}_2`,
        episode: index + 10,
      });
    }
  }
}

export const demoProductEvents = events;
