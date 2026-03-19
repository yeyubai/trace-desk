# React 与 Next.js 风格规则

## 默认思路
- 优先 `Server Component`，只在需要交互、浏览器 API、客户端状态时使用 `use client`。
- React 组件保持纯函数思维，输入相同 props 时输出应稳定可预期。
- 能在 render 阶段推导的值，不额外放进 state。
- 先判断“是否真的需要 Effect”，避免把数据流问题都塞给 `useEffect`。

## 组件拆分
- 页面负责拼装，不负责承载复杂业务实现。
- 容器组件负责数据获取与行为编排，展示组件负责渲染。
- 展示组件尽量通过 props 获取数据，不感知数据来源。
- 单个组件过长时，优先按“职责边界”拆分，而不是按 JSX 长度机械拆分。

## Props 设计
- props 命名直接表达业务含义，不使用 `data`、`info`、`itemData` 这类模糊名字。
- 传入组件的数据应尽量是“已处理好的展示模型”，避免组件内部重复进行复杂转换。
- 布尔 props 使用可读名称，例如 `isStreaming`、`hasError`、`isReadonly`。
- 回调函数命名使用动作语义，例如 `onRetry`、`onStopGeneration`、`onSelectSource`。

## 状态管理
- 本地临时 UI 状态留在组件内。
- 服务端异步状态交给 `TanStack Query`。
- 跨层级但局部的领域状态优先考虑 feature 内部 hooks 或 context，不轻易上全局状态库。
- 不复制服务端状态到本地 state 再维护一份影子数据，除非确有编辑态需求。

## Effect 使用边界
- 只有与外部系统同步时才使用 `useEffect`，例如订阅、定时器、DOM API、流连接。
- 不要用 `useEffect` 处理纯数据推导。
- 不要用 `useEffect` 在 props 变化后“补算”本可直接计算出的值。
- 需要事件回调稳定性时，优先考虑更清晰的结构，而不是到处包裹记忆化。

## Next.js 约束
- 数据获取尽量靠近服务端，避免客户端首屏再发一次无意义请求。
- 服务器能力放在 Route Handlers、Server Actions 或 server-only 服务模块中，不泄漏到客户端。
- 对 SEO 无要求但交互复杂的区域，可局部客户端化；不要整页无差别 `use client`。
- 页面级异常和 loading 使用 App Router 提供的机制，而不是每页手写重复壳层。

## 可读性要求
- JSX 结构要能一眼看懂信息层级。
- 复杂条件渲染提取成具名片段或函数，不在 JSX 中叠太多三元表达式。
- 长列表渲染要保持 key 稳定，不用 index 充当长期 key。
- 事件处理函数名称体现用户意图，不写 `handleClick1`、`handleSubmitData` 之类混合语义名称。

## 反模式
- 整个页面首行加 `use client`，再在里面做所有事情。
- 一个组件同时负责拉数据、做状态机、渲染复杂 UI、发埋点、弹错误提示。
- 为了“减少 props”把所有状态塞进 context。
- 为了“性能优化”过早引入大量 `useMemo` / `useCallback`，反而降低可读性。
