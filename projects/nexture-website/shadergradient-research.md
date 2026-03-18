# ShaderGradient 开源项目研究报告

**研究人：** Finn (Frontend Developer)  
**日期：** 2026-03-13  
**来源：** https://github.com/ruucm/shadergradient  
**版本：** @shadergradient/react v2.4.21  
**适用项目：** nexture.nz 网站 + TheraSeus 医生界面（共同参考）

---

## 1. 核心效果

### 1.1 几何形状（3 种）

| 类型 | 视觉特征 | 适用场景 |
|------|---------|---------|
| `plane` | 平面波浪渐变，有深度感，类似"流动的布料" | 全屏 Hero 背景，登录页 |
| `sphere` | 球形流体渐变，有光感，类似"活的星球" | 科技品牌展示，加载动画 |
| `waterPlane` | 倾斜水面，波纹效果，有真实液体感 | 沉浸式背景，section 分隔 |

### 1.2 Shader 类型（4 种）

- `defaults`：标准噪声渐变，通用
- `positionMix`：位置混合变体，色彩过渡更柔和
- `glass`：玻璃质感（v2.3.4 新增），高反射率，premium 感强
- `cosmic`：宇宙感（v2.3.3 新增），深空粒子感

### 1.3 光照系统

- `lightType: '3d'`：方向光，有明显阴影和高光，三维感强
- `lightType: 'env'`：HDR 环境贴图光（city / dawn / lobby 三种预设），更自然、柔和

### 1.4 动画参数（所有参数实时可控）

```
uSpeed     : 动画整体速度 (0 = 静止, 1+ = 快速)
uStrength  : 波形强度/变形幅度（影响"扰动感"）
uDensity   : 噪声密度（影响色块大小）
uFrequency : 噪声频率（影响细节层次）
uAmplitude : 位移幅度（sphere 膨胀/收缩）
grain      : 胶片颗粒感 on/off，grainBlending 控制强度
reflection : 反射率 0~1
wireframe  : 线框模式（调试用，线框感极强）
```

### 1.5 内置预设（来自 presets.ts）

| 预设名 | 类型 | 色彩 | 视觉特征 |
|--------|------|------|---------|
| **Halo** | plane | 橙 + 米 + 淡紫 | 暖色调、有机感、流动布料 |
| **Pensive** | sphere | 蓝 + 紫 + 亮紫 | 冷色调球体，科技感，zoomed in |
| **Mint** | waterPlane | 青绿 + 水蓝 + 白 | 清新水面，医疗/健康感 |
| **Interstella** | sphere | 青 + 橙 + 蓝灰 | 宇宙感，低饱和对比 |
| **Nighty Night** | waterPlane | 深紫 + 蓝灰 + 黑 | 暗色水面，深沉、专注 |

---

## 2. 技术实现

### 2.1 技术栈

```
GLSL Shaders（顶点 + 片元着色器）
    ↑
Three.js v0.169（3D 渲染引擎）
    ↑
@react-three/fiber（React 的 Three.js 声明式封装）
    ↑
@react-spring/three（弹簧动画，camera 过渡用）
    ↑
camera-controls（相机操控）
    ↑
@shadergradient/react（React 组件 API 封装）
```

**运行时：** WebGL 2.0（GPU 着色器，每帧渲染）

### 2.2 渲染特性（来自 consts.ts）

```typescript
// 核心 Canvas 配置
{
  dpr: pixelDensity,   // 设备像素比（默认1，2档位性能差2-4x）
  linear: true,        // sRGBEncoding（色彩准确）
  flat: true,          // ACESFilmicToneMapping（电影级色调映射）
  camera: { fov: 45 }  // 默认45°视角
}
```

**关键性能参数：**
- `pixelDensity={1}` → 快（默认），`pixelDensity={2}` → 精细但慢
- `powerPreference: 'high-performance' | 'low-power'` → GL 层面功耗控制
- `lazyLoad` + `threshold` + `rootMargin` → IntersectionObserver 懒加载，离开视口暂停渲染

### 2.3 包体积估算

| 依赖包 | gzip 大小（约） |
|--------|----------------|
| `three` | ~150 KB |
| `@react-three/fiber` | ~45 KB |
| `three-stdlib` | ~30 KB |
| `camera-controls` | ~15 KB |
| `@shadergradient/react` | ~20 KB |
| **合计** | **~260 KB gzip** |

⚠️ 这是**最大的成本**：three.js 是重依赖，需要 dynamic import + code splitting。

---

## 3. 使用方式（Next.js App Router）

### 3.1 安装

```bash
pnpm add @shadergradient/react @react-three/fiber three three-stdlib camera-controls
pnpm add -D @types/three
```

### 3.2 Next.js SSR 处理（必须）

WebGL 无法在 Server 端渲染，必须 `dynamic` 懒加载：

```tsx
// components/GradientBackground.tsx
'use client'
import dynamic from 'next/dynamic'

const ShaderBackground = dynamic(
  () => import('./ShaderBackgroundClient'),
  { ssr: false, loading: () => <div className="bg-slate-900 absolute inset-0" /> }
)

export default ShaderBackground
```

