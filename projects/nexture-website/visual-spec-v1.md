# Nexture.nz 改版视觉规范 v1.0
**制定者：** Aria (UX Designer)  
**日期：** 2026-03-14  
**任务：** T060-B  
**依据：** themes.txt（Victor 提供）/ DECISIONS-2026-03-14.md / visual-reference-analysis.md（lusion.co 分析）  
**状态：** v1.0 草案，待 Victor 确认后 → 交付 Finn 实现

---

## 一、色彩系统

### 1.1 基础层（Background Layers）

```css
:root {
  /* 页面背景 */
  --bg-page:      #0C0524;    /* 深紫黑，主背景 */
  --bg-page-img:  url('/assets/Purple-bfg.avif');  /* 叠加纹理，opacity: 0.25-0.4 */

  /* 卡片层级 */
  --bg-card:      #160A3D;    /* 比页面浅一级，用于卡片/面板 */
  --bg-card-hover:#1E1050;    /* 卡片 hover 态 */
  --bg-elevated:  #1A0D45;    /* 弹窗/Dropdown 等悬浮层 */
  --bg-section-alt: #0A0520;  /* 替代 section 背景（Podcast 区等） */
}
```

### 1.2 品牌色（Brand Colors）

```css
:root {
  /* 主色：#2A9D8F（Victor 确认，统一 TheraSeus + nexture.nz） */
  --primary:       #2A9D8F;
  --primary-hover: #33B8A8;   /* 亮化 15% */
  --primary-dark:  #1F7A70;   /* 深化，用于 active 态 */
  --primary-glow:  rgba(42, 157, 143, 0.20);  /* 辉光效果 */
  --primary-bg:    rgba(42, 157, 143, 0.08);  /* 极淡背景，用于 hover 填充 */

  /* 渐变主色（按钮/Primary CTA 用） */
  --gradient-primary: linear-gradient(135deg, #9A81DF 10%, #7456C8 90%);
  --gradient-primary-hover: linear-gradient(135deg, #AA91EF 10%, #8466D8 90%);
}
```

### 1.3 强调色（Accent Colors）

```css
:root {
  --accent-purple:  #9A81DF;   /* 主紫，按钮/边框/图标 */
  --accent-violet:  #7456C8;   /* 深紫，渐变终点 */
  --accent-pink:    #D783D8;   /* 粉紫，次要强调 */
  --accent-rose:    #FF90A5;   /* 玫瑰粉，警告/标签 */
  --accent-amber:   #FFB071;   /* 暖橙，温暖/CTA 强调 */
  --accent-navy:    #14083A;   /* 极深紫，深色填充 */
  --accent-link:    #876CD4;   /* 链接默认色 */
  --accent-link-hover: #9A81DF;
}
```

### 1.4 标题渐变（Heading Gradient）

