# Team Knowledge Copilot Workbench

## 项目简介
- 项目目标：构建一个面向企业团队的 AI 知识工作台，重点练习前端主导的 AI 落地能力，并沉淀为作品集项目。
- 产品方向：让用户上传文档、抓取网页、建立知识库，并通过 AI Copilot 进行多轮问答、引用追溯、总结提炼和行动建议生成。
- 首版重点：`文档导入 + RAG 问答 + 引用展示 + 历史会话`

## 技术栈
- 前端：`Next.js App Router + React + TypeScript`
- UI：`shadcn/ui + Tailwind CSS`
- 前端数据层：`TanStack Query`
- 表单与校验：`react-hook-form + zod`
- AI：阿里云百炼；Node.js 侧优先通过兼容接口接入
- 数据库：`PostgreSQL`
- 向量检索：`pgvector`
- 对象存储：阿里云 `OSS`
- 缓存与任务：`Redis`，需要时补 `BullMQ`

## 产品优先级
- 首版优先实现文档导入、RAG 问答、引用展示、历史会话。
- 产品目标是练习 AI 应用工程化能力，不优先追求复杂商业化能力。
- 方案尽量贴近国内常见技术栈，避免依赖海外一体化 BaaS 作为核心后端。

## 工程约定
- 默认使用 `Next.js` Route Handlers 提供接口，后续如复杂度升高再拆分独立后端。
- 聊天消息结构优先按多段 `parts` 设计，而不是只用单一字符串。
- 回答必须支持引用来源；未命中知识库时必须明确拒答，不能伪造依据。
- 长会话、流式 Markdown、工具调用状态是前端实现重点，相关状态流转要显式设计。
- 新增依赖前优先判断是否直接服务于当前阶段目标，避免过早堆栈。

## 文档入口
- 规划文档：`PLAN.md`
- Codex 项目规则：`.codex/rules/`
- 协作代理说明：`AGENTS.md`

## 说明
- `README.md` 用于记录项目介绍、技术路线和开发入口。
- 变更历史以 Git 提交记录为准，不在 `README.md` 或 `AGENTS.md` 中逐条维护流水账。
