# T013 架构审查报告 — Agent 通信协议 v1.0

**审查人**: Atlas (🏗️ architect)  
**日期**: 2026-03-12  
**基准文档**: `agent-comms-spec.md` v1.0（154行）  
**实际代码**: `tasks.sh` / `notify_q.sh` / `task_monitor.py`  
**下游任务**: T014（Rex 实现）→ T015（Sage 测试）

---

## 总结

**结论：条件通过（9项修改建议，3项高优先级）**

协议整体架构合理，三层降级设计正确，实测通过率 92.6%（T012）。但存在 3 个系统性风险点需要在 T014 中修复，另有 6 个中低风险改进建议。

---

## 一、架构可靠性：JSONL + fcntl 锁的扩展性风险

### 现状核查

**规格声称**：「Python fcntl 文件锁」  
**实际实现**：`tasks.sh` 使用 bash `>>` 无锁追加，`notify_q.sh` 同样无显式锁。Python fcntl 只在 task_monitor.py（读取）中隐含使用。

**结论：规格与实现不一致。** bash `>>` 在 macOS 上对 < 4KB 写入是原子的（内核级 write() 保证），7 个 agent 低并发场景下实际安全，但理论上是未定义行为。

### 扩展性风险

| 维度 | 当前（7 agents） | 风险触发点 |
|------|----------------|-----------|
| **文件大小** | ~100 entries/天，~3K/月 | >50K 行时 `jq -rs 'group_by(.id)'` 扫描耗时 >500ms |
| **并发写入** | 极少 (2-3 agents/时) | Sprint 启动时 7 agents 同时回报→ bash `>>` 竞态 |
| **无压缩策略** | JSONL 永续增长 | 1 年后 ~36K 行，list 命令变慢 |
| **无备份** | 单文件，本地磁盘 | 误删或磁盘故障 → 全部历史丢失 |

**建议 [H1]（高优先级）**：在 tasks.sh 中加 `flock` 文件锁：
```bash
# 在 update/add 操作前加
exec 200>"$TASKS_FILE.lock"
flock -x 200
# 执行写入...
flock -u 200
```
同时在规格中修正"Python fcntl"→"bash flock"，统一描述。

**建议 [M1]**：增加 `tasks.sh compact` 命令，归档 30 天前的 done/cancelled 任务到 `TASKS-YYYY-MM.jsonl`，主文件保持 < 1K 行。

---

## 二、G1 漏洞评估：Layer 2 exit 0 ≠ 消息已处理

### 实际风险重新评级

当前规格标注 G1 为"中"风险。审查认为应重新评级为**低-中**，理由：

1. Layer 1（TASKS.jsonl）先写，持久化可靠
2. task_monitor.py 每 15 分钟扫描 `dispatched`/`in_progress`，stuck 任务必然被告警
3. notify_q.sh 已记录 NOTIFY=FAILED 到日志

**真正的失败场景**：Layer 2 失败 **且** task_monitor 同时宕机 → 无人告警。但这是双重故障，概率极低。

### 低成本修复方案

当前 notify_q.sh 已经足够，但缺一步：**Layer 2 失败时写入结构化审计事件**：

```bash
# 在 notify_q.sh 的 Layer 2 失败分支加：
if [ $NOTIFY_RESULT -ne 0 ] && [ $NOTIFY_RESULT -ne 127 ]; then
    bash "$TASKS_SCRIPT" update "$TASK_ID" "notify_failed" "Layer2 failed at $TS"
fi
```

这样 task_monitor.py 可检测连续 `notify_failed` 事件作为第二重告警触发器。

**建议 [M2]**：在 task_monitor.py 的 active_statuses 中加 `notify_failed`，使其触发告警。

---

## 三、G2/G4 高风险开放项：规范约束够吗？

### G2：状态卡与 TASKS.jsonl 不一致

**技术拦截可行性**：

| 方案 | 实现成本 | 维护成本 | 可靠性 |
|------|---------|---------|--------|
| A: Bot webhook + 文本解析状态卡内容 | 高 | 高（脆） | 低 |
| **B: 强制状态卡含 T-xxx ID，monitor 验证** | **低** | **低** | **中** |
| C: 接受为运维规则（TASKS.jsonl 为权威） | 零 | 零 | 低 |