```css
:root {
  /* Victor 指定渐变 — 用于 Section 标题、Hero 标题 */
  --heading-gradient: linear-gradient(
    90deg,
    #A680FF  5%,
    #FF85B8 45%,
    #FFB070 85%
  );
}

/* 使用方式 */
.gradient-text {
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### 1.5 文字色阶（Text Scale）

```css
:root {
  --text-primary:    #E0D6DE;              /* 主要正文，来自 themes.txt */
  --text-secondary:  rgba(224, 214, 222, 0.70);  /* 副标题/摘要 */
  --text-tertiary:   rgba(224, 214, 222, 0.50);  /* 标签/占位 */
  --text-muted:      rgba(224, 214, 222, 0.35);  /* 最淡，日期/说明 */
  --text-on-primary: #FFFFFF;              /* 主色按钮上的文字 */
  --text-heading:    #F5F0FF;              /* 非渐变标题，接近白色偏紫 */
}
```

### 1.6 边框色阶（Border Scale）

```css
:root {
  --border-subtle:  rgba(154, 129, 223, 0.10);  /* 最淡，大面积分隔 */
  --border-default: rgba(154, 129, 223, 0.20);  /* 卡片默认边框 */
  --border-strong:  rgba(154, 129, 223, 0.45);  /* 重要边框/hover 态 */
  --border-focus:   #2A9D8F;                    /* Focus ring，品牌主色 */
}
```

### 1.7 语义色（Semantic）

```css
:root {
  --color-success:  #10B981;    /* 成功绿（与 #2A9D8F 相近，可合并） */
  --color-warning:  #FFB071;    /* 警告橙（复用 accent-amber） */
  --color-error:    #FF6B6B;    /* 错误红 */
  --color-info:     #876CD4;    /* 信息紫 */
}
```

---

## 二、字体选型

### 2.1 设计目标

目标：在深色背景上兼顾**可读性**与**高端设计感**，参考 lusion.co 的几何无衬线风格。
**Victor 确认（2026-03-14）：** 全站使用 Plus Jakarta Sans，SIL OFL 免费商用授权 ✅

### 2.2 字体方案（已锁定）

**Plus Jakarta Sans + JetBrains Mono**

| 用途 | 字体 | 字重 | 来源 | 理由 |
|------|------|------|------|------|
| 标题 / 大号文字 (H1-H3, display) | **Plus Jakarta Sans** | 700 / 800 | Google Fonts，SIL OFL ✅ | 字形饱满有力，大字号极优雅，更多字重选项，几何感强 |
| 正文 / UI 文字 (body, label, button) | **Plus Jakarta Sans** | 400 / 500 | 同上，统一来源 | 单一字体族全站统一，视觉一致性最佳 |
| 等宽 / 代码 | **JetBrains Mono** | 400 / 500 | Google Fonts，SIL OFL ✅ | 清晰易读，有连字支持，适合代码和技术数据展示 |

**Google Fonts 引入代码：**
```html
<!-- Plus Jakarta Sans：标题 + 正文（统一全站） -->
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<!-- JetBrains Mono：代码/等宽 -->
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**CSS Font Stack：**
```css
:root {
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont,
               'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
}

body         { font-family: var(--font-sans); }
code, pre    { font-family: var(--font-mono); }
```

### 2.3 字号系统（Type Scale）

```css
:root {
  /* 显示级别 — Hero 大标题 */
  --text-display-2xl: 4.5rem;    /* 72px — Hero 主标题 */
  --text-display-xl:  3.75rem;   /* 60px — 次级大标题 */
  --text-display-lg:  3rem;      /* 48px — Section 标题 */

  /* 标题级别 */
  --text-2xl: 2.25rem;   /* 36px — H2 */
  --text-xl:  1.875rem;  /* 30px — H3 */
  --text-lg:  1.5rem;    /* 24px — H4 / 卡片标题 */

  /* 正文级别 */
  --text-base: 1rem;     /* 16px — 标准正文 */
  --text-sm:   0.875rem; /* 14px — 辅助文字 */
  --text-xs:   0.75rem;  /* 12px — 标签/说明 */
}
```

### 2.4 字重规范

```css
:root {
  --font-weight-regular:   400;
  --font-weight-medium:    500;
  --font-weight-semibold:  600;  /* 卡片标题、按钮 */
  --font-weight-bold:      700;  /* Section 标题 */
  --font-weight-extrabold: 800;  /* Hero 主标题 */
}
```

### 2.5 行高规范

```css
:root {
  --leading-tight:   1.2;   /* 大标题，display 级别 */
  --leading-snug:    1.375; /* H2-H3 标题 */
  --leading-normal:  1.5;   /* 正文 */
  --leading-relaxed: 1.625; /* 小字正文，提升可读性 */
}
```

---

## 三、间距系统

