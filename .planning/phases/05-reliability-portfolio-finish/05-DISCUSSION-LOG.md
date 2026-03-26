# Phase 5: Reliability & Portfolio Finish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the defaults chosen during autonomous continuation.

**Date:** 2026-03-26
**Phase:** 05-reliability-portfolio-finish
**Areas discussed:** RAG 可验证性, 网页正文抽取, 收尾交付标准

---

## RAG 可验证性

| Option | Description | Selected |
|--------|-------------|----------|
| 导入后展示抽取结果和 chunk 预览 | 企业级可验证方案 | ✓ |
| 只显示导入成功 | 黑盒，无法定位问题 | |

## 网页正文抽取

| Option | Description | Selected |
|--------|-------------|----------|
| 优先 article/main/正文容器，再回退 body | 更接近真实文章抓取 | ✓ |
| 直接 strip 整个 body | 太容易抓到导航和噪音 | |

## 收尾交付标准

| Option | Description | Selected |
|--------|-------------|----------|
| 先做 RAG 诊断与验收，再做作品集包装 | 先保证产品可信度 | ✓ |
| 先写 README/演示 | 风险是包装先于能力 | |
