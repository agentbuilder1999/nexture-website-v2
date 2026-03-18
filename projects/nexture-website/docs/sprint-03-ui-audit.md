# Sprint-03 UI 审计 — nexture-website-v2

> 发起：Victor · 2026-03-16  
> 数据来源：视频 `misc/2026-03-16 093233.mp4` + HAR `misc/nexture-website-v2.vercel.app.har`  
> 当前线上：https://nexture-website-v2.vercel.app

---

## 审计结论（Aria，2026-03-16）

### 🔴 高优先级

#### 1. Logo 被挤压
- **根因**：`<Image width={120} height={40}>` 强制 3:1 比例，与实际 logo 比例不符
- **修复**：`width={0}` + `className="h-9 w-auto object-contain"`

#### 2. 导航背景割裂
- **根因**：`rgba(12,5,36,0.85)` 与页面底色 `#0c0524` 几乎相同，形成贴上去的暗条
- **修复**：改为 `rgba(22,10,61,0.60)` + `backdrop-filter: blur(24px) saturate(160%)`；滚动后 `.scrolled` 加深到 `rgba(16,6,45,0.82)`

#### 3. Meet TheraSeus 排版
- **根因**：左卡片 grid + 右侧图片两列等重，图片 `funnel-collapse.png` 自带黑边，`object-contain` 露出容器底色
- **修复**：改为全宽居中叙事布局（Section标题→全宽图片→4卡片横排）；图片加 `filter: brightness(1.2) contrast(1.1)` + mask 渐变去黑边

#### 4. Hero 三层金字塔波形（核心视觉）
- **设计叙事**：背景图已有上下两层静态菱形平台，ShaderGradient 作为中间动态层，三层合成三层金字塔，隐喻数据 AI 处理后上升到洞察层
- **Aria 设计规格**（已确认）：

| 层级 | 尺寸 | 位置 |
|------|------|------|
| 底层（背景图，静态） | 700×700px | top: 64% |
| 中间层（ShaderGradient，动态） | 530×530px | top: 51% |
| 顶层（背景图，静态） | 310×310px | top: 37% |

```
ShaderGradient 参数：
  rotationX: 52, rotationY: 0, rotationZ: 0
  cPolarAngle: 105, cDistance: 25
  uStrength: 1.4, uDensity: 1.5

clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)
mask-image: radial-gradient(ellipse 92% 92% at 50% 50%, black 55%, transparent 100%)

@keyframes waveRise {
  0%   { transform: translate(-50%, -50%) rotateZ(45deg) translateY(5px); }
  100% { transform: translate(-50%, -50%) rotateZ(45deg) translateY(-5px); }
}
animation: waveRise 7s ease-in-out alternate infinite;
```

---

### 🟡 中优先级

#### 5. 导航交互状态（毛玻璃胶囊）
- **问题**：active/hover 透明度 0.14，深色背景上几乎不可见
- **方案**：active → `rgba(154,129,223,0.22)` + border + `box-shadow: inset 0 1px 0 rgba(255,255,255,0.1)` + 紫色内发光

#### 6. 按钮形态（Apple 大圆角）
- **方案**：主 CTA（btn-teal）→ `border-radius: 9999px` 完全胶囊 + spring 动效；Ghost → `border-radius: 12px` + 毛玻璃

#### 7. 视频区块（新增，Hero 下方）
- **交互规格**：
  - 40% 可见时 IntersectionObserver 触发自动播放（无 bar/静音/循环）
  - 默认音量 60%，点击切换静音
  - 进场：`scale 0.94→1.0 + opacity 0→1`，600ms Expo Out
  - 静音提示：右下角毛玻璃胶囊，进场后 1.2s 淡入
  - 离开视口：静音（不暂停）

#### 8. 页面切换差异化动效
| 页面 | 进入 |
|------|------|
| Home | Fade |
| Product | Slide up (y:20→0) |
| Team | Scale (0.97→1) |
| Media | Blur in (6px→0) |
| Contact | Slide from right (x:30→0) |
> 实现：Next.js `app/template.tsx` + Framer Motion AnimatePresence

#### 9. 背景统一方案
- **不完全统一**（Aria 建议）：`body` 固定渐变（`background-attachment: fixed`）+ section 半透明叠加
```css
body {
  background: linear-gradient(180deg, #0f052e 0%, #0a0420 30%, #0c0630 70%, #0a0420 100%);
  background-attachment: fixed;
}
.section-alt { background: rgba(14,6,40,0.75); }
```

#### 10. Hero Slogan 居左
- **Aria 结论：保持居左**（B2B SaaS 标准，F-pattern 阅读流，右侧波形平衡）
- 可将 `max-w-3xl` 扩大到 `max-w-4xl`

---

## 审计待完成项

- [ ] **素材 prompt（Aria）**：分析被截断，需要 Aria 补完 nanobanana prompt 清单
- [ ] **Finn 动效分析报告**：已派发，尚未回报（2026-03-16 10:04 派发，Gateway 重启期间可能中断）

---

## 任务派发状态

| 任务 | 负责人 | 状态 | 备注 |
|------|--------|------|------|
| Hero 三层金字塔波形实现 | Finn | ⏳ 进行中 | 2026-03-16 10:24 派发，DoD 含 commit hash |
| 动效问题分析 | Finn | ⚠️ 未确认 | 10:04 派发，需重启后确认是否收到 |
| 素材 prompt 补完 | Aria | ⏳ 待派发 | 原始报告被 token 截断 |
| 其余 UI 改动（1-5,7-10） | Finn | ⏳ 待派发 | 等三层金字塔完成 + Victor 确认后整批派发 |

---

## 系统配置变更记录（2026-03-16）

| 变更 | 内容 |
|------|------|
| `agents.defaults.thinkingDefault` | `adaptive`（新 session 默认） |
| Aria (ux) thinking | session override: `off`（待 Victor 在 #aria topic 发 `/think off` 确认） |
| Finn (frontend) thinking | session override: `off` ✅ |
| Sage (qa) thinking | session override: `off` ✅ |
| Atlas / Rex / Nova / q thinking | `adaptive` ✅ |
