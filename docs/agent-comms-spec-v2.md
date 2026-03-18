# Agent 沟通规范 v2
> 生效日期：2026-03-15 | Victor 确认 | Atlas + Rex 审查通过

## 回报路径（强制三级 fallback）

| Level | 方式 | 触发条件 |
|-------|------|----------|
| 1 | `sessions_send` → q（`agent:main:main`） | 默认 |
| 2 | Bot API curl → 自己的 group topic | Level 1 失败 / Gateway 停机 |
| 3 | DM Victor（6663682303） | q 15min 无响应（Level 1+2 已执行） |

## 直接 DM Victor 的条件（仅两种）
1. Victor 主动 DM 该 agent → 正常回复
2. q 超过 **15 分钟**无响应 → 升级 DM Victor

## 超时阈值
- 普通任务：15 分钟
- P0 安全/崩溃事件：5 分钟

## 所有工作沟通走 Topic
- 阻塞/求助 → 自己的 topic + `[[DISCUSS:main]]`
- 跨 agent 协作 → 各自 topic + #team
- **禁止**主动 DM Victor 汇报工作进度
- `sessions_send` 是官方机制，不在"禁止私聊"范围内

## Gateway 停机豁免
- sessions_send 失败 → 直接跳 Level 2（Bot API topic）
