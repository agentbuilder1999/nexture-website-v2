# Sprint-03 AI 素材 Prompt 清单
> 作者：Aria · 2026-03-16  
> 工具：nanobanana（Victor 生成）  
> 背景色基准：`#0C0524`，主色 `#2A9D8F`，渐变 `#A680FF → #FF85B8 → #FFB070`

---

## 使用说明
- 所有 prompt 均为英文，可直接粘贴至 nanobanana
- 尺寸为最终使用规格，生成后如需裁剪请按比例处理
- 标注 ⭐ 为本 Sprint 最高优先级（Hero 三层金字塔）

---

## 一、Hero 三层金字塔素材（最高优先级）

Hero 三层结构需要两张独立的钻石形平台图，ShaderGradient 作为中间动态层：

```
顶层（静态）310×310px  ← A1
中层（ShaderGradient 动态）← 无需生成
底层（静态）700×700px  ← A2
```

### ⭐ A1 — Hero 顶层平台（小菱形）
用途：Home Hero，top: 37%，clip-path diamond  
尺寸：700×700px（Finn 裁剪为 310×310 展示）  
文件名：`hero-diamond-top.png`

```
A translucent glowing diamond-shaped tech platform viewed from a slight top-down angle, very small and compact, dark deep purple background #0C0524, the platform surface is made of dark crystalline material with subtle circuit board etchings, edges emit soft teal glow (#2A9D8F), holographic data particles floating above the surface, clean geometric precision, no text, no humans, photorealistic 3D render, center-composed on pure black/dark purple background, PNG with transparency around the diamond shape, cinematic 4K quality
```

### ⭐ A2 — Hero 底层平台（大菱形）
用途：Home Hero，top: 64%，金字塔底层  
尺寸：1400×1400px（展示用 700×700）  
文件名：`hero-diamond-bottom.png`

```
A large translucent diamond-shaped futuristic platform viewed from slightly above, dark crystalline surface with deep purple hue (#0C0524), detailed circuit board patterns etched into the surface glowing faintly in teal (#2A9D8F), the platform has three visible tiers/layers at its edges suggesting depth and data processing, soft purple-to-teal gradient rim lighting, faint holographic data streams rising from the surface, scattered glowing particles, no text, no humans, isolated on pure dark background with subtle transparency at edges, photorealistic sci-fi 3D render, 4K
```

---

## 二、Product 页素材

### B1 — TheraSeus 技术场景图
用途：Product 页 "Proprietary Technology" section 视觉  
尺寸：1200×800px  
文件名：`theraseus-technology.png`

```
Minimalist 3D visualization of AI analyzing medical capsule endoscopy frames, thousands of small medical images arranged in a cascading funnel pattern converging into a single bright teal beam (#2A9D8F), dark space-like background #0C0524, purple neural network lines interconnecting the frames, glowing data nodes, photorealistic render, no text overlays, no visible faces or people, clean and clinical aesthetic, professional medical technology illustration, 4K
```

### B2 — robot-hand 透明背景替换版
用途：Product 页 Hero 右侧浮动 / Features 区  
尺寸：800×800px（透明 PNG）  
文件名：`robot-hand-transparent.png`  
说明：现有版本白底，透明版 mix-blend-mode 更稳定

```
A sleek robotic hand with dark metallic finish and teal (#2A9D8F) glowing fingertip joints holding a small white medical capsule pill, isolated on completely transparent background, the hand has subtle purple accent lines along the joints, photorealistic 3D render, medical-grade aesthetic, top-down 3/4 view angle, no other elements, PNG transparency, soft teal rim light, 4K product photography style
```

---

## 三、Team 页素材

### C1 — About Hero 背景图
用途：Team 页 Hero 全宽背景  
尺寸：2752×1536px  
文件名：`about-hero-bg.png`

```
Abstract dark purple cosmic scene showing interconnected medical AI neural network nodes and data pathways, the overall composition forms a subtle layered pyramid silhouette suggesting advancement, deep background color #0C0524, glowing teal (#2A9D8F) connection lines between nodes, scattered purple (#9A81DF) accent particles, a sense of depth and layers with foreground nodes larger, no text, no humans, photorealistic digital art, left side intentionally less busy for text overlay, 4K landscape
```

### C2 — CEO 占位头像（临时，等真实照片）
用途：Team 页 Founder section 圆形头像  
尺寸：400×400px  
文件名：`ceo-placeholder.png`  
⚠️ 仅在 Victor 提供真实照片前使用，不可对外发布

