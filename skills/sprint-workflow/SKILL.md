---
name: sprint-workflow
description: Nexture team Sprint workflow reference. Use when starting/ending a Sprint, writing handoff docs, logging decisions, or following the discussion protocol.
metadata: { "openclaw": { "emoji": "🏃", "always": true } }
---

# sprint-workflow

Reference for all Nexture team workflow protocols.

## Key file paths
```
~/.openclaw/workspace-shared/
  docs/COLLAB.md          # 协作规范（必读）
  docs/DECISIONS.md       # 决策记录
  docs/handoff-template.md # 交接文档模板
  docs/domain/            # 领域知识库
  docs/design-spec.md     # Aria 设计规范
  docs/api-spec.md        # Atlas API 规范
  docs/tech-spec.md       # Atlas 技术规范
  screenshots/            # Finn/Sage 截图验证
```

## Sprint 流程
1. Sprint 启动会 [TEAM-DISCUSS] → q 协调
2. Atlas 技术可行性 + API 规范
3. Aria + Nova 并行（设计 + 文案）
4. Finn 实现（依赖 Aria + Nova 完成）
5. Rex 审查 + Sage QA 并行
6. Sprint 复盘

## 讨论格式
```
[[DISCUSS:agent_id]]
情境: [事实]
冲突: [问题]
我的方案: [答案]
需要你的: [需求]
[[/DISCUSS]]
```

## 决策记录
完成讨论后写入 ~/.openclaw/workspace-shared/docs/DECISIONS.md

## 汇报格式（向 q）
≤100字摘要 + 产出文件路径 + 下游通知
