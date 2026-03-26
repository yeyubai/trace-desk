# trace-desk

## What This Is

`trace-desk` 是一个面向企业团队成员的 AI 知识工作台。它围绕“导入文档与网页、建立可检索知识库、基于引用生成回答”这条主链路，练习前端主导的 AI 应用工程化能力，并沉淀为可演示的作品集项目。

## Core Value

团队成员能基于可信引用，快速从文档和网页中得到可追溯的答案，而不是只看到一个“像是正确”的聊天回复。

## Requirements

### Validated

- ✓ 已具备 `Next.js App Router + React + TypeScript + shadcn/ui + Tailwind CSS` 的工作台骨架与页面壳子 — existing
- ✓ 已提供 `workbench / chat / knowledge / feedback` 的 Route Handlers 与 mock 数据链路 — existing
- ✓ 已支持 `TXT / Markdown / URL` 导入为可检索正文分块，`PDF` 会明确标记为暂不可检索 — existing
- ✓ 已补齐 `PostgreSQL / pgvector / Redis / OSS / 阿里云百炼兼容接口` 的接入口骨架 — existing

### Active

- [ ] 进入 milestone 收尾与归档，准备下一轮真实服务化推进

### Out of Scope

- 复杂多租户、组织级权限与审批流 — 首版目标是单租户团队知识工作台
- 企业 IM / CRM / 工单系统集成 — 不属于当前 MVP 的核心价值
- 自动模型路由、复杂成本控制策略 — 先保留 `Fast / Quality` 两档即可
- 全量 PDF 深度解析与 OCR 流程 — 当前阶段只要求“可见且明确告知不可检索”

## Context

- 当前仓库已存在可运行代码和较完整的产品规划，因此这是一个 `brownfield` 的 GSD 接入，而不是从零初始化。
- 项目内已有明确技术路线与规则来源：`readme.md`、`plan.md`、`.codex/rules/`、`AGENTS.md`。
- 当前工作树存在未提交改动，说明后续 phase 执行需要严格收敛边界，避免把 GSD 规划动作和正在进行的功能开发混在一起。
- 仓库强调聊天消息按 `parts` 建模、回答必须带引用、未命中必须拒答，这些是后续所有 phase 的硬约束。

## Constraints

- **Tech stack**: `Next.js App Router + React + TypeScript + shadcn/ui + Tailwind CSS + TanStack Query + react-hook-form + zod + PostgreSQL + pgvector + OSS + Redis + 阿里云百炼` — 与项目既定路线保持一致
- **Architecture**: 默认使用 `Next.js Route Handlers` 提供接口 — 当前阶段不引入独立后端
- **Product scope**: 首版聚焦 `文档导入 + RAG 问答 + 引用展示 + 历史会话` — 避免过早平台化
- **Trustworthiness**: 未命中知识库必须明确拒答，不允许伪造引用 — 这是产品可信度底线
- **Git workflow**: 仓库提交信息必须使用中文 `类型：简要说明` — 不能直接照搬 GSD 默认英文提交格式

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 保持 `Next.js Route Handlers` 为默认服务端边界 | 当前规模以端到端可控和开发效率优先 | ✓ Good |
| 以 `.planning/` 承接 GSD 规划状态，但默认本地维护 | GSD 默认英文提交格式与仓库 Git 规范冲突 | ✓ Good |
| 本轮 milestone 聚焦 MVP 可演示链路，而非权限和平台能力 | 更符合作品集项目与当前计划节奏 | ✓ Good |
| 先把引用可信度和状态建模做扎实，再扩展工具调用与评测能力 | 可信回答比“功能堆满”更重要 | — Pending |
| 导入状态与检索状态拆成双维模型 | 避免把“已保存但不可检索”的来源误报为失败 | ✓ Good |
| 重复导入 Phase 2 先提示不合并 | 在 mock 阶段优先保证透明反馈而不是复杂覆盖逻辑 | ✓ Good |
| 聊天链路先稳定 NDJSON 流式协议和最近上下文，再继续深化 grounded answer | 先把消息契约和会话 continuity 打稳，后续增强才不会返工 | ✓ Good |
| grounded answer 先由服务端做证据门控 | 没有可用 citation 时直接拒答，比依赖模型自觉更稳 | ✓ Good |
| 模型档位感知与聊天状态展示放在交互层闭环 | 不扩展协议也能让用户理解当前档位与回答状态 | ✓ Good |
| 会话与反馈 mock 数据改为文件持久化 | 只有跨请求共享状态，历史会话和反馈闭环才算真实可测 | ✓ Good |
| 导入来源必须暴露抽取 diagnostics | 企业级 RAG 需要解释“为什么导入后问不到”，不能只给成功提示 | ✓ Good |
| LangChain.js 从 chunking 层开始逐步接入 | 先替换最核心的文档切块环节，再扩展到更完整生态 | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone**:
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-26 after Phase 5 complete*
