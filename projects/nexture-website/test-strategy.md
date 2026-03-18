# Nexture Website 测试策略
> 作者: Sage (QA Engineer) | 日期: 2026-03-12
> 基于: sprint-02/docs/tech-spec.md, sprint-02/docs/design-spec.md, sprint-01 测试经验

---

## 一、测试概览

### 1.1 项目特征

| 属性 | 值 |
|------|------|
| **架构** | 5 页静态 HTML + 共享 CSS/JS |
| **页面** | index.html, product.html, team.html, media.html, contact.html |
| **特效** | Video hero + Canvas 粒子文字动画 |
| **字体** | Space Grotesk 600/700 子集内联 + system-ui |
| **文件预算** | < 30KB/HTML, < 10KB CSS, < 8KB JS |
| **品牌色** | #E8005A + #2D3282 + #7B2070 |
| **目标** | 企业官网，SEO 优先，Core Web Vitals 达标 |

### 1.2 测试金字塔

```
       ┌───────────┐
       │ 视觉回归  │  ~25 screenshots (Playwright)
      ┌┴───────────┴┐
      │ E2E 功能    │  ~15 tests (Playwright)
     ┌┴─────────────┴┐
     │ SEO / a11y    │  ~20 checks (Lighthouse + axe)
    ┌┴───────────────┴┐
    │ 性能 / CWV      │  ~10 metrics (Lighthouse)
   ┌┴─────────────────┴┐
   │ 跨浏览器 / 设备    │  ~30 combos (Playwright)
  └─────────────────────┘
```

---

## 二、视觉回归测试

### 2.1 测试策略

| 测试项 | 断点 | 工具 | 频率 |
|--------|------|------|------|
| **全页截图对比** | 1280px (桌面) + 375px (手机) | Playwright screenshot | 每次 PR |
| **导航栏状态** | 展开/折叠/hover/active | Playwright | 每次 PR |
| **Hero 视频加载** | poster 显示 → 视频播放过渡 | Playwright | 每次 PR |
| **粒子文字动画** | Canvas 渲染完成截图 | Playwright + delay | 每次 PR |
| **暗/亮模式** | 如适用 | Playwright | 每次 PR |
| **Footer 布局** | 桌面 3 列 + 手机堆叠 | Playwright | 每次 PR |

### 2.2 断点矩阵

| 断点 | 宽度 | 覆盖设备 |
|------|------|----------|
| Mobile S | 320px | iPhone SE |
| Mobile M | 375px | iPhone 12/13/14 |
| Mobile L | 425px | iPhone 14 Pro Max |
| Tablet | 768px | iPad |
| Laptop | 1024px | 小笔记本 |
| Desktop | 1280px | 标准桌面 |
| Desktop L | 1440px | 大屏 |

### 2.3 视觉回归工具选择

| 工具 | 理由 | 成本 |
|------|------|------|
| **Playwright screenshots** | 内置，免费，CI 集成 | $0 |
| **pixelmatch** | 像素级对比，轻量 | $0 |
| **可选: Percy** | 云端视觉回归（如团队扩大） | $99/月起 |

```javascript
// Playwright 视觉回归测试示例
test('Home page desktop visual', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2000); // 等待粒子动画
  await expect(page).toHaveScreenshot('home-desktop.png', {
    maxDiffPixelRatio: 0.01,
    fullPage: true
  });
});

test('Home page mobile visual', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.waitForTimeout(2000);
  await expect(page).toHaveScreenshot('home-mobile.png', {
    maxDiffPixelRatio: 0.01,
    fullPage: true
  });
});
```

---

## 三、SEO 测试

### 3.1 SEO 检查清单

| 检查项 | 验证方法 | 通过标准 |
|--------|----------|----------|
| **title 标签** | 每页唯一，含关键词 | ≤ 60 字符 |
| **meta description** | 每页唯一 | 120-160 字符 |
| **h1 标签** | 每页恰好 1 个 | ✅ |
| **canonical URL** | 指向自身 | ✅ |
| **Open Graph** | og:title, og:description, og:image | 每页完整 |
| **robots.txt** | 允许爬虫 | ✅ |
| **sitemap.xml** | 包含所有 5 页 | ✅ |
| **img alt 属性** | 所有图片有 alt | 100% 覆盖 |
| **语义化 HTML** | nav, main, footer, article | ✅ |
| **内链结构** | 所有页面互相可达 | ≤ 2 次点击 |
| **JSON-LD** | Organization + Website schema | ✅ |
| **hreflang** | 如有多语言 | 正确映射 |

