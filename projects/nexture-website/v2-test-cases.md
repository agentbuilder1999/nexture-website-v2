# Nexture.nz v2 测试用例集

**准备者:** Sage (QA Engineer)  
**日期:** 2026-03-14  
**任务:** T063  
**执行时机:** T062（图片集成）完成后立即执行  
**输出报告:** workspace-shared/projects/nexture-website/v2-test-report.md

---

# A. 视觉展现测试用例

## A.1 ShaderGradient 动效测试

### UC-A1.1: ShaderGradient 正常渲染

**环境:** Chrome 120+, macOS 13+ / Windows 11+  
**前置条件:** WebGL 支持，GPU 硬件加速启用

**测试步骤:**

1. 打开 nexture.nz v2 首页
2. 观察 Hero 区顶部背景动效
3. 验证以下特征：
   - ✅ 动效流畅（无卡顿），紫粉橙色渐变流动
   - ✅ 光线/噪声效果可见
   - ✅ FPS 稳定（Chrome DevTools Performance > 55 FPS）
   - ✅ 动效不间断（无闪烁/重启）
   - ✅ 与 Hero 文字层级清晰（文字不被完全覆盖）

**验证方法:**
```bash
# Chrome DevTools: Performance tab
# 录制 3 秒视频
# 检查 FPS chart：应见 60fps 的绿条（偶有 58-59fps 可接受）

# 或使用 Web Performance API
javascript:
  const perf = performance.getEntriesByType('paint');
  console.log('First Paint:', perf[0]?.duration + 'ms');
  console.log('FCP:', perf[1]?.duration + 'ms');
```

**预期结果:** FPS ≥ 55fps（移动端可降至 45fps）

**失败标准:**
- ❌ FPS < 30（卡顿）
- ❌ 动效中断/闪烁
- ❌ 文字不可读

---

### UC-A1.2: WebGL 不可用时回退到 Purple-bfg.avif

**环境:** 禁用 WebGL 的浏览器或低端设备

**前置条件:** Chrome DevTools 禁用 WebGL（Settings → Experiments → "Disable WebGL"）

**测试步骤:**

1. 禁用 WebGL
2. 刷新页面
3. 验证 Hero 背景：
   - ✅ 显示静态背景图 `Purple-bfg.avif`
   - ✅ 无 ShaderGradient 动效（可接受）
   - ✅ 文字仍可读
   - ✅ 页面加载不报错

**验证方法:**
```bash
# 检查 Network tab 中是否加载了 Purple-bfg.avif
# 检查 Console 中无 WebGL 相关错误

# JavaScript 检查
javascript:
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
  console.log('WebGL supported:', !!gl);
```

**预期结果:** 优雅降级，使用静态背景图

---

## A.2 三张 AI 图集成测试

### UC-A2.1: Neural_Sieve 在 Hero 区叠加效果

**位置:** Hero section 上层，与 ShaderGradient 协调

**测试步骤:**

1. 打开首页 Hero 区
2. 观察 Neural_Sieve 图片：
   - ✅ 图片加载完整（无加载失败占位符）
   - ✅ 与 ShaderGradient 背景协调（不过曝/过暗）
   - ✅ 透明度/混合模式合理（通常 mix-blend-mode: screen 或 overlay）
   - ✅ 在 1920px / 1280px / 768px / 375px 断点上都可见
   - ✅ 无边界锯齿（应使用 WebP 转换）

**验证方法:**
```bash
# 检查 Network > Images，Neural_Sieve 文件
# 应为 WebP 格式，大小 < 150KB

# CSS 检查
javascript:
  const img = document.querySelector('img[alt="Neural_Sieve"]');
  console.log('Computed mix-blend-mode:', window.getComputedStyle(img).mixBlendMode);
  console.log('Image src:', img.src);  // 应包含 .webp
```

**预期结果:** 图片与背景协调，WebP 优化，mix-blend-mode 正确

---

### UC-A2.2: Funnel_Collapse 在 TheraSeus 区的深色背景融入

**位置:** TheraSeus 产品区，深色背景（#160A3D）上

**测试步骤:**

1. 滚动到 TheraSeus 区
2. 观察 Funnel_Collapse 图片：
   - ✅ 图片颜色与深色背景协调（不显眼突兀）
   - ✅ mix-blend-mode 应为 darken 或 multiply（使图融入）
   - ✅ 文字清晰可读（图片不遮挡主文本）
   - ✅ 移动端上应缩小/消失（避免 375px 上溢出）

