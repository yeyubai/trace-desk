# trace-desk GSD Profile

## Why This Exists

本项目已经有现成代码、现成规划文档和明确的 Git 规则，所以这里采用的是 **GSD hybrid mode**：

- 继续使用 GSD 的 `PROJECT / REQUIREMENTS / ROADMAP / STATE` 结构来做阶段推进
- 保留 GSD 的 phase 思维、manager/progress/next 这套导航方式
- 不直接照搬 GSD 默认英文 commit 语义，避免和仓库 `中文提交规范` 冲突

## Local Rules For This Repo

1. `.planning/` 默认本地维护，不作为仓库提交历史的一部分。
2. 仓库的真实提交信息仍遵守 `AGENTS.md` 中的中文格式：`类型：简要说明`。
3. 在本仓库里，GSD 更适合承担：
   - 项目态势感知
   - phase 讨论与规划
   - roadmap / state 驱动的下一步推荐
4. 在本仓库里，GSD 默认 **不作为最终代码提交器**。执行实现时，优先由 Codex 按仓库规则完成代码、验证和中文提交。

## Safe Commands

这些命令可以直接使用，适合你当前这个仓库：

- `$gsd-progress`
- `$gsd-next`
- `$gsd-discuss-phase 1`
- `$gsd-plan-phase 1`
- `$gsd-plan-phase 1 --skip-research`
- `$gsd-list-phase-assumptions 1`

## Use With Caution

下面这些命令默认会更强势地驱动执行或自动提交，在本仓库里要先知道代价再用：

- `$gsd-execute-phase`
- `$gsd-manager`
- `$gsd-autonomous`

原因：

- GSD 默认 commit message 是英文 `docs:/feat:/fix:` 风格
- 当前仓库已有未提交工作树改动
- 你的项目规则要求提交信息统一使用中文格式

## Recommended Operating Loop

推荐把 `trace-desk` 当成一个“GSD 负责导航，Codex 负责落地”的项目：

1. `在 Codex 中运行 $gsd-progress`
2. `按建议进入 $gsd-discuss-phase N`
3. `完成后运行 $gsd-plan-phase N`
4. 回到 Codex，直接说：`按照 .planning/phases 中的计划执行 Phase N，遵守 AGENTS.md 和中文提交规范`
5. 实现完成后，再回到 `.planning/STATE.md` / `ROADMAP.md` 更新 phase 状态

## Suggested First Move

当前推荐起手动作：

- `$gsd-discuss-phase 1`

目标：

- 明确 Phase 1 里“壳子一致性、运行时状态、mock/live 契约”到底哪些算 done
- 把 Phase 1 从 roadmap 条目细化成可执行 plans
