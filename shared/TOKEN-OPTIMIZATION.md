# TOKEN-OPTIMIZATION.md
# Nexture Dev Team · Token 分层加载策略
# 制定：Nova | 日期：2026-03-11 | Sprint-02

---

## 一、设计原则

1. **按需加载（Lazy Loading）**：只在需要时注入上下文，不全量广播
2. **层级隔离**：每层有明确触发条件和硬性 token 上限
3. **成本可见**：每次任务分配前可估算本次上下文成本
4. **最小原则**：Level 0 保持极轻，任何 agent 任何时刻均可承载

---

## 二、分层定义

### Level 0 — 始终加载（Always-on Context）
**Token 上限：< 200 tokens**
**触发条件：** 所有对话、所有 agent、所有时刻

包含内容：
- IDENTITY.md（角色名、emoji、一句话定位）
- USER.md（Victor 联系方式、汇报链）
- PROJECTS.json（项目名 + topicId + status，不含 description）
- 当前 Sprint 编号

示例内容（约 120 tokens）：
```
Agent: Nova | Role: AI/ML Engineer
User: Victor (telegram: @okupup)
Projects: nexture-website(#368, Sprint-02, active) | theraseus(#369, Sprint-02, active)
Report to: q
```

---

### Level 1 — 项目上下文（Project Context）
**Token 上限：< 500 tokens**
**触发条件：** agent 进入对应项目 topic（#368 或 #369）时注入

包含内容（按项目注入，非全量）：
- PROJECTS.json 中该项目的完整字段
- 该项目的 agents.auto 成员列表
- 项目当前 sprint 目标（1-2句）
- 关键路径文件索引（文件名 + 路径，不含内容）
- 上次 brief_updated 日期

nexture-website Level 1 示例（约 280 tokens）：
```
Project: nexture-website | Sprint-02 | type: website
Goal: Multi-page site content schema + copy refinement + visual delivery
Docs: nexture-website/docs/copy.md, content-schema.json, nexture-site-analysis.md
Auto agents: nova, aria, finn
Last brief: 2026-03-11
```

theraseus Level 1 示例（约 310 tokens）：
```
Project: theraseus | Sprint-02 | type: ai-platform
Goal: EfficientNet multi-label classifier + frame dedup + quality scoring (Phase 1)
Docs: theraseus/docs/ai-module.md, architecture.md, dataset-exploration.md
Datasets: kvasir-seg, kvasir-v2, wcebleedgen, autowcebleedgen, cvc-clinicdb
Auto agents: nova, atlas
Last brief: 2026-03-11
```

---

### Level 2 — 任务上下文（Task Context）
**Token 上限：无硬性上限（按任务实际需要）**
**触发条件：** q 分配具体任务时，按任务类型精准注入

注入规则：
| 任务类型 | 注入内容 |
|----------|----------|
| 文案/内容 | copy.md + content-schema.json |
| 模型训练 | ai-module.md + dataset-exploration.md + 对应数据集说明 |
| 架构设计 | architecture.md + ADR.md（仅相关条目）|
| 测试验收 | test-report.md + 验收标准 checklist |
| 部署/基础设施 | cloud-infrastructure.md + api-spec.md |
| 代码 Review | 相关代码文件（仅 diff 或关键函数）|

**原则：** Level 2 内容由 q 在任务分配消息中直接引用，不预加载。

---

## 三、每增加一个项目的 Token 成本增量估算

### 成本模型

| 层级 | 新增 token/project | 触发频率 | 说明 |
|------|-------------------|----------|------|
| Level 0 | ~15 tokens | 每条消息 | PROJECTS.json 新增一行摘要 |
| Level 1 | ~300 tokens | 进入项目 topic 时 | 项目 brief 首次注入 |
| Level 2 | ~500-2000 tokens | 每次任务分配 | 按任务类型差异大 |

### 每日成本增量估算（以一个新项目为例）

假设：
- 每日消息量：50 条（所有 agent）
- 每日进入项目 topic：10 次
- 每日任务分配：5 次，平均 Level 2 = 800 tokens

```
Level 0: 50 × 15 = 750 tokens/day
Level 1: 10 × 300 = 3,000 tokens/day
Level 2: 5 × 800 = 4,000 tokens/day
─────────────────────────────────────
合计增量: ~7,750 tokens/day/project
按 claude-sonnet 输入价格 $3/M tokens:
日成本增量: 7,750 / 1,000,000 × $3 ≈ $0.023/day
月成本增量: ≈ $0.69/month/project
```

### 优化建议

1. **PROJECTS.json Level 0 字段极简化**：name + topicId + sprint 三字段，description 移至 Level 1
2. **Level 1 按需缓存**：同一 topic 会话内只注入一次，不重复注入
3. **Level 2 文档分片**：长文档（>1000 tokens）只传相关段落，用行号索引定位
4. **Agent 订阅精准化**：agents.auto 只含真正需要主动加载上下文的 agent（≤3人），避免广播

---

## 四、当前项目 Token 预算概览

| 项目 | Level 0 | Level 1 | 日均 Level 2 | 月估算成本 |
|------|---------|---------|-------------|-----------|
| nexture-website | ~15 t | ~280 t | ~2,000 t | ~$0.50 |
| theraseus | ~15 t | ~310 t | ~3,500 t | ~$0.80 |
| **两项目合计** | **~30 t** | **~590 t** | **~5,500 t** | **~$1.30** |

> 注：Level 2 成本取决于任务密度，theraseus 因 ML 文档较重成本较高。

---

*制定：Nova | Sprint-02 | 2026-03-11*
*审阅：q（建议 Atlas review 架构部分）*
