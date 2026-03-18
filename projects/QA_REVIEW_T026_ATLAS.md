# Atlas 技术评审报告 — T026

**审查人**: Atlas (🏗️ architect)
**日期**: 2026-03-12
**范围**: 11 份自主运营产出文档（T019-T024）

---

## 评审总览

| # | 文档 | 作者 | 评分 | 状态 | 关键问题 |
|---|------|------|------|------|---------|
| 1 | `architecture-spec-v1.md` | Atlas | **8.5** | ✅ 合格 | S3 生命周期描述不一致；RAG 基础设施未收录 |
| 2 | `rag-pipeline-design.md` | Nova | **8.0** | ✅ 合格 | 缺月度成本估算；OpenSearch 未反映在主架构图 |
| 3 | `medical-datasets-survey.md` | Nova | **8.0** | ✅ 合格 | PMC-Patients 合规风险未决；未交叉引用 ML 训练数据集 |
| 4 | `competitive-analysis.md` | Aria | **7.0** | ✅ 合格（边缘）| 分析对象集错误：核心竞品（PillCam/RAPID）未覆盖 |
| 5 | `user-personas.md` | Aria | **8.5** | ✅ 合格 | FHIR 时序与架构不一致；PACS 需求未传导到 API spec |
| 6 | `data-model.md` | Rex | **8.0** | ✅ 合格 | FHIR 字段提前；审计日志缺分区策略；角色枚举可能不一致 |
| 7 | `api-spec-v2.yaml` | Rex | **8.0** | ✅ 合格 | 无异步回调机制；technician 角色不在架构 RBAC；无 DICOM 端点 |
| 8 | `component-library-recommendation.md` | Finn | **6.5** | ⚠️ 需修改 | **技术错误**：Headless UI 无 CDN 版，不支持纯 HTML |
| 9 | `prototype/index.html` | Finn | **7.5** | ✅ 合格 | 结构完整，品牌色正确；粒子动画测试可能脆弱 |
| 10 | `theraseus/test-strategy.md` | Sage | **8.5** | ✅ 合格 | 缺 RAG pipeline 专项测试；缺故障注入测试 |
| 11 | `nexture-website/test-strategy.md` | Sage | **8.0** | ✅ 合格 | Canvas 动画截图测试方案脆弱 |

**合格率**: 10/11（91%）
**需返工**: 1 份（Finn 组件库推荐，技术错误）

---

## 逐文档详细评审

---

### 文档 1：architecture-spec-v1.md（Atlas 自评）

**评分**: 8.5/10 ✅

**完整性**: 全部 6 个必要章节均已覆盖（组件图/数据流/选型表/部署拓扑/安全/扩展性）。

**准确性问题**:
1. **S3 生命周期不一致**：组件图注释写「Raw Bucket → Glacier **30天**」，但选型表写「原始视频 **90天** → 删除」。需统一：建议采用原始视频 90 天归档/删除（合规后），已处理帧 30 天 → Glacier。
2. **RAG 基础设施缺失**：Nova 的 RAG 管道依赖 Amazon OpenSearch Serverless（~$100-200/月），此组件未出现在架构组件图和 AWS 部署拓扑图中。属于内部一致性缺口。
3. **On-Premise 加密细节不足**：Docker compose 骨架写「全磁盘加密」但未给出具体方案（LUKS？应用层加密？）。On-Premise 场景的 HIPAA 合规不能只靠备注。
4. **FHIR 端点**：里程碑 M8 包含 FHIR 设计，但 data-model.md 和 api-spec-v2.yaml 已提前加入 FHIR 字段/端点，时序需与 Rex 对齐。

**修复建议**: 次版本（v1.1）中加入 OpenSearch Serverless 组件，统一 S3 生命周期策略描述。

---

### 文档 2：rag-pipeline-design.md（Nova）

**评分**: 8.0/10 ✅

**优点**: 技术深度好。文档解析策略（PDF/DOCX/JSON/DICOM）、分块方案（按文档类型区分策略）、混合检索（稠密+BM25+RRF）、幻觉检测（NLI 模型）均有详细设计。PHI 合规处理到位。

**问题**:
1. **缺月度成本估算**：引入了 4 个新 AWS 服务（Amazon Titan v2 嵌入、OpenSearch Serverless、Bedrock Claude Haiku 生成、Cohere Rerank 3.5）但无汇总成本估算。估算：
   - OpenSearch Serverless: ~$100-200/月（最小 OCU 配置）
   - Titan v2 嵌入: ~$0.02/1K tokens，20K chunk × 平均 200 tokens = ~$0.08 一次性，微量
   - Cohere Rerank 3.5: $2/1K 查询，若每天 500 查询 = ~$30/月
   - **RAG 新增月度成本约 $130-230/月**，应反映在架构文档中

