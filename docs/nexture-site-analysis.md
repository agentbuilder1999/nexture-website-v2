# nexture.nz 现站分析
> 日期: 2026-03-10 | 分析者: q (CTO)

## 一、站点概况

| 属性 | 值 |
|------|-----|
| 域名 | nexture.nz |
| 技术栈 | Gamma.app 托管（非自建），Next.js SSG |
| 页面数 | 5 页（Home / Product / Team / Media / Contact）|
| CDN | assets.gammahosted.com + imgproxy.gamma.app |
| 分析 | Google Tag Manager (GTM-TCS89QDQ) |
| 字体 | Inter (Google Fonts) + ESBuild + PPMori |
| UI框架 | Chakra UI |
| SEO | 基础 meta tags，OG/Twitter cards 有配置 |
| SSL | ✅ HTTPS |

## 二、页面内容分析

### Home (/)
- **定位语**: "Nexture — Pushing the Boundaries of AI"
- **内容极简**: Logo + 标语 + "Learn More About Product" CTA
- **合作标志**: Ministry of Awesome, University of Otago, NVIDIA Inception, Google Cloud, AWS
- **问题**: 首页内容太少，无法传递产品价值，跳出率预计较高

### Product (/product)
- **核心产品**: TheraSeus™ — 胶囊内镜 AI 阅片系统
- **价值主张**:
  - 阅片时间减少 90%（60min → 6min）
  - 无需新设备，兼容现有工具
  - 按例计费 $135/case
  - Cloud (HIPAA) 或 on-premise 部署
- **功能**:
  - AI 图像过滤（移除 90% 无临床意义图片）
  - 出血和异常检测
  - 结构化报告自动生成
- **目标用户**: 消化内科医生、诊所管理者、医疗系统
- **CTA**: Request a Demo / Join as a Pilot Partner
- **问题**: 缺少视频演示、截图、案例研究、对比数据细节

### Team (/team)
- **总部**: Christchurch, New Zealand
- **强调**: 国际团队、自研核心技术（胶囊机器人 + 深度学习）
- **创始人**: Wei Sun (Victor Sun)，25+ 年医疗科技/AI/机器人经验
- **问题**: 无团队成员照片、无具体履历、缺乏信任要素

### Media (/media)
- **媒体报道**: RegenerationHQ, chi.org.nz, NZ Entrepreneur, MoA, Caffeine Daily
- **播客**: "Nexture AI Dive"（Spotify/Apple/Amazon）
- **问题**: 报道链接有效，但未展示产品截图或技术细节

### Contact (/contact)
- 未提取到具体内容（可能是表单）

## 三、改版建议

### 优先级高
1. **脱离 Gamma.app**: 当前用 Gamma 托管，限制了自定义能力和 SEO 优化
2. **首页重做**: 加入产品演示视频/GIF、核心数据（90% time saving）、信任标志
3. **Product 页增强**: 添加交互式 ROI 计算器、产品截图/视频、案例研究
4. **Team 页补充**: 团队照片、顾问委员会、学术合作

### 优先级中
5. **Blog/资源中心**: SEO 内容营销，胶囊内镜相关教育内容
6. **多语言**: 考虑中文/日语版本（亚太市场）
7. **性能优化**: 当前加载了大量 Chakra CSS 变量，首屏渲染慢

### 技术改版方案
| 项目 | 当前 | 改版后 |
|------|------|--------|
| 托管 | Gamma.app | Vercel (自建 Next.js 15) |
| 框架 | Chakra UI | Tailwind CSS v4 + shadcn/ui |
| CMS | 无 | Contentful / Sanity (headless) |
| 分析 | GTM | Vercel Analytics + GTM |
| 部署 | Gamma CDN | Vercel Edge Network |
