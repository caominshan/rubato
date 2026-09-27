# Hey Tablo 第二天上午：反馈驱动的 Agent 重新规划

> 适用场景：AI 产品经理面试、项目答辩、技术复盘  
> 本轮目标：让 Agent 根据用户反馈修改条件、排除旧结果并再次检索，而不是只完成一次性推荐

## 1. 这一阶段做了什么

第一天完成真实 Agent 后，系统已经能够执行：

```text
用户输入自然语言
→ Retrieval Agent 调用检索工具
→ MiniSearch 返回字幕证据
→ Answer Agent 生成结构化结果
→ 前端展示推荐
```

但这仍然是单轮流程。如果用户觉得推荐“太说教”或“太沉重”，系统无法利用这条反馈。用户只能重新写问题，而且新一轮还可能返回相同片段。

第二天上午，我把系统升级成了反馈驱动的多轮 Agent：

```text
第一次需求
→ 得到三条推荐
→ 用户选择反馈
→ 更新约束
→ 保存会话状态
→ 排除历史片段
→ 再次调用检索工具
→ 返回不同的新结果
```

这一阶段完成了：

- 四种结构化反馈。
- 反馈到检索约束的映射。
- 跨轮次会话状态。
- 上一轮结果强制排除。
- 重新运行 Retrieval Agent 和 Answer Agent。
- 信息不足时主动澄清。
- 前端加载和错误状态。
- Agent Trace 中的轮次与排除数量。
- 三个新增测试，总测试数从 9 个增加到 12 个。
- 反馈区域的视觉和对齐迭代。

---

## 2. 为什么要做重新规划

普通推荐系统经常把用户反馈理解成“换一批”，但“太说教”和“不够好笑”不是同一个意思。

例如用户输入：

> 通勤 20 分钟，想提提神。

第一轮返回三条内容后，用户点击“太说教”。如果系统只是随机换一批，下一轮仍然可能出现人生建议类内容。

真正的重新规划需要完成三个动作：

1. 理解反馈代表的偏好变化。
2. 把偏好变化转换成可执行的检索条件。
3. 带着新条件重新调用工具。

因此我没有把反馈按钮做成前端轮播按钮，而是让每次反馈都产生一个新的 `/api/agent` 请求。

面试时可以这样概括：

> 我把反馈定义成 Agent 下一轮规划的输入，而不是界面上的装饰性交互。用户每次反馈都会更新结构化约束、触发新检索并生成新的 Trace。

---

## 3. 四种反馈是怎么设计的

前端提供四个反馈按钮：

| 用户看到的文案 | 内部枚举值 | 系统理解 |
|---|---|---|
| 太说教 | `too_preachy` | 减少建议与人生道理，增加陪伴和共鸣 |
| 不够好笑 | `not_funny_enough` | 提高笑点、活泼感和即兴感 |
| 太沉重 | `too_heavy` | 降低情绪负担，增加轻盈和温暖感 |
| 换个方向 | `not_relevant` | 改变主题与生活场景，扩大检索方向 |

内部不直接存储中文按钮文本，而是使用稳定枚举值：

```ts
type AgentFeedback =
  | "too_preachy"
  | "not_funny_enough"
  | "too_heavy"
  | "not_relevant";
```

这样做有三个好处：

- 前端文案将来可以修改，不影响服务端逻辑。
- 可以进行类型检查，避免传入不存在的反馈。
- 方便做埋点和反馈效果评测。

---

## 4. 反馈如何变成约束

反馈枚举不会直接传给搜索引擎，而是先映射成结构化约束。

核心映射位于 `lib/agent/session.ts`：