2. **RAG pipeline 未在主架构组件图中体现**：architecture-spec-v1.md 的组件图没有 OpenSearch/嵌入层，需 Atlas 在架构文档 v1.1 中补充。这是跨文档的内部一致性问题，责任在 Atlas。

3. **幻觉检测阈值未定义**：提到「置信度阈值过滤」但未给出具体数字。医疗场景建议：引用置信度 < 0.7 的内容自动降级为「参考建议，请医生核实」。

---

### 文档 3：medical-datasets-survey.md（Nova）

**评分**: 8.0/10 ✅

**优点**: 合规分析详尽，每个数据集有 HIPAA/NZ Privacy Act/商业授权三维评估，MIMIC-III/IV 的排除理由充分。

**问题**:
1. **PMC-Patients 合规风险悬而未决**：表格注明「⚠️ 法律意见：去标识化充分性」，但没有明确说明使用/不使用的决策。在 Atlas 未完成合规评估前，此数据集应标注为「暂缓」，不得进入知识库。
2. **与 implementation-plan.md 的训练数据集未交叉引用**：implementation-plan.md 列出了 Kvasir-SEG / CVC-ClinicDB / WCEbleedGen 等专门用于 YOLOv8-x 训练的胶囊内镜数据集，但本调研文档聚焦于 RAG 知识库（NLP 文献），两类数据集的边界未在文档中说明，易造成混淆。
3. **胶囊内镜专用数据集覆盖不足**：KID2 Dataset（胶囊内镜专用）在 implementation-plan.md 中出现，但本调研中无评估。KID2 同时适合 RAG（包含临床注释）和检测训练。

---

### 文档 4：competitive-analysis.md（Aria）

**评分**: 7.0/10 ✅（边缘合格）

**优点**: UX 模式分析扎实（Ada、Babylon、Noom 等），对 TheraSeus 的 UX 设计建议（置信度可视化、进度条、一键导出）有直接价值。

**核心问题：竞品集选取错误**

本文档分析的 10 个产品全是通用数字健康应用（症状检查器、慢病管理、心理健康、EHR），没有一个是**直接竞品**——胶囊内镜 AI 分析软件。

真正的直接竞品（已在 theraseus-domain-research.md 中列出，本文档未引用）：
- **RAPID Reader**（Given Imaging / Medtronic）- 全球最主要的阅片软件
- **PillCam AI**（Medtronic）- 当前市场领导者
- **AnX Robotica NaviCam**（中国市场）
- **Capsule Sight AI**（新兴竞品）

**架构影响**：竞品功能差距分析是技术选型的重要输入（例如：RAPID Reader 的 DICOM 集成能力 → 决定我们的 DICOM 支持优先级）。基于错误竞品集的分析对架构决策价值有限。

**建议**：补充「第 X 章：直接竞品对比（胶囊内镜 AI）」，对 RAPID Reader / PillCam AI 做具体功能/技术/价格对比。当前内容保留作为「间接竞品/数字健康生态」参考。

---

### 文档 5：user-personas.md（Aria）

**评分**: 8.5/10 ✅

**优点**: 4 个画像覆盖完整的决策链（临床使用者→技术集成者→采购决策者），每个画像有详细的日常工作流、痛点量化、使用旅程图。Helen（IT 主管）画像对技术集成需求的洞察特别有价值。

**问题**:
1. **FHIR 时序不一致**：用户画像功能路线图将 HL7 FHIR 导出标注为「⚠️ Phase 1」，但 architecture-spec-v1.md 将 FHIR 放在 M8（最后阶段）。需要在三份文档（用户画像/架构/API spec）间对齐 FHIR 时序。

2. **PACS 集成需求未传导到 API spec**：Helen 画像明确提出「PACS 自动对接：配置后自动接收 PACS 图像」为中期需求，但 api-spec-v2.yaml 中没有 DICOM/PACS import 端点。需要 Rex 在 API spec 中补充或明确排除此端点（并注明时序）。

3. **小问题**：「3个月免费试用（50例）」的商业条款出现在 James 画像中，但这属于商业模式决策，应记录在专门的商业文档中而非用户画像。

---

### 文档 6：data-model.md（Rex）

**评分**: 8.0/10 ✅

**优点**: Schema 设计成熟，HIPAA 敏感字段的加密处理到位（email_encrypted + email_hash 双字段），`hipaa_baa_signed` 组织级合规字段，`audit_logs` 不可删除设计。ER 图清晰。