**建议 [H2]（高优先级）**：采用方案 B。

1. 规格补充：状态卡 ⏳ 行格式强制为 `⏳ 进行中：T-xxx 一句话`（任务 ID 必填）
2. task_monitor.py 新增检查：如果 TASKS.jsonl 中某 ID 的最新状态是 active，但无对应条目 → 告警（反向检查：发现台账中有任务但无状态卡更新，15min 后告警）
3. 全量扫描 Telegram 状态卡复杂度高，**不值得**。Monitor 只基于 TASKS.jsonl 做推断即可。

### G4：跨 Agent 直接通信无技术拦截

**判断：维持规范约束，不做技术拦截。理由**：

真正的技术拦截需要 Bot API webhook 监听所有消息、识别 bot-to-bot 跨 topic 通信——实现复杂，误报率高，维护成本大。对当前 7 人小团队是过度工程化。

**但**：在 AGENTS.md 和 spec 中明确违规后果（违规视为协议故障，可触发 Sprint 暂停），比技术拦截更有效。

**建议 [L1]**：在规格第 3.3 节加"违规后果"条款，而非追求技术拦截。

---

## 四、虚报检测：Sage「等待 Rex」事件分析

### 根因

状态卡格式无约束：Sage 可以写任意文本，包括未经 q 中转的依赖关系。TASKS.jsonl 中没有对应记录，task_monitor 无法检测。

### 技术层面防止方案

**最低成本可行方案**：扩展 task_monitor.py，增加"孤立阻塞检测"：

```python
# 新增检查逻辑（task_monitor.py）
def check_orphan_blocked(records):
    """检测 blocked 状态但无 BLOCKED_ON 字段的任务"""
    orphans = []
    for task_id, d in records.items():
        if d.get('status') == 'blocked':
            if not d.get('blocked_on'):  # 无结构化阻塞原因
                orphans.append(task_id)
    return orphans
```

同时在规格和 tasks.sh 中强制：**blocked 状态必须包含 `blocked_on` 字段**，值为关联 task ID 或 `EXTERNAL:<原因>`：

```bash
# 合法：tasks.sh update T015 blocked "等待 T014 完成" --blocked-on T014
# 不合法：直接在状态卡写「等待 Rex」
```

**建议 [H3]（高优先级）**：

1. `tasks.sh update <id> blocked "<note>" [--blocked-on <taskId|reason>]` 加 `blocked_on` 字段
2. task_monitor.py 检测 blocked 任务无 `blocked_on` 字段 → 立即告警（不等 15min）
3. 规格 3.2 节加：「blocked 状态必须包含 blocked_on 字段，违规 = 虚报」

这样 Sage 的「等待 Rex」行为 **必须** 经过 tasks.sh update T015 blocked "..." --blocked-on T014，否则 monitor 15 秒内告警。从技术上强制跨 agent 依赖走 TASKS.jsonl 登记。

---

## 五、规格完整性：遗漏和边缘情况

### 发现的遗漏（按优先级）

**[HIGH] 状态枚举不完整**
- 规格合法状态：`pending_confirm` → `dispatched` → `in_progress` → `done` | `blocked` | `paused` | `cancelled`
- task_monitor.py 使用了 `atlas_reviewing` 状态，但规格中无此状态
- tasks.sh 不做状态枚举校验，任何字符串都能写入
- **建议**：规格补充 `atlas_reviewing`；tasks.sh 加状态白名单校验

**[HIGH] 任务重新派发规则未定义**
- task_monitor 告警后，q 如何恢复？重新派发是新 ID 还是重用旧 ID？
- T008 实际经历了 `paused → dispatched`（重新派发复用 ID），但规格无此场景
- **建议**：规格补充 3.4 节「任务恢复流程」：`paused` 状态 + 重新派发保留原 ID

**[MED] 无优先级字段**
- TASKS.jsonl schema 无 `priority` 字段（P0/P1/P2）
- Sage SOUL.md 定义了优先级，但台账无法反映
- **建议**：schema 加可选 `priority: "P0" | "P1" | "P2" | "P3"`

