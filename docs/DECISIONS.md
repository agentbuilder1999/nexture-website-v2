# DECISIONS.md — 决策记录
> 所有 agent 讨论产生的决策记录于此
> 格式：日期 | 议题 | 决策 | 理由 | 影响方

---

## 模板
```
### [日期] [议题标题]
**发起方**: Agent X
**参与方**: Agent X, Agent Y
**决策**: [具体结论]
**理由**: [一句话]
**影响方**: [谁需要执行或知悉]
**状态**: ✅ 已执行 / ⏳ 待执行
```

---

## 记录

<!-- 决策记录从这里开始 -->

### 2026-03-11 字体与 backdrop-filter 性能方案
**发起方**: Atlas
**参与方**: Atlas, Aria
**决策**:
1. 字体：Space Grotesk 600/700 woff2 内嵌（~18KB），正文 `system-ui, -apple-system`，Mono 改 `ui-monospace`，删除 Google Fonts @import
2. 导航毛玻璃：桌面 `backdrop-filter: blur(16px)`，移动端 `@media (max-width:768px)` 降级为 `rgba(6,15,34,0.96)` + `backdrop-filter: none`
**理由**: 满足零外部依赖约束 + 单文件 <50KB + Lighthouse ≥90；排版质量无损
**影响方**: Finn（实现）、Aria（更新 design-spec.md §3 §4.2）
**状态**: ⏳ 待 Aria 更新规范，待 Finn 实现
