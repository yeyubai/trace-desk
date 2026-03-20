# 竞品研究：团队知识问答工作台

## 文档信息
- 研究主题：团队知识库 / Enterprise Search / AI 问答工作台
- 研究日期：2026-03-20
- 研究目标：提炼同类产品在页面结构、核心能力、信任机制上的共性，为 `Trace Desk` 首版 spec 提供依据

## 研究范围
本次优先参考 5 类与本项目最接近的产品：

1. Glean
2. Notion Enterprise Search
3. Atlassian Rovo
4. Guru Enterprise AI Search
5. Onyx（开源 / GitHub）

这些产品覆盖了两类主流路径：
- 企业统一搜索 + AI 问答：Glean、Rovo、Guru
- 工作区内嵌搜索 / AI 问答：Notion
- 开源可自托管工作台：Onyx

## 竞品摘要

### 1. Glean
- 核心定位：统一搜索栏 + AI 问答 + 个性化知识图谱
- 公开信息重点：
  - Glean 强调 unified search bar，用户从一个统一搜索入口检索跨应用内容。
  - 支持 follow-up questions。
  - 实时索引与权限继承是强信任卖点。
  - 帮助文档强调“从任何地方搜索”，包括新标签页、网页侧边栏、Slack 和原生工作工具内嵌搜索。
- 对本项目的启发：
  - 首页应以单一主搜索 / 主提问区为中心，而不是先展示大量说明模块。
  - “不离开当前工作上下文”是体验重点，后续可演化为侧边栏 / 内嵌入口。
  - 权限与实时更新属于后续真实能力，但首版 UI 需要预留“来源可信”和“最新信息”表达位。

### 2. Notion Enterprise Search
- 核心定位：在 Notion Home 中直接提问，搜索工作区和连接应用
- 公开信息重点：
  - Enterprise Search 在 `Home` 页的搜索窗口中完成。
  - 可加上下文、限定搜索范围、切换数据源范围。
  - 支持连接 Slack、Google Drive、Jira 等第三方应用。
  - 明确说明回答始终会引用来源。
  - 支持切换 AI 模型。
- 对本项目的启发：
  - `Home` 风格的单入口比“多说明卡片首页”更像真实产品。
  - 搜索范围 / 数据源范围 / 模型切换应是二级控制，不应抢主视觉。
  - 引用来源需要是默认行为，不是高级功能。

### 3. Atlassian Rovo
- 核心定位：Search / Chat / Studio / Agents 四块能力，但入口表达依然很克制
- 公开信息重点：
  - 公开站点按 `Search`、`Chat`、`Studio`、`Agent` 分层。
  - Search 负责跨应用找信息，Chat 负责快速求助。
  - 强调连接第三方 SaaS 应用。
  - 当 AI 关闭时，Search 依然可以工作，Chat/Agents 则不可用。
- 对本项目的启发：
  - 搜索和问答应区分，但可以共享同一主工作面。
  - 运行模式应清晰，比如“搜索可用 / AI 不可用”。
  - 首版不必把 agent、workflow 等高级能力放进主界面。

### 4. Guru Enterprise AI Search
- 核心定位：可信、带引用、权限感知、可治理的企业 AI 搜索
- 公开信息重点：
  - 主打 trusted answers、cited answers、permission-aware answers。
  - 连接多种知识源且无需迁移内容。
  - 强调 verification workflows、auditability、knowledge quality。
  - 支持在 Slack、Teams、浏览器、外部 AI 工具中消费同一套知识。
- 对本项目的启发：
  - “可信 / 带引用 / 权限感知”可以作为产品价值表达，但不应该在首页重复解释太多次。
  - 评测与反馈页后续可以向“答案质量治理”演进。
  - 首版要避免做成“单纯聊天壳子”，而应表现为“问答 + 来源 + 可信依据”的工作台。

### 5. Onyx
- 核心定位：开源 AI Chat + Enterprise Search + Integrations
- 公开信息重点：
  - 官方主页强调 AI chat connected to docs, apps, and people。
  - 功能包括 advanced chat、feedback、usage analytics、hybrid search、contextual retrieval。
  - GitHub 仓库强调 enterprise search、management UI、document permissioning 和多部署方式。
- 对本项目的启发：
  - 开源工作台产品普遍采用“中间主对话区 + 左右上下文区”的布局。
  - 管理能力与用户能力应分层，不要一开始堆在同一个首页。
  - 我们当前的技术选型与 Onyx 在信息架构上更接近，而不是和纯 SaaS 营销站接近。

## 竞品共性

### 信息架构共性
- 几乎都采用一个强主入口：
  - 统一搜索框
  - 或统一问答框
- 来源连接 / 权限 / 模型 / 搜索范围通常是次级控制，不占据主视觉
- 首页普遍聚焦一个核心任务：
  - 找答案
  - 找文档
  - 基于已有来源继续追问

### 交互共性
- 搜索与聊天是连续体验，而不是两个完全断开的产品
- 回答后常见继续动作：
  - 查看来源
  - 继续追问
  - 切换范围
  - 打开原文
- 结果可信度通常通过 3 种方式表达：
  - 来源引用
  - 权限继承
  - 最新索引 / 实时同步

### 视觉与文案共性
- 真实产品首页往往更克制，文案少而明确
- 少用抽象术语做页面标题，更多使用用户任务语言：
  - Search
  - Ask
  - Sources
  - History
  - Connectors
- 复杂能力通常藏在二级页或二级面板，而不是全在首页讲明白

## 对 Trace Desk 的结论

### 应当借鉴
- 用一个主搜索 / 主问答工作面做首页核心
- 回答默认带引用，来源可展开查看
- 左右侧栏承担辅助上下文，不抢主操作区
- 模型切换、范围限制、运行模式进入二级控制
- 首页文案以“任务导向”表达，而不是“产品说明导向”

### 不应照搬
- 不直接复制 Glean / Rovo 的大量平台化能力
- 不在首版引入 agent、workflow builder、跨页面复杂自动化
- 不在首页堆治理、审计、知识图谱等“平台术语”

### 对首版 MVP 的明确建议
首页只保留三层信息：

1. 顶部
   - 知识库切换
   - 搜索 / 问答主入口
   - 新建来源

2. 主工作区
   - 问题输入
   - 回答内容
   - 引用来源
   - 继续追问

3. 辅助侧栏
   - 左侧：知识库摘要 + 导入入口
   - 右侧：历史会话或来源详情

## 来源
- Glean product page: https://www.glean.com/product/workplace-search-ai
- Glean help: https://docs.glean.com/user-guide/basics/search-from-wherever-you-work
- Notion Enterprise Search: https://www.notion.com/help/enterprise-search
- Atlassian Rovo: https://www.atlassian.com/software/rovo
- Guru Enterprise AI Search: https://www.getguru.com/solutions/ai-enterprise-search
- Onyx official site: https://onyx.app/
- Onyx GitHub: https://github.com/onyx-dot-app/onyx
