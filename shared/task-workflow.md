# Task Workflow Guide
> q 调度系统使用指南。

## task.sh 命令速查

```bash
TASK="~/.openclaw/workspace-shared/scripts/task.sh"

# 新建任务
$TASK push <agent> "<title>" "<detail>" <priority> <type>
# priority: high | medium | low
# type: heavy (夜间) | light (随时)
# 返回: task id

# 示例
$TASK push finn "实现登录页面" "参考 design-spec.md #login" high heavy

# 查看队列
$TASK list          # 最近 20 条
$TASK list 50       # 最近 50 条

# 获取下一个任务
$TASK next

# 更新状态
$TASK active <id> <session_id>   # 开始执行
$TASK done <id>                  # 完成
$TASK fail <id>                  # 失败

# 统计
$TASK count active   # 活跃任务数
$TASK count queued   # 排队数
```

---

## 调度决策树

```
任务到来 / 任务完成
        ↓
task.sh count active → N
        ├── N < 3 且有队列
        │     ├── type=heavy 且 22:00–08:00 NZDT → 立即 spawn
        │     ├── type=heavy 且 08:00–22:00 NZDT → 保留队列（标注 [night]）
        │     └── type=light → 任何时间立即 spawn
        └── N ≥ 3 → 入队，通知 Victor "已入队 (N/3 workers 活跃)"
```

---

## 日夜节律

| 时间（NZDT）| Cron 触发 | 行为 |
|------------|----------|------|
| 08:00 | morning-brief (Haiku) | 汇报夜间完成情况 |
| 21:00 | evening-review (Haiku) | 规划今晚任务 |
| 22:00 | night-dispatch (Sonnet) | 触发重型任务 |
| 00:00 | night-monitor (Haiku) | 巡检 + 续派 |
| 02:00 | night-monitor (Haiku) | 巡检 + 续派 |
| 04:00 | night-monitor (Haiku) | 巡检 + 续派 |

---

## Worker 并发上限

- q 常驻：1 个
- Worker 上限：3 个（Finn / Rex / Nova / Sage 中同时最多 3 个）
- 总计：≤ 4 个活跃 agent

## 任务超时处理

1. 任务超时（>30min 无进展）→ Sage 检测 → `task.sh fail <id>`
2. 通知 Victor 是否重试
3. 重试：`task.sh push` 重新入队

---

## 完整示例：Victor 发起一个前端任务

```
Victor → q: "做一个用户登录页面"

q:
  1. task.sh push finn "用户登录页面" "邮箱+密码，JWT token，参考 design-spec.md" high heavy
  2. N=0 < 3，type=heavy，检查时间
     夜间 → 立即 spawn(finn)
     白天 → 告知 Victor "已入队，夜间执行"

Finn 完成:
  3. git push origin feat/frontend-login
  4. task.sh done <id>
  5. 向 q announce: "登录页面完成，PR: feat/frontend-login"

q:
  6. task.sh next → 检查队列
  7. Morning Brief 8am 报告给 Victor
```