**验证方法:**
```bash
# CSS 检查
javascript:
  const funnel = document.querySelector('img[alt="Funnel_Collapse"]');
  console.log('mix-blend-mode:', window.getComputedStyle(funnel).mixBlendMode);
  console.log('Opacity:', window.getComputedStyle(funnel).opacity);
```

**预期结果:** mix-blend-mode: darken/multiply，融入深色背景

---

### UC-A2.3: Remnant_Shell(3) 在 About 区背景文字清晰度

**位置:** About section，背景使用 Remnant_Shell(3) 图片

**测试步骤:**

1. 滚动到 About 区
2. 观察文字与背景对比：
   - ✅ About 区标题/正文对比度 ≥ 4.5:1（WCAG AA）
   - ✅ 文字不被图片完全覆盖（通常图片放在背景 opacity: 0.15-0.3）
   - ✅ 在移动端也可读（响应式调整）

**验证方法:**
```bash
# 使用 axe DevTools 检查对比度
# 或 Chrome Lighthouse > Accessibility

# 手动测量
javascript:
  const textEl = document.querySelector('.about-text');
  const computedStyle = window.getComputedStyle(textEl);
  console.log('Text color:', computedStyle.color);
  console.log('Background color:', computedStyle.backgroundColor);
  // 转换为对比度并计算
```

**预期结果:** 文字对比度 ≥ 4.5:1

---

## A.3 品牌色一致性测试

### UC-A3.1: 所有按钮/链接色值 #2A9D8F

**范围:** 所有 CTA 按钮、导航链接、强调元素

**测试步骤:**

1. 遍历页面所有交互元素：
   - 导航菜单链接
   - 页脚社交链接
   - 产品区 CTA 按钮（"Learn More", "Try Now" 等）
   - 内联链接

2. 检查：
   - ✅ 默认态颜色 = #2A9D8F（或 rgb(42, 157, 143)）
   - ✅ Hover 态颜色 = #33B8A8（亮化）
   - ✅ Active 态颜色 = #1F7A70（深化）
   - ✅ 无其他绿色混入

**验证方法:**
```bash
# CSS 检查（从 DevTools 取样）
javascript:
  const buttons = document.querySelectorAll('button, a[role="button"], a.cta');
  buttons.forEach(btn => {
    const color = window.getComputedStyle(btn).color;
    const bgColor = window.getComputedStyle(btn).backgroundColor;
    console.log(`${btn.textContent}: color=${color}, bg=${bgColor}`);
  });

# 或使用像素吸管工具检查
```

**预期结果:** 所有元素颜色一致 #2A9D8F 及其变体

---

## A.4 渐变文字测试

### UC-A4.1: 标题紫粉橙渐变正确渲染

**元素:** 所有标题（h1, h2）采用渐变

**渐变定义:**
```css
linear-gradient(90deg, #A680FF 5%, #FF85B8 45%, #FFB070 85%)
```

**测试步骤:**

1. 观察各级标题：
   - ✅ 渐变颜色正确（紫 → 粉 → 橙）
   - ✅ 渐变平滑（无条纹/失真）
   - ✅ 在 Chrome / Safari / Firefox 上一致
   - ✅ 移动端上裁剪得当（不被截断）

**验证方法:**
```bash
# CSS 检查
javascript:
  const h1 = document.querySelector('h1');
  const bg = window.getComputedStyle(h1).background;
  console.log('h1 gradient:', bg);
  // 应包含 linear-gradient 且包含目标色值
```

**预期结果:** 渐变正确，跨浏览器一致

---

## A.5 深色背景一致性

### UC-A5.1: 所有区块背景基于 #0C0524

**范围:** 页面所有主要区块

**定义:**
- `--bg-page: #0C0524` （主背景）
- `--bg-card: #160A3D` （卡片层，比主背景浅）
- `--bg-section-alt: #0A0520` （替代背景）

**测试步骤:**

1. 逐区遍历页面：
   - Hero section
   - Features section
   - TheraSeus / Nexture 产品区
   - About section
   - Footer

2. 检查：
   - ✅ 无意外白底（RGB > 200 的颜色）
   - ✅ 背景颜色在定义的调色板内
   - ✅ 分层清晰（卡片 > 主背景）

**验证方法:**
```bash
# CSS 检查每个 section
javascript:
  document.querySelectorAll('section').forEach(section => {
    const bg = window.getComputedStyle(section).backgroundColor;
    console.log(`Section: ${section.id || section.className}`, bg);
  });
```

