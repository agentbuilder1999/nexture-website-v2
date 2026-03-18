# 前端组件库选型报告
> 项目：nexture-website + theraseus | 任务 ID：T023
> 日期：2026-03-12 | 分析者：Finn（Frontend Developer）

---

## 执行摘要

| 项目 | 推荐方案 | 核心理由 |
|------|---------|---------|
| **nexture-website** | **Headless UI（Tailwind CDN）** | 零依赖、纯 HTML/JS 适配、视觉完全自由 |
| **theraseus** | **shadcn/ui + Tailwind CSS** | WCAG AA 内置、React 生态、企业级组件完整 |

---

## 方案对比总览

| 方案 | Bundle Size | 定制化难度 | 学习曲线 | 维护成本 | 许可证 | 适合场景 |
|------|------------|-----------|---------|---------|--------|---------|
| shadcn/ui + Tailwind | ~15KB (tree-shaken) | 低 | 低 | 低 | MIT | React SaaS / 管理台 |
| Radix UI Primitives | ~20–40KB | 中 | 中 | 低 | MIT | 需完全自主样式的 React 应用 |
| Tailwind UI (付费) | ~Tailwind 体积 | 低 | 低 | 低 | 商业 $299+ | 快速交付，团队设计一致性 |
| MUI (Material UI) | ~300–500KB | 高 | 高 | 中 | MIT | 企业内部工具、Google Design 风格 |
| Mantine | ~80–150KB | 中 | 中 | 低 | MIT | React 全功能应用、Hooks 丰富 |
| Headless UI | ~8KB | 低 | 低 | 低 | MIT | 纯 HTML/Tailwind、无框架依赖 |

---

## 各方案详细分析

### 1. shadcn/ui + Tailwind CSS
- **Bundle Size**：按需 copy-paste，tree-shaken 后约 15KB；Tailwind CDN 约 30KB
- **定制化难度**：低——组件代码直接放入项目，100% 可修改
- **学习曲线**：低——文档清晰，社区活跃，模式一致
- **维护成本**：低——本地代码，无 upstream 依赖冲突
- **许可证**：MIT
- **优点**：无黑盒依赖、WCAG AA 内置（Radix Primitives 驱动）、React 19 原生支持
- **缺点**：需要 React/Next.js；纯 HTML 项目无法直接用
- **适合场景**：中大型 React SaaS、需要品牌高度定制的产品

### 2. Radix UI Primitives
- **Bundle Size**：20–40KB（按 primitive 引入）
- **定制化难度**：中——无样式，需全部自写 CSS
- **学习曲线**：中——API 设计严谨但较底层
- **维护成本**：低——专注交互逻辑，样式归应用方
- **许可证**：MIT
- **优点**：无障碍标准最严格（WAI-ARIA 完整实现）；shadcn/ui 底层即 Radix
- **缺点**：无样式意味着需要更多工作量
- **适合场景**：对 a11y 要求极高且有设计资源的团队

### 3. Tailwind UI（付费）
- **Bundle Size**：仅 Tailwind 本身约 30KB CDN
- **定制化难度**：低——HTML 模板直接复用
- **学习曲线**：低——有设计稿级别的模板
- **维护成本**：低——纯 HTML 模板，可用于任何框架
- **许可证**：商业许可，$299（个人）/ $799（团队）
- **优点**：视觉质量高、可直接用于纯 HTML 项目
- **缺点**：付费，且交互组件仍需自己实现 JS
- **适合场景**：快速启动官网、设计资源有限的团队

### 4. MUI (Material UI)
- **Bundle Size**：300–500KB（含 Emotion）
- **定制化难度**：高——覆盖 Material Design 系统需大量 override
- **学习曲线**：高——sx prop、theme 系统、styled API 三套并存
- **维护成本**：中——大版本迁移复杂
- **许可证**：MIT（企业功能收费）
- **优点**：组件最全，企业内部工具首选
- **缺点**：体积大、Google 风格难以完全覆盖，与 Nexture 深色科技风格冲突
- **适合场景**：企业内部管理工具、标准 Google Design 风格产品