### 3.2 自动化 SEO 测试

```javascript
test('SEO: All pages have unique titles', async ({ page }) => {
  const pages = ['/', '/product.html', '/team.html', '/media.html', '/contact.html'];
  const titles = new Set();
  for (const url of pages) {
    await page.goto(url);
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeLessThanOrEqual(60);
    expect(titles.has(title)).toBe(false); // 唯一性
    titles.add(title);
  }
});

test('SEO: Each page has exactly one h1', async ({ page }) => {
  const pages = ['/', '/product.html', '/team.html', '/media.html', '/contact.html'];
  for (const url of pages) {
    await page.goto(url);
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  }
});
```

---

## 四、性能测试（Core Web Vitals）

### 4.1 性能指标目标

| 指标 | 目标 | 工具 | 备注 |
|------|------|------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Lighthouse | Hero 视频/poster |
| **FID** (First Input Delay) | < 100ms | Lighthouse | JS 最小化 |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Lighthouse | 字体加载策略 |
| **FCP** (First Contentful Paint) | < 1.8s | Lighthouse | 内联关键 CSS |
| **TTFB** (Time to First Byte) | < 800ms | Lighthouse | CDN 缓存 |
| **TBT** (Total Blocking Time) | < 200ms | Lighthouse | - |
| **SI** (Speed Index) | < 3.4s | Lighthouse | - |
| **Lighthouse Score** | ≥ 90 (所有类别) | Lighthouse | Performance/SEO/A11y/BP |

### 4.2 文件大小预算验证

| 文件类型 | 预算 | 验证方法 |
|----------|------|----------|
| **HTML (each)** | < 30KB | stat + gzip 检查 |
| **shared.css** | < 10KB | stat |
| **shared.js** | < 8KB | stat |
| **particles.js** | < 5KB | stat |
| **hero-bg.mp4** | < 5MB | stat |
| **字体 (woff2)** | < 20KB | stat |
| **总页面加载** | < 500KB (首页，含视频) | Lighthouse |

### 4.3 CI 性能测试

```yaml
# .github/workflows/performance.yml
name: Performance Check
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Start local server
        run: npx serve . -l 8080 &
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v12
        with:
          urls: |
            http://localhost:8080/
            http://localhost:8080/product.html
            http://localhost:8080/team.html
            http://localhost:8080/media.html
            http://localhost:8080/contact.html
          budgetPath: './budget.json'
          uploadArtifacts: true
```

```json
// budget.json
[{
  "path": "/*",
  "timings": [
    { "metric": "largest-contentful-paint", "budget": 2500 },
    { "metric": "first-contentful-paint", "budget": 1800 },
    { "metric": "cumulative-layout-shift", "budget": 0.1 },
    { "metric": "total-blocking-time", "budget": 200 }
  ],
  "resourceSizes": [
    { "resourceType": "document", "budget": 30 },
    { "resourceType": "stylesheet", "budget": 15 },
    { "resourceType": "script", "budget": 15 },
    { "resourceType": "total", "budget": 500 }
  ]
}]
```

---

## 五、跨浏览器测试

### 5.1 浏览器矩阵

| 浏览器 | 版本 | 平台 | 优先级 |
|--------|------|------|--------|
| **Chrome** | Latest | Windows/Mac/Android | 🔴 P0 |
| **Safari** | Latest | Mac/iOS | 🔴 P0 |
| **Firefox** | Latest | Windows/Mac | 🟡 P1 |
| **Edge** | Latest | Windows | 🟡 P1 |
| **Samsung Internet** | Latest | Android | 🟢 P2 |

### 5.2 关键兼容性测试点

| 功能 | 风险浏览器 | 测试重点 |
|------|-----------|----------|
| **Video autoplay** | iOS Safari | muted 属性必须，playsinline |
| **Canvas 粒子** | 老旧安卓浏览器 | requestAnimationFrame polyfill |
| **CSS Grid** | IE11 | 不支持（放弃 IE） |
| **woff2 字体** | 老旧浏览器 | system-ui fallback |
| **scroll-behavior** | Safari < 15.4 | smooth 不支持 |
| **aspect-ratio** | Safari < 15 | padding-bottom fallback |

