# COLLAB.md — Nexture 团队协作规范

> 维护者: Atlas | 版本: v2.0 | 2026-03-11
> **每个 Sprint 开始前必须阅读本文档。**

---

## 1. 共享工作区说明

### 1.1 路径规则

| 路径 | 状态 | 说明 |
|---|---|---|
| `~/.openclaw/workspace-shared/` | ✅ **标准路径** | 共享工作区物理位置 |
| `workspace-shared/` | ✅ **软链接** | 各 agent workspace 下的符号链接，指向上述路径 |
| `/workspace/` | ❌ **不存在** | 文档中的逻辑路径，实际操作时使用上述路径 |
| `workspace-<role>/` | 🔒 **私有** | 各 agent 配置文件（AGENTS.md 等），不放共享内容 |

### 1.2 文件写入方式

**`write` 工具**受沙盒限制，只能写入 agent 自身的 `workspace-<role>/`。

**共享文件必须用 `exec` + bash 写入：**

```bash
# ✅ 正确：用 exec 写入共享工作区
cat > ~/.openclaw/workspace-shared/projects/nexture-website/docs/filename.md << 'CONTENT'
文件内容...
CONTENT

# ✅ 也可以通过软链接
cat > workspace-shared/projects/nexture-website/docs/filename.md << 'CONTENT'
文件内容...
CONTENT

# ❌ 错误：write 工具无法写入共享区
# ❌ 错误：写入 /workspace/（路径不存在）
```

### 1.3 读取方式

- `read` 工具：可通过软链接 `workspace-shared/projects/nexture-website/docs/filename.md` 读取
- `exec` + `cat`：可用绝对路径 `~/.openclaw/workspace-shared/projects/nexture-website/docs/filename.md`

---

## 2. 目录结构与职责分工

```
~/.openclaw/workspace-shared/
├── docs/                    # 📐 规范文档 — Atlas 主责
│   ├── COLLAB.md            #   本文件
│   ├── architecture.md      #   系统架构
│   ├── api-spec.md          #   API 规范
│   ├── ADR.md               #   架构决策记录
│   ├── tech-spec.md         #   技术规范
│   └── ...                  #   领域研究、合规等文档
│
├── frontend/                # 🦊 前端代码 — Finn 主责
│   ├── index.html
│   ├── assets/              #   静态资源（图片/SVG/字体）
│   └── ...
│
├── backend/                 # 🐺 后端代码 — Rex 主责
│   ├── ...
│   └── migrations/          #   数据库迁移
│
├── ai_modules/              # 🧪 AI pipeline — Nova 主责
│   └── ...
│
├── design/                  # 🎨 设计资源 — Aria 主责
│   ├── design-system.md
│   └── wireframes/
│
├── scripts/                 # 🔧 工具脚本 — 按需
├── templates/               # 📄 模板文件
├── datasets/                # 📊 数据集（Nova/研究用）
├── references/              # 📚 参考资料
└── delivery/                # 📦 交付物
```

### 写入权限矩阵

| 目录 | 主负责人 | 可读 | 可写 |
|---|---|---|---|
| `docs/` | Atlas | 全员 | Atlas；他人通过 q 协调 |
| `frontend/` | Finn | 全员 | Finn |
| `backend/` | Rex | 全员 | Rex |
| `ai_modules/` | Nova | 全员 | Nova |
| `design/` | Aria | 全员 | Aria |
| `scripts/` | — | 全员 | 创建者维护 |

> ⚠️ 修改他人主责目录下的文件，必须通过 q 协调，禁止直接覆写。

---

## 3. Git Commit 格式规范

### 格式

```
<type>: <English description>
```

### Type 枚举

| Type | 用途 | 示例 |
|---|---|---|
| `feat` | 新功能 | `feat: add particle system with mouse tracking` |
| `fix` | 修复 | `fix: reduce particle count on mobile` |
| `docs` | 文档变更 | `docs: create COLLAB.md team collaboration spec` |
| `style` | 格式/样式（不影响逻辑） | `style: adjust hero section spacing` |
| `refactor` | 重构 | `refactor: extract particle config to constants` |
| `perf` | 性能优化 | `perf: use object pool for particle recycling` |
| `test` | 测试 | `test: add viewport resize test for canvas` |
| `chore` | 构建/工具/依赖 | `chore: update deployment script` |

### 规则

- Description 必须使用 **English**
- 首字母小写，不加句号
- 祈使语气（`add` 而非 `added` 或 `adding`）
- 单行不超过 72 字符

### 分支策略

```
main                              ← 生产分支，只接受 PR
└── dev                           ← 开发集成
    ├── feat/landing-particles
    ├── fix/mobile-performance
    └── docs/sprint-01-spec
```

- 命名：`<type>/<kebab-case-description>`
- 功能分支 → `dev`：Squash Merge
- `dev` → `main`：Merge Commit
- 合并后立即删除功能分支

---

## 4. 交接规范（Handoff Protocol）

### 4.1 流程

```
完成产出 → 写入共享工作区 → Telegram topic 回复 Handoff → q 调度下游
```

