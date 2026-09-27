import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = resolve(root, "legacy/index-v4.6.1.html");
const html = await readFile(htmlPath, "utf8");

function extractJsonAfter(marker) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing marker: ${marker}`);

  let start = markerIndex + marker.length;
  while (/\s/.test(html[start])) start += 1;
  const opener = html[start];
  const closer = opener === "[" ? "]" : opener === "{" ? "}" : null;
  if (!closer) throw new Error(`Marker ${marker} is not followed by JSON`);

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < html.length; index += 1) {
    const char = html[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === opener) depth += 1;
    else if (char === closer) {
      depth -= 1;
      if (depth === 0) return JSON.parse(html.slice(start, index + 1));
    }
  }
  throw new Error(`Unclosed JSON after ${marker}`);
}

function timeToSeconds(value = "0:00") {
  const parts = String(value).split(":").map(Number);
  if (parts.some(Number.isNaN)) return 0;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

const episodes = extractJsonAfter("const EPISODES=");
const learning = extractJsonAfter("window.HEY_TABLO_LEARNING_DATA=");
const episodeByNumber = new Map(episodes.map((episode) => [episode.episodeNumber, episode]));

const cards = Array.isArray(learning.cards) ? learning.cards : [];
const quotes = Array.isArray(learning.quotes) ? learning.quotes : [];
const rawSegments = [...cards, ...quotes];

const segments = rawSegments.map((item, index) => {
  const episode = episodeByNumber.get(item.episode) ?? {};
  const startSeconds = Number.isFinite(item.seconds) ? item.seconds : timeToSeconds(item.time);
  return {
    id: item.id ?? `ep${item.episode}-${startSeconds}-${index}`,
    episode: item.episode,
    title: episode.title ?? "",
    titleZh: episode.coreThemeZh ?? "",
    startSeconds,
    endSeconds: startSeconds + 75,
    timestamp: item.time ?? "0:00",
    quote: item.quote ?? item.term ?? "",
    meaningZh: item.meaning ?? "",
    noteZh: item.note ?? "",
    context: item.context ?? "",
    topics: episode.mainTopics ?? [],
    emotions: episode.emotionsBefore ?? [],
    desiredEffects: episode.desiredEffects ?? [],
    toneTags: episode.toneTags ?? [],
    sourceVerified: Boolean(item.sourceVerified),
    sourceUrl: episode.youtubeUrl ?? episode.sourceUrl ?? ""
  };
}).filter((segment) => segment.quote && segment.episode);

await mkdir(resolve(root, "data"), { recursive: true });
await writeFile(resolve(root, "data/episodes.json"), `${JSON.stringify(episodes, null, 2)}\n`);
await writeFile(resolve(root, "data/transcript-segments.json"), `${JSON.stringify(segments, null, 2)}\n`);
await writeFile(resolve(root, "data/extraction-report.json"), `${JSON.stringify({
  source: "legacy/index-v4.6.1.html",
  generatedAt: new Date().toISOString(),
  episodes: episodes.length,
  segments: segments.length,
  verifiedSegments: segments.filter((segment) => segment.sourceVerified).length
}, null, 2)}\n`);

console.log(`Extracted ${episodes.length} episodes and ${segments.length} segments.`);
