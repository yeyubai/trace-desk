# Phase 3: Grounded Chat Core - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the defaults chosen during autonomous continuation.

**Date:** 2026-03-26
**Phase:** 03-grounded-chat-core
**Areas discussed:** 请求与消息结构, 会话上下文, 回答呈现

---

## 请求与消息结构

| Option | Description | Selected |
|--------|-------------|----------|
| parts + stream events | 继续沿用 parts，并把 chat 流式协议显式建模 | ✓ |
| content string only | 简化结构但不利于状态/引用扩展 | |

**User's choice:** 按推荐默认值继续
**Notes:** 以 `init / delta / complete / error` 作为最小流式协议。

---

## 会话上下文

| Option | Description | Selected |
|--------|-------------|----------|
| 最近 2-4 条文本上下文 | 成本低、实现稳 | ✓ |
| 全量历史 | 成本高且容易失控 | |
| 先做摘要压缩 | 过早复杂化 | |

**User's choice:** 按推荐默认值继续
**Notes:** 先做轻量上下文拼接，不在本 step 引入摘要压缩。

---

## 回答呈现

| Option | Description | Selected |
|--------|-------------|----------|
| 流式 + 停止/重试 + 引用点开详情 | 最贴合当前 Phase 3 目标 | ✓ |
| 只做流式，不处理引用联动 | 体验不完整 | |

**User's choice:** 按推荐默认值继续
**Notes:** 引用点击直接联动来源详情。
