# PRD 需求管理索引

> 按项目分文件管理。每条需求格式见下方模板。
> 维护责任：q（CTO）；来源确认：Victor（CEO）

---

## 项目索引

| 项目 | 文件 | 状态 |
|------|------|------|
| nexture-website | [nexture-website.md](./nexture-website.md) | 活跃 |
| theraseus | [theraseus.md](./theraseus.md) | 活跃 |

---

## 需求状态定义

| 状态 | 含义 |
|------|------|
| `backlog` | 已记录，未排期 |
| `in-progress` | 已派发，开发中 |
| `done` | 已上线 |
| `cancelled` | 已取消，附原因 |

## 优先级定义

| 级别 | 含义 |
|------|------|
| P0 | 阻塞上线 / 生产事故 |
| P1 | 当前 Sprint 必须完成 |
| P2 | 下个 Sprint 或有空时 |

---

## 需求模板

```markdown
## REQ-XXX · [标题]
- **状态**: backlog
- **优先级**: P1
- **来源**: Victor · YYYY-MM-DD
- **场景**: 用户/医生遇到什么问题
- **目标**: 做完后达到什么效果
- **约束**: 技术/合规/性能限制
- **关联任务**: T-XXX
- **备注**: 决策背景、被否决的方案
```
