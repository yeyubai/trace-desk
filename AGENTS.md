# AGENTS.md

## Purpose
- 本文件用于说明 `Codex`、其他协作代理或自动化工具在本仓库中的工作方式。
- 本文件不是项目 README，也不是变更流水账。
- 代码与文档的历史变更统一以 Git 提交记录为准。

## Source Of Truth
- 项目介绍、技术栈说明、开发入口放在 `readme.md`。
- 功能规划、阶段目标、接口与实体设计放在 `plan.md`。
- 项目内 Codex 规则统一维护在 `.codex/rules/`。

## Agent Working Rules
- 开始修改前，先阅读 `readme.md`、`plan.md` 和 `.codex/rules/` 中与当前任务相关的规则。
- 默认遵循当前项目技术路线：`Next.js App Router + React + TypeScript + shadcn/ui + Tailwind CSS + TanStack Query + react-hook-form + zod + PostgreSQL + pgvector + OSS + Redis + 阿里云百炼`。
- 默认使用 `Next.js Route Handlers` 提供接口；如无明确需要，不额外引入独立后端。
- 聊天消息结构优先按 `parts` 设计。
- 知识库问答必须支持引用来源；未命中时必须明确拒答，不能伪造依据。
- 新增依赖前先判断是否直接服务当前阶段目标，避免过早堆栈。

## Documentation Rules
- 修改技术路线、关键接口、核心实体、阶段目标时，同步更新 `plan.md`。
- 修改项目对外介绍、开发方式、文档入口时，同步更新 `readme.md`。
- 修改编码规范、架构规则、提交规范时，同步更新 `.codex/rules/`。
- 所有文档默认保持 `UTF-8` 编码。

## Git Rules
- 提交信息统一使用中文 `类型：简要说明` 格式，包括自动生成的提交信息。
- 一次提交只解决一类问题，不把功能、重构、格式化混在同一个提交里。
- 不在 `AGENTS.md` 中手工记录每次修改内容，修改记录由 Git 管理。
