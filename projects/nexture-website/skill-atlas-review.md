# Skill 架构审查报告

> **Author:** Atlas (architect)
> **Date:** 2026-03-14
> **审查对象:** task-dispatch / har-analyzer / team-analysis
> **关键发现前置:** tasks.sh v5+ 已在第 113 行实现并发门控（`RATE_LIMITED`），两个 Skill 的手动并发检查均为冗余。

---

## Skill 1: task-dispatch

**[部分同意]**

**理由：** 核心边界判断正确（语义解析→brief 生成 = LLM 职责），但 Step 1（`tasks.sh add`）和 Step 3（`openclaw agent --message`）是纯 CLI 调用，不含 LLM 判断，被混入 Skill 步骤中破坏了边界清晰度。

**具体修改建议：**

① **并发检查冗余，删除。**
`tasks.sh add` 在 line 113 已有硬门控（`RATE_LIMITED`），SKILL.md 里的 `grep in_progress | wc -l` 检查是 TOCTOU 竞争窗口（check 和 add 之间可能有其他任务进入 in_progress）。应删除 Skill 内的手动检查，改为处理 tasks.sh 返回的 RATE_LIMITED：

```markdown
### Step 1: Create task entry
If `tasks.sh add` returns RATE_LIMITED → stop dispatch, report queue status to q.
```

② **Step 1 和 Step 3 应标注为 "infrastructure call"，与 Step 2 的 "LLM work" 区分。**

建议在 SKILL.md 中明确每步性质：
```
Step 1 [infrastructure]: tasks.sh add
Step 2 [LLM]: generate brief content
Step 3 [infrastructure]: openclaw agent dispatch
```
这让未来维护者一眼看出"Step 2 是唯一需要 LLM 的步骤"。

③ **`references/brief-template.md` 不存在**（验证：`ls ~/.openclaw/workspace/skills/task-dispatch/references/` 为空）。生产就绪前必须创建，否则 Skill 最关键的产出物没有约束。

④ **缺少幂等性说明。** 相同 TASK_ID 重复调用时行为未定义。建议加：
```markdown
## Idempotency
If TASK_ID already exists in TASKS.jsonl: skip Step 1, only re-dispatch brief.
```

⑤ **T 号生成说明不够具体。** "check tasks.sh list for last ID" 不是可执行命令。应补充：
```bash
LAST_ID=$(bash ~/.openclaw/workspace/scripts/tasks.sh list 2>/dev/null | grep -oP 'T\d+' | sort -t T -k2 -n | tail -1)
NEXT_NUM=$(( ${LAST_ID#T} + 1 ))
TASK_ID="T$(printf '%03d' $NEXT_NUM)"
```

---

## Skill 2: har-analyzer

**[部分同意]**

**理由：** 边界违反"有限度"——Step 1（`parse_har.py`）和 Step 2（URL 模式匹配）是完全确定性的计算，不含 LLM 判断，不应作为 Skill 步骤呈现；但 Step 3（解读信号 → 推荐可借鉴模式）是真正的 LLM 工作。三步合在一个 Skill 里是合理的（Skill 可以编排脚本+LLM），但 SKILL.md 需要明确标注哪些步骤是工具调用、哪步是 LLM 生成，否则维护者会困惑"为什么这个 Skill 需要 LLM"。

**具体修改建议：**

① **`scripts/parse_har.py` 不存在**（`ls ~/.openclaw/workspace/skills/har-analyzer/scripts/` 为空）。这是 Skill 能否运行的前提。该脚本应在 SKILL.md 里有 fallback 说明，或把 HAR 解析改为内联 bash：

```bash
# 不依赖外部脚本的 fallback（python3 单行）
python3 -c "
import json, sys
har = json.load(open(sys.argv[1]))
entries = har.get('log', {}).get('entries', [])
urls = [e['request']['url'] for e in entries]
print('\n'.join(urls))
" <har_file> > /tmp/har-urls.txt
```

② **`references/report-template.md` 不存在。** 同 task-dispatch 问题——产出格式没有约束。

③ **边界标注建议：**
```
Step 1 [tool]: parse_har.py → URL list (no LLM)
Step 2 [tool]: pattern match → library signals (no LLM)
Step 3 [LLM]: interpret signals + generate recommendations
```

④ **缺少 fallback 处理两个已知边缘情况：**
- **混淆资源名（Cloudflare / Webpack hash）**：`/a3f2d1.js` 这类哈希 bundle 无法匹配库名 → Step 3 应有 "low-signal HAR" 标注，提示可能需要 DOM 分析补充
- **HAR 包含响应体（大文件）**：SKILL.md 说 "without loading raw response bodies" 但没有说明如何确保 parse_har.py 跳过响应体。如果用内联 bash 则 `response.content` 不会被加载，应在 Skill 里说明这个保证。

⑤ **"Recommended borrowable patterns for nexture" 是当前唯一 project-specific 内容。** 如果这个 Skill 要被其他项目复用，该描述应参数化为 `<project>` 变量。

---

## Skill 3: team-analysis

**[部分同意，但有一个设计级缺陷需要修复才能生产就绪]**

**理由：** 职责边界基本清晰，但 Step 5（收集 & 汇总）存在一个根本性的**异步状态连续性问题**——6 个 agent 的完成可能分散在 10-30 分钟内，SKILL.md 假设 q 的单个 session 保持上下文等待所有完成，这在实际中不成立。

**具体修改建议：**

① **[设计级修复] Step 5 异步连续性问题。**

当前描述：
> "After all 6 complete, q synthesizes into a consolidated report for Victor."

这假设 q 能感知"6 个都完成了"。但实际上：
- 6 个 agent 各自完成后发消息回 q
- q 的 session 可能已经被其他对话占用
- 没有机制告诉 q "现在可以合成了"