```ts
const FEEDBACK_CONSTRAINTS = {
  too_preachy: {
    avoidAdvice: true,
    desiredEffect: "陪伴与共鸣，不要建议",
    tone: "自然、平等、轻松、不说教",
  },
  not_funny_enough: {
    desiredEffect: "更快获得笑点和轻松感",
    tone: "好笑、活泼、有即兴感",
  },
  too_heavy: {
    avoidHeavy: true,
    desiredEffect: "低负担地放松",
    tone: "轻盈、温暖、不沉重",
  },
  not_relevant: {
    broadenSearch: true,
    desiredEffect: "换一个更贴近日常处境的方向",
    tone: "具体、生活化、有代入感",
  },
};
```

以“太说教”为例，它不是简单地把“太说教”三个字追加到搜索词，而是拆成：

- `avoidAdvice = true`：明确的排除条件。
- `desiredEffect = 陪伴与共鸣`：想得到什么。
- `tone = 自然、平等、轻松`：内容应该是什么语气。

这样更接近一个可解释的 Agent 规划过程。

---

## 5. 会话状态是什么

为了让下一轮知道上一轮发生了什么，我定义了 `AgentSessionState`。

```ts
type AgentSessionState = {
  conversationId: string;
  originalMessage: string;
  turn: number;
  constraints: {
    avoidAdvice: boolean;
    avoidHeavy: boolean;
    broadenSearch: boolean;
    desiredEffect: string;
    tone: string;
  };
  excludedSegmentIds: string[];
  feedbackHistory: AgentFeedback[];
};
```

各字段的作用：

### `conversationId`

标识同一段会话。它也被传给 Agents SDK 的 `groupId`，方便将同一会话的多轮 Trace 关联起来。

### `originalMessage`

保存用户最初的需求。点击反馈时不要求用户重新输入问题，系统会继续围绕原始需求重新规划。

### `turn`

记录当前轮次：

```text
第一次推荐：TURN 1
第一次反馈后：TURN 2
第二次反馈后：TURN 3
```

### `constraints`

保存当前已经积累的约束。新反馈在旧约束基础上合并，而不是每次清空。

例如用户依次点击：

```text
太说教 → 不够好笑
```

最终约束会同时保留“不要说教”和“需要更多笑点”。

### `excludedSegmentIds`

保存所有已经推荐过的字幕片段 ID，防止后续重复。

### `feedbackHistory`

保存用户反馈历史，可用于：

- 调试多轮行为。
- 后续分析最常见的不满意原因。
- 评估某种反馈是否真的改善了结果。

---

## 6. 为什么采用客户端携带会话状态

这一版没有把会话存进数据库，也没有使用服务器进程内存，而是采用 request-carried state：

```text
服务端返回 session
→ 前端保存 session
→ 下一轮请求携带 session
→ 服务端更新后再次返回
```

反馈请求示例：

```json
{
  "message": "通勤 20 分钟，想提提神",
  "conversationId": "conversation-123",
  "feedback": "too_preachy",
  "session": {
    "turn": 1,
    "constraints": {
      "avoidAdvice": false,
      "avoidHeavy": false,
      "broadenSearch": false,
      "desiredEffect": "",
      "tone": ""
    },
    "excludedSegmentIds": ["hd-ep21-xx", "hd-ep27-xx"],
    "feedbackHistory": []
  }
}
```

采用这种方案是因为项目仍处于面试 Demo 阶段，它有几个现实优势：

- 不需要引入数据库，能在两天内完成。
- API 本身保持无状态，调试容易。
- 每个请求都包含完整决策上下文。
- 将来可以无缝把同一个 session 存进 Redis 或数据库。

它的限制也很明确：用户刷新页面后会话会丢失，客户端也可能篡改状态。因此生产版本需要服务端持久化和身份校验。

面试时不要说这是最终生产架构，可以说：

> MVP 阶段我选择 request-carried state 验证多轮策略，后续规模化时会把状态迁移到 Redis 或持久化会话表。

---

## 7. 为什么排除逻辑必须放在检索层

这是本轮最重要的技术判断。

最简单的做法是在提示词里写：

> 请不要重复上一轮结果。

但提示词属于软约束。模型可能：

