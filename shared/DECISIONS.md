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

### 2026-03-11 Sprint-02 内容接口方式
**发起方**: q（TEAM-DISCUSS 综合）
**参与方**: 全员
**决策**: 采用 `content-schema.json` 结构化接口替代 copy.md Markdown 文本，Nova 负责输出，Finn 按字段取值，彻底解决注释污染问题
**理由**: Markdown 注释被 Finn 误当 HTML 模板复制是 Sprint-01 注释问题根因
**影响方**: Nova（新增产出）、Finn（实现方式变更）
**状态**: ⏳ Sprint-02 执行

### 2026-03-11 Sprint-02 Rex 职责边界
**发起方**: q（TEAM-DISCUSS 综合）
**参与方**: Rex
**决策**: Rex 本轮只做 HTML 审查 + screenshot checklist 验证；QUALITY.md / DEPLOYMENT.md / CI 推迟到 Sprint-03（后端启动时）
**理由**: Sprint-02 仍是纯静态 HTML，无部署需求，避免过度工程化
**影响方**: Rex
**状态**: ⏳ Sprint-02 执行

### 2026-03-11 网站结构方案
**发起方**: Victor
**参与方**: Atlas, Aria, Finn
**决策**: 保留多页面结构（Home/Product/Team/Media/Contact），不改为单页 Landing Page
**理由**: B2B 医疗受众有深度阅读习惯，各页独立聚焦内容，专业感更强，符合决策链阅读习惯
**影响方**: Atlas（tech-spec 更新为 5 页架构）、Aria（design-spec 多页版）、Finn（5个HTML文件）
**状态**: ⏳ Sprint-02 执行
