---
phase: 02-knowledge-ingestion-experience
plan: 03
subsystem: ui
tags: [feedback, import-form, api-error, duplicate]
requires:
  - phase: 02-knowledge-ingestion-experience
    provides: Detailed source status model
provides:
  - "Inline import feedback banners"
  - "Actionable API error parsing for import endpoints"
affects: [import, chat, api]
tech-stack:
  added: []
  patterns: ["Import actions surface result feedback next to the form and auto-focus the newest source"]
key-files:
  created:
    - src/features/knowledge/lib/build-import-feedback.ts
  modified:
    - src/lib/api.ts
    - src/features/knowledge/components/ImportSourceForm.tsx
    - src/features/workbench/components/ImportPageContent.tsx
    - src/features/workbench/components/WorkbenchShell.tsx
    - src/app/api/knowledge/import-url/route.ts
    - src/app/api/knowledge/upload/route.ts
key-decisions:
  - "导入结果反馈必须在表单附近即时可见"
  - "URL/file import 都采用同一套反馈语义"
patterns-established:
  - "Import feedback is derived from the newest source record and API error messages"
requirements-completed: [INGEST-04]
duration: session-based
completed: 2026-03-26
---

# Phase 2: Knowledge Ingestion Experience Summary

**导入动作现在会在表单附近即时反馈成功、警告或失败结果，并自动把焦点切到最新来源。**

## Performance

- **Duration:** session-based
- **Started:** 2026-03-26T00:55:00+08:00
- **Completed:** 2026-03-26T01:20:00+08:00
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- 新增 `buildImportFeedback`，统一从来源状态推导 UI 提示。
- `ImportSourceForm` 支持渲染成功/警告/失败提示条。
- Import 页面和聊天工作台都在导入成功后自动选中新来源。
- `lib/api.ts` 和导入 routes 现在会返回更可读的错误信息，而不是裸状态码。

## Task Commits

本次没有创建 git commit。

## Files Created/Modified
- `src/features/knowledge/lib/build-import-feedback.ts` - 统一导入反馈推导
- `src/lib/api.ts` - API error 解析
- `src/features/knowledge/components/ImportSourceForm.tsx` - 表单内结果提示
- `src/features/workbench/components/ImportPageContent.tsx` - 成功/失败反馈与自动选中
- `src/features/workbench/components/WorkbenchShell.tsx` - 复用同一套导入反馈
- `src/app/api/knowledge/import-url/route.ts` - 返回更具体错误
- `src/app/api/knowledge/upload/route.ts` - 返回更具体错误

## Decisions Made

- 导入结果提示不依赖全局通知，也不要求用户自行去列表寻找变化。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 当前导入链路已经足够清晰，可以把重心转到 Phase 3 的 grounded answer 与引用展示。

---
*Phase: 02-knowledge-ingestion-experience*
*Completed: 2026-03-26*