### 3.1 基础间距（4px 倍数）

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
}
```

### 3.2 页面级间距

```css
:root {
  /* 内容最大宽度 */
  --max-w-content:  1280px;
  --max-w-text:     720px;   /* 长文本列宽，约 70 字符 */
  --max-w-narrow:   960px;

  /* 水平内边距 */
  --px-page: clamp(20px, 5vw, 80px);  /* 响应式，移动端 20px，桌面 80px */

  /* Section 垂直间距 */
  --section-py:     clamp(64px, 8vw, 128px);  /* 大 section 上下边距 */
  --section-py-sm:  clamp(40px, 5vw, 80px);   /* 小 section */
}
```

---

## 四、圆角系统

```css
:root {
  --radius-sm:   6px;    /* 小元素：tag、badge */
  --radius-md:   8px;    /* 按钮、输入框 */
  --radius-lg:   12px;   /* 卡片（主要组件） */
  --radius-xl:   16px;   /* 大卡片、面板 */
  --radius-2xl:  24px;   /* Modal、Drawer */
  --radius-full: 9999px; /* Pill 形状：标签、小按钮 */
}
```

---

## 五、阴影与辉光系统

```css
:root {
  /* 标准阴影（深色背景下阴影效果弱，主用辉光） */
  --shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.4);
  --shadow-md:  0 4px 12px rgba(0, 0, 0, 0.5);
  --shadow-lg:  0 10px 30px rgba(0, 0, 0, 0.6);

  /* 品牌辉光（Dark Mode 核心视觉） */
  --glow-primary:  0 0 24px rgba(42, 157, 143, 0.25);   /* 主色绿色辉光 */
  --glow-purple:   0 8px 32px rgba(116, 86, 200, 0.25);  /* 紫色辉光，卡片 hover */
  --glow-heading:  0 0 40px rgba(166, 128, 255, 0.20);   /* 标题光晕 */

  /* 卡片边框辉光（代替传统阴影） */
  --card-glow-hover: 0 0 0 1px rgba(154, 129, 223, 0.4),
                     0 8px 32px rgba(116, 86, 200, 0.2);
}
```

---

## 六、组件设计规范

### 6.1 按钮系统

#### Primary Button（渐变，主要 CTA）

```css
.btn-primary {
  background: var(--gradient-primary);
  color: #FFFFFF;
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: var(--radius-md);
  border: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--gradient-primary-hover);
  box-shadow: var(--glow-purple);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 3px;
}
```

#### Secondary Button（Ghost，边框款）

```css
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  font-size: 15px;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  border-color: var(--border-strong);
  background: rgba(154, 129, 223, 0.08);
  color: #F5F0FF;
}
```

#### Teal Button（品牌主色，强调功能）

```css
.btn-teal {
  background: var(--primary);
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.btn-teal:hover {
  background: var(--primary-hover);
  box-shadow: var(--glow-primary);
  transform: translateY(-1px);
}
```

---

### 6.2 卡片系统

```css
/* 基础卡片 */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: all 0.25s ease;
}

.card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-strong);
  box-shadow: var(--glow-purple);
  transform: translateY(-2px);
}

/* 特色卡片（featured，渐变边框） */
.card-featured {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  position: relative;
}

.card-featured::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  padding: 1px;
  background: var(--gradient-primary);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
```

---

### 6.3 导航（Nav）

```css
.nav {
  background: rgba(12, 5, 36, 0.85);   /* 页面背景 + 毛玻璃 */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Logo */
.nav-logo {
  height: 28px;
  width: auto;
}

/* Nav Link */
.nav-link {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
  text-decoration: none;
}

.nav-link:hover,
.nav-link.active {
  color: var(--text-primary);
}

/* Nav CTA */
.nav-cta {
  /* 使用 btn-teal 或 btn-primary */
  font-size: 14px;
  padding: 8px 20px;
}
```

---

### 6.4 Hero 区块

```css
.hero {
  min-height: 100vh;            /* 全屏 Hero */
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* 背景处理 */
.hero-bg {
  position: absolute;
  inset: 0;
  background-image: url('/assets/Purple-bfg.avif');
  background-size: cover;
  background-position: center;
  opacity: 0.35;                /* 底图透明度 */
  z-index: 0;
}

/* 渐变遮罩，确保文字可读性 */
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(12, 5, 36, 0.2) 0%,
    rgba(12, 5, 36, 0.6) 60%,
    rgba(12, 5, 36, 1.0) 100%
  );
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
}

/* Hero 大标题 */
.hero-title {
  font-family: var(--font-sans);
  font-size: clamp(2.5rem, 6vw, 5rem);  /* 响应式：移动 40px，桌面 80px */
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;              /* 大字号微收紧字间距 */
}