**[MED] 无 output artifacts 字段**
- 任务完成只有 `note` 自由文本，无结构化产出路径
- T013 产出是本文件，但 TASKS.jsonl 只记录文字摘要
- **建议**：schema 加可选 `output_path: string[]`

**[MED] 任务 ID 跨 Sprint 碰撞**
- 未定义 ID 是全局递增还是 Sprint 内重置
- 两个 Sprint 都可能出现 T001，历史记录混乱
- **建议**：改用 `S1-T001` 格式，或全局递增不重置

**[LOW] 状态卡 message_id 硬编码无恢复流程**
- AGENTS.md 记录 Atlas 状态卡 message_id=429
- 若消息被删除，无恢复程序
- **建议**：规格加「状态卡重建流程」：发新消息 → 更新 AGENTS.md message_id

---

## 六、针对 Rex（T014）的实现建议

### 必须实现（H 级）

| # | 任务 | 文件 | 工作量 |
|---|------|------|--------|
| H1 | tasks.sh 加 `flock` 写锁 | `tasks.sh` | ~30 行 |
| H2 | 规格强制 ⏳ 含 T-xxx（文档修改） | `agent-comms-spec.md` | 说明更新 |
| H3 | tasks.sh update blocked 加 `--blocked-on` 字段 | `tasks.sh` + `task_monitor.py` | ~50 行 |

### 建议实现（M 级）

| # | 任务 | 文件 | 工作量 |
|---|------|------|--------|
| M1 | tasks.sh 加 `compact` 命令 | `tasks.sh` | ~40 行 |
| M2 | task_monitor.py 加 `notify_failed` 状态检测 | `task_monitor.py` | ~15 行 |
| M3 | tasks.sh 加状态枚举白名单校验 | `tasks.sh` | ~20 行 |
| M4 | 规格补充 `atlas_reviewing` 状态 + 任务重派流程 | `agent-comms-spec.md` | 文档 |

### 维持规范约束即可（不需代码）

- G4（跨 agent 直接通信拦截）：成本 >> 收益，规范+后果约束足够
- 状态卡 message_id 硬编码：低概率事件，有手动恢复流程即可
- 任务 ID 跨 Sprint 碰撞：重命名规范，非代码修改

---

## 七、针对 Sage（T015）的测试建议

Sage 现有测试覆盖（T011 报告）已有 8 个协议合规用例。需补充：

### 新增测试用例

| # | 测试名称 | 验证点 |
|---|---------|--------|
| T15-01 | blocked_without_blocked_on | `tasks.sh update Txx blocked "note"` 无 `--blocked-on` → task_monitor 告警 |
| T15-02 | blocked_with_blocked_on | `--blocked-on T014` 存在 → monitor 不告警 |
| T15-03 | blocked_on_nonexistent_task | `--blocked-on T999`（不存在）→ monitor 告警 |
| T15-04 | status_whitelist_reject | `tasks.sh update Txx invalid_status` → 拒绝写入 |
| T15-05 | atlas_reviewing_active | `atlas_reviewing` 状态 → monitor 识别为 active，超时告警 |
| T15-06 | concurrent_flock_20threads | 20 线程并发写入，无数据损坏（原有测试升级：加 flock 后重测） |
| T15-07 | tasks_compact | `tasks.sh compact` → 归档旧条目，主文件减少 |
| T15-08 | notify_failed_detection | Layer 2 失败后写 notify_failed → monitor 下一轮告警 |

---

## 附录：规格与实现差异清单

| 规格声称 | 实际实现 | 影响 |
|---------|---------|------|
| Python fcntl 文件锁 | bash `>>` 无锁 | 低（原子写，但未定义行为） |
| `atlas_reviewing` 未定义 | task_monitor.py 使用 | 台账可写入未定义状态 |
| 状态机转换约束 | 无校验，任意字符串 | 可写入非法状态 |
| blocked 需描述原因 | note 自由文本 | 无法区分内部阻塞 vs 跨 agent 依赖 |

---

*审查完成。下游：T014 → Rex 实现 H1/H2/H3，T015 → Sage 新增 8 用例测试。*
