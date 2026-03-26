# Phase 4: Sessions & Feedback Loop - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

本 phase 聚焦“会话恢复 + 反馈闭环 + 下一步建议”三件事：用户要能回看历史会话、带着已有上下文继续提问、看到反馈状态被持久化，并在会话页获得明确的下一步动作。它不扩展到更重的评测平台或多模型对比。

</domain>

<decisions>
## Implementation Decisions

### 会话恢复
- **D-01:** Sessions 页面不再只展示会话列表，而是要有“列表 + 会话详情/摘要 + 继续追问入口”的完整结构。
- **D-02:** 从 Sessions 页继续会话时，直接跳转到 `/chat?sessionId=...`，而不是让用户重新手动选择。

### 反馈闭环
- **D-03:** 反馈记录按 `messageId` 去重更新，而不是同一条消息无限追加多条相反反馈。
- **D-04:** 会话页和聊天页都要能恢复“这条消息已经被评过”的状态，而不是只在当前内存里记住。

### 下一步建议
- **D-05:** 选中某个历史会话时，会话页需要提炼这条会话中的最新 followups，作为继续追问建议。
- **D-06:** 反馈汇总不只显示总数，还应表达“已覆盖多少条回答、还有多少未评”的业务意义。

### the agent's Discretion
- Sessions 页面三栏布局的比例和视觉强调点
- 会话摘要卡片与 followup 推荐的呈现方式

</decisions>

<canonical_refs>
## Canonical References

### 项目约束
- `readme.md` — 产品目标、会话与反馈入口
- `plan.md` — 历史会话、反馈评分、追问建议要求
- `AGENTS.md` — 仓库规则与中文提交规范

### 上游阶段
- `.planning/PROJECT.md` — 核心价值和约束
- `.planning/REQUIREMENTS.md` — `SESS-01` 到 `SESS-03`
- `.planning/ROADMAP.md` — Phase 4 目标与成功标准
- `.planning/phases/03-grounded-chat-core/03-CONTEXT.md` — grounded chat 的上下文、流式协议和 followup 约定

### Codex 规则
- `.codex/rules/architecture.md` — feature/server/ui 边界
- `.codex/rules/react-next-style.md` — App Router / React 风格约束
- `.codex/rules/typescript-quality.md` — 类型与 schema 质量约束

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/features/chat/components/SessionRail.tsx`: 已有会话列表组件，可保留并增强信息表达
- `src/features/chat/components/ChatMessageCard.tsx`: 已支持引用、追问、反馈按钮，适合复用在会话详情里
- `src/features/workbench/components/FeedbackSummaryPanel.tsx`: 已有反馈汇总面板，可升级指标
- `src/app/api/chat/[sessionId]/route.ts`: 已有单会话读取接口，可继续用作恢复会话入口

### Established Patterns
- 工作台仍通过 `WorkbenchSnapshot` 统一聚合页面状态
- 反馈写入通过 `/api/feedback` 路由完成，前端目前用 mutation 触发 snapshot 刷新
- 聊天页已经支持引用联动和 followups，Sessions 页应尽量复用这些信息而不是再造新语义

### Integration Points
- `src/features/workbench/components/SessionsPageContent.tsx` 是本 phase 主承载页
- `src/features/workbench/components/WorkbenchShell.tsx` 和 `src/app/(dashboard)/chat/page.tsx` 需要支持从历史会话入口恢复
- `src/services/db/mock-workbench-store.ts` 和 `src/features/workbench/server/getWorkbenchSnapshot.ts` 需要补 feedback/session 聚合数据

</code_context>

<specifics>
## Specific Ideas

- Sessions 页最好像一个“会话控制台”，而不是三块彼此割裂的卡片。
- 已经评过的回答应该在历史会话里保留状态，避免用户每次刷新都像没评过一样。
- 会话详情中直接给“继续这个会话”的按钮，比只列历史卡片更有效。

</specifics>

<deferred>
## Deferred Ideas

- 多模型对比、评测数据集、评分维度细分留到 Phase 5 或后续 milestone
- 更复杂的会话搜索和过滤留到后续 phase

</deferred>

---

*Phase: 04-sessions-feedback-loop*
*Context gathered: 2026-03-26*