**预期结果:** 所有背景基于深紫色调，无白底

---

## A.6 Partner Logos 清晰度测试

### UC-A6.1: 5 个 Logo 清晰可见，无变形

**Logos:**
1. NVIDIA
2. Ministry of Agriculture (MOA)
3. University of Otago
4. AWS
5. Google

**测试步骤:**

1. 定位 Partner/Clients 区
2. 检查每个 logo：
   - ✅ 清晰可见（不模糊）
   - ✅ 比例正确（无拉伸/挤压）
   - ✅ 颜色清晰（不偏色）
   - ✅ 响应式：在 375px / 1920px 上都可见（可能缩小）

**验证方法:**
```bash
# 检查图片属性
javascript:
  const logos = document.querySelectorAll('[class*="partner"], [class*="client"]');
  logos.forEach(logo => {
    const img = logo.querySelector('img');
    if (img) {
      const rect = img.getBoundingClientRect();
      console.log(`${img.alt}: ${rect.width}x${rect.height}, aspectRatio=${rect.width/rect.height}`);
    }
  });
```

**预期结果:** 所有 logo 清晰，比例正确，响应式可见

---

# B. 文字排版测试用例

## B.1 字体加载测试

### UC-B1.1: Plus Jakarta Sans 正确加载，Fallback 配置

**字体:**
- Plus Jakarta Sans（变体：400, 600, 700, 800）
- 来源：Google Fonts

**测试步骤:**

1. 打开首页，打开 Chrome DevTools > Network
2. 过滤 "googleapis" 或 "fonts.gstatic.com"
3. 验证：
   - ✅ Plus Jakarta Sans 四个权重都加载
   - ✅ 使用 display=swap（避免 FOUT）
   - ✅ 加载完成时间 < 2s
   - ✅ Fallback 字体链（若 Plus 加载失败）正确配置

**CSS 预期:**
```css
@font-face {
  font-family: 'Plus Jakarta Sans';
  src: url('...');
  font-display: swap;  /* 重要：避免字体闪烁 */
}

body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

**验证方法:**
```bash
# 检查 HTML head 中的 font-family 定义
javascript:
  const fontFamily = window.getComputedStyle(document.body).fontFamily;
  console.log('Font family:', fontFamily);  // 应包含 Plus Jakarta Sans
  
  // 检查 @font-face
  for (let rule of document.styleSheets[0].cssRules) {
    if (rule.type === rule.FONT_FACE_RULE) {
      console.log('Font:', rule.style.fontFamily, 'Display:', rule.style.fontDisplay);
    }
  }
```

**预期结果:** Plus Jakarta Sans 加载完成，display=swap，Fallback 正确

---

## B.2 字重层级测试

### UC-B2.1: h1 (800) / h2 (700) / h3 (600) / body (400/500) 视觉层级清晰

**标准:**
| 元素 | 字重 | 预期视觉效果 |
|------|------|-----------|
| h1 | 800 | 最粗最大，品牌标题 |
| h2 | 700 | 次级标题 |
| h3 | 600 | 小标题 |
| body | 400 | 正文 |
| body strong | 500 | 强调 |

**测试步骤:**

1. 遍历页面各标题等级
2. 与视觉规范对比，确认：
   - ✅ h1 最粗（字重 800）
   - ✅ h2 明显比 h1 轻（字重 700）
   - ✅ h3 明显比 h2 轻（字重 600）
   - ✅ 正文字重 400，强调文本 500 可见区别

**验证方法:**
```bash
javascript:
  ['h1', 'h2', 'h3', 'p', 'body'].forEach(selector => {
    const el = document.querySelector(selector);
    if (el) {
      const weight = window.getComputedStyle(el).fontWeight;
      console.log(`${selector}: font-weight=${weight}`);
    }
  });
```

**预期结果:** 字重层级清晰，与规范一致

---

## B.3 行高/行间距舒适度

### UC-B3.1: 正文行高 1.7-1.8（舒适阅读）

**标准:** 
- h1/h2/h3: 行高 1.2-1.4（标题紧凑）
- body: 行高 1.7-1.8（正文舒适）

**测试步骤:**

1. 定位产品页、About 页等长文本区域
2. 检查：
   - ✅ 标题行高紧凑（1.2-1.4）
   - ✅ 正文行高舒适（1.7-1.8）
   - ✅ 无过紧（行高 < 1.5）导致拥挤
   - ✅ 无过松（行高 > 2.0）导致散乱

**验证方法:**
```bash
javascript:
  const para = document.querySelector('p, .article-content');
  const lineHeight = window.getComputedStyle(para).lineHeight;
  console.log('Line height:', lineHeight);
  // 转换为比例（em）进行判断
