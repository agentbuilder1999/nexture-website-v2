# COLLAB.md — Nexture 项目协作规范

> 维护者: Atlas | 版本: v1.0 | 2026-03-10
> **每个 Sprint 开始前必须阅读本文档。**

---

## 1. 共享工作区说明

```
/workspace/    ← 唯一共享根目录（即 workspace-shared）
```

- `/workspace/` 与各 agent 的 `workspace-shared/` 软链接指向同一物理目录
- **所有产出物直接写入 `/workspace/` 下对应子目录**，全员可读可写
- 各 agent 私有配置（`AGENTS.md`, `SOUL.md` 等）保留在各自 `workspace-<role>/`，不放入 `/workspace/`

---

## 2. 目录结构与职责分工

```
/workspace/
├── docs/                    # 📐 规范文档（Atlas 主责）
│   ├── COLLAB.md            #   本文件
│   ├── architecture.md      #   系统架构
│   ├── api-spec.md          #   API 规范
│   ├── ADR.md               #   架构决策记录
│   └── tech-spec.md         #   技术规范
│
├── frontend/                # 🦊 前端代码（Finn 主责）
│   ├── index.html
│   ├── assets/              #   静态资源
│   └── ...
│
├── backend/                 # 🐺 后端代码（Rex 主责）
│   ├── ...
│   └── migrations/
│
├── ai_modules/              # 🧪 AI pipeline（Nova 主责）
│   └── ...
│
└── design/                  # 🎨 设计资源（Aria 主责）
    ├── design-system.md
    └── wireframes/
```

### 写入权限

| 目录 | 主负责人 | 说明 |
|---|---|---|
| `docs/` | Atlas | 规范/架构文档；他人修改通过 q 协调 |
| `frontend/` | Finn | 前端实现 |
| `backend/` | Rex | 后端实现 |
| `ai_modules/` | Nova | AI pipeline |
| `design/` | Aria | 设计稿/资源 |

> 修改他人主责目录的文件，通过 q 协调，避免覆写冲突。

---

## 3. Git Commit 格式

```
<type>: <English description>
```

| Type | 用途 |
|---|---|
| `feat` | 新功能 |
| `fix` | 修复 |
| `docs` | 文档变更 |
| `style` | 格式/样式调整（不影响逻辑） |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试 |
| `chore` | 构建/工具/依赖 |

**示例：**
```
feat: add particle system with mouse tracking
docs: create tech-spec for landing page
fix: reduce particle count on mobile
```

### 分支策略

```
main              ← 生产，只接受 PR
└── dev           ← 开发集成
    ├── feat/landing-particles
    ├── fix/mobile-performance
    └── docs/sprint-01-spec
```

- 命名：`<type>/<kebab-case-description>`
- 功能分支 → `dev`（Squash Merge）；`dev` → `main`（Merge Commit）
- 合并后删除功能分支

---

## 4. 交接规范

### 流程

```
完成产出 → 写入 /workspace/ 对应目录 → Telegram topic 回复摘要 → q 调度下游
```

**禁止跳过 q 直接指派其他成员。**

### 汇报格式

```
✅ [产出类型] 完成
📄 路径: /workspace/xxx/yyy.md
📋 内容: 一句话描述
👉 下游: 谁需要读/用这个文件
```

### 依赖链

```
Atlas (docs/) → Aria (design/) → Finn (frontend/)
             → Rex (backend/)
             → Nova (ai_modules/)
```

---

## 5. 文件命名规范

| 类型 | 格式 | 示例 |
|---|---|---|
| 文档 | `kebab-case.md` | `tech-spec.md` |
| 全局规范 | `UPPER-CASE.md` | `COLLAB.md`, `ADR.md` |
| 代码/资源 | `kebab-case.{ext}` | `particle-system.js`, `hero-bg.svg` |

**禁止：** 空格、中文文件名、无意义后缀（`final-v2-final.md`）。所有文件名用 English。

---

## Changelog

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-03-10 | v1.0 | 初始版本 — Sprint-01 复盘后建立 |

*本文档由 Atlas 维护。修改请通过 q 提交。*
