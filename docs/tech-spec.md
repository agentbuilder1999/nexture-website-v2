# Tech Spec — nexture.nz Landing Page (Sprint-01)

> Target: **workspace-shared/docs/tech-spec.md**
> Author: Atlas · 2026-03-10

---

## 1. Particle Effect: Recommendation

### Decision: **原生 Canvas 2D API**

| 方案 | 体积 | 依赖 | 自定义度 | 性能 |
|---|---|---|---|---|
| **Canvas 2D (推荐)** | 0 KB | 无 | ★★★★★ | ★★★★☆ |
| tsParticles | ~40 KB min+gz | npm/CDN | ★★★★☆ | ★★★★☆ |
| particles.js | ~15 KB min+gz | CDN | ★★★☆☆ | ★★★☆☆ |

**理由：**

1. **零依赖** — 单文件约束下无需引入外部 CDN，消除第三方可用性/版本风险。
2. **完全控制** — 鼠标跟随粒子的行为（吸引/排斥半径、连线、颜色渐变）可精确调参，无需绕过库的抽象层。
3. **体积** — Landing page 首屏性能关键；原生实现粒子系统约 80-120 行 JS，gzip 后 < 2 KB。
4. **particles.js 已停维** — 最后更新 2017，已知内存泄漏。tsParticles 功能过剩、API 复杂度不匹配此场景。
5. **浏览器兼容** — Canvas 2D 支持到 IE9+，所有主流浏览器零 polyfill。

### 实现要点

```
Canvas 全屏背景 (position: fixed, z-index: 0)
├─ Particle pool: 80-120 个粒子（视口面积自适应）
├─ 每帧更新: requestAnimationFrame loop
├─ 鼠标交互: mousemove → 粒子向鼠标位置偏移（引力衰减 1/r²）
├─ 连线: 粒子间距 < 150px 时绘制半透明线段
├─ 响应式: resize 事件重置 canvas 尺寸 + 粒子重分布
└─ 移动端: touch 事件映射 + 粒子数量减半（性能保护）
```

---

## 2. HTML 文件结构

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexture — Digital Solutions</title>
  <meta name="description" content="...">
  <!-- All CSS inline in <style> -->
</head>
<body>

  <!-- ① Background Canvas — 全屏粒子画布 -->
  <canvas id="particles"></canvas>

  <!-- ② Navigation -->
  <nav class="nav">
    <!-- Logo + hamburger (mobile) + links -->
  </nav>

  <!-- ③ Hero Section -->
  <section id="hero">
    <!-- 主标题 / 副标题 / CTA button -->
  </section>

  <!-- ④ Services Section -->
  <section id="services">
    <!-- 3-4 service cards (grid) -->
  </section>

  <!-- ⑤ About Section -->
  <section id="about">
    <!-- 公司简介 / 团队理念 -->
  </section>

  <!-- ⑥ Contact / CTA Section -->
  <section id="contact">
    <!-- 联系表单或 CTA -->
  </section>

  <!-- ⑦ Footer -->
  <footer>
    <!-- 版权 / 社交链接 -->
  </footer>

  <!-- All JS inline in <script> -->
  <script>
    // Particle system + UI interactions
  </script>

</body>
</html>
```

### Section 职责说明

| Section | 用途 | 关键样式 |
|---|---|---|
| `canvas#particles` | 全屏粒子背景 | `position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none` |
| `nav` | 固定顶部导航 | `position:fixed; z-index:100; backdrop-filter:blur(10px)` |
| `#hero` | 首屏视觉焦点 | `min-height:100vh; display:flex; align-items:center` |
| `#services` | 服务展示 | `CSS Grid: auto-fit, minmax(280px, 1fr)` |
| `#about` | 公司信息 | 文字为主，简洁 |
| `#contact` | 转化入口 | 表单或 mailto CTA |
| `footer` | 法律/链接 | 固定底部信息 |

---

## 3. Technical Constraints

### 硬约束
- **单文件** `index.html`：CSS 内联 `<style>`，JS 内联 `<script>`
- **零构建工具**：无 Webpack/Vite/PostCSS
- **零外部依赖**：无 CDN 引用、无 npm
- **ES6+**：`const/let`、arrow functions、template literals、`class`（不用 `var`）
- **响应式**：移动优先 media queries，断点 480px / 768px / 1200px

### 浏览器兼容目标
- Chrome 80+, Firefox 78+, Safari 14+, Edge 80+
- iOS Safari 14+, Chrome Android 80+
- **不支持** IE（允许使用 ES6+ 特性）

### 性能预算
| 指标 | 目标 |
|---|---|
| 文件大小 | < 50 KB (uncompressed) |
| 首次内容绘制 (FCP) | < 1.0s |
| 粒子帧率 | ≥ 55 fps @ 1080p |
| Lighthouse Performance | ≥ 90 |

### 可访问性
- 语义化 HTML5 标签（`nav`, `section`, `footer`）
- `prefers-reduced-motion` 媒体查询：禁用粒子动画，显示静态背景
- 所有交互元素可键盘访问
- 颜色对比度 ≥ 4.5:1 (WCAG AA)

### 粒子系统参数（建议默认值）

```javascript
const CONFIG = {
  particleCount: 100,        // 桌面端；移动端 ÷ 2
  particleRadius: [1, 3],    // 随机半径范围 px
  speed: [0.2, 0.8],         // 随机速度范围 px/frame
  lineDistance: 150,          // 连线最大距离 px
  lineWidth: 0.5,            // 连线宽度 px
  mouseRadius: 200,           // 鼠标影响半径 px
  mouseForce: 0.05,          // 鼠标引力系数
  color: 'rgba(255,255,255,' // 粒子/线段基色（alpha 动态计算）
};
```

---

## 4. Deployment Note

静态单文件，部署选项：
- **S3 + CloudFront**（推荐，后续可复用）：S3 静态托管 + CloudFront 分发 + Route53 DNS + ACM 证书
- **GitHub Pages**：临时方案，零成本快速上线

---

*End of spec. Aria 按 §2 结构设计视觉稿，Finn 按 §3 约束实现。*
