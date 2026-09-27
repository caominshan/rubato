import { describe, expect, it } from "vitest";
import { searchSegments, segments } from "@/lib/retrieval";
import { transcriptSegmentsSchema } from "@/lib/retrieval/schema";
import {
  getEpisodeTool,
  getSegmentContextTool,
  recommendSegmentsTool,
  searchTranscriptTool,
} from "@/lib/tools";

describe("Hey Tablo deterministic retrieval", () => {
  it("validates all 500 transcript segments against the canonical schema", () => {
    expect(transcriptSegmentsSchema.parse(segments)).toHaveLength(500);
  });

  it("finds an exact English transcript phrase", () => {
    const results = searchSegments("mentally bulletproof", { limit: 3 });
    expect(results[0].episode).toBe(2);
    expect(results[0].quote.toLowerCase()).toContain("mentally bulletproof");
    expect(results[0].scoreBreakdown.exactPhrase).toBeGreaterThan(0);
  });

  it("expands a Chinese listener query and finds relevant heartbreak segments", () => {
    const results = searchTranscriptTool.execute({ query: "失恋后很难过，想被陪伴", limit: 5 });
    expect(results[0].episode).toBe(4);
  });

  it("enforces the verified source filter", () => {
    const results = searchTranscriptTool.execute({
      query: "ghost story",
      limit: 10,
      verifiedOnly: true,
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((result) => result.sourceVerified)).toBe(true);
  });

  it("returns episode metadata and neighboring transcript context", () => {
    const episode = getEpisodeTool.execute({ episodeNumber: 1 });
    expect(episode?.title).toContain("2026");
    expect(episode?.segmentCount).toBeGreaterThan(0);

    const context = getSegmentContextTool.execute({
      segmentId: "hd-ep01-02-hit-me-hard",
      neighborCount: 1,
    });
    expect(context?.target.quote).toBe("hit me hard");
    expect(context?.before).toHaveLength(1);
    expect(context?.after).toHaveLength(1);
  });

  it("recommends verified and episode-diverse segments without a model", () => {
    const results = recommendSegmentsTool.execute({
      situation: "我最近对工作和未来很迷茫",
      desiredEffect: "想获得一点视角",
      limit: 3,
    });
    expect(results.length).toBe(3);
    expect(results.every((result) => result.sourceVerified)).toBe(true);
    expect(new Set(results.map((result) => result.episode)).size).toBe(results.length);
  });

  it("hard-excludes historical segment IDs during replanning", () => {
    const first = recommendSegmentsTool.execute({
      situation: "一个人吃饭，想轻松一点",
      limit: 3,
    });
    const excludedSegmentIds = first.map((item) => item.id);
    const replanned = recommendSegmentsTool.execute({
      situation: "一个人吃饭，想轻松一点",
      desiredEffect: "陪伴，不要说教",
      tone: "轻松",
      excludeSegmentIds: excludedSegmentIds,
      limit: 3,
    });

    expect(replanned.length).toBeGreaterThan(0);
    expect(replanned.every((item) => !excludedSegmentIds.includes(item.id))).toBe(true);
  });
});
