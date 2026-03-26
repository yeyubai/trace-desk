---
phase: 05-reliability-portfolio-finish
plan: 01
subsystem: rag
tags: [diagnostics, import, extraction, chunks]
requires:
  - phase: 02-knowledge-ingestion-experience
    provides: Source detail surface and import workflow
  - phase: 03-grounded-chat-core
    provides: Grounded answer/refusal semantics
provides:
  - "Source diagnostics for imported content"
  - "Stronger URL extraction heuristics and migration-safe diagnostics persistence"
affects: [knowledge, import, rag, retrieval]
tech-stack:
  added: []
  patterns: ["Imported sources now expose extraction diagnostics instead of acting like a black box"]
key-files:
  created: []
  modified:
    - src/features/knowledge/types/knowledge.ts
    - src/features/workbench/schemas/workbench-snapshot.ts
    - src/features/knowledge/server/import-knowledge-source.ts
    - src/features/knowledge/components/SourceDetailPanel.tsx
    - src/services/db/mock-workbench-store.ts
key-decisions:
  - "RAG import must be diagnosable via extraction mode, text length, chunk previews, and warnings"
patterns-established:
  - "Legacy mock state is auto-hydrated with diagnostics so reliability work survives restarts"
requirements-completed: []
duration: session-based
completed: 2026-03-26
---

# Phase 5: Reliability & Portfolio Finish Summary

**来源导入现在不再是黑盒：用户可以看到正文抽取策略、正文长度、chunk 预览和风险告警，从而判断为什么这条链接能问、不能问，或者问不到。**

## Performance

- **Duration:** session-based
- **Started:** 2026-03-26T15:20:00+08:00
- **Completed:** 2026-03-26T16:00:00+08:00
- **Tasks:** 4
- **Files modified:** 5

## Accomplishments
- 给 `SourceDocumentSummary` 增加了结构化 diagnostics 字段。
- URL 抽取优先尝试 `article/main/content-container`，失败时才回退到 `body-fallback`。
- 来源详情面板现在能展示抽取长度、抽取策略、质量标签、告警和 chunk 预览。
- mock store 会自动迁移旧状态文件，避免重启后 diagnostics 丢失。
- 用真实业务链路验证了“导入本地网页链接 -> 返回 chunk/diagnostics”。

## Task Commits

本轮尚未创建 git commit；会继续按“文档提交 + 代码提交”拆分方式单独提交。

## Files Created/Modified
- `src/features/knowledge/types/knowledge.ts`
- `src/features/workbench/schemas/workbench-snapshot.ts`
- `src/features/knowledge/server/import-knowledge-source.ts`
- `src/features/knowledge/components/SourceDetailPanel.tsx`
- `src/services/db/mock-workbench-store.ts`

## Decisions Made

- 即使在 mock 阶段，也必须让导入结果可解释、可验证，不能只看“导入成功”。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- 发现旧的 mock 状态文件缺少新 diagnostics 字段，导致最新 schema 会在重启后失效，已通过自动迁移修复。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 现在已经能解释“为什么导入链接后问不到”，接下来可以继续做 05-02：把检索质量门槛和命中解释进一步统一。

---
*Phase: 05-reliability-portfolio-finish*
*Completed: 2026-03-26*