/* Hero 副标题 */
.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--text-secondary);
  max-width: var(--max-w-text);
  line-height: var(--leading-relaxed);
}
```

---

## 七、改版 v1 与现有网站对比

| 维度 | 现有 v1 (Finn 实现) | 改版 v1.0 规范 |
|------|-------------------|--------------|
| **背景** | 浅色系（白/浅灰） | 深紫 `#0C0524` + Purple-bfg.avif |
| **品牌主色** | TheraSeus 用 `#2A9D8F` | 全站统一 `#2A9D8F` |
| **CTA 按钮** | 单色填充 | 渐变（`#9A81DF → #7456C8`）或纯主色 |
| **标题颜色** | 深色文字 | 渐变 `#A680FF → #FF85B8 → #FFB070` |
| **正文颜色** | `#1e293b` 等深色 | `#E0D6DE`（浅色，适配深背景） |
| **卡片** | 白色背景 + 轻阴影 | `#160A3D` + 紫色边框辉光 |
| **字体** | Inter（全站） | **Plus Jakarta Sans**（全站统一，700/800 标题 + 400/500 正文）|
| **圆角** | 多样，未统一 | 统一 token：6/8/12/16px |
| **动效** | 基础 transition | 统一：translateY(-2px) + glow |
| **导航** | 浅色实心 | 毛玻璃 + 深紫背景 blur |
| **媒体页** | 无 | 新增，含 5 张卡片 + 播客 + Logos |
| **品牌视觉** | 无品牌背景 | Purple-bfg.avif 系统性应用 |
| **阴影系统** | 传统 box-shadow | 辉光（glow）代替传统阴影 |

---

## 八、实现优先级

### 必须（P0）
- [ ] 全局色彩 token 替换（浅→深背景，文字色反转）
- [ ] Hero 标题应用渐变
- [ ] CTA 按钮更新（渐变 + glow）
- [ ] Nav 毛玻璃效果
- [ ] Purple-bfg.avif 应用到 Hero 背景

### 重要（P1）
- [ ] 卡片系统统一（bg-card + border + hover glow）
- [ ] Plus Jakarta Sans 引入（替换全站 Inter，含标题+正文）
- [ ] 媒体页全新实现
- [ ] Partner Logos 区块

### 增强（P2）
- [ ] 渐变边框 featured card
- [ ] Podcast 区块视觉升级
- [ ] 字号 token 全站统一
- [ ] 圆角 token 全站统一

---


---

## 十、ShaderGradient 预设参数（Hero 动态背景）

**给 Finn 的参数规范**  
库：`@shadergradient/react`（来自 shadergradient.co，Victor 确认使用）

### 推荐预设 A：Hero 主场景（暗紫 × 蓝绿辉光）

```js
// 定位：全屏 Hero 背景，慢速流动感，医疗 AI 科技风
<ShaderGradient
  type="waterPlane"          // 水面波纹型，流体感强
  color1="#7456C8"           // 深紫主色
  color2="#2A9D8F"           // 品牌 teal，与 CTA 呼应
  color3="#0C0524"           // 极深背景色，防止过亮
  uSpeed={0.25}              // 慢速（专业感，不分散注意力）
  uStrength={1.8}            // 中等扭曲，有动感不眩晕
  uDensity={1.2}             // 密度适中
  positionX={0}
  positionY={0}
  positionZ={0}
  rotationX={45}             // 稍倾斜，视角更有深度
  rotationY={0}
  rotationZ={0}
  cameraZoom={1}
  lightType="env"
  envPreset="city"           // 城市环境光，带金属质感
  grain="off"                // 关闭颗粒感（深色背景已够质感）
  brightness={1.0}
/>
```

**叠加处理（React 组件外层）：**
```css
.hero-gradient-wrapper {
  position: absolute;
  inset: 0;
  opacity: 0.55;            /* 不盖住文字，保持文字可读 */
  z-index: 0;
}
/* 在 ShaderGradient 上叠加从底部的渐变遮罩 */
.hero-gradient-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(12, 5, 36, 0.5) 55%,
    rgba(12, 5, 36, 1.0) 100%
  );
}
```

---

### 推荐预设 B：Section 背景（柔和，次要区块用）