**问题**:
1. **FHIR 字段提前**：`examinations.fhir_imaging_study_id` 和 `patients.fhir_id` 已在 MVP Schema 中，但架构文档将 FHIR 定为 Phase 3。应加注释说明这些字段是为将来扩展预留，MVP 可为 NULL。

2. **audit_logs 缺分区策略**：HIPAA 要求审计日志保留 7 年。不做分区的话，7 年后单表行数将达到数亿级，查询性能急剧下降。建议加：按年分区（PostgreSQL 声明式分区，`PARTITION BY RANGE (created_at)`）。

3. **ai_jobs.job_type 应为 enum**：当前是 `varchar`，没有数据库层约束。应定义：`frame_extraction | quality_filter | super_resolution | detection | segmentation | classification | report_generation`，用 PostgreSQL ENUM 或 CHECK constraint。

4. **users.role 单角色限制**：`varchar role` 只支持单角色，无法实现「医生兼研究员」等多角色场景。MVP 可接受，但架构文档应注明此限制。

---

### 文档 7：api-spec-v2.yaml（Rex）

**评分**: 8.0/10 ✅

**优点**: 1685 行，覆盖完整的 REST API（Auth/Patients/Examinations/AI Jobs/Findings/Reports/Organizations/Users/FHIR），HIPAA 注释完善，错误码规范，rate limiting 记录在 header 说明中。

**问题**:
1. **缺异步回调机制**：AI 处理是异步管道（5分钟+）。API spec 目前只有轮询（`GET /examinations/{id}/status`）但没有：
   - WebSocket endpoint（实时进度推送，Web UI 需要这个）
   - Webhook callback（第三方 EMR 集成需要这个）
   需至少补充 WebSocket 或 SSE endpoint。

2. **technician 角色不在架构设计中**：API spec 的 User.role enum 包含 `[admin, doctor, technician, viewer]`，但 architecture-spec-v1.md 的 RBAC 设计只有 `[admin, doctor, reviewer, system]`。`technician` vs `reviewer` 角色定义不一致，需对齐。

3. **无 DICOM/PACS import 端点**：用户画像 Helen 明确要求 PACS 自动对接，但 API spec 无此端点。应补充或明确标注为 Phase 2。

4. **文件上传模式不明确**：`POST /examinations/{id}/frames/upload` 应是获取预签名 URL 再直传 S3（避免 API 成为带宽瓶颈），但 spec 中未区分「申请上传 URL」和「直传」这两步。建议：`POST /examinations/{id}/upload-url` 返回 presigned URL，客户端直接 PUT 到 S3。

---

### 文档 8：component-library-recommendation.md（Finn）

**评分**: 6.5/10 ⚠️ 需修改

**技术错误（关键）**：

> 「Headless UI 可直接通过 CDN 引入，与现有纯 HTML 架构兼容」

**这是错误的。** Headless UI 是 React 专用库（`@headlessui/react`），没有 UMD/CDN 版本，无法在纯 HTML 项目中使用。当前 nexture-website 是纯 HTML/CSS/JS，没有 React/Next.js 编译环境。

正确的纯 HTML 交互组件方案：
- **Alpine.js**（~16KB gzipped，CDN 可用，与 Tailwind 深度集成）：可通过 `<script src="https://unpkg.com/alpinejs">` 直接引入，支持 Dropdown/Modal/Tabs 等交互组件
- **或**：维持纯 Vanilla JS（当前已经做到，无需引入库）

**其他问题**：
- nexture-website 已经是纯 HTML 交付（prototype/index.html），组件库对其实际价值有限，建议明确说明「当前阶段不引入组件库」
- TheraSeus 的 shadcn/ui 推荐完全正确 ✅

**修复要求**：Finn 需更正 nexture-website 的推荐（将 Headless UI CDN 改为 Alpine.js 或 Vanilla JS）。

---

### 文档 9：prototype/index.html（Finn）

**评分**: 7.5/10 ✅

**优点**: 结构完整（nav/hero/features/trust/CTA/footer），品牌色正确（#E8005A/#2D3282/#7B2070），CSS variables 系统化，暗色主题，粒子动画骨架存在。

**技术评估**（静态审查）:
- 669 行单文件，含内联 CSS/JS，符合 nexture-website 的 <30KB/HTML 目标（需实际测量）
- CSS 使用 `position: fixed` nav + `backdrop-filter: blur`，性能敏感，需测试 Safari 兼容性
- Features 卡片使用 emoji 作为 icon（🎯 ⚡ 🔒），可快速替换为 SVG icon
- 未见响应式 media queries（从 grep 结果看），需确认 375px 视口是否有测试

