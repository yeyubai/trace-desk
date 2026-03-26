---
phase: 05-reliability-portfolio-finish
plan: 02
subsystem: rag
tags: [retrieval, refusal, diagnostics, langchain]
requires:
  - phase: 05-reliability-portfolio-finish
    provides: Import-stage diagnostics and observable chunk previews
provides:
  - "Retrieval quality rules based on source diagnostics"
  - "Refusal answers with product-readable diagnostics hints"
affects: [retrieval, chat, ai]
tech-stack:
  added:
    - "@langchain/core"
    - "@langchain/textsplitters"
  patterns: ["Retrieval and refusal semantics now consume diagnostics produced at import time"]
key-files:
  created:
    - src/services/rag/langchain-splitting.ts
  modified:
    - src/features/knowledge/server/import-knowledge-source.ts
    - src/services/retrieval/search-knowledge-base.ts
    - src/services/ai/compose-mock-answer.ts
    - src/services/ai/generate-grounded-answer.ts
    - src/app/api/chat/route.ts
    - package.json
    - package-lock.json
key-decisions:
  - "Adopt LangChain.js incrementally from chunking first"
  - "Use diagnostics-aware retrieval gating instead of treating all chunks equally"
patterns-established:
  - "Refusal answers now surface retrieval diagnostics hints for product-level explainability"
requirements-completed: [REL-01, REL-02]
duration: session-based
completed: 2026-03-26
---

# Phase 5: Reliability & Portfolio Finish Summary

**RAG 现在开始脱离 demo 逻辑：切块改由 LangChain.js 驱动，检索会参考来源质量，拒答也会带上更明确的命中/未命中诊断。**

## Performance

- **Duration:** session-based
- **Started:** 2026-03-26T22:55:00+08:00
- **Completed:** 2026-03-26T23:20:00+08:00
- **Tasks:** 4
- **Files modified:** 7

## Accomplishments
- 引入 `@langchain/core` 与 `@langchain/textsplitters`。
- 新增 LangChain splitter service，把来源切块切换到 `Document + RecursiveCharacterTextSplitter / MarkdownTextSplitter`。
- 检索开始过滤不可检索来源，并对 `thin`/`body-fallback` 来源降权。
- 拒答答案不再只是空泛一句话，而会带上 retrieval diagnostics 提示。

## Task Commits

本轮尚未创建 git commit；会继续按“文档提交 + 代码提交”拆分方式单独提交。

## Files Created/Modified
- `src/services/rag/langchain-splitting.ts`
- `src/features/knowledge/server/import-knowledge-source.ts`
- `src/services/retrieval/search-knowledge-base.ts`
- `src/services/ai/compose-mock-answer.ts`
- `src/services/ai/generate-grounded-answer.ts`
- `src/app/api/chat/route.ts`
- `package.json`
- `package-lock.json`

## Decisions Made

- LangChain 先从切块和 Document 编排层落地，避免一次性引入过多不必要抽象。
- import diagnostics 必须参与 retrieval/refusal，而不只是展示给用户看。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `@langchain/community` 当前与现有依赖树有 peer 冲突，因此本轮先安全接入 `@langchain/core` 和 `@langchain/textsplitters`，后续再评估 vector store/loaders 的接入节奏。

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 现在已经有 LangChain 切块和 diagnostics-aware retrieval，下一步可以继续补 05-03 的文档、验收清单和作品集表达。

---
*Phase: 05-reliability-portfolio-finish*
*Completed: 2026-03-26*