- 忽略某个 ID。
- 忘记上一轮结果。
- 看到高相关内容后仍然重复选择。
- 生成不在当前证据中的片段。

因此我把 `excludeSegmentIds` 加入底层搜索过滤器：

```ts
if (filters.excludeSegmentIds?.includes(document.id)) {
  return false;
}
```

处理顺序变成：

```text
MiniSearch 找到候选
→ 过滤已出现的 segmentId
→ 计算排序分数
→ 返回给模型
```

这样模型根本看不到被排除的片段，也就无法再次选择。

我还在工具包装层注入排除列表：

```ts
const effectiveInput = {
  ...input,
  excludeSegmentIds: context.excludedSegmentIds,
};
```

即使 Retrieval Agent 忘记在工具参数里传排除项，运行上下文仍然会强制补上。

这形成了两层保护：

1. 提示词告诉 Agent 不要重复。
2. 工具层从代码上禁止重复。

面试时可以总结为：

> 与业务正确性相关的约束不能只依赖 Prompt，必须下沉为确定性代码。

---

## 8. 重新规划的完整执行流程

以用户点击“太说教”为例。

### 第一步：前端发送反馈

`ListeningExperience` 发送：

```ts
fetch("/api/agent", {
  method: "POST",
  body: JSON.stringify({
    message: response.session.originalMessage,
    conversationId: response.session.conversationId,
    feedback: "too_preachy",
    session: response.session,
  }),
});
```

### 第二步：API 验证请求

Zod 验证：

- message 长度。
- feedback 是否属于四种合法枚举。
- session 字段是否完整。
- 排除列表和反馈历史是否超过上限。

不合法请求会在调用模型前返回 400。

### 第三步：更新会话

服务端调用：

```ts
applyFeedback(baseSession, "too_preachy");
```

更新结果包括：

- `turn + 1`。
- `avoidAdvice = true`。
- 更新 `desiredEffect` 和 `tone`。
- 将反馈加入 `feedbackHistory`。

### 第四步：生成规划文本

服务端将结构化状态转成 Retrieval Agent 能理解的规划输入：

```text
原始需求：通勤 20 分钟，想提提神
更新约束：不要给建议；只提供陪伴；语气自然、轻松
必须排除的历史片段：hd-ep21-xx, hd-ep27-xx, hd-ep07-xx
当前轮次：2
```

### 第五步：再次调用 Retrieval Agent

Retrieval Agent 必须调用一次：

- `recommend_segments`，或
- `search_transcript`。

工具上下文会自动注入 `excludedSegmentIds`。

### 第六步：MiniSearch 重新检索

检索工具综合：

- 原始需求。
- 期望效果。
- 新语气。
- 来源验证要求。
- 历史排除列表。

然后返回新的字幕证据。

### 第七步：Answer Agent 生成新结果

Answer Agent 只能基于本轮检索证据生成结构化回答，并被明确禁止输出排除列表中的片段。

### 第八步：更新排除列表

新一轮推荐的 ID 继续追加到 `excludedSegmentIds`：

```ts
addRecommendationsToExclusions(
  session,
  output.recommendations.map(item => item.segmentId),
);
```

列表去重，并限制最多保留 30 个 ID，避免会话无限增长。

### 第九步：前端替换结果

新响应返回后：

- 三个声波节点更新。
- 当前封面更新。
- 推荐理由更新。
- `TURN 1` 变成 `TURN 2`。
- Trace 显示新的工具调用和耗时。
- `EXCLUDED` 数量增加。

---

## 9. 信息不足时为什么不直接推荐

用户可能只输入：

- “随便”
- “不知道”
- “都行”
- “推荐”
- “听什么”

这些输入没有说明：

- 当前情绪。
- 使用场景。
- 想获得什么效果。
- 不想听什么。

如果 Agent 此时仍返回三条内容，看起来很智能，但实际上没有推荐依据。

因此我增加了 `isInsufficientRequest`：

