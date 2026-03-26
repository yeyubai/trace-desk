---
phase: 02-knowledge-ingestion-experience
plan: 01
subsystem: api
tags: [ingestion, source-status, zod, mock-store]
requires:
  - phase: 01-foundation-stabilization
    provides: Stable WorkbenchSnapshot contract
provides:
  - "Dual ingestion/retrieval state model for sources"
  - "PDF stored-only behavior and duplicate import hints"
affects: [knowledge, import, workbench]
tech-stack:
  added: []
  patterns: ["Source records expose import lifecycle and retrieval availability separately"]
key-files:
  created: []
  modified:
    - src/features/knowledge/types/knowledge.ts
    - src/features/knowledge/server/import-knowledge-source.ts
    - src/services/db/mock-workbench-store.ts
    - src/features/workbench/schemas/workbench-snapshot.ts
    - src/lib/formatters.ts
key-decisions:
  - "把导入状态和检索状态拆成两个维度"
  - "PDF 先以 stored-only 记录存在，而不是伪装成失败"
patterns-established:
  - "SourceDocumentSummary 用 retrievalStatus/retrievalDetail 描述可问答性"
requirements-completed: [INGEST-01, INGEST-02, INGEST-03]
duration: session-based
completed: 2026-03-26
---

# Phase 2: Knowledge Ingestion Experience Summary

**来源记录现在能明确区分“已导入”和“是否可检索”，PDF 与处理中来源不再被错误归类为失败。**

## Performance

- **Duration:** session-based
- **Started:** 2026-03-26T00:45:00+08:00
- **Completed:** 2026-03-26T01:20:00+08:00
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- `SourceDocumentSummary` 增加了 `retrievalStatus`、`retrievalDetail` 和 `duplicateOf`。
- 导入服务和 snapshot schema 统一接入新状态模型。
- mock 数据现在包含可检索、仅存储、处理中、可能重复等真实导入场景。

## Task Commits

本次没有创建 git commit。
原因：继续遵守本仓库中文提交规范与“当前工作树已有其他改动”的约束，先完成 phase 交付与验证。

## Files Created/Modified
- `src/features/knowledge/types/knowledge.ts` - 扩展来源状态模型
- `src/features/knowledge/server/import-knowledge-source.ts` - 输出双维状态与 PDF stored-only 行为
- `src/services/db/mock-workbench-store.ts` - mock 数据补齐导入状态和重复提示
- `src/features/workbench/schemas/workbench-snapshot.ts` - snapshot schema 扩展来源字段
- `src/lib/formatters.ts` - 补充来源状态/检索状态文案

## Decisions Made

- “导入成功”不再自动等于“可检索”。
- 重复导入在 Phase 2 只做提示，不做覆盖或自动合并。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 后续 grounded answer 可以直接使用更可靠的来源状态，不必猜测某条来源是否应参与检索。
- 导入页和聊天页都已经拥有可消费的新来源状态语义。

---
*Phase: 02-knowledge-ingestion-experience*
*Completed: 2026-03-26*
