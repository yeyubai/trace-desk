# Phase 5: Reliability & Portfolio Finish - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

本 phase 聚焦“把当前 MVP 链路做成可解释、可验证、可交付”的收尾工作。优先级不是继续加新功能，而是解决会影响业务可信度的缺口，尤其是 RAG 导入后无法判断是否真正进入检索链路的问题。

</domain>

<decisions>
## Implementation Decisions

### 企业级 RAG 验证
- **D-01:** Phase 5 先把“导入后可验证”作为 RAG 收尾的第一优先级，不再接受黑盒导入。
- **D-02:** 网页导入必须暴露正文抽取结果、抽取策略、chunk 预览和告警信息，让前后端共享同一套诊断语义。

### 抓取与检索可靠性
- **D-03:** URL 抽取不再只依赖整个 `<body>` 去标签化，而要优先尝试 `article/main/正文容器` 这类候选块。
- **D-04:** 如果抽取正文过短或 chunk 数过少，要明确标记为“薄内容/低可信”，而不是继续伪装成普通可检索来源。

### 交付标准
- **D-05:** 必须补一条最小可重复的端到端验收：导入网页 -> 看抽取摘要/chunk -> 提问命中 -> 引用展示。
- **D-06:** 作品集层面的 README / plan / 页面文案，应以“真实 RAG 产品”而不是 demo 口径来表达。

### the agent's Discretion
- 诊断面板的视觉层次和字段排序
- 内容过薄时的文案和阈值细节

</decisions>

<canonical_refs>
## Canonical References

### 项目约束
- `readme.md` — 产品定位与开发入口
- `plan.md` — 技术路线、阶段目标、RAG 约束
- `AGENTS.md` — 仓库规则与中文提交规范

### 上下游上下文
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/todos/pending/2026-03-26-rag-unified-design-and-import-audit.md`
- `.planning/phases/02-knowledge-ingestion-experience/02-CONTEXT.md`
- `.planning/phases/03-grounded-chat-core/03-CONTEXT.md`

### Spec / 任务参考
- `specs/001-mvp-knowledge-workbench/spec.md`
- `specs/001-mvp-knowledge-workbench/tasks.md`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/features/knowledge/server/import-knowledge-source.ts`: 已有 URL 抓取、正文规范化和 chunk 生成入口
- `src/services/retrieval/search-knowledge-base.ts`: 已有基础检索逻辑
- `src/features/knowledge/components/SourceDetailPanel.tsx`: 已有来源详情面板，可继续扩展为诊断面板
- `src/features/workbench/components/ImportPageContent.tsx`: 已有导入主场景，是“导入后可验证”最合适的入口

### Established Patterns
- 导入动作完成后统一回到 `WorkbenchSnapshot`
- 来源详情和引用详情已经共用一个 detail panel
- mock 数据层当前已经升级为文件持久化，可支撑跨请求验证

### Integration Points
- `src/app/api/knowledge/import-url/route.ts` 是 URL 导入入口
- `src/features/knowledge/server/import-knowledge-source.ts` 决定抽取和 chunk 语义
- `src/features/knowledge/components/SourceDetailPanel.tsx` 负责把抽取结果解释给用户
- `src/services/retrieval/search-knowledge-base.ts` 与 `src/services/ai/generate-grounded-answer.ts` 依赖抽取结果质量

</code_context>

<specifics>
## Specific Ideas

- 用户导入文章链接后，应该能看到“抓到了多少正文、切成几段、前几段是什么”，不再只能看到一个模糊摘要。
- 如果抓取的是导航、页脚、登录提醒之类的薄内容，系统应该明确提示，而不是等到问答时才说没命中。
- 企业级应用不只是“能导入”，而是“导入结果可解释、可复验、可持续优化”。

</specifics>

<deferred>
## Deferred Ideas

- 真正的向量索引与 pgvector 落地可以作为后续 slice，但本 step 先优先解决可观测性和抽取可信度
- 更重的重排模型和评测平台留到后续扩展

</deferred>

---

*Phase: 05-reliability-portfolio-finish*
*Context gathered: 2026-03-26*