**推荐修复：** 为 team-analysis 任务增加一个 completion-check 步骤，由 tasks.sh 追踪子任务状态：

```markdown
### Step 2 (修改): Create task + subtask entries
# 主任务
tasks.sh add <TASK_ID> "全员分析: <artifact>" in_progress all
# 6个子任务（每个 agent 一个，独立 ID）
tasks.sh add <TASK_ID>-aria  "Aria分析: <artifact>"  dispatched ux
tasks.sh add <TASK_ID>-atlas "Atlas分析: <artifact>" dispatched architect
# ...

### Step 5 (修改): Synthesis trigger
# 每个 agent 完成时 update 自己的子任务 → done
# q 检测到所有子任务 done 时触发合成：
bash -c 'ALL_DONE=$(tasks.sh list | grep "<TASK_ID>-" | grep -v done | wc -l); [ "$ALL_DONE" -eq 0 ] && echo "可以合成"'
```

② **并发检查冗余，删除（同 task-dispatch）。**
tasks.sh 已有 RATE_LIMITED 门控。当前策略"[arch+ux+backend] → [frontend+airag+qa]"是合理的分批逻辑，但应改为：
```markdown
### Step 4: Dispatch
Dispatch first batch. If tasks.sh returns RATE_LIMITED, queue remainder.
Do NOT manually count in_progress — let tasks.sh enforce the gate.
```

③ **team-analysis 不调用 task-dispatch（验证）：** 两者都直接调 tasks.sh，不存在 SKILL→SKILL 依赖，无循环风险。✅ 这是正确做法——Skill 之间的依赖应通过共享 script（tasks.sh）协调，而非 Skill 调 Skill。如果将来需要 team-analysis 复用 task-dispatch 的 brief 生成逻辑，应将该逻辑提取为 tasks.sh 中的 `brief-gen` 命令，而不是 Skill 调 Skill。

④ **`references/synthesis-template.md` 不存在。** 同上。

⑤ **缺少超时/部分完成策略。** 如果某个 agent 30 分钟后仍未回复怎么办？SKILL.md 应明确：
```markdown
## Timeout Policy
If any sub-agent does not complete within 30 minutes:
- Mark that sub-task as `blocked`
- Proceed with synthesis using available results
- Flag missing domain in synthesis report: "[Nova analysis: TIMEOUT]"
```

---

## 四个维度汇总

### 1. 边界清晰度

| Skill | 判定 | 问题 |
|-------|------|------|
| task-dispatch | ⚠️ 部分违反 | Step 1/3 是纯 CLI，未标注 `[infrastructure]` vs `[LLM]` |
| har-analyzer | ⚠️ 部分违反 | Step 1/2 是纯计算，但合并在 Skill 中是可接受的——只需明确标注 |
| team-analysis | ✅ 基本清晰 | 职责划分合理，但 Step 5 有设计级缺陷 |

### 2. 依赖关系

```
task-dispatch ──→ tasks.sh (script) ✅
task-dispatch ──→ openclaw CLI (infra) ✅

har-analyzer  ──→ parse_har.py (script，不存在！) ⚠️
har-analyzer  ──→ 无 Skill 依赖 ✅

team-analysis ──→ tasks.sh (script) ✅
team-analysis ──→ openclaw CLI (infra) ✅
team-analysis ──→ 不调用 task-dispatch ✅（无循环）
```

**结论：无 SKILL→SKILL 循环依赖。** 但 har-analyzer 的脚本依赖（parse_har.py）不存在是 blocker。

### 3. 并发 Gate 的统一位置

**结论：应从所有 SKILL.md 中删除手动并发检查，统一在 tasks.sh 处理。**

理由：
1. tasks.sh v5 line 113 已实现 RATE_LIMITED 门控
2. Skill 内的手动检查存在 TOCTOU 竞争（check 和 add 之间时间窗口）
3. 两个 Skill 各维护一份检查逻辑 = 维护双倍负担
4. 符合昨晚约定：`bash+jq 可完整表达 → script`

正确模式：
```markdown
## Concurrency Handling
If `tasks.sh add` returns RATE_LIMITED: queue this task, report to q. Do not retry automatically.
```

### 4. 生产就绪缺失项汇总

| 项目 | task-dispatch | har-analyzer | team-analysis |
|------|:---:|:---:|:---:|
| references/ 模板文件存在 | ❌ | ❌ | ❌ |
| 脚本文件存在 | N/A | ❌ parse_har.py | N/A |
| 幂等性说明 | ❌ | ✅（天然幂等） | ⚠️（部分） |
| 错误/超时处理 | ❌ | ⚠️（部分） | ❌ |
| T号生成命令具体化 | ❌ | N/A | ❌ |
| 异步状态连续性 | N/A | N/A | 🔴 设计级缺陷 |
| [infrastructure]/[LLM] 步骤标注 | ❌ | ❌ | ❌ |
| 并发 gate 正确化（处理 RATE_LIMITED） | ❌ | N/A | ❌ |

---

## 优先修复顺序（给 q）

1. **🔴 立即：** 删除 task-dispatch 和 team-analysis 中的手动并发检查 → 改为处理 RATE_LIMITED
2. **🔴 立即：** team-analysis Step 5 异步连续性修复（子任务追踪机制）
3. **🟡 生产前：** 创建所有 `references/*.md` 模板文件（3 个 Skill × 各自缺少的模板）
4. **🟡 生产前：** 创建 `har-analyzer/scripts/parse_har.py`（或内联 fallback）
5. **🟢 迭代时：** 为所有步骤添加 `[infrastructure]` / `[LLM]` 标注

---

*Atlas — Skill 架构审查完成 | 2026-03-14*
