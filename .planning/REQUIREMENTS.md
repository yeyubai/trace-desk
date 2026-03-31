# Requirements: trace-desk

**Defined:** 2026-03-31
**Milestone:** v1.1 RAG 业务闭环优化
**Core Value:** 团队成员不仅能获得可追溯答案，还能把未命中、反馈和优质回答转化为持续改进的团队知识资产。

## Existing Baseline

- [x] 用户可以导入 `TXT / Markdown / URL` 来源并查看是否可检索
- [x] 用户可以在聊天区得到带引用的 grounded answer，未命中时明确拒答
- [x] 用户可以恢复历史会话并提交反馈
- [x] 工作台已经具备基础的导入诊断、引用展示与会话闭环

## v1.1 Requirements

### Business Focus

- [x] **BIZ-01**: User can enter the workspace through one clearly framed business scenario instead of a generic “knowledge Q&A” shell.
- [x] **BIZ-02**: User can understand what the current scenario is optimizing, which sources matter most, and what a successful answer looks like.

### Governance

- [ ] **GOV-01**: User can see source ownership, freshness, and trust level in source detail and citation-related views.
- [ ] **GOV-02**: User can tell when a source is stale, weak, or conflicting before treating it as strong evidence.

### Miss Loop & Feedback

- [ ] **LOOP-01**: User can turn a retrieval miss or refusal into a structured knowledge gap record instead of losing the question.
- [ ] **LOOP-02**: User can route misses and answer feedback into a visible review or source-update queue.

### Actionability & Collaboration

- [ ] **ACT-01**: User can convert a grounded answer into reusable outputs such as summary, action items, or standard reply drafts.
- [ ] **COL-01**: User can promote a grounded answer into a reusable team artifact instead of leaving value trapped in a single session.

### Metrics & Coverage

- [x] **MET-01**: User can see business-facing metrics such as answer adoption, accepted answers, and recurring knowledge gaps in addition to RAG quality signals.
- [ ] **COV-01**: Product explicitly defines which enterprise source types are first-class retrievable content in this milestone, including the business boundary for `PDF`.

## Future Requirements

- **PLAT-01**: User can authenticate with a lightweight self-hosted auth flow.
- **PLAT-02**: Large import jobs run through queue-backed async processing.
- **PLAT-03**: Workspace includes comparative evaluation dashboards for multiple prompts/models.
- **PLAT-04**: Knowledge sources can be synced from enterprise systems beyond uploaded files and URLs.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-tenant org permissions | Still not required to validate the business-loop milestone |
| CRM / IM / ticketing integrations | Valuable later, but not needed to prove the new workflow |
| Full OCR + deeply searchable PDF pipeline | Too large for this milestone; boundary definition comes first |
| Automatic model routing | Explicit model tiers remain sufficient for now |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BIZ-01 | Phase 6 | Complete |
| BIZ-02 | Phase 6 | Complete |
| MET-01 | Phase 6 | Complete |
| GOV-01 | Phase 7 | Planned |
| GOV-02 | Phase 7 | Planned |
| LOOP-01 | Phase 7 | Planned |
| LOOP-02 | Phase 7 | Planned |
| COV-01 | Phase 7 | Planned |
| ACT-01 | Phase 8 | Planned |
| COL-01 | Phase 8 | Planned |

**Coverage:**
- v1.1 requirements: 10 total
- Mapped to phases: 10
- Unmapped: 0

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-04-01 after Phase 6 complete*