```

**预期结果:** 行高在规范范围内，文字可读舒适

---

## B.4 中英文混排（如有中文）

### UC-B4.1: 中英文字体优雅降级

**背景:** 若页面包含中文内容

**预期处理:**
- Plus Jakarta Sans 用于英文
- 中文自动回退到系统字体（如 "Hiragino Sans", "STHeitiSC"）

**测试步骤:**

1. 检查是否有中文内容（如"诊疗"、"数据"等）
2. 验证：
   - ✅ 英文部分使用 Plus Jakarta Sans
   - ✅ 中文部分使用合理的中文字体
   - ✅ 无混乱/乱码

**验证方法:**
```bash
# 手动观察，或用 CSS 检查
javascript:
  const chineseEl = document.querySelector('[lang="zh"], .chinese-text');
  if (chineseEl) {
    const fontFamily = window.getComputedStyle(chineseEl).fontFamily;
    console.log('Chinese text font:', fontFamily);
  }
```

**预期结果:** 中英文字体区分合理，无乱码

---

## B.5 响应式文字换行

### UC-B5.1: 移动端 (375px) 标题换行合理，不溢出

**环境:** 375px 宽度（iPhone SE / 12 mini）

**测试步骤:**

1. 使用 Chrome DevTools 模拟 375px 宽度
2. 检查各标题：
   - ✅ h1 标题在 375px 上应换行（通常换 2-3 行）
   - ✅ 无水平滚动（overflow hidden）
   - ✅ 文字大小减小但仍可读

**预期:**
```
Nexture.nz
Revolutionizes
Medical Data
Analysis
```

（示例，标题应自然换行）

**验证方法:**
```bash
# 检查元素宽度是否溢出
javascript:
  const h1 = document.querySelector('h1');
  const parentWidth = h1.parentElement.offsetWidth;
  const h1Width = h1.offsetWidth;
  console.log(`Parent width: ${parentWidth}, h1 width: ${h1Width}`);
  if (h1Width > parentWidth) console.warn('❌ Text overflow!');
```

**预期结果:** 移动端文字自然换行，无溢出

---

## B.6 对比度检查（WCAG AA）

### UC-B6.1: 深色背景上浅色文字对比度 ≥ 4.5:1

**背景:** #0C0524（深紫）  
**文字颜色:** 通常白色或浅灰

**标准:** WCAG 2.1 AA 要求对比度 ≥ 4.5:1

**测试步骤:**

1. 检查主要文字元素（h1, p, body）
2. 使用 axe DevTools 或 Lighthouse 自动检查
3. 验证：
   - ✅ 正文对比度 ≥ 4.5:1
   - ✅ 强调色（如 #2A9D8F 绿色）与深色背景对比度 ≥ 3:1

**验证方法:**
```bash
# 使用 Lighthouse
# Chrome > F12 > Lighthouse > Accessibility > run