**所有调度由 q 负责。禁止跳过 q 直接指派其他成员。**

### 4.2 Handoff 格式

```
✅ HANDOFF: [产出类型]
📄 路径: ~/.openclaw/workspace-shared/xxx/yyy.md
📋 摘要: ≤100 字描述核心内容
📐 验收标准:
  - [ ] 标准 1（由发起方/q 定义）
  - [ ] 标准 2
  - [ ] 标准 3
👉 下游: 谁需要读/用这个文件
⚠️ 注意: 特殊说明（如有）
```

### 4.3 验收标准规则

- **验收标准由任务发起方（通常是 q）在任务分配时定义**
- 如果发起方未提供，执行者在 Handoff 中自拟，由 q 确认
- 验收标准必须是**可检查的**（能回答"是否满足"）
- 下游消费者在使用产出前，逐条核对验收标准

### 4.4 示例

```
✅ HANDOFF: [tech-spec]
📄 路径: ~/.openclaw/workspace-shared/projects/nexture-website/docs/tech-spec.md
📋 摘要: Landing page 粒子方案选型（Canvas 2D）+ HTML 结构 + 技术约束
📐 验收标准:
  - [ ] 粒子方案有对比分析和推荐理由
  - [ ] HTML section 结构完整定义
  - [ ] 性能预算和浏览器兼容目标明确
  - [ ] 移动端适配方案已覆盖
👉 下游: Finn（实现）、Aria（结构参考）
```

### 4.5 依赖链

```
Atlas (docs/规范)
  → Aria (design/)    → Finn (frontend/)
  → Rex (backend/)
  → Nova (ai_modules/)
                         ↓
                    集成 → dev → main
```

---

## 5. 讨论发起规范

### 5.1 何时发起讨论

当你遇到以下情况，不要自行决定，发起讨论：
- 需要修改他人主责领域
- 技术方案有多种选择且影响他人
- 发现规范与实际实现矛盾
- 需要跨角色协调

### 5.2 [[DISCUSS]] 格式

在 Telegram topic 中发起：

```
[[DISCUSS]] 讨论标题

🎯 背景: 为什么需要讨论这个问题
📌 问题: 具体要决定什么
🔀 选项:
  A. 方案 A — 优点 / 缺点
  B. 方案 B — 优点 / 缺点
  C. 方案 C — 优点 / 缺点
💡 我的倾向: X 方案，因为...
👥 需要: @谁 的输入
⏰ 期望: 何时前需要结论
```

### 5.3 第一性原则三问

发起讨论前，先自问：

1. **这个问题必须现在决定吗？** — 如果可以延迟到有更多信息时再决定，标注 `[DEFER]` 并记录
2. **这个问题只影响我自己的领域吗？** — 如果是，自己决定并记录到 ADR，不需要讨论
3. **我是否已经有足够信息做出合理推荐？** — 如果是，直接给出推荐 + 理由，而不是开放式提问

> 目标：减少不必要的讨论，快速推进。讨论是为了做决定，不是为了讨论。

### 5.4 讨论结论记录

讨论结束后，由 q 或指定成员记录：

```
[[RESOLVED]] 讨论标题
📝 结论: 采用方案 X
📌 理由: ...
📄 记录: 写入 ADR.md（如为架构决策）
👉 行动: 谁做什么
```

---

## 6. 协作矩阵

### 6.1 谁可以和谁讨论什么

| 发起方 → 参与方 | 讨论范围 | 是否需要 q 介入 |
|---|---|---|
| Atlas ↔ Rex | API 规范、数据模型、后端架构 | 技术讨论可直接进行，决策需 q 确认 |
| Atlas ↔ Nova | AI pipeline 架构、数据流设计 | 同上 |
| Atlas ↔ Aria | 无直接讨论 | 通过 q 中转 |
| Atlas ↔ Finn | 技术约束澄清 | 通过 q 中转 |
| Aria ↔ Finn | 设计实现细节、组件规格 | 技术讨论可直接进行，决策需 q 确认 |
| Rex ↔ Nova | 后端 ↔ AI 接口 | 技术讨论可直接进行，决策需 q 确认 |
| 任何人 → q | 任何问题 | — |

### 6.2 原则

- **技术细节讨论**（"这个接口参数用什么类型"）：相关方可直接讨论
- **架构/方向决策**（"我们用 REST 还是 GraphQL"）：必须经 q 确认
- **跨领域协调**（"我的设计需要后端新接口"）：通过 q 发起
- **所有讨论结论**：回到 Telegram topic 公开记录，不私下决定

### 6.3 升级机制

| 情况 | 行动 |
|---|---|
| 讨论 30 分钟无共识 | 升级到 q 裁决 |
| 涉及项目方向/预算/时间线 | 直接由 q 决定，必要时升级 Victor |
| 发现安全/合规问题 | Atlas 立即通知 q |
| 实现偏离架构规范 | Atlas 立即通知 q |

---

## 7. 集体讨论规范

### 7.1 何时触发集体讨论

- Sprint 规划
- 重大架构变更（影响 ≥3 个角色）
- 项目方向调整
- 复盘/回顾

