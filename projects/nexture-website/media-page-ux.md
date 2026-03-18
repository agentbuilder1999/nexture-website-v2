# Nexture 媒体页 UX 设计方案
**设计者：** Aria (UX Designer)  
**日期：** 2026-03-14  
**任务：** T060-A  
**依据：** DECISIONS-2026-03-14.md / source-material-analysis.md / themes.txt

---

## 一、页面定位与受众

**媒体页目标受众：**
1. 潜在合作医院/投资人（验证可信度）
2. 新闻记者（寻找背景资料）
3. 医生（评估产品的行业认可度）

**设计目标：**
- 一眼传递"有 NZ 主流媒体背书"
- 播客体现 Victor 的思想领导力
- Partner Logos 证明生态系统级别的认可

---

## 二、页面结构

```
┌─────────────────────────────────────────┐
│  NAV（全站复用）                           │
├─────────────────────────────────────────┤
│  [1] PAGE HERO                           │
│   "In the News"                          │
│   一句副标题                              │
├─────────────────────────────────────────┤
│  [2] PRESS COVERAGE                      │
│   5张媒体卡片（网格/列表切换可选）           │
├─────────────────────────────────────────┤
│  [3] PODCAST — Nexture AI Dive           │
│   独立区块（视觉分隔，非列表混排）           │
├─────────────────────────────────────────┤
│  [4] TRUSTED BY / PARTNER LOGOS          │
│   静态网格（5 Logos）                      │
├─────────────────────────────────────────┤
│  FOOTER（全站复用）                        │
└─────────────────────────────────────────┘
```

---

## 三、各区块详细设计

### [1] Page Hero

**高度：** `min-h-[280px]`，无全屏（节省滚动路径，媒体页信息密度高）

**内容：**
```
标题（渐变）：  In the News
副标题：        Nexture's work in AI-powered healthcare
                has been recognized across New Zealand.
```

**视觉：**
- 标题应用品牌渐变 `#A680FF → #FF85B8 → #FFB070`
- 背景：页面基础背景 `#0C0524` + 轻微 `Purple-bfg.avif` 叠加（`opacity: 0.3`）
- 无 CTA，直接进入内容

---

### [2] Press Coverage — 媒体卡片区

#### 布局方案：三列网格（Desktop）

```
Desktop (≥1024px): grid-cols-3，5 张卡片（最后一行居中 2 张）
Tablet (768-1023px): grid-cols-2
Mobile (<768px): grid-cols-1
```

卡片间距：`gap-6`（24px）

#### 媒体卡片组成

```
┌─────────────────────────────────┐
│  [Source Logo / Favicon]  [日期] │  ← 顶部信息栏
│─────────────────────────────────│
│  文章标题（2行 clamp）             │  ← 主要内容
│                                 │
│  摘要（3行 clamp）                │
│                                 │
│  [Read Article →]               │  ← 外链 CTA
└─────────────────────────────────┘
```

#### 各字段设计规则

| 字段 | 样式 | 说明 |
|------|------|------|
| Source Name | `text-xs font-semibold text-[#876CD4] uppercase tracking-wider` | 紫色，品牌色，高可识别性 |
| 日期 | `text-xs text-[#E0D6DE]/50` | 半透明，次要信息 |
| 标题 | `text-base font-semibold text-[#E0D6DE] line-clamp-2` | 主要阅读焦点 |
| 摘要 | `text-sm text-[#E0D6DE]/70 line-clamp-3` | 70% 透明度，减少视觉重量 |
| "Read Article →" | `text-sm text-[#2A9D8F] hover:text-[#3BBDAC]` | 品牌主色，外链交互 |

#### 卡片颜色规范（Dark Purple 主题）

```css
.media-card {
  background: #160A3D;          /* 比页面背景稍亮 */
  border: 1px solid rgba(154, 129, 223, 0.15);  /* 淡紫边框 */
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;
}

.media-card:hover {
  border-color: rgba(154, 129, 223, 0.4);
  background: #1E1050;           /* hover 稍微更亮 */
  box-shadow: 0 8px 32px rgba(116, 86, 200, 0.2);  /* 紫色辉光 */
  transform: translateY(-2px);
}
```

#### 5 张媒体卡片内容

| # | 来源 | 标题 | 摘要（建议文案） |
|---|------|------|--------------|
| 1 | Good News Aotearoa | Six Kiwi Innovations Changing the Game | "Nexture's AI-powered diagnostics featured among New Zealand's most impactful tech innovations." |
| 2 | NZ Entrepreneur Magazine | The Kiwi AI Startup Revolutionising Gastrointestinal Healthcare | "Victor Sun's 25-year journey in healthcare technology led him back to New Zealand to solve a critical diagnostic bottleneck." |
| 3 | chi.org.nz | Nexture: Revolutionising Gastrointestinal Healthcare | "Christchurch-based Nexture is using deep learning to cut capsule endoscopy review time by 90%." |
| 4 | Ministry of Awesome | Startup Stories: Victor Sun — Nexture | "How a seasoned AI entrepreneur found his mission in Christchurch's innovation ecosystem." |
| 5 | caffeinedaily.co | New Startup Tackles Diagnostic Delays | "Nexture addresses one of gastroenterology's most persistent pain points with AI-driven workflow optimization." |

---

### [3] Podcast 区块 — Nexture AI Dive

