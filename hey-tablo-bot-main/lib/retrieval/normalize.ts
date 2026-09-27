import type { SearchDocument, TranscriptSegment } from "./schema";

const QUERY_ALIASES: Record<string, string[]> = {
  "累": ["tired", "low energy", "comfort", "company"],
  "疲惫": ["tired", "low energy", "comfort"],
  "陪伴": ["company", "comfort", "lonely"],
  "孤独": ["lonely", "company", "comfort"],
  "失恋": ["heartbreak", "grief", "comfort"],
  "心碎": ["heartbreak", "grief"],
  "难过": ["sad", "comfort", "permission to feel"],
  "焦虑": ["anxious", "anxiety", "reflection"],
  "工作": ["career", "work", "reflection"],
  "职业": ["career", "starting over", "impostor syndrome"],
  "迷茫": ["confused", "starting over", "perspective"],
  "变老": ["aging", "nostalgia", "time perception"],
  "时间": ["time perception", "aging", "nostalgia"],
  "搞笑": ["funny", "witty", "comedy", "energy"],
  "开心": ["funny", "hope", "energy"],
  "鬼": ["ghost", "paranormal", "supernatural"],
  "恐怖": ["ghost", "paranormal", "chilling"],
  "创作": ["creative", "creator", "music", "reflection"],
  "追星": ["fandom", "fan", "k-pop"],
};

export function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[_/|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(value: string): string[] {
  const normalized = normalizeText(value);
  const latinTokens = normalized.match(/[a-z0-9]+(?:[-'][a-z0-9]+)*/g) ?? [];
  const chineseRuns = normalized.match(/[\u3400-\u9fff]+/g) ?? [];
  const chineseTokens = chineseRuns.flatMap((run) => {
    const chars = Array.from(run);
    const bigrams = chars.slice(0, -1).map((char, index) => char + chars[index + 1]);
    return [run, ...chars, ...bigrams];
  });

  return [...new Set([...latinTokens, ...chineseTokens])];
}

export function expandQuery(query: string): string {
  const normalized = normalizeText(query);
  const aliases = Object.entries(QUERY_ALIASES)
    .filter(([phrase]) => normalized.includes(phrase))
    .flatMap(([, values]) => values);

  return normalizeText([normalized, ...aliases].join(" "));
}

export function toSearchDocument(segment: TranscriptSegment): SearchDocument {
  const tags = [
    ...segment.topics,
    ...segment.emotions,
    ...segment.desiredEffects,
    ...segment.toneTags,
  ].join(" ");

  const searchText = [
    segment.quote,
    segment.meaningZh,
    segment.noteZh,
    segment.context,
    segment.title,
    segment.titleZh,
  ].join(" ");

  return { ...segment, searchText, tags };
}
