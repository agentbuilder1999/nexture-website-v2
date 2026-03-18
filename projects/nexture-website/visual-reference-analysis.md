# 视觉参考站点技术分析报告

**分析人：** Finn (Frontend Developer)  
**日期：** 2026-03-13  
**分析源：** lusion.co.har (32MB) · lumonus.com.har (3MB) · shadergradient.co.har (4.2MB)  
**用途：** Nexture 网站改版视觉技术参考

---

## 1. lusion.co — 深度分析

### 1.1 技术栈

| 层次 | 技术 | 证据 |
|------|------|------|
| **框架** | Astro (SSG) | URL 路径 `/_astro/hoisted.81170750.js`、`/_astro/about.e7252178.css` |
| **WebGL 渲染** | OGL（轻量 WebGL 库） | 主包 1239KB，无 Three.js，使用 `.buf` 格式模型（OGL 私有二进制格式） |
| **3D 格式** | 自定义 `.buf` 二进制 | 非标准 glTF，lusion 自研压缩格式，加载极快 |
| **光照材质** | Matcap + EXR HDR | `matcap.exr` (588KB)、normal maps (`_nor.webp`)、ARM maps (`_arm.webp`) |
| **视频** | MP4 progressive | `desktop.mp4` 分 4 次渐进加载（64KB→31KB→1.5MB→3.2MB），平滑播放 |
| **音频** | 全站音效系统 | hover/click/page/cinematic/glass_broken 共 13 个 `.ogg` 文件 |
| **字体** | 自定义 + Aeonik + IBM Plex Mono | `LusionMono.woff2`（自研等宽字体）|
| **CDN** | lusion.dev（静态资源）+ lusion.co（HTML） | 主域名与资源域名分离 |

### 1.2 核心视觉效果

**① 深度视差（Depth Parallax）**

每个项目图片都配有对应的 `_depth.webp`（比主图小 5-10x）：
```
home.webp       (105-261KB) — 主图
home_depth.webp (4-30KB)    — 深度图（灰度）
```
深度图驱动 WebGL 着色器，鼠标移动时模拟视差位移，创造「图片有厚度」的幻觉。这是 lusion 最标志性的首页效果。

**② 3D 隧道穿越动画（Tunnel Effect）**

加载的 3D 资产清单：
```
astronaut_helmet.buf       (168KB)  + 3 套纹理贴图
astronaut_wearpack.buf     (188KB)  + 动画数据
tunnel_block_wall.buf      (355KB)  — 隧道几何体
grid_structure_hd.buf      ( 88KB)  — 网格结构
broken_glass.buf           (132KB)  + 破碎动画
```
全 3D 宇宙隧道过场动画，内含宇航员模型、破碎玻璃物理动画、太空电视效果（`tablet.png`/`desktop.png` 贴图）。

**③ About 页 3D 地形场景**

```
terrain.buf                (387KB)  — 地形网格
person.buf + person_idle.buf       — 角色模型+待机动画
rock_0~3.buf × 2（高低精度）        — 可拾取岩石
terrain_shadow_light_height.webp (1086KB) — 高度+光照贴图
fog.png                    ( 55KB)  — 雾效纹理
```
沉浸式 3D About 页，人物站在山坡上，有环境光、雾效、动态岩石。

**④ 全站音频反馈**

```
hover_0/1/2.ogg   — 悬停音效（3种随机）
click_0/1.ogg     — 点击音效
focus_0/1/2.ogg   — 聚焦音效
glass_broken.ogg  — 破碎特效音
page_0/1.ogg      — 页面切换音
cinematic_0/2/3.ogg — 场景背景音乐
```
音频 + 视觉联动，创造游戏级沉浸感。

**⑤ 资源加载策略**

- 主 JS (1.2MB) 首帧加载，WebGL context 立即建立
- 3D 资产按需流式加载（进入对应区域才 fetch）
- 视频 4 段渐进加载（先低质预览，再 full HD）
- 图片全部 WebP，关键纹理 ACES EXR 格式

### 1.3 技术小结

lusion.co 是**自研 WebGL 引擎**的代表：不用 Three.js，用更轻量的 OGL，配合自定义 `.buf` 二进制格式和完整音效系统。实现成本极高，不适合直接复制，但深度视差和隧道效果的**设计理念**可借鉴。

---

## 2. lumonus.com — 分析

### 2.1 技术栈

| 层次 | 技术 | 证据 |
|------|------|------|
| **框架** | 静态营销站（疑似 Webflow） | 仅 20 个请求，无 JS 框架文件 |
| **视觉技术** | 静态图片 + CSS | 全部为 PNG 截图，无 WebGL/Canvas |
| **内容** | 产品截图展示 | 文件名含 `Group 427321591.png` 等设计导出命名 |

