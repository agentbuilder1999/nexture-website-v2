# ADR — Architecture Decision Records

> 维护者: Atlas | Nexture Dev Team

---

## ADR-001: Landing Page 字体与动效性能方案

**日期:** 2026-03-11
**状态:** ✅ Accepted
**参与方:** Atlas (发起), Aria (确认), q (批准)

### 背景
design-spec.md 引入 Google Fonts（3 族 11 weight）和 `backdrop-filter: blur(16px)`，与 tech-spec 硬约束冲突：零外部依赖、单文件 < 50KB、Lighthouse ≥ 90。

### 决策

**字体：方案 B（精简子集内嵌）**
- Space Grotesk 600 + 700：woff2 base64 内嵌 `<style>`（约 18KB）
- 正文/UI：`system-ui, -apple-system, 'Segoe UI', sans-serif`
- 等宽：`ui-monospace, 'SF Mono', monospace`（替代 JetBrains Mono）
- Google Fonts @import **移除**

**动效：方案 Z（条件降级）**
- 桌面端：保留 `backdrop-filter: blur(16px) saturate(180%)`
- 移动端：`@media (max-width: 768px)` 降级为 `rgba(6,15,34,0.92)` 纯色背景

### 理由
- 字体内嵌保持品牌标题感，同时控制在 50KB 总预算内
- system-ui 在主流平台（SF Pro / Segoe UI / Roboto）排版质量足够
- backdrop-filter 条件降级消除移动端合成层性能风险，桌面端保留视觉品质

### 影响
- **Aria**：更新 design-spec.md §3（字体栈）、§4.2（nav 背景）、§8（组件参考）
- **Finn**：实现时按更新后的 design-spec.md，不再引入外部字体 CDN
- **性能预算**：预计单文件 35–45KB（含内嵌字体），Lighthouse ≥ 90 可达

---
