# Hey Tablo Agent

一个基于真实播客字幕的情境化收听 Agent。用户不需要知道节目名称，只需描述此刻的状态、时间或不想听什么，系统就会调用检索工具，从 500 条字幕证据中推荐三个可以追溯到原视频的“声音切片”。

## 为什么做这个项目

传统播客产品通常要求用户先选择节目或搜索关键词；但人在疲惫、通勤或独处时，更常表达的是“我现在需要什么”。Hey Tablo 把入口从内容目录改成自然语言状态，并用 Agent 完成需求理解、工具选择、证据检索和结构化回答。

项目重点不是做一个“Tablo 聊天机器人”，而是验证三件事：

1. AI 能否把模糊状态转成可执行的检索条件。
2. 推荐是否能够回到真实字幕、时间戳和原视频。
3. 用户说“太说教”后，系统是否会更新约束并真正换掉旧结果。

## 已实现能力

- Next.js App Router 前端与 Node.js API Route。
- OpenAI Agents SDK 工具调用工作流。
- Qwen 与 OpenAI 两种模型运行配置。
- MiniSearch 中英混合检索、排序和来源过滤。
- 四个确定性工具：字幕搜索、情境推荐、单集查询、上下文查询。
- Zod 请求、会话与回答 Schema。
- 三条带 episode、时间戳、原文和来源链接的推荐。
- “太说教 / 不够好笑 / 太沉重 / 换个方向”四种反馈。
- 会话约束累积与历史 segmentId 强制排除。
- 信息不足时先澄清，而不是强行猜测。
- 模型不可用时透明降级到本地检索。
- Agent Trace、错误状态、封面回退与移动端布局。
- 16 个自动化测试与 GitHub Actions 质量门禁。
- `/insights` 用户反馈分析页与浏览器本地事件埋点。

## 工作流

```text
用户需求
  → API 请求校验
  → 会话状态 / 反馈约束
  → Retrieval Agent 调用工具
  → MiniSearch 检索与确定性过滤
  → Answer Agent 生成结构化输出
  → 声音切片界面

模型失败
  → 本地 MiniSearch 降级
  → 低置信度与错误原因透明展示
```

完整图示见 [系统架构](docs/architecture.md)。

## 本地运行

要求 Node.js 22 或更高版本。

```bash
npm install
cp .env.example .env.local
npm run dev
```

打开 `http://localhost:3000`。不配置模型密钥也能运行，此时会使用本地确定性检索，并在响应中标记 `fallback`。

## 模型配置

推荐使用阿里云百炼 Qwen：

```env
MODEL_PROVIDER=qwen
DASHSCOPE_API_KEY=你的百炼_API_Key
QWEN_MODEL=qwen-plus
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

也可以切换为 OpenAI：

```env
MODEL_PROVIDER=openai
OPENAI_API_KEY=你的_OpenAI_API_Key
OPENAI_MODEL=gpt-5-mini
```

密钥仅由服务端读取。不要使用 `NEXT_PUBLIC_` 前缀，也不要提交 `.env.local`。

## 常用命令

```bash
npm run dev          # 启动开发环境
npm run typecheck    # TypeScript 静态检查
npm test             # 运行自动化测试
npm run build        # 生产构建
npm run extract:data # 从 legacy HTML 重新提取数据
```

提交到 GitHub 后，Actions 会按顺序执行：

```text
npm ci → npm run typecheck → npm test → npm run build
```

## API 示例

第一次请求：

```json
{
  "message": "一个人吃饭，想听点轻松的"
}
```

反馈后的请求会继续携带服务端返回的 `conversationId` 和 `session`：

```json
{
  "message": "一个人吃饭，想听点轻松的",
  "conversationId": "conversation_xxx",
  "feedback": "too_preachy",
  "session": {}
}
```

系统会更新语气与期望效果，并在检索层排除上一轮已经出现的字幕片段。

## 数据

| 数据 | 数量 |
|---|---:|
| 节目 | 29 期 |
| 字幕片段 | 500 条 |
| 已验证来源片段 | 390 条 |
| 自动化测试 | 16 个 |

数据提取结果见 `data/extraction-report.json`。内部的 `editorNote` 和 `evidenceSummary` 用于审核和评测，不直接展示给用户；界面只展示个性化 `reason` 与 `recommendationCopy`。

## 工程结构

```text
app/                    页面、API Route 与全局样式
components/editorial/   编辑风格界面与交互组件
data/                   节目、字幕和提取报告
docs/                   架构、评测、移动端和开发复盘
legacy/                 原始单文件 HTML 迁移基线
lib/agent/              Agent、模型、会话、Trace 和降级逻辑
lib/retrieval/          MiniSearch、规范化、排序与 Schema
lib/tools/              四个确定性业务工具
scripts/                数据提取脚本
tests/                  检索与 API/Agent 测试
.github/workflows/      持续集成质量门禁
```

## 质量与评测

- [评测报告](docs/evaluation-report.md)
- [移动端验收记录](docs/mobile-test-report.md)
- [系统架构](docs/architecture.md)
- [反馈驱动重新规划复盘](docs/day-2-morning-feedback-replanning.md)

当前自动化验证覆盖：字幕 Schema、精确检索、跨语言检索、来源过滤、推荐多样性、历史去重、非法请求、模型降级、信息不足、反馈重规划和用户行为指标计算。

## 部署

该项目可以部署到支持 Node.js 22 的 Next.js 平台，例如 Vercel：

1. 将仓库推送到 GitHub。
2. 等待 `quality-gate` Action 通过。
3. 在部署平台导入仓库。
4. 配置 Qwen 或 OpenAI 的服务端环境变量。
5. 使用 `npm run build` 构建并发布。

部署后先验证无密钥降级，再配置模型密钥验证真实工具调用。这样能区分“应用本身不可用”和“模型配置不可用”。

## 当前边界

- 会话状态由客户端在当前页面生命周期内携带，尚未写入 Redis 或数据库。
- 信息不足判断目前使用确定性短语规则。
- 390 条字幕完成来源验证，其余片段正式引用前仍需人工复核。
- 当前评测以确定性测试为主，尚未积累真实用户满意度和播放转化数据。
- 移动端已完成响应式验收，但尚未加入 Playwright 端到端测试。

这些限制会在界面、Trace 或文档中明确说明，不把 Demo 能力包装成生产能力。