```ts
export function isInsufficientRequest(message: string): boolean {
  const normalized = message
    .trim()
    .replace(/[，。！？,.!?\s]/g, "");

  return new Set([
    "随便",
    "不知道",
    "都行",
    "推荐",
    "听什么",
    "看什么",
  ]).has(normalized);
}
```

命中后直接返回澄清问题：

> 你现在更想被陪伴、逗笑，还是安静想一想？

此时：

- 不调用模型。
- 不调用检索工具。
- recommendations 为空。
- `needsClarification = true`。
- 前端展示专门的澄清状态。

这体现了 Agent 的一个重要能力：知道什么时候信息不足，不用幻觉填补缺失条件。

---

## 10. 前端交互如何实现

### 四个按钮

反馈配置集中定义：

```ts
const feedbackOptions = [
  { value: "too_preachy", label: "太说教" },
  { value: "not_funny_enough", label: "不够好笑" },
  { value: "too_heavy", label: "太沉重" },
  { value: "not_relevant", label: "换个方向" },
];
```

按钮点击时调用同一个 `replan(feedback)` 函数，而不是分别编写四套请求代码。

### 加载状态

重新规划可能需要几秒到十几秒。等待期间：

- 保留上一轮结果。
- 禁用四个反馈按钮。
- 显示“正在换一组声音……”。
- 不把页面切回首页。
- 输入框位置不改变。

这比清空页面再显示 loading 更稳定，也降低了用户对系统失败的误判。

### 错误状态

如果重新规划失败：

- 旧结果继续可用。
- 反馈栏显示错误信息。
- 用户可以再次尝试。
- 不会因为一次请求失败丢失整个会话。

### Trace

结果页底部现在显示：

```text
TURN 2 · QWEN · 1 TOOL · 10.3S
EXCLUDED 6 SEGMENTS
```

它能说明：

- 当前是第几轮。
- 使用了哪个模型。
- 是否真实调用工具。
- 完整耗时。
- 累计排除了多少历史片段。

---

## 11. 反馈栏视觉上迭代了什么

新增反馈按钮后，详情卡底部一度出现了两个问题：

1. 标签、评分和反馈提示字号太小。
2. 放大字体后，反馈按钮仍塞在右侧内容列里，导致按钮挤压和边界错位。

第一次调整只放大了字号，没有重新分配空间，结果排版反而更差。之后我重新划分了卡片结构：

```text
┌─────────────────────────────────────┐
│ 逐集封面 │ 标题、简介、理由、评分     │
├─────────────────────────────────────┤
│ 提示语              四个反馈按钮 →   │
└─────────────────────────────────────┘
```

反馈栏成为横跨整张卡片的独立 Grid 行：

- 左侧放“不太对？告诉我哪里要改”。
- 四个按钮作为一个组靠右。
- 按钮使用固定高度和最小宽度。
- `inline-flex` 保证文字水平和垂直居中。
- 移动端改为提示语一行、四个按钮一行。

这次迭代的教训是：

> 字号问题不能只靠放大字体解决；文字变大以后，必须重新检查容器、层级和空间分配。

---

## 12. 用户文案与内部证据字段分层

在结果卡的“为什么推荐”区域，我发现过一个内容职责错误：页面展示了类似下面的文案：

> 完整 transcript 证明这集不仅是成员互损……

这不是 Agent 应该对用户说的话，而是数据整理阶段写给内容审核者看的内部备注。出现这个问题的原因，是前端为了增加信息量，直接读取了 `editorNote`，把内部内容标注误当成了用户推荐文案。

### 四类字段分别负责什么

| 字段 | 使用对象 | 作用 | 是否直接展示 |
|---|---|---|---|
| `activeItem.reason` | 当前用户 | Agent 根据本轮需求生成的个性化推荐理由 | 是，作为主文案 |
| `recommendationCopy` | 普通用户 | 编辑预先整理的自然、易读的推荐语 | 是，作为辅助文案 |
| `editorNote` | 内容运营与开发者 | 记录选集依据、内容判断和资料整理说明 | 否 |
| `evidenceSummary` | 检索、审核与评测系统 | 保存推荐结论对应的字幕证据摘要 | 否 |