### 5. Mantine
- **Bundle Size**：80–150KB（按模块）
- **定制化难度**：中——CSS 变量系统灵活，支持深色模式
- **学习曲线**：中——文档完善，Hooks 库丰富
- **维护成本**：低——活跃维护，API 稳定
- **许可证**：MIT
- **优点**：深色模式内置、Hooks 最丰富（Form/Modal/Notification）、v7 起 CSS 变量
- **缺点**：体积比 shadcn 大；需 React
- **适合场景**：功能密集的 React 应用，需要丰富 Hooks 的团队

### 6. Headless UI
- **Bundle Size**：~8KB（仅交互逻辑，无样式）
- **定制化难度**：低——无任何样式约束
- **学习曲线**：低——API 极简（Disclosure/Menu/Dialog/Listbox）
- **维护成本**：低——Tailwind Labs 维护，与 Tailwind 深度集成
- **许可证**：MIT
- **优点**：最轻量；可配合 Tailwind CDN 用于纯 HTML；无障碍内置
- **缺点**：组件数量少（仅 10+ 个），不适合复杂 SaaS
- **适合场景**：轻量官网、静态页面、需要完全 CSS 控制的项目

---

## 最终推荐

### nexture-website → **Headless UI（+ Tailwind CDN）**

当前 nexture-website 已交付 Sprint-02，技术栈为纯 HTML/CSS/JS，无 React/Next.js：

1. **零框架依赖**：Headless UI 的 JS 模块（Menu/Dialog）可直接通过 CDN 引入，与现有纯 HTML 架构兼容
2. **视觉完全自由**：无预设样式，品牌色（#E8005A / #2D3282 / #7B2070）、粒子系统、暗色科技风格完全由 Finn 控制
3. **轻量**：8KB 远低于 MUI/Mantine，符合首屏 <2s 性能要求；Lighthouse 分数友好

> 注意：nexture-website 为纯静态 HTML，组件库实际意义有限。真正改版至 Next.js 时（见 nexture-site-analysis.md 技术改版方案），应升级为 shadcn/ui。

---

### theraseus → **shadcn/ui + Tailwind CSS**

医疗 AI 阅片系统面向临床医生，要求严格：

1. **WCAG AA 内置**：shadcn/ui 基于 Radix Primitives，所有交互组件（Dialog/Select/Dropdown）原生满足 WAI-ARIA；直接满足医疗软件无障碍要求
2. **企业级组件完整**：表单验证（react-hook-form）、数据表格（TanStack Table）、通知系统均有成熟 shadcn/ui 集成方案
3. **迁移成本最低**：未来升级到 Next.js App Router 无缝衔接；组件代码在项目内，不受 upstream 破坏性更新影响；长期维护成本最低

---

## 不推荐原因

| 方案 | 不推荐原因 |
|------|-----------|
| Radix UI | shadcn/ui 已封装其能力，直接用 shadcn 效率更高 |
| Tailwind UI | 付费且仅提供模板，theraseus 需要完整组件生态 |
| MUI | 体积过大（500KB），品牌覆盖成本高，与 Nexture 深色风格冲突 |
| Mantine | 能力接近 shadcn/ui，但社区规模和 shadcn 差距拉大，切换成本不值得 |

---

## 实施建议

### Phase 1（当前 Sprint）
- nexture-website：继续纯 HTML，Tailwind CDN + Headless UI CDN 按需引入
- theraseus：确定 React/Next.js 技术栈后，`npx shadcn@latest init` 初始化

### Phase 2（官网 Next.js 迁移时）
- nexture-website 升级至 shadcn/ui（与 theraseus 统一技术栈）
- 建立跨项目共享 design tokens（CSS 变量层）

---

*版本：v1.0 | 日期：2026-03-12 | 分析者：Finn | 任务：T023*
