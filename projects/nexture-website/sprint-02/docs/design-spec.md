# Nexture — Design Specification v2 Final
**Sprint-02 · Aria · 2026-03-11**
Multi-page: Home / Product / Team / Media / Contact

---

## 1. Brand Color Palette

```css
:root {
  /* ── Brand Source (logo exact values) ── */
  --brand-pink:       #E8005A;
  --brand-blue:       #2D3282;
  --brand-purple:     #7B2070;
  --brand-pink-light: #F040A0;

  /* ── Backgrounds (dark navy) ── */
  --color-canvas:        #06060e;
  --color-bg-primary:    #08081c;
  --color-bg-surface:    #0e0e28;
  --color-bg-elevated:   #16163a;
  --color-bg-subtle:     #0b0b1e;

  /* ── UI Primary — Brand Pink (buttons, CTA, labels) ── */
  --color-primary-500:   #E8005A;
  --color-primary-400:   #F040A0;   /* hover + small text (AA: 5.8:1) */
  --color-primary-600:   #c00048;
  --color-primary-glow:  rgba(232, 0, 90, 0.22);

  /* ── UI Secondary — Brand Blue ── */
  --color-secondary-500: #2D3282;
  --color-secondary-400: #4048b0;
  --color-secondary-glow:rgba(45, 50, 130, 0.25);

  /* ── Neutrals ── */
  --color-text-primary:  #f5f0ff;
  --color-text-secondary:#9890b8;
  --color-text-muted:    #48446a;
  --color-border:        rgba(232, 0, 90, 0.14);
  --color-border-strong: rgba(232, 0, 90, 0.38);

  /* ── Semantic ── */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error:   #ef4444;

  /* ── Brand Gradients (UI layer) ── */
  --gradient-brand:      linear-gradient(135deg, #E8005A 0%, #7B2070 50%, #2D3282 100%);
  --gradient-brand-soft: linear-gradient(135deg, rgba(232,0,90,0.10) 0%, rgba(45,50,130,0.10) 100%);
  --gradient-text:       linear-gradient(90deg, #E8005A, #7B2070, #2D3282);
  --gradient-card-edge:  linear-gradient(180deg, rgba(232,0,90,0.10) 0%, transparent 100%);
}
```

> **使用规则：** `--brand-pink #E8005A` 仅用于 16px bold+ 及 UI 色块；正文链接/小标签用 `--color-primary-400 #F040A0`（对比度 5.8:1 ✅ AA）。

---

## 2. Particle System — "Precision Field"

粒子配色采用医疗 AI 数据可视化语言（参照 NVIDIA / DeepMind / GE Healthcare），独立于 Logo 品牌色，与其保持色相族关联。

```css
:root {
  /* ── Precision Field 粒子色 (Victor 确认 2026-03-11) ── */
  --particle-primary:   #00C8E8;                    /* Medical Cyan — 主色 55% */
  --particle-secondary: #5870E8;                    /* Deep Periwinkle — 辅色 30% */
  --particle-pulse:     #9050C8;                    /* Scientific Violet — 脉冲 10% */
  --particle-dust:      rgba(224, 240, 255, 0.18);  /* 白色微尘 5% */
  --particle-line:      rgba(0, 200, 232, 0.09);    /* 连线，近隐 */
}
```

```js
const PARTICLE = {
  // ── 文字粒子（构成 slogan，无 DOM 文字节点）──
  text: {
    sampleStep:   4,           // 每 4px 采样一坐标点
    size:         2.5,         // px
    colors:      ['#00C8E8', '#5870E8', '#9050C8'],
    colorRatio:  [0.55, 0.30, 0.15],
    opacity:      0.88,
    settleMs:     1200,
    easing:      'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    drift: {
      amplitude:  2,           // ±2px 呼吸，永不完全静止
      periodMs:   4500,        // 各粒子随机 3000–6000ms
      mode:       'coordinated-wave', // 分区同相位，非独立随机抖动
    },
    scatter: {
      radius:     80,          // 鼠标扰动半径
      strength:   5,
      returnMs:   800,         // 离开后重新汇聚耗时
    },
  },
  // ── 环境粒子（背景漂浮，衬托文字层）──
  ambient: {
    count:       120,          // desktop；mobile: 60
    sizeMin:     2,  sizeMax:  4,
    opacityMin:  0.55, opacityMax: 0.75,
    speed:       0.4,
    colors:     ['#00C8E8', '#5870E8', '#9050C8'],
    colorRatio: [0.55, 0.30, 0.15],
    line: {
      color:     'rgba(0, 200, 232, 0.09)',
      maxDist:   130,
    },
    mouse:  { repelRadius: 100, strength: 0.05 },
    pulse:  { count: 5, intervalMs: [3000, 6000] },
  }
};
```

