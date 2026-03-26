# Roadmap: trace-desk

## Overview

这轮 roadmap 把 `trace-desk` 从“已有骨架和部分真实接入口”的状态，推进到“可演示、可验证、可继续迭代”的 `v1.0 MVP`。阶段拆分遵循当前项目的真实基线：先稳住壳子和契约，再补知识导入与 grounded chat，随后完善会话反馈闭环，最后做可靠性与作品集收尾。

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation Stabilization** - 统一页面壳子、状态契约与 mock/live 边界
- [x] **Phase 2: Knowledge Ingestion Experience** - 补齐来源导入、来源详情和导入错误反馈
- [ ] **Phase 3: Grounded Chat Core** - 打通 grounded answer、引用展示和模型档位链路
- [x] **Phase 4: Sessions & Feedback Loop** - 完成历史会话恢复、反馈闭环与追问建议
- [ ] **Phase 5: Reliability & Portfolio Finish** - 完成可靠性自测、空态异常态与作品集收尾

## Phase Details

### Phase 1: Foundation Stabilization
**Goal**: 把现有页面骨架整理成稳定的工作台基础，统一导航、运行时状态和前后端契约，为后续 phase 减少返工。
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03
**Success Criteria** (what must be TRUE):
  1. User can enter overview, import, chat, and sessions pages with one consistent shell and no broken navigation.
  2. Runtime status surfaces current data mode, AI mode, and service readiness without requiring developer-only context.
  3. Mock and live adapters expose one stable response contract for workbench, knowledge, and chat flows.
**Plans**: 3 plans

Plans:
- [x] 01-01: 审计当前工作台壳子与接口返回结构，补齐 phase 级基线说明
- [x] 01-02: 统一 dashboard shell、顶部导航与运行时状态展示
- [x] 01-03: 对齐 mock/live 数据契约与输入校验，清理后续 phase 的边界风险

### Phase 2: Knowledge Ingestion Experience
**Goal**: 让知识导入真正可被理解和验证，而不只是“表面能提交”。用户需要清楚知道来源是否可检索、为什么失败、当前状态如何。
**Depends on**: Phase 1
**Requirements**: INGEST-01, INGEST-02, INGEST-03, INGEST-04
**Success Criteria** (what must be TRUE):
  1. User can import `TXT / Markdown / URL` sources and immediately看到是否可检索。
  2. User can upload `PDF` and明确看到“已记录但暂不可检索”的状态提示。
  3. User can inspect source list/detail and understand parse status, retrievable state, and error feedback.
**Plans**: 3 plans

Plans:
- [x] 02-01: 完成导入表单、上传/抓取接口与结果状态的统一建模
- [x] 02-02: 强化来源列表与详情视图，展示 retrievable、chunk、error 等关键信息
- [x] 02-03: 补齐导入失败、重复导入、不可检索来源的明确反馈

### Phase 3: Grounded Chat Core
**Goal**: 打通“检索 -> 引用组装 -> 回答展示”核心链路，让问答区真正体现 grounded answer 能力，而不是普通聊天壳子。
**Depends on**: Phase 1, Phase 2
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05
**Success Criteria** (what must be TRUE):
  1. User can ask multi-turn questions against the knowledge base from the chat workspace.
  2. Answers render with citations tied to source records when retrieval succeeds.
  3. When retrieval fails, the assistant explicitly refuses or states that no reliable evidence was found.
  4. User can see which model tier answered and continue the conversation with the same session context.
**Plans**: 3 plans

Plans:
- [x] 03-01: 统一 chat message `parts`、会话上下文与问答请求/响应结构
- [x] 03-02: 完成 grounded answer 服务端链路与引用展示
- [x] 03-03: 补齐模型档位切换、未命中拒答与 chat 状态流转

### Phase 4: Sessions & Feedback Loop
**Goal**: 把一次回答扩展成可继续追问、可回看、可评价的会话闭环，让工作台更接近真实产品使用场景。
**Depends on**: Phase 3
**Requirements**: SESS-01, SESS-02, SESS-03
**Success Criteria** (what must be TRUE):
  1. User can reopen a previous session and recover enough history to continue.
  2. User can submit feedback for an answer and the UI reflects stored feedback state.
  3. User can see grounded next-step suggestions or follow-up prompts that do not invent new evidence.
**Plans**: 3 plans

Plans:
- [x] 04-01: 打通历史会话读取与会话侧栏恢复链路
- [x] 04-02: 完成反馈提交、反馈状态展示与会话内联更新
- [x] 04-03: 补齐 grounded follow-up / next-step suggestion 的展示与约束

### Phase 5: Reliability & Portfolio Finish
**Goal**: 用可验证的自测、异常态和演示资料，把项目从“能跑”推进到“能展示、能解释、能交付”。
**Depends on**: Phase 2, Phase 3, Phase 4
**Requirements**: REL-01, REL-02, REL-03
**Success Criteria** (what must be TRUE):
  1. Import, chat, and sessions flows all expose explicit loading, empty, and failure states.
  2. The project passes `npm run lint`, `npm run typecheck`, and `npm run build` for milestone scope.
  3. Demo data, docs, and presentation assets are ready for portfolio use.
**Plans**: 3 plans

Plans:
- [x] 05-01: 补齐关键空态、失败态、长会话/长列表等可靠性细节
- [x] 05-02: 跑通 lint/typecheck/build 与核心手动验证清单
- [ ] 05-03: 完成 README/演示脚本/作品集说明等收尾物料

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation Stabilization | 3/3 | Complete | 2026-03-26 |
| 2. Knowledge Ingestion Experience | 3/3 | Complete | 2026-03-26 |
| 3. Grounded Chat Core | 3/3 | Complete | 2026-03-26 |
| 4. Sessions & Feedback Loop | 3/3 | Complete | 2026-03-26 |
| 5. Reliability & Portfolio Finish | 2/3 | In progress | - |