```js
// 定位：About / Features 等 Section 的淡化背景装饰
<ShaderGradient
  type="plane"               // 平面型，比 waterPlane 更静
  color1="#9A81DF"           // 浅紫
  color2="#14083A"           // 极深紫
  color3="#1A0D45"           // 深蓝紫
  uSpeed={0.12}              // 极慢，几乎静态
  uStrength={0.8}
  uDensity={0.9}
  rotationX={30}
  grain="on"                 // 开颗粒感，增加质感层次
  brightness={0.85}
/>
```
**叠加处理：** `opacity: 0.3`，作为微妙背景纹理

---

### 预设参数说明

| 参数 | 作用 | Nexture 推荐范围 |
|------|------|----------------|
| `type` | 形状类型 | `waterPlane`（Hero）/ `plane`（Section）|
| `color1/2/3` | 渐变三色 | 紫系 `#7456C8` + teal `#2A9D8F` + 深背景 `#0C0524` |
| `uSpeed` | 动画速度 | `0.1–0.3`（慢 = 专业感） |
| `uStrength` | 波纹扭曲强度 | `1.0–2.5`（过高会令人头晕） |
| `uDensity` | 网格密度 | `0.8–1.5` |
| `grain` | 颗粒感 | Hero 关闭，次要 section 可开 |
| `brightness` | 整体亮度 | `0.8–1.0`（暗色主题不宜过亮） |

---

### 性能注意事项（给 Finn）

1. **SSR 兼容**：ShaderGradient 依赖 WebGL，Next.js 须 `dynamic import` + `ssr: false`
2. **移动端降级**：检测 WebGL 不可用时，回退到 `Purple-bfg.avif` 静态背景
3. **仅 Hero 使用**：Section 背景若性能有压力，改用 CSS `radial-gradient` 近似
4. **Canvas 层级**：`position: absolute; z-index: 0`，内容层 `z-index: 1` 以上

## 九、开发交付清单（给 Finn）

```
1. CSS variables 文件：tokens.css（包含本文档所有 :root 变量）
2. 字体引入：Google Fonts CDN — Plus Jakarta Sans (400/500/600/700/800) + JetBrains Mono (400/500)
3. 背景资源：Purple-bfg.avif → /public/assets/
4. Logo 文件：nexturelogo.png / nexturelogosmall.png → /public/assets/
5. Partner logos → /public/assets/partners/（白色 SVG 优先）
6. 参考站：nexture-demo.pages.dev（颜色 #2A9D8F 已确认）
```

---

*规范版本：v1.0 | 制定：Aria | 2026-03-14*  
*待 Victor 确认后转交 Finn 实现*  
*更新历史：v1.0 初版，基于 themes.txt + DECISIONS-2026-03-14.md*

---

## 字体系统更新（2026-03-14 Victor 确认）

**字体：Plus Jakarta Sans（SIL OFL 免费商用）**

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

```css
--font-heading: 'Plus Jakarta Sans', sans-serif;  /* 700/800 */
--font-body:    'Plus Jakarta Sans', sans-serif;  /* 400/500 */
--font-mono:    'JetBrains Mono', monospace;      /* 400/500 */
```

全站统一 Plus Jakarta Sans，无需维护两套字体栈。

---

## ShaderGradient 参数（Finn 实现用）

### Hero Section（主背景）
```tsx
<ShaderGradient
  type="waterPlane"
  animate="on"
  color1="#7456C8"
  color2="#2A9D8F"
  color3="#0C0524"
  uSpeed={0.25}
  uStrength={1.8}
  grain="off"
  lightType="3d"
  opacity={0.55}
/>
```

### Section 分隔背景（次要）
```tsx
<ShaderGradient
  type="plane"
  animate="on"
  color1="#A680FF"
  color2="#14083A"
  color3="#0C0524"
  uSpeed={0.12}
  uStrength={0.8}
  grain="on"
  opacity={0.3}
/>
```

### Next.js 集成（必须）
```tsx
// 必须 dynamic import + ssr: false
const ShaderGradient = dynamic(
  () => import('@shadergradient/react').then(m => m.ShaderGradient),
  { ssr: false }
);
```

### 移动端 Fallback
检测 WebGL 不可用时降级到 `Purple-bfg.avif` 静态背景。