**设计原则：** 独立区块，视觉上与媒体卡片有明显分隔（section 背景加深或加边框线）

**布局：** 横向两栏（Left: 播客介绍 | Right: 平台链接按钮组）

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  🎙️  Nexture AI Dive                                    │  ← 播客名（渐变标题）
│                                                          │
│  "Dive into the cutting edge of artificial intelligence  │
│  with Nexture AI Dive. Expert analysis and captivating   │
│  discussions every Sunday."                              │
│                                                          │
│  [🟢 Listen on Spotify]  [🎵 Apple Podcasts]             │
│  [🎶 Amazon Music]                                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**颜色规范：**
```css
.podcast-section {
  background: #0A0520;    /* 比页面背景略深，创造分区感 */
  border-top: 1px solid rgba(154, 129, 223, 0.2);
  border-bottom: 1px solid rgba(154, 129, 223, 0.2);
  padding: 64px 0;
}

.podcast-title {
  /* 应用品牌渐变 */
  background: linear-gradient(90deg, #A680FF 5%, #FF85B8 45%, #FFB070 85%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2rem;
  font-weight: 700;
}
```

**平台按钮设计（三个，横向排列）：**
```css
.platform-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid rgba(154, 129, 223, 0.3);
  border-radius: 8px;
  color: #E0D6DE;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.platform-btn:hover {
  border-color: #2A9D8F;
  color: #2A9D8F;
  background: rgba(42, 157, 143, 0.08);
}
```

---

### [4] Partner Logos 区块

**Victor 确认的 5 个 Partners：**
NVIDIA Inception / Ministry of Awesome / University of Otago / AWS / Google

**布局方案：静态网格（5 Logos）**

```
Desktop: flex 横向均匀分布（justify-between），5 logo 一行
Mobile: 3+2 两行网格
```

**为何不用滚动跑马灯：**
- 5 个 Logo 数量少，静态展示更有力（滚动带感觉像在"凑数量"）
- 静态展示每个品牌都清晰可见，传递更强的认可感

**颜色规范：**
```css
.partner-section {
  background: #0C0524;    /* 页面基础背景 */
  padding: 56px 0;
}

.partner-label {
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 12px;
  font-weight: 600;
  color: rgba(224, 214, 222, 0.4);  /* 很淡，不抢主角 */
  margin-bottom: 40px;
}
/* 内容："Supported & recognized by" */

.partner-logo {
  filter: brightness(0) invert(1);      /* 将彩色 Logo 转为白色 */
  opacity: 0.6;
  transition: opacity 0.2s;
  height: 32px;                          /* 统一高度，宽度自适应 */
  max-width: 120px;
  object-fit: contain;
}

.partner-logo:hover {
  opacity: 1;                            /* hover 全亮，强调 */
}
```

**为何 filter: invert：**
- 深色背景下彩色 Logo（红色 AWS、绿色 NVIDIA 等）视觉混乱
- 统一白色 + 半透明处理，既整洁又不失识别度
- 是行业标准做法（见 Vercel / Linear / Lusion 的 Logo 处理）

---

## 四、Dark Purple 主题完整色值参考

### 媒体页专用色值表

| 元素 | Hex | 用途 |
|------|-----|------|
| 页面背景 | `#0C0524` | 基础背景 |
| 卡片背景 | `#160A3D` | 媒体卡片默认态 |
| 卡片 hover 背景 | `#1E1050` | 鼠标悬停 |
| Podcast 区背景 | `#0A0520` | 区块分隔，比页面深 |
| 卡片边框 | `rgba(154, 129, 223, 0.15)` | 默认态 |
| 卡片 hover 边框 | `rgba(154, 129, 223, 0.40)` | 悬停态 |
| hover 辉光 | `rgba(116, 86, 200, 0.20)` | box-shadow |
| 标题渐变 | `#A680FF → #FF85B8 → #FFB070` | Section 标题 |
| 正文 | `#E0D6DE` | 主要文字 |
| 次要文字 | `rgba(224, 214, 222, 0.70)` | 摘要、副标题 |
| 最淡文字 | `rgba(224, 214, 222, 0.40)` | 日期、小标签 |
| 来源标签 | `#876CD4` | 媒体来源名 |
| 外链颜色 | `#2A9D8F` | "Read Article →" |
| 外链 hover | `#3BBDAC` | 悬停亮化 |
| Partner Label | `rgba(224, 214, 222, 0.40)` | "Supported by" 标签 |

---

## 五、移动端适配要点

1. **媒体卡片**：单列，卡片高度不设 min-height，全展开
2. **播客区块**：标题居中，平台按钮换行堆叠（`flex-wrap: wrap`）
3. **Partner Logos**：`grid-cols-3` + `grid-cols-2` 两行，`gap-6`
4. **Page Hero**：标题降至 `text-3xl`（28px），副标题 `text-sm`

---

## 六、交互规范

| 交互 | 行为 |
|------|------|
| 媒体卡片点击 | 全卡片可点击（`<a>` 包裹），`target="_blank" rel="noopener"` |
| "Read Article →" | 视觉强调，键盘可聚焦 |
| Partner Logo hover | opacity 0.6 → 1.0，`transition: 0.2s` |
| 平台按钮 | 明确的 focus ring（`outline: 2px solid #2A9D8F`）|

---

*设计规范完成时间：2026-03-14 · Aria*