### 7.2 [TEAM-DISCUSS] 格式

由 q 发起：

```
[TEAM-DISCUSS] 讨论主题

📋 议程:
  1. 议题 1 — 预计 X 分钟
  2. 议题 2 — 预计 X 分钟
  3. ...

📎 前置阅读:
  - ~/.openclaw/workspace-shared/projects/nexture-website/docs/xxx.md
  - ...

👥 参与: @Atlas @Aria @Finn @Rex @Nova（或指定子集）
⏰ 时间: YYYY-MM-DD HH:MM NZDT
📏 规则:
  - 每人每议题发言 ≤ 200 字
  - 先表态（赞成/反对/中立）再给理由
  - q 负责总结和最终决策
```

### 7.3 集体讨论输出

```
[TEAM-RESOLVED] 讨论主题

📝 决议:
  1. 议题 1 → 结论 + 负责人 + 截止时间
  2. 议题 2 → 结论 + 负责人 + 截止时间

📄 记录: 写入 ADR.md / COLLAB.md（视内容）
📅 下次: 下一次集体讨论预期时间
```

---

## 8. Sprint 流程概览

### 8.1 Sprint 周期

```
Sprint 长度: 由 q 根据项目节奏决定（通常 1-2 周）
```

### 8.2 流程

```
┌─────────────────────────────────────────────────────────┐
│  Phase 0: 准备                                          │
│  q 定义 Sprint 目标 + 任务分解                           │
│  全员阅读 COLLAB.md（本文档）                             │
├─────────────────────────────────────────────────────────┤
│  Phase 1: 规范先行                                      │
│  Atlas → tech-spec / api-spec / architecture            │
│  Aria → design-system / wireframes                      │
│  产出 Handoff → q 分发                                   │
├─────────────────────────────────────────────────────────┤
│  Phase 2: 并行实现                                      │
│  Finn → frontend（依赖 Atlas spec + Aria design）       │
│  Rex → backend（依赖 Atlas api-spec）                    │
│  Nova → ai_modules（依赖 Atlas architecture）            │
│  各自 Handoff → q 协调集成                               │
├─────────────────────────────────────────────────────────┤
│  Phase 3: 集成 & 验收                                   │
│  q 验收各产出（对照验收标准）                              │
│  集成测试 → dev 分支                                     │
│  修复 → 回到 Phase 2                                    │
├─────────────────────────────────────────────────────────┤
│  Phase 4: 交付                                          │
│  dev → main（PR + Review）                              │
│  部署                                                    │
├─────────────────────────────────────────────────────────┤
│  Phase 5: 复盘                                          │
│  [TEAM-DISCUSS] Sprint 回顾                             │
│  更新 COLLAB.md / ADR.md                                │
└─────────────────────────────────────────────────────────┘
```

### 8.3 Sprint 启动 Checklist

每个 Sprint 开始前，q 确认：

- [ ] COLLAB.md 已被全员阅读
- [ ] Sprint 目标明确（一句话可表述）
- [ ] 任务已分解并分配到各角色
- [ ] 每个任务有明确的验收标准
- [ ] 依赖关系已识别（谁等谁）
- [ ] architecture.md / api-spec.md 已更新（如适用）

---

## 文件命名规范

| 类型 | 格式 | 示例 |
|---|---|---|
| 文档 | `kebab-case.md` | `tech-spec.md`, `api-spec.md` |
| 全局规范 | `UPPER-CASE.md` | `COLLAB.md`, `ADR.md` |
| 代码/资源 | `kebab-case.{ext}` | `particle-system.js`, `hero-bg.svg` |
| 目录 | `snake_case` 或 `kebab-case` | `ai_modules/`, `wireframes/` |

**禁止：** 空格、中文文件名、无意义后缀（`final-v2.md`）。**所有文件名用 English。**

---

## Changelog

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-03-10 | v1.0 | 初始版本 — Sprint-01 复盘后建立 |
| 2026-03-11 | v2.0 | 完整版 — 增加讨论规范、协作矩阵、Sprint 流程、exec 写入说明 |

---

*本文档由 Atlas 维护。修改请通过 q 提交。*


---

## 决策记录规范

### DECISIONS.md（q 维护，所有决策）
路径：`~/.openclaw/workspace-shared/projects/nexture-website/docs/DECISIONS.md`
记录：**所有讨论产生的决策**，无论大小
格式：日期 | 议题 | 决策 | 理由 | 影响方 | 状态
维护：q 在每次 [[RESOLVED]] 后自动写入

### ADR.md（Atlas 维护，架构决策）
路径：`~/.openclaw/workspace-shared/projects/nexture-website/docs/ADR.md`
记录：**仅架构级决策**（系统设计、技术选型、API 约定）
格式：标准 ADR（背景/决策/理由/影响/状态）
维护：Atlas 在做架构决策时主动写入

**规则：同一决策不重复记录。**
- 架构决策 → Atlas 写 ADR.md，q 在 DECISIONS.md 写一行摘要+指向 ADR
- 非架构决策 → 只写 DECISIONS.md
