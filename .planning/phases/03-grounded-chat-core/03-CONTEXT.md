# Phase 3: Grounded Chat Core - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

本 phase 只处理 grounded chat 主链路：把“检索 -> 会话上下文 -> 流式回答 -> 引用展示”连接成一个稳定的问答体验。它不进入会话归档/反馈汇总，也不扩展到更复杂的评测或平台能力。

</domain>

<decisions>
## Implementation Decisions

### 请求与消息结构
- **D-01:** 聊天链路继续以 `parts` 为中心建模，而不是退回单字符串 `content`。
- **D-02:** `ChatStreamEvent` 作为客户端和 `/api/chat` 之间的流式协议，至少包含 `init / delta / complete / error` 四类事件。

### 会话上下文
- **D-03:** 每次提问都会带入最近几轮对话上下文，但只提取文本片段，不把完整历史无界塞进 prompt。
- **D-04:** 当前阶段先使用轻量“最近 2-4 条文本消息”策略，不在本 phase 实现复杂摘要压缩。

### 回答呈现
- **D-05:** 聊天界面优先支持流式输出、停止生成、重新生成和引用点击查看来源。
- **D-06:** 被点击的引用应该直接联动到来源详情，不要求用户手动切页查找。

### the agent's Discretion
- 流式 loading 文案和消息气泡细节
- 最近上下文截断的精确条数

</decisions>

<canonical_refs>
## Canonical References

### 项目约束
- `readme.md` — 产品方向、工程约定、聊天消息结构说明
- `plan.md` — RAG、引用展示、会话链路的阶段目标
- `AGENTS.md` — 仓库规则与中文提交规范

### 上游阶段
- `.planning/PROJECT.md` — 项目核心价值与可信回答约束
- `.planning/REQUIREMENTS.md` — `CHAT-01` 到 `CHAT-05`
- `.planning/ROADMAP.md` — Phase 3 目标与成功标准
- `.planning/phases/01-foundation-stabilization/01-CONTEXT.md` — 工作台壳子和契约决策
- `.planning/phases/02-knowledge-ingestion-experience/02-CONTEXT.md` — 来源状态和详情表现决策

### Codex 规则
- `.codex/rules/architecture.md` — 检索、生成、引用组装显式分层
- `.codex/rules/react-next-style.md` — React/Next 风格约束
- `.codex/rules/typescript-quality.md` — 类型与 schema 约束

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/features/chat/components/ChatWorkspace.tsx`: 已有问答工作区，可继续承接流式状态与会话交互
- `src/features/chat/components/ChatMessageCard.tsx`: 已有 parts 渲染能力，适合继续补引用交互
- `src/services/retrieval/search-knowledge-base.ts`: 已有基础检索与重排逻辑
- `src/services/ai/generate-grounded-answer.ts`: 已有 grounded answer 生成入口

### Established Patterns
- 工作台仍通过 `getWorkbenchSnapshot()` + React Query 刷新视图
- 来源详情已支持 explanation 面板，适合作为引用点击后的落点
- 当前接口边界仍保持在 `Next.js Route Handlers`

### Integration Points
- `src/app/api/chat/route.ts` 是流式 NDJSON 协议入口
- `src/features/chat/hooks/useChatMutations.ts` 负责客户端流式消费
- `src/features/chat/server/build-chat-context.ts` 负责最近会话上下文抽取
- `src/features/workbench/components/WorkbenchShell.tsx` 负责把引用点击联动到来源详情

</code_context>

<specifics>
## Specific Ideas

- 问答链路要先把协议和上下文建稳，再继续做 grounded answer 的准确性增强。
- 点击引用后直接看到对应来源详情，比只显示一串 badge 更有解释力。
- 当前阶段的 streaming 重点是“稳定”和“可恢复”，不是做复杂动画。

</specifics>

<deferred>
## Deferred Ideas

- 更复杂的历史会话压缩和摘要策略留到后续 phase
- 反馈闭环与评分面板留到 Phase 4
- 更强的拒答策略和模型档位行为留到 Phase 3 后续计划或 `03-03`

</deferred>

---

*Phase: 03-grounded-chat-core*
*Context gathered: 2026-03-26*
