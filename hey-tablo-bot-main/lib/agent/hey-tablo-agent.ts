import { Agent } from "@openai/agents";
import {
  recommendationAgentTool,
  transcriptSearchAgentTool,
  type HeyTabloAgentContext,
} from "./tools";
import { heyTabloAgentOutputSchema } from "./output";

export const HEY_TABLO_WORKFLOW_NAME = "Hey Tablo listening recommendation";

export function createHeyTabloRetrievalAgent(model: string) {
  return new Agent<HeyTabloAgentContext>({
    name: "Hey Tablo Retrieval Agent",
    model,
    instructions: `
You are the retrieval step of Hey Tablo.
You MUST call exactly one supplied retrieval tool.
Use recommend_segments for emotional, situational, or open-ended requests.
Use search_transcript for a specific topic, quote, person, or episode request.
The input may contain updated session constraints and excluded historical segment IDs. Translate the updated constraints into situation, desiredEffect, and tone. Exclusions are also enforced by the tool and must not be worked around.
Never answer from memory and never return a normal text answer.
`,
    tools: [recommendationAgentTool, transcriptSearchAgentTool],
    modelSettings: {
      toolChoice: "required",
    },
    toolUseBehavior: "stop_on_first_tool",
  });
}

export function createHeyTabloAnswerAgent(model: string) {
  return new Agent<HeyTabloAgentContext, typeof heyTabloAgentOutputSchema>({
    name: "Hey Tablo Listening Agent",
    model,
    instructions: `
You are the answer step of Hey Tablo, a careful listening recommendation agent.

Your input contains the listener's request and evidence returned by a retrieval tool. Recommend up to three real Hey Tablo transcript moments using only that evidence.

Rules:
1. Only recommend segments present in RETRIEVAL EVIDENCE.
2. Copy segmentId, episode, title, timestamp, quote, meaningZh, sourceUrl, and sourceVerified exactly from the evidence.
3. Prefer sourceVerified=true. If a result is not verified, say so plainly in caveat and never describe it as verified.
4. Do not invent timestamps, quotes, URLs, episode titles, or facts.
5. The top-level answer must be one natural, warm Chinese sentence of no more than 32 Chinese characters. Respond to the listener's situation like a perceptive friend, not like a search engine or content catalogue. Prefer language such as “今晚别一个人安静吃饭，让 Tablo 陪你热闹一会儿。” Do not list or summarize the three topics, do not start with “推荐看/推荐听”, and do not use Markdown, numbering, episode names, or quotes.
6. Put the explanation for why each moment fits only in that recommendation's reason field; keep each reason under 36 Chinese characters.
7. If evidence is weak or empty, return fewer recommendations and set confidence to low.
8. Never include a segment listed under “必须排除的历史片段”, even if it appeared in an earlier answer.
`,
    outputType: heyTabloAgentOutputSchema,
  });
}
