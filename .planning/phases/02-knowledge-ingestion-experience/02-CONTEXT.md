# Phase 2: Knowledge Ingestion Experience - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

本 phase 只处理知识导入体验：让用户清楚知道来源是否已导入、是否可检索、为什么不可检索、以及失败时该怎么处理。它不进入 grounded answer 生成、引用真实性和多轮会话逻辑。

</domain>

<decisions>
## Implementation Decisions

### 导入状态语义
- **D-01:** 将“导入成功”和“可检索”拆成两个维度建模，而不是把 `PDF 已保存但不可检索` 归为失败。
- **D-02:** 保留导入流程状态（如 `已导入 / 处理中 / 导入失败`），另增检索状态（如 `可检索 / 仅存储 / 暂不可检索`）。

### 来源列表与详情分工
- **D-03:** 列表负责快速判断：标题、来源类型、导入状态、检索状态、分块数、最近更新时间。
- **D-04:** 详情负责解释原因：为什么可检索或不可检索、是否可能重复、引用标签、来源链接与当前引用摘录。

### 反馈与重复导入
- **D-05:** 导入表单需要在页面内直接反馈结果，不要求用户刷新或自己去列表里猜状态。
- **D-06:** 重复导入先采用“允许导入但明确提示可能重复”的策略，不在 Phase 2 做覆盖或自动合并。

### the agent's Discretion
- 导入结果提示条的布局与微文案
- Import 页面三栏或双栏的具体比例

</decisions>

<canonical_refs>
## Canonical References

### 项目约束
- `readme.md` — 产品目标、工程约定、MVP 边界
- `plan.md` — 首版功能重点与 4-6 周分期
- `AGENTS.md` — 仓库规则、中文提交规范、GSD 约束

### 上下游上下文
- `.planning/PROJECT.md` — 核心价值与阶段约束
- `.planning/REQUIREMENTS.md` — `INGEST-01` 到 `INGEST-04`
- `.planning/ROADMAP.md` — Phase 2 目标与成功标准
- `.planning/phases/01-foundation-stabilization/01-CONTEXT.md` — Phase 1 已锁定的契约与壳子决策

### Codex 规则
- `.codex/rules/architecture.md` — feature/server/ui 边界
- `.codex/rules/forms-and-validation.md` — 表单与错误反馈约束
- `.codex/rules/typescript-quality.md` — 类型与 schema 约束

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/features/knowledge/components/ImportSourceForm.tsx`: 已有文件上传与 URL 导入入口
- `src/features/knowledge/components/SourceListPanel.tsx`: 已有来源卡片列表，适合补状态与选择能力
- `src/features/knowledge/components/SourceDetailPanel.tsx`: 已有详情面板骨架，适合承接检索解释和重复提示
- `src/features/knowledge/server/import-knowledge-source.ts`: 已有 URL / file 导入与 chunk 生成逻辑
- `src/services/db/mock-workbench-store.ts`: 已有 source/chunk mock store，可在此扩展重复导入和状态语义

### Established Patterns
- 页面通过 `getWorkbenchSnapshot()` + `useWorkbenchSnapshotQuery()` 驱动统一数据视图
- 导入 mutation 完成后刷新 snapshot，而不是单独维护局部 source store
- 表单校验优先使用 `react-hook-form + zod`

### Integration Points
- `src/app/api/knowledge/import-url/route.ts` 与 `src/app/api/knowledge/upload/route.ts` 是导入反馈的服务端入口
- `src/features/workbench/components/ImportPageContent.tsx` 是 Phase 2 的主承载页
- `src/features/workbench/components/WorkbenchShell.tsx` 中也复用了导入表单，需要保持反馈方式一致

</code_context>

<specifics>
## Specific Ideas

- `PDF` 应表达为“来源已保存，但当前不可检索”，而不是“失败”。
- 导入完成后最好直接选中新来源，让用户立即看到详情和状态解释。
- 重复导入先提示，不做自动合并，避免在 mock 阶段引入过重的数据策略。

</specifics>

<deferred>
## Deferred Ideas

- OCR / PDF 正文解析留到后续 phase
- 导入任务异步队列与后台重试留到后续 phase
- 基于来源详情的 grounded preview 与引用预览卡片增强留到 Phase 3/4

</deferred>

---

*Phase: 02-knowledge-ingestion-experience*
*Context gathered: 2026-03-26*