**颜色逻辑说明（给 Finn 参考）：**
- `#00C8E8` — 降饱和医疗青，ECG/MRI 界面标准发光色，稳重可信
- `#5870E8` — 深蓝偏紫，AI 运算的视觉语言（DeepMind 系），承接品牌 navy
- `#9050C8` — 科学紫，Logo 过渡紫 `#7B2070` 的冷色提炼版，仅用于 pulse 节点
- 三色同属冷色系，饱和度克制，整体读感稳重精密

---

## 3. Home Page — Video Hero 层级结构

**Victor 确认层级（2026-03-11）：**

```
z-100  Nav（position: fixed，全宽）
z-10   Hero 内容区（eyebrow / CTA / subtext / trust logos）
z-3    粒子 Canvas（position: absolute，仅 Hero section 范围）
z-2    渐变蒙版（非均匀，加噪点）
z-1    视频元素（autoplay muted loop playsinline）
z-0    页面背景色
```

### Layer 1 — 视频背景

```html
<video class="hero-video" autoplay muted loop playsinline poster="hero-poster.jpg">
  <source src="hero.mp4" type="video/mp4">
</video>
```

```css
.hero { position: relative; height: 100vh; overflow: hidden; }
.hero-video {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; z-index: 1;
}
```

> ⚠️ **视频内容要求（给制作方）：** 主色调必须深色/低亮度。明亮场景（白色医院走廊、强光手术室）会导致粒子消失。理想题材：暗室器械特写、数据可视化素材、低调照明的临床环境。

### Layer 2 — 渐变蒙版（非均匀 + 噪点质感）

```css
.hero-overlay {
  position: absolute; inset: 0; z-index: 2;
  /* 主渐变：顶轻底重，让视频顶部呼吸，底部 CTA 区清晰 */
  background:
    linear-gradient(
      to bottom,
      rgba(6, 6, 14, 0.30)  0%,
      rgba(6, 6, 14, 0.52) 45%,
      rgba(6, 6, 14, 0.82) 100%
    );
}
/* 噪点质感层（去除数字屏保感，增加电影颗粒感）*/
.hero-overlay::after {
  content: '';
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.05;   /* 4–5%，肉眼几乎不可见，质感决定性 */
  mix-blend-mode: overlay;
}
```

### Layer 3 — 粒子 Canvas

```css
.particle-canvas {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  z-index: 3;
  pointer-events: none;  /* 点击穿透，不阻挡 CTA */
}
```

**粒子入场时序：**

| 时间 | 事件 |
|---|---|
| 0ms | 视频播放，纯净全屏，蒙版不可见 |
| 300ms | 蒙版淡入（opacity 0→1，0.6s ease） |
| 800ms | 粒子从视口四边随机位置生成 |
| 800–2000ms | 粒子飞向字形目标坐标（settleMs: 1200） |
| 2000ms | 文字成形，呼吸运动开始 |
| 2200ms | 副标题行 fadeUp 淡入 |
| 2500ms | CTA 按钮 spring 弹入 |
| 2800ms | Trust logos 淡入 |

> **⚠️ 无 DOM 文字节点：** Slogan 完全由粒子构成，无 `<h1>` 等字体渲染。无障碍处理：`<canvas aria-label="Pushing the Boundaries of AI" role="img">`

### Hero 布局

```
100vh 垂直居中
  [eyebrow — 13px，#F040A0，letter-spacing 0.08em]
  MEDICAL AI · CAPSULE ENDOSCOPY
  
  [粒子 slogan — clamp(2.5rem, 7vw, 4.5rem)]
  Pushing the Boundaries of AI
  
  [subtext — 18px system-ui，--color-text-secondary，max-width 520px]
  
  [Get Demo ▶]   [Learn More →]
  
  ── Trusted by ──
  [Ministry of Awesome · UoA · NVIDIA · Google Cloud · AWS]
  
  [↓ scroll indicator — 底部居中，细线脉冲动画]
```

**Mobile (≤768px)：**
- 粒子 slogan 字号：`clamp(1.6rem, 8.5vw, 2.4rem)`，重新采样像素坐标
- 环境粒子 count: 60，关闭鼠标扰动
- 视频保留，poster 图作 loading fallback

---

## 4. 内页页头（Product / Team / Media / Contact）

无视频，无粒子，品牌一致。