```
Professional CEO portrait of a young Asian male entrepreneur in his late 20s to early 30s, clean modern style, wearing a dark navy or charcoal business casual shirt, neutral dark purple/navy background (#0C0524), soft cinematic studio lighting with slight teal rim light on one side, confident yet approachable expression, photorealistic style, square composition, suitable for corporate website headshot, 4K
```

---

## 四、Media 页素材

### D1 — Media Hero 背景
用途：Media 页 Hero section 背景  
尺寸：2400×800px  
文件名：`media-hero-bg.png`

```
Abstract visualization of digital media and news broadcasting, floating translucent newspaper/article card fragments arranged in a wave pattern, deep dark purple background #0C0524, cards emit soft white and teal (#2A9D8F) glow, subtle connection lines between cards suggesting information network, clean and minimal design, no readable text on the cards, photorealistic 3D render, suitable as a dark-themed press/media hero background, 4K widescreen
```

---

## 五、通用装饰元素

### E1 — Section 分隔装饰条
用途：Section 间装饰分隔（CSS ::before / ::after）  
尺寸：1440×120px（PNG 透明背景）  
文件名：`section-divider-circuit.png`

```
Ultra-wide thin decorative divider strip, dark background with transparent edges, subtle glowing circuit board traces running horizontally from left to right, occasional teal (#2A9D8F) glow nodes at circuit intersections, very minimal and abstract, suitable as a CSS border/divider element between web page sections, fades to full transparency at both left and right edges, PNG with alpha transparency, 4K wide
```

### E2 — OG 分享图
用途：meta og:image，社交媒体分享预览  
尺寸：1200×630px  
文件名：`og-image.png`

```
Clean social media preview card for a healthcare AI company called "Nexture", dark background #0C0524, the Nexture logo in white top-left area, large headline text "AI for Healthcare" in gradient from purple to teal, abstract medical AI visualization in the background with neural network nodes and faint capsule images, teal (#2A9D8F) accent lighting, professional modern tech-company aesthetic, 1200x630 pixels, suitable for Twitter/LinkedIn sharing preview
```

---

## 六、Podcast 封面

### F1 — "Nexture AI Dive" Podcast Cover
用途：Media 页 Podcast 区块封面  
尺寸：800×800px（Spotify/Apple Podcast 标准）  
文件名：`podcast-cover.png`

```
Square podcast cover art for "Nexture AI Dive" show about AI in healthcare, dark background (#0C0524), stylized abstract brain or neural network formed from teal (#2A9D8F) light lines with purple (#9A81DF) accents, microphone silhouette integrated subtly into the neural pattern, clean geometric design, the show title "Nexture AI Dive" in clean white sans-serif typography at the bottom, tagline "AI x Healthcare" in small teal text above the title, professional podcast artwork quality, 4K square
```

---

## 优先级汇总

| 优先级 | 素材 | 文件名 | 影响范围 |
|--------|------|--------|---------|
| ⭐⭐⭐ P0 | Hero 底层钻石 | `hero-diamond-bottom.png` | Home Hero 三层金字塔核心 |
| ⭐⭐⭐ P0 | Hero 顶层钻石 | `hero-diamond-top.png` | Home Hero 三层金字塔核心 |
| ⭐⭐ P1 | robot-hand 透明背景 | `robot-hand-transparent.png` | Product 页视觉质量 |
| ⭐⭐ P1 | Podcast 封面 | `podcast-cover.png` | Media 页完整性 |
| ⭐ P2 | TheraSeus 技术图 | `theraseus-technology.png` | Product 页丰富度 |
| ⭐ P2 | About Hero 背景 | `about-hero-bg.png` | Team 页视觉升级 |
| P3 | Media Hero 背景 | `media-hero-bg.png` | Media 页视觉升级 |
| P3 | Section 分隔条 | `section-divider-circuit.png` | 细节打磨 |
| P3 | OG 分享图 | `og-image.png` | SEO / 社交分享 |
| P4 | CEO 占位头像 | `ceo-placeholder.png` | 仅真实照片到位前临时用 |

---

## 给 Finn 的接入说明

生成完成后，Victor 将素材放入 `v2/public/assets/`。  
CSS 接入方式见 `visual-spec-v1.md` Task 4 + `sprint-03-ui-audit.md` §4（Hero 三层规格）。

---

*Aria · Sprint-03 · 2026-03-16*
