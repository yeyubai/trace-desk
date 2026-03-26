# Requirements: trace-desk

**Defined:** 2026-03-25
**Core Value:** 团队成员能基于可信引用，快速从文档和网页中得到可追溯的答案，而不是只看到一个“像是正确”的聊天回复。

## v1 Requirements

### Foundation

- [x] **FOUND-01**: User can open overview, import, chat, and sessions pages under one consistent workspace shell.
- [x] **FOUND-02**: Workspace clearly shows current `data mode`、`AI mode` and runtime readiness without requiring code inspection.
- [x] **FOUND-03**: Mock and live adapters share one stable UI contract so the frontend does not branch on backend mode.

### Knowledge Ingestion

- [x] **INGEST-01**: User can import `TXT / Markdown / URL` sources and see whether each source is retrievable.
- [x] **INGEST-02**: User can upload `PDF` sources and explicitly see they are stored but not yet retrievable.
- [x] **INGEST-03**: User can inspect source list and source detail to understand parse status, retrievable state, and latest update.
- [x] **INGEST-04**: Import failures return actionable UI/API feedback instead of silent failure.

### Grounded Chat

- [x] **CHAT-01**: User can ask multi-turn questions against the knowledge base from the chat workspace.
- [x] **CHAT-02**: Assistant responses preserve `parts`-friendly message structure and session history.
- [x] **CHAT-03**: When retrieval hits, answers show citations tied to source records.
- [x] **CHAT-04**: When retrieval misses, assistant explicitly states no reliable evidence was found and does not fabricate citations.
- [x] **CHAT-05**: User can choose between `Fast` and `Quality` model tiers and see which tier answered.

### Sessions & Feedback

- [x] **SESS-01**: User can reopen a past session and recover the message history needed to continue the conversation.
- [x] **SESS-02**: User can submit answer feedback and the system persists the feedback state.
- [x] **SESS-03**: Workspace can surface grounded next-step suggestions or follow-up prompts without inventing new evidence.

### Reliability & Portfolio

- [ ] **REL-01**: Import, chat, and sessions flows all have explicit loading, empty, and failure states.
- [ ] **REL-02**: Core milestone flows pass `npm run lint`, `npm run typecheck`, and `npm run build`.
- [ ] **REL-03**: Project includes demo-friendly docs, seeded scenarios, and portfolio-ready presentation material.

## v2 Requirements

### Platform Expansion

- **PLAT-01**: User can authenticate with a lightweight self-hosted auth flow.
- **PLAT-02**: Large import jobs run through queue-backed async processing.
- **PLAT-03**: Workspace includes comparative evaluation dashboards for multiple prompts/models.
- **PLAT-04**: Knowledge sources can be synced from enterprise systems beyond uploaded files and URLs.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-tenant org permissions | Increases backend complexity and is not core to the MVP knowledge workflow |
| CRM / IM / ticketing integrations | Useful later, but not required to validate grounded Q&A |
| Full OCR + deeply searchable PDF pipeline | Too much document-processing scope for the current milestone |
| Automatic model routing | Two explicit model tiers are enough for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| INGEST-01 | Phase 2 | Complete |
| INGEST-02 | Phase 2 | Complete |
| INGEST-03 | Phase 2 | Complete |
| INGEST-04 | Phase 2 | Complete |
| CHAT-01 | Phase 3 | Complete |
| CHAT-02 | Phase 3 | Complete |
| CHAT-03 | Phase 3 | Complete |
| CHAT-04 | Phase 3 | Complete |
| CHAT-05 | Phase 3 | Complete |
| SESS-01 | Phase 4 | Complete |
| SESS-02 | Phase 4 | Complete |
| SESS-03 | Phase 4 | Complete |
| REL-01 | Phase 5 | Pending |
| REL-02 | Phase 5 | Pending |
| REL-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after brownfield GSD initialization*
