# Phase 1: Foundation Stabilization - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

本 phase 只处理工作台基础层：统一 dashboard 壳子、把运行时模式与依赖 readiness 暴露到页面、并为 `workbench` / import / chat 的基础数据契约增加显式校验。它不进入知识导入细节、grounded answer 逻辑或反馈闭环实现。

</domain>

<decisions>
## Implementation Decisions

### 工作台壳子
- **D-01:** 保持 `src/app/(dashboard)/layout.tsx` 作为统一壳子入口，不引入额外布局层。
- **D-02:** 顶部导航保持现有信息架构，但补一个跨页面状态条来展示运行时模式与 readiness。

### 运行时状态
- **D-03:** 运行时状态需要直接面向产品使用者表达，不只是裸露 `configured/missing/mock` 枚举值。
- **D-04:** `RuntimeOverview` 增加机器可消费的 summary，避免多个组件各自重复推导 readiness。

### 数据契约
- **D-05:** `WorkbenchSnapshot` 作为工作台主契约，需要在服务端输出和客户端消费两侧都校验。
- **D-06:** Phase 1 先把 `workbench` 相关返回结构稳定下来，并把知识导入返回的 snapshot 一并接入同一个 parser。

### the agent's Discretion
- 状态条的微文案和布局细节
- runtime 面板里摘要与明细的呈现方式

</decisions>

<specifics>
## Specific Ideas

- 所有 dashboard 子页都应该能看到“当前是 mock 还是 live、哪些依赖已就绪、当前知识库有多少来源/会话”。
- 工作台契约校验优先使用 `zod`，因为项目已经把它作为既有依赖。
- 不为了 Phase 1 引入新依赖或改动复杂 chat / retrieval 业务逻辑。

</specifics>

<canonical_refs>
## Canonical References

### 项目约束
- `readme.md` — 当前项目定位、技术栈、工程约定
- `plan.md` — MVP 范围、阶段目标、首版核心链路
- `AGENTS.md` — 仓库协作规则、中文提交规范、GSD 本地规划约束

### Codex 规则
- `.codex/rules/architecture.md` — 目录边界与服务层约束
- `.codex/rules/react-next-style.md` — App Router / React 风格约束
- `.codex/rules/typescript-quality.md` — 类型与校验质量约束

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/features/workbench/components/DashboardTopBar.tsx`: 已有跨页面导航，可继续承接统一壳子
- `src/features/runtime/components/RuntimeStatusPanel.tsx`: 已有 runtime 可视化组件，但当前未接入页面
- `src/features/workbench/server/getWorkbenchSnapshot.ts`: 现有工作台聚合数据入口
- `src/lib/api.ts`: 统一 fetch helper，适合补 parser 支持

### Established Patterns
- 页面层通过 `getWorkbenchSnapshot()` 提供 `initialSnapshot`，客户端用 `useWorkbenchSnapshotQuery()` 接续更新
- 类型已按 feature 拆分，适合继续以 schema 文件方式补契约校验

### Integration Points
- `src/app/(dashboard)/layout.tsx` 负责统一状态条挂载
- `src/features/workbench/hooks/useWorkbenchSnapshotQuery.ts` 与 `src/features/knowledge/hooks/useKnowledgeMutations.ts` 负责客户端 snapshot 消费
- `src/app/api/workbench/route.ts`、`src/app/api/knowledge/*`、`src/app/api/chat/route.ts` 依赖 `getWorkbenchSnapshot()` 作为返回基线

</code_context>

<deferred>
## Deferred Ideas

- 导入失败的细粒度错误态与来源详情增强留到 Phase 2
- grounded answer / 引用真实性与拒答链路留到 Phase 3
- 历史会话恢复与反馈闭环留到 Phase 4

</deferred>

---

*Phase: 01-foundation-stabilization*
*Context gathered: 2026-03-25*
