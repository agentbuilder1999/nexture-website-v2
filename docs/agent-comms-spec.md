# Agent 通信协议规格 v1.1
> 作者：Victor + q | 日期：2026-03-12 | 状态：已实施（T013-T015 验证通过）
> 变更：v1.0 → v1.1（Atlas T013 审查后，Rex T014 实现，Sage T015 34/34 测试通过）

---

## 1. 背景与目标

nexture 团队由 7 个 agent 协作完成任务（q/Aria/Atlas/Finn/Rex/Nova/Sage）。本规格定义 agent 之间所有通信的标准机制，确保：
- **可追溯**：每个任务有完整的生命周期记录
- **可靠**：消息发送失败有降级方案
- **可观测**：stale 任务自动告警
- **防伪**：禁止虚报通信状态

---

## 2. 核心组件

### 2.1 TASKS.jsonl — 任务台账
- **位置**：`~/.openclaw/workspace-shared/TASKS.jsonl`
- **格式**：append-only JSONL，每行一个事件
- **并发安全**：Python `fcntl.LOCK_EX` 全周期读-计算-写锁（tasks.sh v4，macOS 无 flock 二进制，fcntl 为等效实现）
- **幂等性**：相同 ID + 相同 status + 无新备注 → 跳过写入

**字段规范**：
```json
{
  "id": "T001",
  "title": "任务描述",
  "status": "in_progress",
  "agent": "qa",
  "updated": "2026-03-12T12:00:00+13:00",
  "note": "可选备注"
}
```

**合法状态值**：
`pending_confirm` → `dispatched` → `in_progress` → `done` | `blocked` | `paused` | `cancelled` | `atlas_reviewing` | `notify_failed`

### 2.2 tasks.sh v4 — 台账操作脚本
- **位置**：`~/.openclaw/workspace/scripts/tasks.sh`
- **接口**：`tasks.sh add|update|list|all|compact [days=30]`
- **环境变量覆盖**（测试用）：`TASKS_FILE`
- **状态白名单**：9 个合法状态，非法值在入口拒绝
- **blocked_on**：`update <ID> blocked <note> --blocked-on <T-xxx>` 写入依赖字段

### 2.3 notify_q.sh — 双频道通知
- **位置**：`~/.openclaw/workspace/scripts/notify_q.sh`
- **Layer 1**：更新 TASKS.jsonl（同步，不可失败）
- **Layer 2**：`openclaw agent --agent main --message`（异步，允许失败）
- **降级**：Layer 2 失败时记录日志，不影响 Layer 1
- **环境变量**：`TASKS_FILE` / `TASKS_SH` / `OPENCLAW` / `LOG_FILE`（测试用）

### 2.4 task_monitor.py v3 — Stale 检测 + Session 活跃度
- **位置**：`~/.openclaw/workspace/scripts/task_monitor.py`
- **触发**：cron 每 15 分钟（job name: `task-monitor`）
- **检测逻辑**：
  - `in_progress`/`dispatched`/`blocked`/`atlas_reviewing`/`notify_failed` 超过 15 分钟未更新 → STALE 告警
  - `blocked` 无 `blocked_on` 字段 → 「未登记跨 agent 依赖」告警
  - `blocked_on` 目标 ID 不存在 → 「依赖的任务不存在」告警
  - `in_progress` 且 session mtime > 10 分钟 + 无 .lock 文件 → DEAD_SESSION 告警
- **豁免状态**：`done` / `cancelled` / `paused`
- **告警方式**：`openclaw agent --agent main --message`

---

## 3. 派发协议

### 3.1 q 向 agent 派发任务（标准流程）

```
Step 1: tasks.sh add <ID> <title> dispatched <agentId> <note>
Step 2: openclaw agent --agent <agentId> --message "<任务内容>"
```

**强制要求**：
- 先写 TASKS.jsonl，再发消息
- 任务 ID 必须在 TASKS.jsonl 存在才算有效派发
- 禁止只发消息不写台账（无记录的派发 = 不存在的派发）

### 3.2 Agent 完成任务后回报（强制三步）

```bash
# Step 1: 更新台账（最优先）
bash ~/.openclaw/workspace/scripts/tasks.sh update <taskId> done "<摘要>"

# Step 2: 通知 q（唯一合法路径）
/path/to/openclaw agent --agent main --message "【任务完成】<taskId> <摘要>"

# Step 3: 更新状态卡（editMessageText，不发新消息）
```

**禁止路径**：
- ❌ `message` 工具（参数不稳定，静默失败）
- ❌ Bot API curl 向其他 agent 的 topic 发消息
- ❌ 只更新状态卡不执行 Step 1/2

### 3.3 跨 Agent 协作（禁止直接）

```
禁止：Agent A → 直接联系 Agent B
正确：Agent A → openclaw agent --agent main → q → openclaw agent --agent B
```

**关键规则**：agent 不得在状态卡标注「等待 X 实现」而不经过 q 中转并建立 TASKS.jsonl 记录。违规定性：**虚报通信状态**。

---

## 4. 状态卡规范

每个 agent 在自己 group topic 有唯一置顶状态卡（固定 message_id），格式：

```
[emoji] [名字] · [角色]
✅ 已完成：<最近完成任务>
⏳ 进行中：<当前任务 ID + 一句话>
🚧 阻塞：<阻塞原因>（无阻塞时省略）
```

**维护规则**：
- 只能 edit 原消息，不发新消息
- 状态更新必须与 TASKS.jsonl 一致（不得写 TASKS.jsonl 没有记录的状态）
- **禁止在状态卡写任何 TASKS.jsonl 中不存在的任务或依赖关系**

---

## 5. 通信超时规则

| 场景 | 超时阈值 | 触发动作 |
|------|---------|---------|
| 任务派发后无 `in_progress` 确认 | 15 分钟 | task_monitor 告警 q |
| 任务 `in_progress` 后无 `done`/`blocked` | 15 分钟 | task_monitor 告警 q |
| q 收到告警后无响应 | 15 分钟 | 下次 cron 再次告警 |

---

## 6. 已知问题与开放项

| # | 问题 | 风险 | 状态 |
|---|------|------|------|
| G1 | Layer 2 无 ACK（exit 0 ≠ q 已处理）| 低-中 | 开放（task_monitor 15min 兜底）|
| G2 | 状态卡内容无法自动校验与 TASKS.jsonl 一致 | 高 | 开放（规范约束）|
| G3 | 任务派发无「已收到」确认机制 | 中 | 开放 |
| G4 | 跨 agent 直接通信无技术拦截，仅靠规范约束 | 高 | 开放（成本 >> 收益，维持规范）|

---

## 7. 测试覆盖范围（参考 T011）

- ✅ TASKS.jsonl 状态机完整性（5用例）
- ✅ 并发安全性 20线程（2用例）
- ✅ notify_q.sh 双频道（4用例）
- ✅ stale 检测边界（6用例）
- ✅ Gateway 连通性（3用例，Colima 环境自动 skip）
- ✅ 协议合规性（Sage 补充 8用例）
- ✅ blocked_on 验证（T015 T15-01/02/03）
- ✅ 状态白名单（T015 T15-04）
- ✅ session 活跃度（T015 T15-09/10）
- ✅ notify_failed 检测（T015 T15-08）
- ⚠️ 虚报通信状态：规范约束，无技术拦截
- ⚠️ 任务派发收件确认：开放项 G3

---

*本文档为 Atlas 审查基准文档。任何协议变更须通过 Atlas 评审 + Victor 确认后生效。*
