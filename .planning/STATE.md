# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-25)

**Core value:** 团队成员能基于可信引用，快速从文档和网页中得到可追溯的答案，而不是只看到一个“像是正确”的聊天回复。
**Current focus:** Reliability & Portfolio Finish

## Current Position

Current Phase: 5
Current Phase Name: Reliability & Portfolio Finish
Total Phases: 5
Current Plan: 2
Total Plans in Phase: 3
Status: In progress
Last Activity: 2026-03-26 — Completed Phase 5 plan 05-02 and introduced LangChain-based chunking
Last Activity Description: Retrieval now uses diagnostics-aware quality rules and refusal hints; next step is 05-03.
Progress: 93%

## Performance Metrics

**Velocity:**
- Total plans completed: 14
- Average duration: session-based
- Total execution time: session-based

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 3 | session-based | session-based |
| 2 | 3 | session-based | session-based |
| 3 | 3 | session-based | session-based |
| 4 | 3 | session-based | session-based |
| 5 | 2 | session-based | session-based |

**Recent Trend:**
- Last 5 plans: 03-03, 04-01, 04-02/03, 05-01, 05-02
- Trend: Improving

## Decisions Made

| Phase | Decision | Rationale |
|-------|----------|-----------|
| Init | Keep `Next.js Route Handlers` as the default backend boundary | Aligns with `plan.md` and the existing codebase |
| Init | Treat `.planning/` as local-only GSD state | Avoids stock GSD English planning commits conflicting with repo rules |
| Init | Start with a focused 5-phase `v1.0` milestone | Matches the current brownfield maturity better than a greenfield reset |
| 1 | Centralize `WorkbenchSnapshot` parsing across server and client consumers | Reduce mock/live contract drift before deeper feature work |
| 1 | Surface runtime mode and readiness in the shared dashboard shell | Every workspace page should expose current operating mode without extra navigation |
| 1 | Compute runtime readiness summary on the server side | Keep UI wording and dependency counts consistent across components |
| 2 | Separate ingestion state from retrieval state | Users need to know whether a source was saved versus whether it can answer questions |
| 2 | Let duplicate imports through but mark them clearly | Transparent feedback is lower risk than auto-merge in the current mock stage |
| 2 | Show import results inline and auto-focus the newest source | Reduces ambiguity after upload/import actions |
| 3 | Use explicit `init / delta / complete / error` events for chat streaming | Keeps route, hook, and UI aligned on one protocol |
| 3 | Feed only recent text messages into prompt context | Balances continuity with prompt size and implementation cost |
| 3 | Open source detail when a citation is clicked | Reuses the Phase 2 detail surface instead of creating a new overlay |
| 3 | Build retrieval query from recent context plus current question | Improves follow-up retrieval without introducing full history bloat |
| 3 | Refuse server-side when there are no usable citations | Prevents the model from answering with unsupported evidence |
| 3 | Show model tier and workspace state explicitly in the chat UI | Users should always understand what mode answered and whether the answer is retrying, refusing, or complete |
| 4 | Persist mock workbench state to disk | In-memory state was not reliable across requests, breaking feedback/session verification |
| 4 | Use Sessions page as a conversation console | History list, session summary, followups, and continue action belong together |
| 5 | Add extraction diagnostics to imported sources | RAG reliability requires import-stage observability, not just downstream refusal |
| 5 | Introduce LangChain from the chunking layer | It is the safest first slice to move the stack from demo logic toward an enterprise RAG workflow |

## Pending Todos

- 1 pending todo - see `.planning/todos/pending/2026-03-26-rag-unified-design-and-import-audit.md`

## Blockers

- 当前工作树已有未提交改动；执行 phase 时要先确认写入范围
- 仓库仍存在多处与 Phase 1 无关的未提交改动，后续 phase 执行时要继续控制写入范围

## Session

Last Date: 2026-03-26 23:20
Stopped At: Phase 5 plan 05-02 completed with LangChain chunking and retrieval quality rules; next recommended command is to continue Phase 5 execution
Resume File: None
