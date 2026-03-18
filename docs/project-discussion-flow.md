# 项目讨论流程文档 v1.1
> 生效日期：2026-03-15 | Victor 确认 | Atlas + Sage 审查通过
> 变更：修复 3 处结构冲突 + 5 处边界条件 + token 成本约束显式化

---

## 零、Token 成本约束（强制）

讨论是最贵的操作，必须有意识地控制。

| Agent | 单轮成本 | 最大轮次 | Sprint 上限 |
|-------|---------|---------|------------|
| Atlas | ~$0.15/轮 | **3 轮** | 计入 $2 总额 |
| 其他 agent | ~$0.05/轮 | **5 轮** | 计入 $2 总额 |

**Sprint 复盘必须报告本 Sprint 讨论成本；超 $2 → 通知 Victor。**

### 讨论发起前必须自检
- 该问题是否在 COLLAB.md / api-spec.md / DECISIONS.md 中已有答案？
- 是否可以自己决策（无需讨论）？
- 是否可以用一条消息描述清楚（而非多轮）？

→ 以上任一为"是"，**不发起讨论**。

---

## 一、讨论类型速查

| 类型 | 标签 | 发起方 | 适用场景 | 典型成本 |
|------|------|--------|---------|---------|
| 单点讨论 | [[DISCUSS:agent_id]] | 任意 agent | 单一问题，有明确方案需确认 | $0.05–$0.15 |
| 全员讨论 | [TEAM-DISCUSS] | q / Victor | Sprint 启动/复盘、重大决策 | $0.30–$0.90 |
| 紧急上报 | [[BLOCK:main]] | 任意 agent | P0 阻塞、Gateway 停机、安全事件 | 最小化 |
| Victor 检查点 | q 主动通知 | q | 设计完成 / 第一版完成 | — |

🔴 [[DISCUSS]] 与 [[BLOCK]] 严格区分：阻塞紧急情况用 [[BLOCK]]，不走完整讨论门控。

---

## 二、[[DISCUSS:agent_id]] 单点讨论

### 发起条件
- 有具体问题，且已有自己的初步方案
- 轮次预算充足（Atlas 未满 3 轮，其他未满 5 轮）

### 消息格式（缺任意 section → q 退回，不路由）
```
情境：[当前阶段 + 遇到的具体情况]
冲突：[具体问题/障碍]
我的方案：[agent 自己的建议，必须有，不能空]
需要你的：[明确说明需要对方给什么]
```
- 每个 section 独立一行，不写叙述式长段落
- 每次只讨论一个问题，多个问题拆分发送

### q 的处理流程
1. 门控检查（4 项全过才路由）→ 不通过：退回并说明原因
2. 转发给目标 agent，附完整上下文 + 轮次计数
3. 目标 agent **15 分钟内无响应** → q 直接决策，不等待
4. 轮次超限（Atlas 3 轮 / 其他 5 轮）→ q 直接给出决策，终止讨论
5. 检测到 [[RESOLVED]] → 决策写入 DECISIONS.md → 发摘要到 #team

---

## 三、[[BLOCK:main]] 紧急上报

与 [[DISCUSS]] 严格分离，不走门控，不限轮次。

### 触发条件
- 任务被阻塞无法推进（等待依赖、权限、数据）
- P0 安全事件 / Gateway 停机 / 数据丢失风险

### 格式（简洁，无需方案）
```
[[BLOCK:main]]
阻塞原因：[一句话]
影响任务：[任务 ID]
需要：[具体需要 q 提供什么]
```

### q 的处理
- P0：5 分钟内响应
- 普通阻塞：15 分钟内响应
- q 15 分钟无响应 → agent 升级到 Level 2（Bot API topic）→ 再 15 分钟 → DM Victor

---

## 四、[TEAM-DISCUSS] 全员讨论

### 发起条件（满足至少一项）
- Sprint 启动会 / Sprint 复盘（固定触发）
- 重大架构决策，需要多视角
- Victor 或 q 明确要求

### 成本预估（发起前必做）
参与 agent 数 × 单轮成本 × 预计轮次 ≤ 本 Sprint 剩余预算

