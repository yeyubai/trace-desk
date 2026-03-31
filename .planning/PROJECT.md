# trace-desk

## What This Is

`trace-desk` 是一个面向企业团队成员的 AI 知识工作台。它围绕“导入文档与网页、建立可检索知识库、基于引用生成回答、把问答沉淀为团队资产”这条主链路，练习前端主导的 AI 应用工程化能力，并沉淀为可持续演进的作品集项目。

## Core Value

团队成员能够基于可追溯引用，快速从文档和网页中得到可信答案；并且当系统答不上来时，失败不会被浪费，而是能转化为知识治理和业务改进动作。

## Current Milestone: v1.1 RAG 业务闭环优化

**Goal:** 把当前“可信 RAG 底座”推进成“业务价值更清晰、失败可转化、知识可治理、回答可复用”的团队知识工作流。

**Target features:**
- 聚焦一个高价值业务场景，重写产品价值叙事、入口和验收方式
- 为来源与引用补齐治理语义，例如负责人、时效性、可信级别与冲突提示
- 为未命中和低置信回答补齐转化闭环，沉淀为待补知识或审核任务
- 让回答产物能被团队复用，并开始观察业务采纳与缺口趋势

## Requirements

### Validated

- 已具备 `Next.js App Router + React + TypeScript + shadcn/ui + Tailwind CSS` 的工作台骨架与页面壳
- 已提供 `workbench / chat / knowledge / feedback` 的 Route Handlers 与真实 RAG 接口入口
- 已支持 `TXT / Markdown / URL` 导入为可检索正文分块，`PDF` 会明确标记为已存储但未必可检索
- 已建立 `导入 -> 检索 -> grounded answer -> 引用展示 -> 会话反馈` 的基础可信链路
- 已完成 Phase 6：默认业务场景、入口文案、任务路径与业务指标契约已经对齐

### Active

- [ ] 建立知识治理模型，让来源“能引用”进一步升级为“可管理、可审查、可更新”
- [ ] 打通未命中、低置信和反馈回流路径，把失败问答转化为后续知识建设任务
- [ ] 让回答产物能被团队复用，并开始观察业务采纳与缺口趋势

### Out of Scope

- 多租户组织权限与审批流
- CRM / IM / 工单系统等外部企业集成
- 全量 OCR 与重型 PDF 深度解析平台
- 自动模型路由与复杂成本控制
- 与当前业务闭环目标无直接关系的平台化能力堆叠

## Context

- 当前仓库已经完成 `v1.0 MVP`，并在 `.planning/milestones/` 中保留了已归档的路线与需求。
- 用户最新反馈指出，系统的主要短板不在“是否能做 RAG”，而在“是否有清晰的业务抓手与持续使用理由”。
- `.planning/todos/pending/2026-03-26-rag-unified-design-and-import-audit.md` 与 `.planning/todos/pending/2026-03-31-rag-business-loop-and-governance.md` 共同作为本里程碑输入。
- `Phase 6` 已完成，当前产品默认以“团队知识答疑与标准回复生成”作为统一业务场景。

## Constraints

- **Tech stack**: 继续使用既定技术栈，避免为业务问题引入新的基础设施复杂度。
- **Architecture**: 默认仍由 `Next.js Route Handlers` 提供接口，不拆独立后端。
- **Product scope**: 本轮优先补“场景、治理、闭环、复用、指标”，不是继续横向铺更多来源或平台功能。
- **Trustworthiness**: 未命中时必须明确拒答，不允许伪造引用；新增业务闭环能力不能破坏现有可信约束。
- **Git workflow**: 仓库提交信息继续使用中文 `类型：简要说明` 格式。

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| `v1.1` 先做业务闭环优化，而不是平台扩张 | 当前最大短板是价值叙事和团队复用，而不是功能数量 | Good |
| 延续 phase 编号，从 Phase 6 开始 | 保持里程碑历史连续，便于追踪 v1.0 到 v1.1 的演进 | Good |
| 先聚焦一个默认业务场景，再讨论多场景扩展 | 不聚焦场景会让需求、指标和 UI 都继续发散 | Good |
| 治理、未命中转化和回答复用应与 RAG 统一设计待办并行推进 | 可信回答和业务闭环不能分裂成两套产品心智 | Pending |
| 概览、导入、问答、会话与文档必须使用同一套业务语言 | 客户只会信任一条清晰一致的工作流 | Good |

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
*Last updated: 2026-04-01 after completing Phase 6*