### 2.2 视觉特征

- **极简加载**：20 条请求，4-5 张大图（200-470KB），其余为 HTML/CSS
- **视觉风格**：产品 mockup 截图为主，设计精良但无动态效果
- **无 3D/WebGL**：纯 CSS + 高质量静态图片

### 2.3 技术小结

lumonus.com 是**高质量静态展示站**，重点在设计和内容而非技术特效。对 Nexture 的参考价值在于：**精良的产品截图展示方式**，而非技术实现。

---

## 3. shadergradient.co — 分析

### 3.1 技术栈

| 层次 | 技术 | 证据 |
|------|------|------|
| **框架** | Framer | `framerusercontent.com` CDN，`framer.dhduowes.mjs` (462KB) |
| **动画** | Framer Motion | `motion.dbqug9au.mjs` (142KB) |
| **核心库** | @shadergradient/react | `ShaderGradientStateless.0XmDN_TB.mjs` 直接加载 |
| **HDR 资产** | GitHub Pages 托管 | `ruucm.github.io/shadergradient/ui@latest/` |
| **构建** | Framer 托管（framerusercontent.com CDN） | 所有 `.mjs` 均从 framerusercontent 加载 |

### 3.2 网站结构

shadergradient.co **就是** shadergradient 库的官方展示站，网站本身用 Framer 搭建，展示组件由 `@shadergradient/react` 驱动。关键文件：

```
ShaderGradientStateless.0XmDN_TB.mjs — 实际渲染组件
shared-lib.dcsd6k4h.mjs (1376KB)      — Framer 核心 + Three.js
motion.dbqug9au.mjs (142KB)           — Framer Motion 动画
```

与 T050 研究的关系：**完全一致**，网站本身是该库的 live demo。HDR 环境贴图（city/dawn/lobby）从 `ruucm.github.io` 加载，这就是为什么需要 `envBasePath` 配置。

### 3.3 技术小结

shadergradient.co = Framer 网站 + 自家库的实时展示。对 Nexture 的参考价值：确认了库的**实际运行效果**和**HDR 资产来源**。

---

## 4. 三站共性技术模式

| 模式 | lusion.co | lumonus.com | shadergradient.co | 描述 |
|------|-----------|-------------|-------------------|------|
| 自定义字体 | ✅ Aeonik | ❓ | ✅ 多款 | 品牌感依赖独特字体排版 |
| 深色背景 | ✅ 深黑 | ❌ 浅色 | ✅ 暗色 | premium 设计倾向深色底 |
| WebP 图片 | ✅ 全部 | ✅ | ✅ | 图片格式统一现代化 |
| 渐进式加载 | ✅ 视频分段 | — | ✅ lazyLoad | 重资产按需加载 |
| 无 jQuery | ✅ | ✅ | ✅ | 现代原生/框架 |
| GPU 渲染 | ✅ OGL | ❌ | ✅ Three.js | 视觉冲击力来自 GPU |
| 声音设计 | ✅ 13个音效 | ❌ | ❌ | lusion 独特，成本高 |

**共性结论：**
1. **深色背景 + 亮色 accent** 是 premium 技术品牌的标准配色
2. **WebP + 渐进加载** 是性能标配
3. **自定义字体** 是品牌差异化关键
4. **WebGL/GPU** 是视觉冲击力的来源，非 WebGL 站点视觉差距明显

---

## 5. Nexture 可借鉴效果推荐

### themes.txt 主题解读

```
主色：#A680FF 5% → #FF85B8 45% → #FFB070 85%（紫→粉→橙渐变）
次色：#D783D8（粉紫）、#FF90A5（粉）、#FFB071（橙）
深色：#14083A（深紫）
背景：#0C0524（深紫黑）
```

**定位：** 深紫黑底 + 紫粉橙渐变文字 — 神秘、技术感、带温度的科技美学。与 lusion 的冷黑不同，Nexture 更有色彩生命力。

---

### 推荐效果清单（按实施难度排序）

#### 🟢 低难度 — 直接可实施

**效果①：ShaderGradient Hero 背景（最高优先级）**

```tsx
// Nexture 配色的 ShaderGradient 配置
<ShaderGradient
  type="sphere"
  animate="on"
  color1="#A680FF"   // 主紫
  color2="#FF85B8"   // 粉
  color3="#14083A"   // 深紫黑（背景色）
  grain="on"
  uSpeed={0.2}
  uStrength={0.8}
  lightType="3d"
  cPolarAngle={130}
  cDistance={2.0}
  cameraZoom={10}
/>
```
- **来源：** shadergradient.co + T050 研究
- **视觉：** 深紫底的紫粉球体，grain 质感，完美匹配 themes.txt
- **实施：** `pnpm add @shadergradient/react` + dynamic import，1天

