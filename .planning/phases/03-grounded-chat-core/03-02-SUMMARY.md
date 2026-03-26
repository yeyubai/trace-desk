---
phase: 03-grounded-chat-core
plan: 02
subsystem: ai
tags: [grounded-answer, retrieval, refusal, citations]
requires:
  - phase: 03-grounded-chat-core
    provides: Stable streaming chat protocol and recent context builder
provides:
  - "Context-aware retrieval query"
  - "Server-side refusal when evidence is missing or unusable"
affects: [chat, retrieval, ai]
tech-stack:
  added: []
  patterns: ["Grounded answer generation refuses before model output when there are no usable citations"]
key-files:
  created: []
  modified:
    - src/services/ai/compose-mock-answer.ts
    - src/services/ai/generate-grounded-answer.ts
    - src/features/chat/server/build-chat-response.ts
    - src/app/api/chat/route.ts
key-decisions:
  - "Use recent conversation context to expand retrieval query"
  - "Treat missing usable citations as a server-side refusal path"
patterns-established:
  - "Retrieval and answer generation now share one evidence gate"
requirements-completed: [CHAT-03, CHAT-04]
duration: session-based
completed: 2026-03-26
---

# Phase 3: Grounded Chat Core Summary

**grounded answer 现在会先检查是否存在可用证据，再决定回答还是明确拒答；检索 query 也开始利用最近会话上下文。**

## Performance

- **Duration:** session-based
- **Started:** 2026-03-26T02:15:00+08:00
- **Completed:** 2026-03-26T02:40:00+08:00
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- `buildRetrievalQuery()` 进入实际聊天链路，最近几轮文本内容会参与检索 query 生成。
- `compose-mock-answer` 和 `streamGroundedAnswer` 都加入了统一 refusal 分支。
- 如果没有任何可用 citation，服务端会直接拒答，而不是把问题继续交给模型。

## Task Commits

本轮尚未创建 git commit；会继续按“文档提交 + 代码提交”拆分方式单独提交。

## Files Created/Modified
- `src/services/ai/compose-mock-answer.ts` - 增加统一 refusal answer
- `src/services/ai/generate-grounded-answer.ts` - 在生成前验证 evidence gate
- `src/features/chat/server/build-chat-response.ts` - retrieval query 开始利用最近上下文
- `src/app/api/chat/route.ts` - 实际 chat route 使用 context-aware retrieval

## Decisions Made

- 没有可用证据时，拒答逻辑不依赖模型自觉，而是由服务端直接兜底。
- 会话上下文先参与检索 query，再参与 prompt，避免只在生成阶段才利用上下文。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `03-03` 可以继续补模型档位与聊天状态流转，不需要再改 grounded/refusal 基础协议。

---
*Phase: 03-grounded-chat-core*
*Completed: 2026-03-26*