### 5.3 Playwright 跨浏览器配置

```javascript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
});
```

---

## 六、可访问性测试（WCAG 2.1 AA）

| 检查项 | 工具 | 通过标准 |
|--------|------|----------|
| **颜色对比度** | axe-core | 文本 4.5:1, 大文本 3:1 |
| **键盘导航** | 手动 + Playwright | 所有交互可 Tab 到达 |
| **屏幕阅读器** | axe-core | ARIA 标签完整 |
| **焦点指示器** | 手动检查 | 可见焦点环 |
| **图片 alt 文本** | axe-core | 100% 覆盖 |
| **表单标签** | axe-core | 所有 input 有 label |
| **skip nav** | 手动 | 首个焦点元素 |
| **视频字幕** | 手动 | hero 视频无语音（装饰性，无需字幕） |

```javascript
test('Accessibility: axe scan home page', async ({ page }) => {
  await page.goto('/');
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

---

## 七、CI/CD 成本估算

### 7.1 CI 运行成本

| 测试类型 | 频率 | 每次时长 | 月运行次数 | 月成本 (USD) |
|----------|------|----------|-----------|-------------|
| **视觉回归** | 每次 PR | 3 min | ~100 | $0 (免费层) |
| **SEO 检查** | 每次 PR | 1 min | ~100 | $0 |
| **Lighthouse** | 每次 PR | 2 min | ~100 | $0 |
| **跨浏览器** | Nightly | 10 min | ~30 | $0 |
| **a11y 扫描** | 每次 PR | 1 min | ~100 | $0 |
| **全套回归** | Pre-release | 20 min | ~4 | $0 |

### 7.2 月度总成本

| 项目 | 月成本 (USD) |
|------|-------------|
| **GitHub Actions** | $0 (免费层 2000 min/月) |
| **预计月用量** | ~700 min (~35% 免费额度) |
| **CDN (Cloudflare)** | $0 (免费层) |
| **域名 (nexture.nz)** | ~$3/月 |
| **总计** | **~$3/月** |

### 7.3 成本对比

| 方案 | 月成本 | 能力 |
|------|--------|------|
| **当前方案（推荐）** | **$3/月** | GitHub Actions 免费 + Cloudflare |
| **+Percy 视觉回归** | $102/月 | 云端截图对比 |
| **+BrowserStack** | $32/月 | 真机跨浏览器 |

**建议**: 当前阶段用免费工具即可满足需求。团队扩大后再考虑付费服务。

---

## 八、E2E 功能测试清单

| 测试场景 | 页面 | 验证内容 |
|----------|------|----------|
| **导航链接** | 所有页面 | 5 个链接全部可点击且跳转正确 |
| **导航高亮** | 所有页面 | 当前页 nav link 有 active 样式 |
| **汉堡菜单** | 手机端 | 展开/折叠/点击后关闭 |
| **Hero 视频** | index | autoplay + muted + loop |
| **粒子动画** | index | Canvas 渲染 + 文字可见 |
| **CTA 按钮** | index | Get Started → contact, Learn More → product |
| **联系表单** | contact | 必填校验 + 提交成功 |
| **响应式布局** | 所有页面 | 320px-1440px 无溢出 |
| **Footer 链接** | 所有页面 | 社交链接 + 版权信息 |
| **404 页面** | - | 友好的 404 + 返回首页链接 |

---

## 九、测试执行顺序（Sprint 优先级）

### Sprint 1（MVP）

1. 🔴 **P0**: 视觉回归（桌面 + 手机）— 确保 Finn 交付视觉一致
2. 🔴 **P0**: Core Web Vitals — LCP < 2.5s, CLS < 0.1
3. 🟡 **P1**: SEO 基础检查 — title, h1, meta, OG
4. 🟡 **P1**: 跨浏览器 — Chrome + Safari 双端
5. 🟢 **P2**: 可访问性 — axe 自动扫描

### Sprint 2+

6. 🟢 **P2**: 完整跨浏览器矩阵
7. ⚪ **P3**: 性能优化测试
8. ⚪ **P3**: 安全头验证（CSP, HSTS）