```tsx
// components/ShaderBackgroundClient.tsx
'use client'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

export default function ShaderBackgroundClient() {
  return (
    <ShaderGradientCanvas
      style={{ position: 'absolute', inset: 0 }}
      pixelDensity={1}
      fov={45}
      lazyLoad          // 离开视口自动暂停
    >
      <ShaderGradient
        type="plane"
        animate="on"
        uSpeed={0.3}
        uStrength={2}
        color1="#2A9D8F"
        color2="#264653"
        color3="#1a1a2e"
        grain="on"
        lightType="3d"
      />
    </ShaderGradientCanvas>
  )
}
```

### 3.3 URL String 模式（从 shadergradient.co 复制配置）

```tsx
// 直接用可视化工具生成的 URL 字符串驱动
<ShaderGradient
  control="query"
  urlString="https://www.shadergradient.co/customize?animate=on&type=sphere&color1=%23809bd6&color2=%23910aff&grain=on"
/>
```

### 3.4 API 友好度评分

| 维度 | 评分 | 说明 |
|------|------|------|
| React 集成 | ⭐⭐⭐⭐⭐ | 声明式 props，TypeScript 完整类型 |
| Next.js App Router | ⭐⭐⭐⭐ | 需要 dynamic import，有 CodeSandbox 示例 |
| 可视化配置 | ⭐⭐⭐⭐⭐ | shadergradient.co/customize 实时预览导出 |
| 文档质量 | ⭐⭐⭐ | README 清晰但示例偏少 |
| 移动端 | ⭐⭐⭐ | 可用，有 Mobile Safari 特殊处理 |

---

## 4. 最有视觉冲击力的效果（前端视角精选）

### 效果①：Pensive Sphere（蓝紫球体）★★★★★

```typescript
type: 'sphere', color1: '#809bd6', color2: '#910aff', color3: '#af38ff',
lightType: '3d', grain: 'on', uSpeed: 0.3, uStrength: 0.4,
cPolarAngle: 140, cDistance: 1.5, cameraZoom: 12.5
```
**特征：** 极度 zoomed-in 的紫色球体，几乎填满画面。有高光反射，grain 增加质感。
**适用：** TheraSeus 登录页 Hero，科技医疗感强，蓝紫色调暗示 AI/专业性。

### 效果②：Glass Shader + Plane ★★★★★

```typescript
type: 'plane', shader: 'glass', reflection: 0.8,
lightType: 'env', envPreset: 'lobby', grain: 'off'
```
**特征：** 半透明玻璃质感渐变，有高反射高光，极度 premium。
**适用：** Nexture 官网 About/Services section 背景，传达高端品牌感。

### 效果③：Cosmic Sphere ★★★★

```typescript
type: 'sphere', shader: 'cosmic', uDensity: 1.8, uSpeed: 0.2,
lightType: 'env', envPreset: 'dawn', brightness: 0.7
```
**特征：** 星云/宇宙粒子感球体，深色系，非常适合深色主题。
**适用：** Nexture Hero 深色版，TheraSeus AI 分析等待页面。

### 效果④：Nighty Night waterPlane ★★★★

```typescript
type: 'waterPlane', color1: '#606080', color2: '#8d7dca', color3: '#212121',
uSpeed: 0.3, uStrength: 1.5, grain: 'on', cPolarAngle: 80, cameraZoom: 9.1
```
**特征：** 暗色水面，紫灰调，颗粒感强。安静、深沉、专注感。
**适用：** TheraSeus 医生登录页全屏背景——暗色调不刺眼，与白色 UI 形成对比。

### 效果⑤：Mint waterPlane（加载动画变体）★★★

```typescript
type: 'waterPlane', color1: '#94ffd1', color2: '#6bf5ff', color3: '#ffffff',
uSpeed: 0.5, uStrength: 3.4, animate: 'on', grain: 'off'
```
**特征：** 清新水面，白色/青绿，快速流动感。
**适用：** TheraSeus AI 分析进度页，暗示"扫描/处理中"。

---

## 5. 应用场景建议

### 5.1 TheraSeus（医生管理界面）

| 场景 | 推荐效果 | 配置建议 |
|------|---------|---------|
| **登录页 Hero 背景** | Pensive Sphere 或 Nighty Night | 深色调，`uSpeed: 0.2`（慢速），`grain: on` → 专业、安静感 |
| **AI 分析进度页** | Mint waterPlane | `uSpeed: 0.5`，cyan 色调，暗示"处理中"；进度完成时 `animate: 'off'` 静止 |
| **主界面** | **❌ 不推荐** | 三面板审阅界面 = 医生高度专注工作，任何动态背景都是干扰 |
| **Splash/加载屏** | Cosmic Sphere | 深色 + 缓慢，品牌感强，1-2秒短暂展示 |

**医疗场景特别说明：**
- 颜色避免红色（与出血标注冲突），避免强烈橙黄（干扰图片色感）
- 蓝、绿、紫色调 = 安全（医疗品牌常用，专业感）
- 登录/非工作页面可用，**主 Review 界面绝对不用**