修复前的代码把 `editorNote` 放在了用户界面：

```tsx
<p>{episode?.editorNote ?? activeItem.reason}</p>
<small>{activeItem.reason}</small>
```

修复后改成：

```tsx
<p>{activeItem.reason}</p>
{episode?.recommendationCopy ? (
  <small>{episode.recommendationCopy}</small>
) : null}
```

现在信息层级是：

```text
个性化理由：为什么它适合用户此刻的需求
编辑推荐语：这集内容本身有什么值得听的
内部证据：只用于检索、审核、Trace 和评测
```

技术证据仍然保留，因为它能支持来源验证、问题排查和离线评测；但“可解释”不等于把所有技术过程展示给用户。普通用户只需要理解推荐和自己的关系，开发者才需要查看 transcript、字段名和证据链。

修复完成后重新运行了 TypeScript 检查、12 个自动化测试和 Next.js 生产构建，结果全部通过。

面试时可以这样解释：

> 我在数据层区分了用户文案、个性化推荐理由和内部证据字段。内部证据用于可解释性、内容审核和评测，但不会直接展示给普通用户。前端只消费适合当前场景的用户文案，避免把 transcript、字段名等系统语言暴露出来。

这次问题带来的产品判断是：

> 数据越丰富，不代表界面展示得越多越好。Agent 产品需要同时建立面向用户的解释层和面向系统的证据层，两者使用同一份事实，但表达方式和可见范围不同。

---

## 13. 新增和修改的关键文件

### `lib/agent/session.ts`

新建的会话规划模块，负责：

- 创建初始会话。
- 把反馈映射成约束。
- 累积多轮反馈。
- 管理排除列表。
- 生成 Retrieval Agent 的规划输入。
- 判断信息是否不足。

### `lib/agent/output.ts`

新增：

- 四种反馈的 Zod 枚举。
- 会话约束 Schema。
- 会话状态 Schema。
- 请求中的 `feedback` 和 `session`。
- 响应中的 `session`。
- `needsClarification` 和 `clarificationQuestion`。

### `lib/retrieval/index.ts`

在 `SearchFilters` 中增加 `excludeSegmentIds`，并在底层过滤历史结果。

### `lib/tools/index.ts`

让 `search_transcript` 和 `recommend_segments` 接受排除列表。

### `lib/agent/tools.ts`

从 Agent 运行上下文中读取历史排除列表，并强制注入实际工具参数。Trace 记录的也是注入后的 effective input。

### `lib/agent/run.ts`

串联完整流程：

- 创建或恢复 session。
- 应用 feedback。
- 处理信息不足。
- 生成 planning input。
- 运行 Retrieval Agent。
- 运行 Answer Agent。
- 更新排除列表。
- 返回新的 session。

### `app/api/agent/route.ts`

API Route 将经过 Zod 验证的 `feedback` 和 `session` 传给 Agent 执行函数。

### `components/editorial/ListeningExperience.tsx`

- 增加四个反馈按钮。
- 实现 `replan` 请求。
- 保存旧结果直到新结果返回。
- 显示反馈加载和错误状态。
- 渲染信息不足的澄清页面。
- 显示轮次和排除数量。

### `app/globals.css`

- 反馈栏独立布局。
- 按钮靠右及双向居中。
- 标签和评分字号调整。
- 桌面与移动端反馈布局。

---

## 14. 12 个测试验证了什么

当前共有两个测试文件、12 个测试。

### 检索相关测试

1. 500 条字幕全部符合统一 Schema。
2. 能检索精确英文字幕。
3. 中文需求能够扩展并命中相关英文片段。
4. `verifiedOnly` 能过滤未验证来源。
5. 能获取单集元数据和上下文片段。
6. 推荐结果在集数维度保持多样性。
7. 排除列表能够强制过滤历史 segmentId。

