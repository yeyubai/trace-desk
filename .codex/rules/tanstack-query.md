# TanStack Query 规则

## 角色定位
- `TanStack Query` 只管理服务端异步状态，不作为通用全局状态库使用。
- Query 用于读取、缓存、同步服务端数据；本地交互状态留给组件或 feature hooks。

## Query Key 规则
- Query Key 必须稳定、可序列化、可预测。
- 统一使用 Query Key 工厂函数，避免手写散落字符串。
- Query Key 中显式包含影响结果的关键参数，例如 `knowledgeBaseId`、分页参数、过滤条件、模型档位。

## 数据获取规则
- 首屏可在服务端获取的数据，优先在服务端完成，不为了统一写法全部放到客户端 Query。
- Query 函数只负责请求和最小必要映射，不在其中塞复杂 UI 逻辑。
- 不要在多个组件里重复发同一语义请求而不共享 key。

## Mutation 规则
- Mutation 负责创建、更新、删除、触发异步流程。
- Mutation 成功后优先做精确失效或定向更新，避免无差别刷新整个缓存。
- 乐观更新只用于收益明显且回滚逻辑清晰的场景。

## 状态使用
- 在 UI 中显式区分 `loading`、`error`、`success`、`fetching`、`empty`。
- `isFetching` 和 `isPending` 语义不同，不能混用。
- 不把 Query 返回的数据复制到本地 state 再维护一份，除非正在做用户编辑草稿。

## 可读性与维护性
- 每个业务域可维护独立的 query 模块，例如 `chatQueries`、`knowledgeQueries`。
- Query Hook 名称表达业务意图，例如 `useKnowledgeBaseListQuery`、`useChatSessionQuery`。
- 不在组件里直接内联超长 query 配置对象，提取为具名选项或 hooks。

## 反模式
- 把表单输入中间态放进 Query Cache。
- 提交成功后全站 `invalidateQueries()`。
- Query Key 只写成 `["list"]`、`["detail"]` 这种缺少领域上下文的形式。
- 在 Query 函数中偷偷做 toast、路由跳转、埋点等副作用。
