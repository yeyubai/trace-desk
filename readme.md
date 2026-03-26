# Team Knowledge Q&A Workbench

## 项目简介
- 项目目标：构建一个面向企业团队的 AI 知识工作台，重点练习前端主导的 AI 落地能力，并沉淀为作品集项目。
- 产品方向：让用户上传文档、抓取网页、建立知识库，并通过 AI 问答助手进行多轮问答、引用追溯、总结提炼和行动建议生成。
- 首版重点：`文档导入 + RAG 问答 + 引用展示 + 历史会话`

## 技术栈
- 前端：`Next.js App Router + React + TypeScript`
- UI：`shadcn/ui + Tailwind CSS`
- 前端数据层：`TanStack Query`
- 表单与校验：`react-hook-form + zod`
- AI：阿里云百炼；Node.js 侧优先通过兼容接口接入
- RAG 编排：`LangChain.js`（当前已先接入 `Document + TextSplitter`）
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

## 当前实现
- 已完成 `Next.js App Router` 项目初始化，并直接在当前仓库根目录落项目结构。
- 已搭好首版工作台页面骨架：知识库概览、来源导入、问答区、历史会话、运行时接入状态。
- 已提供 mock 数据链路与 Route Handlers：`/api/workbench`、`/api/chat`、`/api/knowledge/*`、`/api/feedback`。
- `TXT / Markdown / URL` 导入现已写入可检索正文分块；`PDF` 仍仅记录来源并标记为暂不可检索。
- 已补真实服务接入口骨架：环境变量校验、`PostgreSQL/pgvector` 初始化 SQL、百炼兼容客户端、Redis 客户端、OSS 客户端。
- 历史会话恢复、反馈持久化、继续追问建议已打通。
- 导入后的来源详情已支持显示 `抽取策略 / 正文长度 / chunk 预览 / 诊断告警`，便于判断“为什么导入后可能问不到”。
- 切块链路已开始切到 `LangChain.js`，当前优先落在 `Document + RecursiveCharacterTextSplitter / MarkdownTextSplitter`。

## 当前 RAG 能力
当前项目已经具备企业级 RAG 所需的基础分层，但仍处于持续收敛中：

1. **Ingestion**
   - 支持 `TXT / Markdown / URL / PDF`
   - URL 导入会暴露正文抽取策略、正文长度和 chunk 诊断

2. **Chunking**
   - 当前已开始使用 `LangChain.js` splitter
   - 每个来源会保留 chunk 预览与关键词样本

3. **Retrieval**
   - 仅 `retrievable` 来源进入检索
   - `thin`、`body-fallback` 这类低质量来源会被降权

4. **Answering**
   - 回答必须带引用
   - 证据不足时由服务端明确拒答，不依赖模型自由发挥

5. **Observability**
   - 用户可以在来源详情看到导入诊断
   - 当前已能解释“导入了为什么还问不到”的一部分原因

## 最小验收路径
推荐用下面这条链路验证当前系统是否真正可用：

1. 在 `/import` 导入一条网页链接
2. 打开该来源详情，确认：
   - `抽取策略`
   - `正文长度`
   - `chunk 预览`
   - `诊断告警`
3. 到 `/chat` 针对该来源正文提问
4. 观察是否：
   - 命中该来源并展示引用
   - 或明确拒答并给出可解释原因

## 本地开发
1. 安装依赖：`npm install`
2. 复制环境变量模板：将 `.env.example` 内容写入 `.env.local`
3. 启动开发环境：`npm run dev`
4. 常用校验：
   - `npm run lint`
   - `npm run typecheck`
   - `npm run build`

## 环境变量说明
- `APP_DATA_MODE`
  - `mock`：当前默认模式，页面使用内存中的示例数据
  - `live`：为接真实数据库保留的模式
- `APP_AI_MODE`
  - `mock`：当前默认模式，回答由本地 mock 编排生成
  - `bailian`：接阿里云百炼兼容接口，需要配置 `BAILIAN_API_KEY`
- 其他真实服务配置：
  - `DATABASE_URL`
  - `REDIS_URL`
  - `OSS_REGION`
  - `OSS_BUCKET`
  - `OSS_ACCESS_KEY_ID`
  - `OSS_ACCESS_KEY_SECRET`
  - `AI_FAST_MODEL`
  - `AI_QUALITY_MODEL`
  - `BAILIAN_BASE_URL`
  - `BAILIAN_API_KEY`

## 文档入口
- 规划文档：`plan.md`
- Spec 文档：`specs/`
- Codex 项目规则：`.codex/rules/`
- 协作代理说明：`AGENTS.md`

## 说明
- `readme.md` 用于记录项目介绍、技术路线和开发入口。
- 变更历史以 Git 提交记录为准，不在 `readme.md` 或 `AGENTS.md` 中逐条维护流水账。