### API 和 Agent 相关测试

8. 非法请求会在运行 Agent 前返回 400。
9. 缺少模型密钥时会透明降级到本地检索。
10. 选择 Qwen 时会提示正确的 `DASHSCOPE_API_KEY`。
11. “随便”这样的输入会返回澄清问题，并且不调用工具。
12. 点击“太说教”后，会话进入第二轮、约束更新，并且不重复上一轮片段。

第 12 个测试的关键断言包括：

```ts
expect(second.session.conversationId)
  .toBe(first.session.conversationId);

expect(second.session.turn).toBe(2);
expect(second.session.constraints.avoidAdvice).toBe(true);
expect(second.session.feedbackHistory).toContain("too_preachy");

expect(
  secondIds.every(id => !firstIds.includes(id)),
).toBe(true);
```

这不是只测试页面上有没有按钮，而是验证完整业务行为。

最终结果：

```text
Test Files  2 passed
Tests       12 passed
TypeScript  passed
Next build passed
```

---

## 15. 验收标准是怎么满足的

原始验收标准：

> 点击“太说教”后，Agent 会改变条件，不重复推荐。

对应实现：

| 验收点 | 实现证据 |
|---|---|
| 能点击“太说教” | 前端反馈按钮与 `replan` 函数 |
| Agent 改变条件 | `avoidAdvice`、`desiredEffect`、`tone` 更新 |
| 再次调用检索 | 重新请求 `/api/agent`，Retrieval Agent 再次调用工具 |
| 不重复推荐 | 检索层 `excludeSegmentIds` 强制过滤 |
| 保持同一会话 | `conversationId` 不变、`turn` 增加 |
| 可以验证 | Trace 显示轮次和排除数量，自动化测试比较两轮 ID |

因此该验收不是通过视觉模拟完成，而是有前端、API、Agent、检索和测试五层证据。

---

## 16. 两分钟面试讲述版本

> 第一版 Hey Tablo Agent 已经能调用检索工具并返回真实片段，但它仍然是单轮的。用户如果觉得推荐太说教或太沉重，只能重新输入问题，而且系统可能重复推荐。所以第二阶段我重点做了反馈驱动的重新规划。
>
> 我定义了太说教、不够好笑、太沉重和换个方向四种反馈，并把它们映射成结构化约束。例如“太说教”会更新为 avoidAdvice=true，同时把期望效果改为陪伴和共鸣，把语气改为自然、平等、不说教。这些约束会保存在 session 中，和原始需求、轮次、历史反馈以及已经推荐过的 segmentId 一起传到下一轮。
>
> 为了保证结果真的不重复，我没有只在 Prompt 里写“不要重复”，而是把 excludeSegmentIds 下沉到 MiniSearch 的过滤层。工具包装器还会从运行上下文强制注入排除列表，所以即使模型忘记传参，也拿不到上一轮的片段。重新检索后，Answer Agent 只能根据新的证据生成结果。
>
> 前端上，用户点击反馈后旧结果会继续保留，按钮进入加载状态，直到新结果返回再整体替换，避免页面跳动。如果输入只有“随便”或“不知道”，系统不会强行推荐，而是先追问用户更想被陪伴、逗笑还是安静想一想。
>
> 最后我增加了测试，验证同一 conversationId 的轮次从 1 变成 2、avoidAdvice 被更新、反馈进入历史，并且第二轮的 segmentId 与第一轮没有交集。这样这个功能不是一个前端“换一批”按钮，而是一条可以验证的 Agent 重新规划链路。

---

## 17. 30 秒精简版

> 我给 Hey Tablo 增加了反馈驱动的多轮重新规划。用户可以选择太说教、不够好笑、太沉重或换个方向，系统会把反馈转换成结构化约束，保存在会话状态中，并重新调用检索工具。上一轮的 segmentId 会在 MiniSearch 层被强制排除，因此不能重复推荐。我还处理了信息不足、加载和错误状态，并通过自动化测试验证第二轮约束更新且结果不重复。

