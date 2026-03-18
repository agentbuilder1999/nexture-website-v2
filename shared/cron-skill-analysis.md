# Cron Skills 深度分析报告
生成时间: 2026-03-12 16:54 GMT+13
作者: q

## 背景
对5个ClawHub cron相关skill进行深度分析，结合现有cron monitor架构，评估优化和鲁棒性提升空间。

---

## 一、现有 Cron Monitor 架构

### 当前生产Cron Jobs

| 名称 | 计划 | Payload类型 | sessionTarget | 状态 |
|------|------|------------|---------------|------|
| task-monitor | `*/15 * * * *` NZ | **systemEvent** | **main** | ✅ enabled |
| bedrock-quota-monitor | `0 10 * * *` NZ | agentTurn | isolated | ✅ enabled |
| morning-brief | `0 7 * * *` NZ | agentTurn | isolated | ✅ enabled |
| config-backup | `0 3 * * *` NZ | systemEvent | main | ❌ disabled |

**关键风险点**: task-monitor 使用 `systemEvent + sessionTarget: main` — 这是 cron-mastery 中被标记的高风险模式。

---

## 二、各 Skill 深度分析

### 1. cron-retry v1.0.0 ✅ 无风险
**来源**: jrbobbyhansen-pixel

**核心功能**: 通过 heartbeat 自动检测并重试因网络错误失败的 cron jobs

**机制**:
- 检查 `lastStatus == "error"` + `enabled == true` 的 jobs
- 匹配网络错误模式: ECONNREFUSED, ETIMEDOUT, fetch failed 等
- 调用 `cron run --id` 重试

**安全评估**: 完全安全
- 只重试网络瞬时错误
- 检查 lastRunAtMs 防止重试风暴
- 不修改任何状态，只触发运行

**与现有架构的关联**:
- morning-brief 和 bedrock-quota-monitor 均有可能因网络问题失败
- task-monitor 在 lastDurationMs: 2 (几乎瞬间完成) — 如果脚本报错会留下 error 状态
- **直接可用**: 可集成到 HEARTBEAT.md

---

### 2. cron-doctor v1.1.0 ✅ 无风险
**来源**: suryast / Polycat

**核心功能**: 诊断和分级 cron job 故障，生成结构化健康报告

**机制**:
- 针对**系统 cron** (crontab -l, /var/log/syslog) — 非 OpenClaw managed cron
- 提供优先级分级框架：🔴Critical / 🟠High / 🟡Medium / 🟢Low
- 输出标准化报告到 `~/workspace/reports/cron-health-YYYY-MM-DD.md`
- 3个+ critical 失败自动告警

**安全评估**: 完全安全
- 只读诊断
- 无外部写操作
- 验证门控完善 (checklist 防遗漏)

**与现有架构的关联**:
- 分级框架可直接用于我们的 task-monitor 增强
- 我们的 cron jobs 目前没有 criticality 元数据
- cron-doctor 的报告格式是良好实践，可提升 task_monitor.py 的输出质量

---

### 3. cron-mastery v1.0.3 ⚠️ 可疑（已在使用）
**来源**: i-mw

**核心功能**: OpenClaw 计时系统最佳实践指南 (agentTurn vs systemEvent, 精确调度, 迁移指南)

**风险向量**:
```
systemEvent + sessionTarget: main 
→ 主 session 获得完整工具访问
→ 若 systemEvent.text 被注入恶意指令
→ 可执行任意命令、数据泄露
```

**具体风险点** (references/templates.md 中的 Janitor 模板):
```json
{
  "payload": {
    "kind": "systemEvent",
    "text": "List all cron jobs... Delete any disabled jobs... Report results."
  },
  "sessionTarget": "main"
}
```
→ text 字段如果被污染，主 session 会无条件执行

**我们当前暴露**: task-monitor 使用完全相同模式!
```
payload.kind = systemEvent
sessionTarget = main
text = "[SYSTEM-MONITOR] 执行 stale 任务检测..."
```

**缓解方案**:
- Option A: 将 task-monitor 迁移到 `agentTurn + isolated` + strict prefix
- Option B: 将 task-monitor 的 systemEvent.text 限制为最小化指令（只传参数，不传完整指令）
- Option C: 在 main session 添加 systemEvent 内容白名单检查

---

### 4. cron-scheduler v1.0.0 ⚠️ 可疑（与我们无关）
**来源**: picaye

**核心功能**: 管理**系统 cron** (crontab 命令)，非 OpenClaw managed cron