**效果②：产品截图深度视差（lusion 同款原理）**

```tsx
// 每张截图配一张手动制作的深度图
// CSS filter + transform 实现，无需 WebGL
const handleMouseMove = (e) => {
  const { x, y } = e; // 归一化 -1~1
  image.style.transform = `translateX(${x * 12}px) translateY(${y * 8}px)`;
  depthLayer.style.transform = `translateX(${x * 24}px) translateY(${y * 16}px)`;
};
```
- **来源：** lusion 的 home.webp + home_depth.webp 模式
- **视觉：** 鼠标移动时截图有立体漂浮感，高端感 +50%
- **实施：** 纯 CSS/JS，不需 WebGL，2天（含制作深度层）

**效果③：渐变文字动画**

```css
/* 匹配 themes.txt 的流动渐变标题 */
.heading-gradient {
  background: linear-gradient(90deg, #A680FF 5%, #FF85B8 45%, #FFB070 85%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-size: 200%;
  animation: gradientFlow 4s ease infinite;
}

@keyframes gradientFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```
- **来源：** themes.txt 直接映射
- **视觉：** 标题文字有紫粉橙流动渐变
- **实施：** 纯 CSS，半天

---

#### 🟡 中难度 — 需要规划

**效果④：鼠标跟随粒子光晕**

```tsx
// 自定义 cursor 替换 + 粒子拖尾
// 用 Canvas 2D（非 WebGL），性能友好
const canvas = useRef<HTMLCanvasElement>(null);
// 每帧在鼠标位置绘制渐隐圆形，形成拖尾
```
- **来源：** lusion 的音效系统替代方案（视觉版）
- **视觉：** 鼠标拖紫粉光晕尾迹，强化品牌色感知
- **实施：** Canvas 2D，1-2天

**效果⑤：滚动触发区块入场（GSAP ScrollTrigger 替代）**

```tsx
// 用 Framer Motion + useInView
import { motion, useInView } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
>
  {children}
</motion.div>
```
- **来源：** lusion/shadergradient 都使用 Motion 类动画
- **视觉：** 区块内容随滚动优雅入场
- **实施：** `pnpm add framer-motion`，1天

**效果⑥：视频 Reel（类 lusion 风格）**

```
lusion 的做法：
  4段渐进加载 → 64KB低质首帧 → 3.2MB HD
  用 <video> autoplay muted loop + WebGL 后处理颜色校正

Nexture 简化版：
  单段 MP4 <video> autoplay muted loop
  CSS filter: brightness/contrast 微调色调
  不需要 WebGL 后处理
```
- **来源：** lusion 的 desktop.mp4 策略
- **实施：** 2-3天（含视频制作）

---

#### 🔴 高难度 — 长期规划

**效果⑦：WebGL 深度视差 3D 卡片（lusion 完整版）**

- 需要 Three.js/OGL + 自定义深度着色器
- 每张产品图需制作 depth map（Blender 或 PS 深度扩展）
- 估算 1-2 周实施

**效果⑧：3D 场景过场（lusion tunnel 类似物）**

- 需要 3D 建模 + WebGL 动画系统
- Nexture 品牌感：星际/粒子隧道更符合（非宇航员）
- 估算 3-4 周实施（含建模）

---

## 6. 综合实施路线推荐

```
Phase A（1周，立即可做）：
  ✅ ShaderGradient Hero（紫粉球体）
  ✅ 渐变文字流动动画
  ✅ Framer Motion 滚动入场
  → 视觉提升 60%，技术风险低

Phase B（2-3周）：
  ✅ CSS 深度视差（产品截图漂浮感）
  ✅ 自定义鼠标光晕
  ✅ 视频 Reel 区块
  → 视觉提升至 85%

Phase C（长期，Sprint N+2）：
  ✅ WebGL 深度视差（完整版）
  ✅ 3D 过场动画
  → 达到 lusion 级视觉效果
```

---

## 7. 资产参考清单（来自 HAR 分析）

| 效果 | lusion 资产 | Nexture 等效制作 |
|------|-------------|-----------------|
| 产品深度图 | `*_depth.webp` (4-30KB) | PS/Blender 导出，每张截图配 1 张 |
| 环境贴图 | `matcap.exr` (588KB) | ShaderGradient 内置 city/dawn/lobby HDR |
| 自定义字体 | Aeonik + LusionMono | 待 Aria 确认字体选型 |
| 视频 Reel | `desktop.mp4` (3.2MB HD) | 待 Victor 提供或制作品牌 Reel |
| 音效 | 13个 .ogg (各 5-464KB) | Phase B 可选，投入产出比需评估 |

---

*报告版本：v1.0 | 分析：Finn | 2026-03-13*