---

## 18. 面试官可能追问的问题

### Q1：这和“换一批”有什么区别？

“换一批”只改变结果，不一定改变条件。重新规划会先理解用户为什么不满意，再更新期望效果、语气和排除条件，然后重新调用检索工具。

### Q2：为什么不用自然语言保存反馈？

结构化枚举便于类型检查、埋点、测试和稳定映射。中文展示文案可以变，但内部逻辑不会受影响。

### Q3：模型会不会仍然重复推荐？

模型拿不到被排除的片段。排除发生在 MiniSearch 返回结果之前，因此比 Prompt 约束可靠。

### Q4：为什么只排除 segmentId，不排除整个 episode？

当前验收要求是“不重复上一轮结果”，片段级排除能保留同一集内其他可能高度相关的内容。如果用户反馈是“这一集不喜欢”，下一步可以新增 `excludeEpisodeIds`。

### Q5：多次反馈会发生什么？

约束会累积，轮次递增，新推荐继续加入排除列表。列表去重并限制为 30 个，防止请求无限膨胀。

### Q6：为什么会话由客户端携带？

这是两天 MVP 的效率取舍，避免先搭数据库。它适合验证交互和规划逻辑；生产环境会迁移到服务端会话存储。

### Q7：如何判断信息不足？

当前版本使用确定性短语规则，优点是便宜、快速、可测试。生产版本可以结合字段完整度、分类模型或让 Agent 返回 clarification decision。

### Q8：如果重新规划失败怎么办？

保留旧结果并显示局部错误，不清空页面。用户仍然可以播放旧推荐或再次点击反馈。

### Q9：怎样证明真的重新调用了工具？

Trace 会显示新的 traceId、轮次、工具调用数和耗时；自动化测试还验证了第二轮结果 ID 与第一轮没有交集。

### Q10：这一阶段最重要的产品判断是什么？

把用户的不满意原因转换成可执行约束，并把关键业务约束下沉到确定性工具层，而不是全部交给模型自由理解。

---

## 19. 目前的限制与下一步

### 当前限制

- 会话刷新后不会持久保存。
- 信息不足判断目前是关键词规则。
- 反馈维度只有四种。
- “换个方向”主要依靠检索查询变化，没有主题距离模型。
- 当前只强制排除片段，没有“屏蔽整集”。
- 反馈效果尚未使用离线评测集量化。

### 下一步

- 将会话状态保存到 Redis 或数据库。
- 增加 `excludeEpisodeIds`。
- 建立反馈前后相关性、重复率和满意度评测。
- 记录每种反馈的点击率和二次播放率。
- 为“太沉重”增加情绪强度的确定性过滤。
- 为“换个方向”增加主题多样性或向量距离约束。

面试中主动说出这些限制不会减分，反而能说明你知道 Demo 和生产系统之间的差距。

---

## 20. 不要说错的地方

- 不要说系统已经使用数据库保存会话。目前是客户端携带状态。
- 不要说 Agent 拥有长期记忆。目前是当前页面生命周期内的短期状态。
- 不要说四种反馈完全由模型自由理解。它们先映射成确定性约束。
- 不要说只靠 Prompt 避免重复。真正的强制排除发生在检索层。
- 不要说“太沉重”已经基于专业心理标签过滤。目前主要通过检索条件和语气约束调整。
- 不要说信息不足判断使用了模型。目前使用确定性短语规则。
- 不要说按钮点击只是切换本地数组。它会重新请求 API 和运行 Agent 工作流。

---

## 21. 一句话总结

> 我把 Hey Tablo 从一次性推荐工具升级成了能接收反馈、更新约束、记住历史并重新调用工具的多轮 Agent，同时用检索层硬过滤保证结果不重复。