**风险向量**:
```bash
(crontab -l 2>/dev/null; echo "SCHEDULE COMMAND") | crontab -
crontab -l | grep -v "PATTERN_TO_REMOVE" | crontab -
COMMAND_HERE
```
→ 用户输入直接插入 shell，无任何清洗 → RCE

**与现有架构的关联**: **完全无关**
- 我们使用 OpenClaw managed cron，不使用系统 crontab
- 此 skill 对我们的项目没有任何参考价值
- **结论**: 不采纳，可从 skills 目录删除

---

### 5. macro-monitor v1.0.2 ⚠️ 可疑（与 cron 监控无关）
**来源**: hmzo

**核心功能**: 每日宏观金融数据采集和推送（Trading Economics, FRED, 国家统计局等）

**风险向量**:
1. SKILL.md 中 message 工具指令为空 (空代码块)：
```
使用 message 工具将整理好的报告推送给用户：
```
→ agent 可能自由推断应发送的内容

2. 可写 references/indicators.md：
```
如果该指标是常见指标，考虑将解释添加到 references/indicators.md 中
```
→ 自我扩展知识库，潜在的注入持久化

**与现有架构的关联**: **完全无关**
- 这是一个独立的金融监控用例
- 与我们的 cron monitor 项目无交集
- **结论**: 不采纳，可从 skills 目录删除

---

## 三、优化建议矩阵

| 优化项 | 来源Skill | 价值 | 工作量 | 优先级 |
|--------|-----------|------|--------|--------|
| 网络失败自动重试 | cron-retry | HIGH | 低（修改HEARTBEAT.md） | P1 |
| task-monitor 安全加固（systemEvent→agentTurn） | cron-mastery风险 | HIGH | 中（修改jobs.json + 测试） | P1 |
| cron jobs 增加 criticality 元数据 | cron-doctor | MEDIUM | 中（改task_monitor.py） | P2 |
| 标准化健康报告格式 | cron-doctor | MEDIUM | 低（改报告模板） | P2 |
| 清理不相关 skills | - | LOW | 低 | P3 |

---

## 四、P1 具体方案

### P1-A: 网络失败自动重试（cron-retry集成）

**方案**: 在 HEARTBEAT.md 添加 Cron Recovery Check 块

```markdown
## Cron Recovery Check
Check for cron jobs with lastStatus: "error". If the error matches network patterns 
(connection error, sendMessage failed, fetch failed, ETIMEDOUT, ECONNREFUSED), 
retry the job using cron tool with action: "run" and the job ID. Report what was recovered.
```

**风险**: 无。只读 + 有条件触发。

### P1-B: task-monitor 安全加固

**当前**:
```json
{
  "payload": {
    "kind": "systemEvent",
    "text": "[SYSTEM-MONITOR] 执行 stale 任务检测：运行 python3 task_monitor.py。有告警则通知 Victor，无告警则 NO_REPLY 静默。"
  },
  "sessionTarget": "main"
}
```

**方案1 (推荐)**: 迁移到 agentTurn + isolated
```json
{
  "payload": {
    "kind": "agentTurn",
    "message": "SYSTEM TASK - EXECUTE WITHOUT DEVIATION:\n1. Run: /opt/homebrew/bin/python3 ~/.openclaw/workspace/scripts/task_monitor.py\n2. If output contains ALERT: notify Victor via Telegram DM 6663682303\n3. If no ALERT: reply ONLY with NO_REPLY"
  },
  "sessionTarget": "isolated",
  "wakeMode": "now"
}
```

**方案2**: 保持 systemEvent + main，但 text 最小化为纯指令（无动态插值）

**需要讨论**: 方案1 的 isolated session 没有 sessionTarget: main 的完整工具权限，是否足够执行 task_monitor.py？Atlas 需要评估。

---

## 五、给 Atlas 的架构问题

1. **task-monitor 迁移可行性**: `sessionTarget: isolated` 的 session 是否有足够的 exec 权限运行 `/opt/homebrew/bin/python3`？
2. **systemEvent 注入向量评估**: 在我们的部署中，谁能修改 jobs.json？如果只有 q 自己，实际注入风险有多高？
3. **cron-retry + task-monitor 交互**: 如果 task-monitor 脚本本身出错（非网络原因），cron-retry 是否会误重试？
4. **criticality 元数据方案**: 是否应在 jobs.json 里加自定义字段，还是在 task_monitor.py 里维护一个 criticality 映射表？