# 或手动计算
javascript:
  function getLuminance(r, g, b) {
    return (0.299*r + 0.587*g + 0.114*b) / 255;
  }
  
  function getContrast(rgb1, rgb2) {
    const l1 = getLuminance(...rgb1);
    const l2 = getLuminance(...rgb2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  // 例：白色 (255,255,255) vs 深紫 (12,5,36)
  const contrast = getContrast([255,255,255], [12,5,36]);
  console.log(`Contrast ratio: ${contrast.toFixed(2)}:1`);  // 应 ≥ 4.5
```

**预期结果:** 对比度 ≥ 4.5:1（WCAG AA），≥ 7:1（WCAG AAA）

---

## B.7 长文本行宽舒适度

### UC-B7.1: 段落文字行宽在 60-75 字符范围

**背景:** 可读性研究表明，最舒适的行宽是 60-75 字符

**测试步骤:**

1. 定位产品页、About 页等长文本区域
2. 测量行宽（字符数）：
   - ✅ 正文行宽约 60-75 字符
   - ✅ 不超过 100 字符（过长难阅读）

**验证方法:**
```bash
# 手动数一行最长文字
# 或用 CSS 测量
javascript:
  const para = document.querySelector('article p, .article-content p');
  if (para) {
    const text = para.textContent;
    const lines = para.getBoundingClientRect().height / 
                 parseFloat(window.getComputedStyle(para).lineHeight);
    const charsPerLine = Math.round(text.length / lines);
    console.log(`Characters per line: ~${charsPerLine}`);
  }
```

**预期结果:** 行宽在 60-75 字符，舒适阅读

---

# C. 响应式断点测试

## C.1 响应式设计检查表

**断点定义:**
- 375px （移动：iPhone SE / 12 mini）
- 768px （平板：iPad）
- 1280px （桌面：MacBook）
- 1920px （宽屏：外接显示器）

### UC-C1.1: 各断点上 Hero / 导航 / 产品区 / Footer 检查

**测试矩阵:**

| 断点 | Hero | 导航 | 产品区 | Footer |
|------|------|------|--------|--------|
| 375px | ✅ 标题换行合理 | ✅ 汉堡菜单 | ✅ 产品栈排列合理 | ✅ 单列排列 |
| 768px | ✅ 标题可见 | ✅ 部分导航显示 | ✅ 2 列排列 | ✅ 2 列排列 |
| 1280px | ✅ 标题完整 | ✅ 全导航显示 | ✅ 3 列排列 | ✅ 多列对齐 |
| 1920px | ✅ 标题宽敞 | ✅ 水平导航充裕 | ✅ 4 列或自适应 | ✅ 对称布局 |

**测试步骤（每个断点）:**

1. 使用 Chrome DevTools 设置视口宽度
2. 按顺序检查：
   - Hero section：标题是否合理缩放、文字是否换行得当
   - 导航栏：是否响应式切换（移动/桌面导航不同）
   - 产品区：卡片是否合理重排（1 列 → 2 列 → 3 列）
   - Footer：链接是否合理分布

**验证方法:**
```bash
# Chrome DevTools: Toggle Device Toolbar (Ctrl+Shift+M)
# 手动测试各断点
# 或使用 Playwright 自动截图

# 检查 CSS media queries
javascript:
  for (let sheet of document.styleSheets) {
    for (let rule of sheet.cssRules) {
      if (rule.media) {
        console.log('Media query:', rule.media.mediaText);
      }
    }
  }
```

**预期结果:** 各断点上布局合理，无溢出/错位

---

# D. 性能测试用例

## D.1 图片懒加载与优化

### UC-D1.1: 三张 AI 图使用 Next.js Image，WebP 转换

**图片:**
- Neural_Sieve
- Funnel_Collapse
- Remnant_Shell(3)

**测试步骤:**

1. 打开 Network 标签过滤图片
2. 检查：
   - ✅ 图片格式为 WebP（或浏览器支持的现代格式）
   - ✅ 文件大小合理（< 200KB 每张）
   - ✅ 使用 Next.js Image 组件（`<Image>` tag）
   - ✅ 懒加载启用（src-set 中 loading="lazy"）

**验证方法:**
```bash
# Network > Images，检查请求
# 应见 .webp 后缀或 Accept: image/webp 协商

javascript:
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    console.log(`${img.alt}: ${img.src}, loading=${img.loading}`);
  });
```

**预期结果:** WebP 格式，懒加载启用，大小合理

---

## D.2 字体加载性能

### UC-D2.1: Google Fonts 配置 display=swap，避免字体闪烁

**测试步骤:**

1. 打开首页，打开 Network 过滤 fonts
2. 检查：
   - ✅ fonts.googleapis.com / fonts.gstatic.com 请求
   - ✅ 字体加载完成时间 < 2s
   - ✅ CSS 中 @font-face 包含 font-display: swap

**预期结果:** 字体快速加载，swap 模式避免 FOUT

---

## D.3 ShaderGradient 性能

### UC-D3.1: 动效帧率稳定 60fps（桌面），45fps（移动）

**测试步骤:**

1. Chrome DevTools > Performance
2. 录制 Hero 区 3 秒
3. 检查：
   - ✅ FPS 曲线平稳
   - ✅ 桌面上主要在 60fps（绿色）
   - ✅ 移动上稳定在 45-50fps

**预期结果:** FPS 稳定，无掉帧

---

# 执行计划

**T062 完成后立即执行：**

1. 按照本测试用例逐项检查
2. 记录每项的 Pass / Fail / 需改进
3. 生成测试报告：`v2-test-report.md`
4. 报告应包含：
   - ✅ 总体通过率（X/Y 测试通过）
   - ✅ 优先级缺陷（P0/P1/P2）
   - ✅ 截图/视频证据（关键项）
   - ✅ 建议改进项

---

**测试用例准备完成。等待 T062 完成后立即执行。**

