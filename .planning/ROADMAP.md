# Roadmap: trace-desk

## Overview

这一轮 roadmap 将 `trace-desk` 从“可信的 RAG 工作台”推进到“业务价值更清晰、失败可沉淀、知识可治理、回答可复用”的 `v1.1` 里程碑。路线不再优先扩平台，而是先把场景、治理、闭环和复用这四条业务主线补完整。

## Phases

**Phase Numbering:**
- Integer phases (6, 7, 8): Planned milestone work
- Decimal phases (6.1, 6.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 6: Business Scenario & Value Definition** - 明确主场景、价值叙事、成功标准与业务指标
- [ ] **Phase 7: Governance & Miss Capture Loop** - 为来源和未命中补齐治理状态、缺口沉淀与回流机制
- [ ] **Phase 8: Actionable Answers & Team Reuse** - 让 grounded answer 产出可复用的团队资产与行动结果

## Phase Details

### Phase 6: Business Scenario & Value Definition
**Goal**: 让工作台从“通用知识问答”切到“有明确业务目标的知识工作流”，先把场景、价值叙事、成功标准和基础业务指标对齐。
**Depends on**: v1.0 shipped baseline
**Requirements**: BIZ-01, BIZ-02, MET-01
**Success Criteria** (what must be TRUE):
  1. User enters the product through a clearly stated business scenario instead of a generic shell.
  2. Workspace explains what counts as a good answer, which sources matter, and why this workflow saves time.
  3. Product docs and runtime copy align on the same business story and milestone scope.
  4. The team has a first set of business-facing metrics to track adoption, acceptance, and gap frequency.
**Plans**: 3 plans

Plans:
- [x] 06-01: 定义默认业务场景、价值叙事和验收口径
- [x] 06-02: 对齐工作台入口文案、关键状态和产品文档
- [x] 06-03: 定义业务指标、漏斗和最小观测契约

### Phase 7: Governance & Miss Capture Loop
**Goal**: 让来源和回答从“能引用”进一步升级为“可治理、可追责、可持续改进”，并把未命中变成后续工作入口。
**Depends on**: Phase 6
**Requirements**: GOV-01, GOV-02, LOOP-01, LOOP-02, COV-01
**Success Criteria** (what must be TRUE):
  1. User can distinguish strong, weak, stale, or conflicting sources before trusting them.
  2. Retrieval misses and low-confidence outcomes can be captured as structured gaps instead of being discarded.
  3. Feedback, misses, and source updates flow into one understandable review loop.
  4. The milestone clearly defines which source types are in-scope for reliable retrieval, including the `PDF` boundary.
**Plans**: 3 plans

Plans:
- [ ] 07-01: 设计来源治理语义与展示契约
- [ ] 07-02: 打通未命中转化、反馈回流与待补知识队列
- [ ] 07-03: 收敛来源覆盖边界并明确 PDF 处理策略

### Phase 8: Actionable Answers & Team Reuse
**Goal**: 让回答结果从“看完即走”变成“可复用、可传播、可驱动下一步动作”的团队工作资产。
**Depends on**: Phase 6, Phase 7
**Requirements**: ACT-01, COL-01
**Success Criteria** (what must be TRUE):
  1. User can transform a grounded answer into structured outputs such as summary, action items, or standard reply drafts.
  2. User can preserve and reuse high-quality answers beyond a single session.
  3. The product reinforces a team workflow, not just an individual chat interaction.
**Plans**: 3 plans

Plans:
- [ ] 08-01: 定义回答产物类型与结构化输出契约
- [ ] 08-02: 设计团队复用与沉淀入口
- [ ] 08-03: 补齐复用链路的验证与展示

## Progress

**Execution Order:**
Phases execute in numeric order: 6 -> 7 -> 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 6. Business Scenario & Value Definition | 3/3 | Complete | 2026-04-01 |
| 7. Governance & Miss Capture Loop | 0/3 | Not started | - |
| 8. Actionable Answers & Team Reuse | 0/3 | Not started | - |

---
*Roadmap updated: 2026-04-01 after completing Phase 6*
