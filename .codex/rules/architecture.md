# 架构规则

## 架构目标
- 以 `Next.js App Router` 为外壳，以清晰的业务边界组织代码。
- 优先保证 `可读性 > 可扩展性 > 局部技巧性优化`。
- 首版聚焦 `知识库导入、RAG 检索问答、引用展示、历史会话`，不提前设计重型平台化能力。

## 目录组织原则
- `app/` 负责路由、页面装配、布局、页面级 loading/error 和服务端入口。
- `features/` 负责按业务域组织代码，例如 `knowledge`、`chat`、`citation`、`session`。
- `components/` 只放跨业务复用的通用组件，不放带强领域含义的组件。
- `services/` 负责外部依赖访问与业务用例编排，例如数据库、向量检索、对象存储、模型调用。
- `lib/` 只放无业务归属的基础能力，例如时间处理、字符串处理、环境变量读取、日志封装。
- `types/` 放共享领域类型，但不要把所有类型都堆到一个超大文件里。

## 推荐目录示意
```text
src/
  app/
    (dashboard)/
    api/
  features/
    chat/
      components/
      hooks/
      server/
      schemas/
      types/
    knowledge/
      components/
      server/
      schemas/
      types/
  components/
    ui/
    shared/
  services/
    ai/
    db/
    oss/
    retrieval/
  lib/
  types/
```

## 边界约束
- 页面组件不直接写数据库访问逻辑。
- UI 组件不直接拼接 Prompt，不直接操作 SQL，不直接承担复杂业务流程。
- Route Handlers 负责 `请求解析 + 权限校验 + 调用服务 + 返回响应`，不写成长篇业务脚本。
- 服务层负责具体业务编排，例如“上传文档并切块入库”“检索并生成带引用回答”。
- 基础工具函数必须保持无副作用；有副作用的逻辑放入服务层或明确命名的 server 模块。

## RAG 架构约束
- 检索、重排、生成、引用组装是 4 个显式步骤，不能混成单个黑盒函数。
- 模型输出不能直接视为最终可信数据；引用、来源、结构化字段要做服务端校验。
- 未命中知识库时明确拒答，不允许生成“看起来合理”的伪引用。
- 工具调用按业务意图建模，例如 `searchKnowledgeBase`、`fetchSourcePreview`，不要暴露任意 SQL 能力给模型。

## 状态建模
- 状态名必须贴近业务语义，例如 `idle`、`uploading`、`indexing`、`streaming`、`toolRunning`、`failed`。
- 不把多种状态压缩进布尔值，例如避免同时使用 `isLoading`、`isPending`、`hasStarted` 去表达同一流程。
- 长流程优先使用显式状态机思维建模，即使不引入状态机库，也要让状态与转换可枚举。

## 可读性要求
- 一个文件只表达一个主职责。
- 一个函数只完成一个清晰动作。
- 命名优先使用领域词汇，不使用 `handleData`、`processInfo`、`tempList` 这类弱语义名称。
- 复杂条件分支要拆成具名函数，避免把业务规则埋进巨长 `if` 中。

## 反模式
- 在页面文件中同时写 UI、网络请求、数据映射、错误兜底、数据库访问。
- 在一个 `utils.ts` 里堆积无边界的所有逻辑。
- 把所有服务端逻辑都塞进单个 Route Handler。
- 让模型直接决定数据库结构或直接产出最终引用数据而不校验。