```css
.inner-header {
  height: 220px;
  padding-top: 64px;
  background: var(--color-bg-subtle);
  background-image: var(--gradient-brand-soft);
  border-left: 4px solid transparent;
  border-image: var(--gradient-brand) 1;
  display: flex; flex-direction: column;
  justify-content: flex-end;
  padding-inline: clamp(24px, 5vw, 80px);
  padding-bottom: 40px;
}
.inner-header .eyebrow {
  color: var(--color-primary-400);
  font-size: 0.75rem; letter-spacing: 0.08em;
  text-transform: uppercase; margin-bottom: 8px;
}
.inner-header h1 {
  font-family: var(--font-display);
  font-size: clamp(1.875rem, 5vw, 3rem);
  font-weight: 700; letter-spacing: -0.02em;
  color: var(--color-text-primary);
}
@media (max-width: 768px) { .inner-header { height: 160px; } }
```

---

## 5. Navigation（shared.css — 全页面引用）

```css
.nav {
  position: fixed; top: 0; width: 100%; height: 64px; z-index: 100;
  background: rgba(8, 8, 28, 0.88);
  backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid var(--color-border);
  transition: background 0.25s ease;
}
.nav.scrolled { background: rgba(8, 8, 28, 0.97); }

@media (max-width: 768px) {
  /* 去除 backdrop-filter，避免与粒子 canvas GPU 层叠加掉帧 */
  .nav { background: rgba(8, 8, 28, 0.97); backdrop-filter: none; }
}
```

Logo: Space Grotesk 700，`--color-text-primary` + `▸` in `var(--brand-pink)`  
链接: system-ui 14px，`--color-text-secondary` → hover `--color-primary-400`，0.2s ease  
CTA "Get Demo": `background: var(--gradient-brand)`，8px radius，10px 20px，white 600

---

## 6. Spacing & Component Tokens

```css
:root {
  --space-2:4px; --space-4:16px; --space-6:24px; --space-8:32px;
  --space-10:40px; --space-12:48px; --space-16:64px; --space-24:96px;
  --section-py: clamp(64px, 8vw, 96px);
  --container-xl: 1200px; --container-sm: 640px;
  --radius-sm:6px; --radius-md:10px; --radius-lg:16px; --radius-full:9999px;
  --shadow-glow-primary:   0 0 28px rgba(232, 0, 90, 0.32);
  --shadow-glow-secondary: 0 0 24px rgba(45, 50, 130, 0.30);
  --transition-fast: 0.15s ease; --transition-base: 0.25s ease;
  --transition-spring: 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Typography */
  --font-display: 'Space Grotesk', system-ui, -apple-system, sans-serif;
  --font-body:    system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono:    ui-monospace, 'SF Mono', 'Cascadia Code', monospace;
  --text-hero:    clamp(2.5rem, 7vw, 4.5rem);
}

@font-face {
  font-family: 'Space Grotesk';
  font-weight: 600 700; font-display: swap;
  src: url('fonts/space-grotesk-600-700.woff2') format('woff2');
  unicode-range: U+0020-007E, U+00A0-00FF;
}
```

| Component | Tokens |
|---|---|
| Primary Button | `--gradient-brand`，`--radius-md`，white 600，hover `brightness(1.1)` + `--shadow-glow-primary` |
| Ghost Button | `border: 1px solid --color-border-strong`，`--color-primary-400`，hover `--color-primary-glow` bg |
| Card | `--color-bg-surface` + `--gradient-card-edge` `::before`，`--color-border`，`--radius-lg`，hover `translateY(-4px)` |
| Stats Number | `--font-mono`，`--gradient-text` clip，clamp(2rem, 4vw, 3rem) |
| Form Input | `--color-bg-elevated`，`--color-border`，focus `--brand-pink` border + 3px `--color-primary-glow` ring |
| Eyebrow | `--color-primary-400`，uppercase，`letter-spacing: 0.08em`，左侧 `3×20px` 品牌色竖线 |

---

## 7. Motion & Accessibility

```css
.reveal {
  opacity: 0; transform: translateY(20px);
  transition: opacity 0.55s ease, transform 0.55s ease;
}
.reveal.visible { opacity: 1; transform: none; }
.reveal:nth-child(2) { transition-delay: 100ms; }
.reveal:nth-child(3) { transition-delay: 200ms; }

@media (prefers-reduced-motion: reduce) {
  *, .reveal { transition: none !important; animation: none !important; }
  /* Particle canvas: 停止所有动画，渲染静态点阵 */
}
```

- Particle canvas：`document.hidden` 时暂停 rAF，`visibilitychange` 时恢复
- Touch 检测：`navigator.maxTouchPoints > 0` → 关闭鼠标扰动
- 无障碍：`<canvas role="img" aria-label="Pushing the Boundaries of AI">`

---

*Design Spec v2 Final — Aria · Sprint-02 · Victor 确认版 · For Finn · Queries via q*
