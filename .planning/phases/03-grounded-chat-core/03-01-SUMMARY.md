---
phase: 03-grounded-chat-core
plan: 01
subsystem: chat
tags: [streaming, context, ndjson, parts]
requires:
  - phase: 01-foundation-stabilization
    provides: Workbench snapshot contract and stable dashboard shell
  - phase: 02-knowledge-ingestion-experience
    provides: Source detail view for citation drill-down
provides:
  - "NDJSON chat stream protocol"
  - "Recent conversation context builder"
  - "Chat UI support for stop, retry, and citation selection"
affects: [chat, workbench, ai, retrieval]
tech-stack:
  added: []
  patterns: ["Chat route and client hook communicate via explicit stream events instead of one-shot JSON"]
key-files:
  created:
    - src/features/chat/server/build-chat-context.ts
  modified:
    - src/features/chat/types/chat.ts
    - src/features/chat/server/build-chat-response.ts
    - src/app/api/chat/route.ts
    - src/features/chat/hooks/useChatMutations.ts
    - src/features/chat/components/ChatWorkspace.tsx
    - src/features/chat/components/ChatMessageCard.tsx
    - src/features/chat/components/MessageComposer.tsx
    - src/app/(dashboard)/chat/page.tsx
    - src/features/workbench/components/WorkbenchShell.tsx
key-decisions:
  - "Chat stream uses init/delta/complete/error protocol"
  - "Recent conversation context only includes recent text parts"
patterns-established:
  - "Citation clicks route through the workbench shell into the source detail panel"
requirements-completed: [CHAT-01, CHAT-02]
duration: session-based
completed: 2026-03-26
---

# Phase 3: Grounded Chat Core Summary

**聊天链路现在具备显式流式协议、最近会话上下文拼装和引用点击联动，为 grounded answer 主链路打下了第一层稳定基础。**

## Performance

- **Duration:** session-based
- **Started:** 2026-03-26T01:35:00+08:00
- **Completed:** 2026-03-26T02:05:00+08:00
- **Tasks:** 4
- **Files modified:** 9

## Accomplishments
- `ChatStreamEvent` 统一了 `/api/chat` 与客户端之间的 NDJSON 协议。
- 新增 `build-chat-context.ts`，把最近几轮文本消息转成轻量 prompt 上下文。
- 聊天界面支持停止生成、重新生成、自动滚动和引用点击查看来源详情。
- Chat page 布局更稳定，消息气泡和 composer 也更适合流式对话场景。

## Task Commits

本轮尚未创建 git commit；当前代码和 planning 文件已通过校验，后续将按“文档/代码拆分提交”的方式单独提交。

## Files Created/Modified
- `src/features/chat/server/build-chat-context.ts` - 最近对话上下文构建
- `src/features/chat/types/chat.ts` - 增加流式 chat event 定义
- `src/features/chat/server/build-chat-response.ts` - 支持 draft message 与稳定消息 id
- `src/app/api/chat/route.ts` - 切换到 NDJSON 流式响应
- `src/features/chat/hooks/useChatMutations.ts` - 客户端消费流式事件并更新缓存
- `src/features/chat/components/ChatWorkspace.tsx` - 支持 stop/retry/citation selection
- `src/features/chat/components/ChatMessageCard.tsx` - 引用可点击
- `src/features/chat/components/MessageComposer.tsx` - 更贴近聊天输入的交互形态
- `src/app/(dashboard)/chat/page.tsx` - 聊天页布局稳定

## Decisions Made

- 最近上下文先只带入最近 2-4 条文本内容，不引入摘要压缩。
- 引用交互优先落到现有来源详情面板，而不是额外造一个引用弹层。

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `03-02` 可以在现有流式协议上继续把 grounded answer 与检索结果联到更强。
- `03-03` 可以继续补模型档位与聊天状态流转体验。

---
*Phase: 03-grounded-chat-core*
*Completed: 2026-03-26*