**无法在静态审查中验证**：Lighthouse 分数、Canvas 粒子系统性能、实际文件大小（gzip）。建议 Sage 运行 Playwright + Lighthouse 验证后更新评分。

---

### 文档 10：theraseus/test-strategy.md（Sage）

**评分**: 8.5/10 ✅

**优点**: 测试分层清晰（Unit/集成/E2E/性能/安全），医疗指标专项测试（FNR<2%/FPR<5%/ECE<0.05/mAP@0.5）覆盖全面，RBAC 测试矩阵完整，与 ai-clinical-metrics.md 的指标要求一致。

**问题**:
1. **缺 RAG Pipeline 专项测试**：rag-pipeline-design.md 设计了幻觉检测（NLI 模型）、引用准确性、置信度阈值，但测试策略中无对应测试用例。RAG 是报告生成质量的核心，幻觉率测试对医疗场景是 P0。
2. **缺故障注入测试**：GPU Worker 在处理中途崩溃时（Spot 实例抢占），SQS 消息是否会正确重回队列？患者数据是否完整？这类 chaos 测试在医疗软件中是必要的。
3. **AI 偏差测试**：列在 Appendix 优先级 P2，但没有具体测试用例。FDA 对 AI/ML SaMD 要求 bias assessment，至少需要定义测试数据集的人口统计分层。

---

### 文档 11：nexture-website/test-strategy.md（Sage）

**评分**: 8.0/10 ✅

**优点**: 针对静态官网特点设计合理，视觉回归（Playwright screenshots）、Core Web Vitals、SEO、跨浏览器矩阵均有覆盖。

**问题**:
1. **Canvas 动画截图测试脆弱**：`await page.waitForTimeout(2000)` 是时间依赖等待，在 CI 环境（慢机器）可能截到动画中间态，产生假失败。建议改为：等待 Canvas 的 `data-animation-state="ready"` 属性或 `page.waitForFunction(() => window.particleAnimationReady === true)`。
2. **Percy 成本建议过高**：推荐 Percy（$99/月起）作为可选工具，对 MVP 静态官网过度。当前 Playwright + pixelmatch 已足够，Percy 等 team 扩大到 5+ 前端开发者再考虑。

---

## 跨文档一致性问题汇总

| 问题 | 涉及文档 | 责任方 | 建议 |
|------|---------|-------|------|
| **FHIR 时序不一致** | architecture(Phase 3) vs user-personas(Phase 1) vs api-spec(已有端点) vs data-model(已有字段) | Atlas 主导对齐 | 统一为：字段/端点 MVP 中预留（nullable），功能性启用在 Phase 3 |
| **PACS/DICOM 需求未进 API spec** | user-personas → api-spec 断层 | Rex | 在 api-spec 补充 DICOM import endpoint 或明确 Phase 时序 |
| **RAG 基础设施未进架构图** | rag-pipeline vs architecture | Atlas | architecture-spec v1.1 补充 OpenSearch Serverless 组件 |
| **technician vs reviewer 角色** | api-spec vs architecture RBAC | Rex + Atlas | 对齐角色枚举，选一个 |
| **直接竞品缺失** | competitive-analysis | Aria | 补充胶囊内镜直接竞品章节 |
| **Headless UI 技术错误** | component-library-recommendation | Finn | 更正为 Alpine.js 或 Vanilla JS |

---

## 返工要求

### 必须返工（不合格）
**Finn** → `component-library-recommendation.md`
- 更正 nexture-website 推荐：Headless UI 改为 Alpine.js（CDN 可用）或明确「维持 Vanilla JS，无需组件库」
- 工作量：~30 分钟

### 建议修复（下一个 Sprint）
**Atlas** → `architecture-spec-v1.md` v1.1
- 补充 OpenSearch Serverless 组件，统一 S3 生命周期描述，补充 On-Premise 加密细节

**Rex** → `api-spec-v2.yaml` v2.1
- 补充 WebSocket/SSE 异步回调，对齐角色枚举，补充 DICOM import 或明确 Phase 时序

**Aria** → `competitive-analysis.md` v1.1
- 补充直接竞品章节（RAPID Reader/PillCam AI）

**Nova** → `rag-pipeline-design.md` v1.1
- 补充月度成本估算，明确 PMC-Patients 合规决策

**Sage** → `theraseus/test-strategy.md` v1.1
- 补充 RAG pipeline 专项测试，故障注入测试骨架

---

*Atlas (🏗️) | T026 | 2026-03-12*