### 5.2 nexture.nz 官网

| 场景 | 推荐效果 | 配置建议 |
|------|---------|---------|
| **Hero 全屏背景** | Glass Plane 或 Halo | 饱满视觉冲击，`pixelDensity: 1.5` |
| **Section 过渡背景** | waterPlane（低 uSpeed） | `uSpeed: 0.1` 极缓慢，装饰性，不抢主角 |
| **Services 卡片 hover 效果** | Sphere 小尺寸 | 每张卡片内嵌 sphere，hover 时 `uSpeed` 加快 |
| **About 页面** | Interstella Sphere | 宇宙感，品牌视野宏大的隐喻 |
| **404 / Error 页** | Nighty Night | 深色调，不影响阅读，有品牌感 |

---

## 6. 局限性

### 6.1 性能开销（最大风险）

```
问题：Three.js 依赖约 260KB gzip，WebGL Canvas 每帧 GPU 渲染
影响：
  - 初始包体积增大（first load JS budget）
  - 电池设备（笔记本/手机）持续 GPU 占用
  - 低端设备帧率下降（< 30fps 时视觉体验反效果）

缓解方案：
  - dynamic import（懒加载，不进入主 bundle）
  - lazyLoad prop（IntersectionObserver，离开视口暂停）
  - pixelDensity={1}（不用 2）
  - powerPreference: 'low-power'（在医疗/工作场景）
  - animate="off" 后 useEffect 静止（只在登录时动，进入主界面静止）
```

### 6.2 移动端兼容性

```
状态：可用，但有注意点
  - Mobile Safari：有专项处理（v2.4.14 isMobileSafari 检测）
  - grain 在某些版本 Mobile Safari 有问题（v2.4.15 修复）
  - 低端 Android（WebGL 2.0 不支持的设备）：Canvas 空白，需 fallback
  - 推荐：移动端用 pixelDensity={1}，powerPreference='low-power'

建议 fallback：
  ShaderGradientCanvas 下加 CSS background-image 作 no-WebGL 保底
```

### 6.3 Next.js SSR 限制

```
问题：WebGL 无法在服务端运行
必须：dynamic(() => import(...), { ssr: false })
影响：首屏渲染时背景短暂为空白 → 需要 loading fallback（纯 CSS 渐变）
```

### 6.4 医疗场景适用性边界

```
✅ 适合：
  - 品牌展示页（登录、landing、404）
  - AI 处理等待状态
  - 营销类页面（nexture.nz）

❌ 不适合：
  - 主诊断/审阅工作界面（干扰专注）
  - 需要高精度色彩判断的区域（渐变背景影响图像色感知觉）
  - 老旧临床设备（医院工作站可能是 5-10 年旧机，WebGL 不稳定）
  - 需要长时间持续使用的功能页面（GPU 持续占用 = 设备发热）
```

### 6.5 其他限制

```
- Shader 可定制性有限：只有 defaults/positionMix/glass/cosmic 四种
- 自定义 GLSL：不支持直接注入自定义着色器（只能用内置）
- Z 轴交互：无内置触摸/鼠标交互渐变变形（需自己绑定鼠标事件 → hoverState prop）
- GIF 导出：Figma 插件有收费计划（每月/年付费）
- 未来计划中但未实现：Metallic shader, Glass shader 正式版, Webflow/Wix 支持
```

---

## 7. 实施建议（总结）

### TheraSeus 优先级

1. **登录页** → Pensive Sphere（`color1: #0f4c75, color2: #2A9D8F, grain: on, uSpeed: 0.2`）
2. **AI 加载页** → Mint waterPlane（`uSpeed: 0.4, color1: #2A9D8F, color2: #264653`）
3. **主 Review 界面** → **不使用**，用纯 `bg-slate-50` 或 glassmorphism CSS

### Nexture 优先级

1. **Hero** → Glass Plane 或 Halo（最大冲击力，`pixelDensity: 1.5`）
2. **Section 背景** → 静态 CSS 渐变（性能优先，节省 GPU）
3. **Services 卡片** → 可选小尺寸 sphere，hover 激活

### 性能控制策略（两个项目通用）

```tsx
// 生产建议配置
<ShaderGradientCanvas
  pixelDensity={1}              // 不用 2
  lazyLoad                      // 视口外暂停
  gl={{ powerPreference: 'low-power' }}  // 省电
>
  <ShaderGradient
    animate="on"
    uSpeed={0.2}                // 慢速（视觉柔和 + 节省 GPU）
  />
</ShaderGradientCanvas>
```

---

## 8. 参考资源

- **可视化配置工具：** https://www.shadergradient.co/customize
- **GitHub：** https://github.com/ruucm/shadergradient
- **Next.js App Router 示例：** https://codesandbox.io/p/sandbox/github/ruucm/shadergradient/tree/main/apps/example-nextjs-approuter
- **FEConf 2024 讲演：** https://www.youtube.com/watch?v=CSChpoiRTIY

---

*报告版本：v1.0 | 研究：Finn | 2026-03-13*