### 三阶段流程

第一阶段：并行征集（0–3 分钟）
- q 同时发给所有参与 agent，附注「请独立回复，不要参考他人答案」
- 等待：正常 90 秒，最长 3 分钟
- 超时未回复 → 标注「[超时未回复]」，基于已有回复继续，不重发
- 超时记录写入当次复盘

第二阶段：汇总（q 执行）
- 提取共识点
- 标注分歧点（含各方立场）
- 发摘要到 #team（topic 263）

第三阶段：收敛
- 无分歧 → 直接决策
- 有分歧 → q 发起针对性双边讨论（成本计入 Sprint 总额）
- 分歧持续超过轮次上限 → q 或 Victor 直接拍板

---

## 五、Sprint 项目执行流程

### 启动
Step 1. Victor → q：Sprint 目标 + 任务列表
Step 2. q 发起 [TEAM-DISCUSS] Sprint 启动会，全员对齐目标
Step 3. q 按路由矩阵分配任务到各 agent topic（含 DoD + Deadline + 回报路径）
Step 4. 各 agent 在自己 topic 确认收到
  超时规则：30 分钟内未确认 → 标注 [未确认]，q 记录后推进
  不因单个 agent 未确认阻塞整个 Sprint 启动

### 执行中
Step 5. Agent 执行任务
Step 6. 阻塞 → 发 [[BLOCK:main]] 到自己 topic（不走 [[DISCUSS]] 门控）
Step 7. 【检查点①】Aria + Nova 完成设计规范
  q 通知 Victor DM：附路径，等「继续」或「调整：[说明]」
  Victor 无响应超 2 小时 → q 标注并继续（非阻塞）
Step 8. 【检查点②】Finn 完成第一版
  q 发截图给 Victor DM（1280px + 375px）
  Victor 无响应超 2 小时 → q 标注并继续（非阻塞）
Step 9. Sage 全面 QA → 出具测试报告（路径写入 #sage topic）

### 收尾
Step 10. 判定标准：TASKS.jsonl 中本 Sprint 所有任务状态为 done/cancelled
Step 11. q 向 Victor 提交完成报告（含可验证产出路径、偏差说明）
Step 12. Victor 执行系统硬操作（部署、重启等）
Step 13. q 发起 Sprint 复盘 [TEAM-DISCUSS]
Step 14. q 报告本 Sprint 讨论成本（超 $2 → 附优化建议）

---

## 六、任务回报规范（v2）

详见：workspace-shared/docs/agent-comms-spec-v2.md

| Level | 方式 | 触发条件 |
|-------|------|---------|
| 1 | sessions_send → q（agent:main:main） | 默认 |
| 2 | Bot API curl → 自己的 group topic | Level 1 失败 / Gateway 停机 |
| 3 | DM Victor（6663682303） | q 15min 无响应（Level 1+2 已执行）；P0 专用；使用执行 agent 的 botToken 调用 Telegram API |

- P0 事件：5 分钟超时阈值
- 普通任务：15 分钟超时阈值

---

## 七、[[CONFIG-SUGGEST]] 审核

- 触发：每次 Sprint 复盘后，q 检查各 agent topic
- 有价值 → 提交 Victor 确认 → 由 q 执行 openclaw config set
- 通知提出建议的 agent：「已采纳/拒绝，原因：[...]」
- 采纳的建议写入 DECISIONS.md

---

## 附录：常见错误与正确做法

| 错误做法 | 正确做法 |
|---------|---------|
| 被阻塞用 [[DISCUSS]] 上报 | 用 [[BLOCK:main]] |
| 全员广播一个简单问题 | 先自检，能自决就自决 |
| Atlas 讨论 4+ 轮 | 第 3 轮结束后 q 直接决策 |
| Sprint "all done" 靠通知判断 | 查 TASKS.jsonl 状态 |
| 检查点等 Victor 无限期 | 2 小时无响应 → 继续，标注 |
| sessions_send 失败直接放弃 | fallback 到 Level 2 Bot API |
