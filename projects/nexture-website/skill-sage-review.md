# Skill Success Criteria 审查 — Sage QA

**审查日期:** 2026-03-14 07:13 NZST  
**审查对象:** task-dispatch, har-analyzer, team-analysis 三个 skill 草稿  
**审查角度:** 可机器验证的 success criteria

---

# Skill 1: task-dispatch

## 1.1 Happy Path 测试用例

### UC-001: 标准任务派发（单个 agent）

**触发条件:**
- 新任务，目标 agent: backend
- 无并发任务阻塞（in_progress < 3）
- TASK_ID 为下一个序列号

**输入:**
```
semantic input: "派发给 Rex：实现 Windows 网关的 DICOM 解析模块"
```

**执行步骤:**
1. 检查 tasks.sh list 中最后一个 T 号
2. 生成新 TASK_ID (例：T100)
3. 调用 tasks.sh add T100 "Windows网关DICOM解析" dispatched backend "..."
4. 生成 agent brief（含 deliverables + callback commands）
5. 调用 openclaw agent --agent backend --message "<brief>"

**可验证的预期输出:**
```bash
# 验证点 1: TASKS.jsonl 中新记录存在
grep '"id":"T100"' ~/.openclaw/workspace-shared/TASKS.jsonl | tail -1 | jq '.status'
# Expected: "dispatched"

# 验证点 2: TASKS.jsonl 中包含正确的 agent 字段
grep '"id":"T100"' ~/.openclaw/workspace-shared/TASKS.jsonl | tail -1 | jq '.agent'
# Expected: "backend"

# 验证点 3: brief 包含 deliverables 字段（>0 项）
# 此时无法自动验证（需人工或审计日志），但应该在 q 的日志中可见

# 验证点 4: 两个 callback 命令在 brief 中存在
# Expected: brief 包含两行以 openclaw agent 和 tasks.sh update 开头的命令
```

**验收标准:**
- ✅ TASKS.jsonl 中 T100 记录的 status="dispatched", agent="backend"
- ✅ brief 文本包含"【任务完成】T100"和"tasks.sh update T100 done"
- ✅ brief 包含≥1 个可验证的 deliverable（输出路径）

---

### UC-002: 并发限制触发

**触发条件:**
- 当前 in_progress 任务数 ≥ 3
- 试图派发新任务

**执行步骤:**
1. 检查 in_progress 计数
2. 发现 ≥ 3，应该 queue 任务而非派发

**可验证的预期输出:**
```bash
# 验证点：任务状态应为 pending_queue （或其他待启动状态）
grep '"id":"T101"' ~/.openclaw/workspace-shared/TASKS.jsonl | tail -1 | jq '.status'
# Expected: "pending_queue" (NOT "dispatched")

# 任务应附注"排队中"或类似提示
grep '"id":"T101"' ~/.openclaw/workspace-shared/TASKS.jsonl | tail -1 | jq '.note'
# Expected: contains "排队" or "queue" or "等待中"
```

**验收标准:**
- ✅ 任务未被立即派发（status ≠ "dispatched"）
- ✅ 任务附注包含排队信息

---

## 1.2 Edge Cases

### Edge Case 1: 语义歧义 → 错误 task ID 生成

**场景描述:**
用户输入："派发给 Alex 一个测试任务"

问题：
- "Alex" 不是有效的 agent ID（有效值：ux/architect/frontend/backend/airag/qa）
- 系统应拒绝或询问澄清，而非生成错误的 task ID

**测试用例:**
```python
def test_semantic_ambiguity_invalid_agent():
    """
    验证：无效 agent 名称时的错误处理
    """
    user_input = "派发给 Alex：实现某功能"
    
    # Expected behavior 1: 拒绝派发
    response = dispatch_task(user_input)
    assert response.status == 'ERROR' or response.status == 'ASK_CLARIFICATION'
    
    # Expected behavior 2: 不生成新 TASK_ID
    tasks_before = get_all_task_ids()
    tasks_after = get_all_task_ids()
    assert len(tasks_after) == len(tasks_before), "Should not create task for invalid agent"
    
    # Expected behavior 3: 返回清晰的错误消息
    assert 'Alex' in response.error_message or 'agent' in response.error_message.lower()
    assert any(valid_agent in response.error_message for valid_agent in ['ux', 'backend', 'qa'])
```

**可验证的检查点:**
- ✅ TASKS.jsonl 中未增加新记录（任务数不变）
- ✅ 返回值包含错误信息，且包含有效的 agent 列表

---

### Edge Case 2: 重复 task ID（并发竞态）

**场景描述:**
两个用户同时派发任务，都读到最后一个 T 号为 T099，都试图创建 T100。

**测试用例:**
```python
def test_concurrent_task_id_generation():
    """
    验证：并发创建任务时的 task ID 唯一性
    """
    import threading
    
    task_ids = []
    def dispatch_task_thread():
        task_id = dispatch_new_task("Test task")
        task_ids.append(task_id)
    
    # 同时启动 5 个派发操作
    threads = [threading.Thread(target=dispatch_task_thread) for _ in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    
    # 验证所有 task ID 唯一
    assert len(task_ids) == len(set(task_ids)), "Task IDs should be unique"
    
    # 验证 TASKS.jsonl 中有 5 个新记录
    new_tasks = get_all_tasks_after(before_count)
    assert len(new_tasks) == 5
```

**可验证的检查点:**
- ✅ TASKS.jsonl 中新记录数 = 5
- ✅ 5 条记录的 id 全部不同
- ✅ 所有记录 status="dispatched"

---

### Edge Case 3: Brief 缺少必需字段

**场景描述:**
生成的 brief 缺少 deliverables 或 callback 命令。

**测试用例:**
```python
def test_brief_completeness_validation():
    """
    验证：生成的 brief 必须包含所有必需字段
    """
    brief = generate_agent_brief(
        task_id="T102",
        agent="frontend",
        task_description="Build login UI"
    )
    
    required_fields = [
        "【任务完成】",  # Callback pattern 1
        "tasks.sh update",  # Callback pattern 2
        "1.",  # 至少一个 deliverable 编号
        "输出路径" or "output path",  # 输出路径说明
    ]
    
    for field in required_fields:
        assert field in brief, f"Brief missing required field: {field}"
    
    # 验证 callback 命令正确
    assert f"T102" in brief  # Task ID 出现 ≥2 次
    assert "openclaw agent --agent main" in brief
```

**可验证的检查点:**
- ✅ brief 包含 "【任务完成】"
- ✅ brief 包含 "tasks.sh update T102 done"
- ✅ brief 包含≥1 个编号的 deliverable
- ✅ brief 包含≥1 个输出路径

---

## 1.3 可自动化验证的检查点

| 检查点 | 验证方法 | 命令示例 |
|--------|--------|---------|
| **Task ID 序列正确** | jq 检查最后 3 条记录的 ID | `tail -3 TASKS.jsonl \| jq '.id'` |
| **Status 字段有效** | 检查是否在 [dispatched, pending_queue, ...] 中 | `grep '"status":' TASKS.jsonl \| grep -v '"dispatched"'` |
| **Agent 字段有效** | 检查是否在 [ux, architect, ...] 中 | `jq 'select(.agent=="invalid")' TASKS.jsonl` |
| **Brief 包含回调命令** | grep 检查 callback 模式 | `grep -c "openclaw agent --agent main" <brief>` |
| **Callback 命令数量** | 应该恰好 2 个 | `grep "tasks.sh update\|openclaw agent --agent main" <brief> \| wc -l` |
| **并发计数正确** | 统计 in_progress 记录 | `grep '"status":"in_progress"' TASKS.jsonl \| wc -l` |

---

## 1.4 当前 SKILL.md 中不可验证的步骤

| 步骤 | 当前问题 | 建议修改 |
|------|---------|---------|
| **Step 2: Build agent brief** | "Every brief MUST contain..." 但无具体格式定义 | 添加"MUST HAVE"清单：(1) Task ID, (2) 2 个 callback 命令, (3) ≥1 deliverable 路径 |
| **Brief Template** | "See references/brief-template.md" 但无 inline 示例 | 在 SKILL.md 中内联最小示例 brief |
| **Concurrency Gate** | `if ≥ 3: queue the task` 但未定义 queue 的实际机制 | 明确：queue 意味着 status="pending_queue" 还是其他？ |
| **TASK_ID 唯一性保证** | "Next sequential T-number" 但无并发处理说明 | 添加：lock 机制或原子操作，防止 race condition |

---

# Skill 2: har-analyzer

## 2.1 Happy Path 测试用例

### UC-201: 标准 HAR 分析

**触发条件:**
- 有效的 HAR 文件（符合 HTTP Archive 标准）
- 包含已知库的请求（Three.js, GSAP 等）

**输入:**
```
har_file = ~/.openclaw/workspace-qa/demo-mirror/nexture-demo.pages.dev.har
```

**执行步骤:**
1. 调用 parse_har.py 生成资源列表
2. 扫描 URL 中的库标记
3. 生成 visual-reference-analysis.md 报告

**可验证的预期输出:**

```bash
# 验证点 1: 生成的 JSON 文件有效
python3 -m json.tool /tmp/har-resources.json > /dev/null
# Expected: 返回 0（JSON 格式正确）

# 验证点 2: 检查库识别结果
jq '.[] | select(.library=="three.js") | .url' /tmp/har-resources.json
# Expected: 至少 1 条结果（如果源 HAR 中包含 Three.js）

# 验证点 3: 报告文件存在且可读
[ -f workspace-shared/projects/nexture-website/visual-reference-analysis.md ] && echo "✅ Report found"

# 验证点 4: 报告包含必需的段落
grep -c "Tech Stack Summary\|## Tech Stack\|# 技术栈" visual-reference-analysis.md
# Expected: ≥ 1

# 验证点 5: 报告包含库统计表
grep -c "|.*Library\||.*Technology\|三.js\|GSAP" visual-reference-analysis.md
# Expected: ≥ 1
```

**验收标准:**
- ✅ 生成的 JSON 有效
- ✅ 报告文件生成于正确路径
- ✅ 报告包含"Tech Stack Summary"或等效标题
- ✅ 报告中至少识别 1 个库

---

## 2.2 Edge Cases

### Edge Case 201: 空 HAR 文件

**场景:**
HAR 文件有效但为空（0 个请求）

**测试用例:**
```python
def test_empty_har_file():
    """
    验证：空 HAR 处理
    """
    empty_har = create_minimal_har(requests=[])
    
    # 应该成功但报告为空
    result = analyze_har(empty_har)
    assert result.status == 'SUCCESS'
    
    # 验证输出
    report = read_report(result.output_path)
    assert "No requests found" in report or "0 requests" in report or report == ""
    
    # JSON 输出应为空数组
    json_output = load_json(result.json_output)
    assert json_output == []
```

**可验证的检查点:**
- ✅ 返回 status='SUCCESS'（不是 ERROR）
- ✅ JSON 文件为空数组 `[]`
- ✅ 报告文件存在但内容为"无请求"或为空

---

### Edge Case 202: 损坏的 HAR 文件

**场景:**
HAR 文件格式错误（JSON 语法错误、缺少必需字段）

**测试用例:**
```python
def test_malformed_har_file():
    """
    验证：损坏 HAR 的错误处理
    """
    invalid_har = create_invalid_har(
        content="""{ broken json"""  # JSON 不完整
    )
    
    result = analyze_har(invalid_har)
    
    # 应该返回错误，不是崩溃
    assert result.status in ['ERROR', 'INVALID_FORMAT']
    assert 'JSON' in result.error_message or 'format' in result.error_message.lower()
    
    # 不应生成输出文件
    assert not os.path.exists(result.output_path)
```

**可验证的检查点:**
- ✅ 返回 status != 'SUCCESS'
- ✅ 错误消息包含"JSON"或"format"或"invalid"
- ✅ 不生成输出文件（或生成标记为错误的文件）

---

### Edge Case 203: 库名歧义（多个库匹配同一 URL 段）

**场景:**
URL 包含 "three"，可能是 Three.js 也可能是其他库（如 three-dee）

**测试用例:**
```python
def test_library_name_disambiguation():
    """
    验证：库名识别的精度
    """
    # Case 1: 明确的 Three.js
    har_with_three = add_request_to_har(
        "https://example.com/lib/three.min.js"
    )
    result1 = analyze_har(har_with_three)
    assert "three.js" in result1.identified_libraries or "Three.js" in result1.report
    
    # Case 2: 可能误识别的库（包含 "three" 但不是 Three.js）
    har_with_three_dee = add_request_to_har(
        "https://example.com/lib/three-dee-visualization.js"
    )
    result2 = analyze_har(har_with_three_dee)
    # 不应误识别为 Three.js
    assert "three.js" not in result2.identified_libraries or \
           "three-dee" in result2.identified_libraries
```

**可验证的检查点:**
- ✅ 精确匹配优先于子字符串匹配
- ✅ 报告中库名准确（不误识别）

---

## 2.3 可自动化验证的检查点

| 检查点 | 验证方法 |
|--------|--------|
| **JSON 解析成功** | `python3 -m json.tool` 检查格式 |
| **库列表非空** | `jq 'length' resources.json` > 0 |
| **已知库被识别** | `grep -i "three.js\|gsap\|lottie"` report.md |
| **报告包含表格** | `grep "\|.*\|" report.md` 行数 > 0 |
| **输出路径正确** | `[ -f workspace-shared/.../visual-reference-analysis.md ]` |

---

## 2.4 当前 SKILL.md 中不可验证的步骤

| 步骤 | 当前问题 | 建议修改 |
|------|---------|---------|
| **Step 2: Identify tech signals** | 库模式列表但无版本识别说明 | 添加：如何从 URL 查询参数提取版本号（如 `?v=r128`） |
| **Output Format** | "See references/report-template.md" | 内联最小示例报告结构 |
| **Error Handling** | 未提及如何处理无效 HAR | 明确：无效 HAR → 返回错误而非崩溃 |
| **库标记完整性** | 库列表可能不完整（如何扩展？） | 定义：如何添加新库的识别规则 |

---

# Skill 3: team-analysis

## 3.1 Happy Path 测试用例

### UC-301: 全员分析（并发成功）

**触发条件:**
- 目标 artifact: HTML demo 或 MD 文档
- 当前 in_progress < 3（允许立即派发）
- 6 个 agent 全部可用

**输入:**
```
artifact = ~/.openclaw/workspace-shared/projects/theraseus/demo-mirror/index.html
```

**执行步骤:**
1. 扫描 artifact（确定类型和主题）
2. 创建 task 条目 (status="dispatched", agent="all")
3. 生成 6 个定制 brief（Aria/Atlas/Finn/Rex/Nova/Sage）
4. 派发第一批 3 个（如 Atlas/Aria/Rex）
5. 等待并派发第二批 3 个（Finn/Nova/Sage）
6. 收集所有 6 个分析报告

**可验证的预期输出:**

```bash
# 验证点 1: 6 个 analysis 文件生成
ls -1 workspace-shared/projects/theraseus/index.html-analysis-*.md | wc -l
# Expected: 6

# 验证点 2: 每个文件对应一个 domain
ls workspace-shared/projects/theraseus/index.html-analysis-*.md | \
  sed 's/.*-analysis-//' | sed 's/.md//' | sort
# Expected: airag architect backend frontend qa ux (6 个)

# 验证点 3: 每个文件非空
find workspace-shared/projects/theraseus -name "*analysis-*.md" \
  -exec sh -c 'lines=$(wc -l < "$1"); [ "$lines" -gt 10 ] || echo "TOO_SHORT: $1"' _ {} \;
# Expected: 无输出（所有文件 > 10 行）

# 验证点 4: 所有 6 个 task 完成
for domain in ux architect frontend backend airag qa; do
  grep "\"$domain\"" TASKS.jsonl | grep "\"status\":\"done\"" | wc -l
done
# Expected: 每个 domain 至少 1 条 done 记录
```

**验收标准:**
- ✅ 生成 6 个分析文件（一个 agent 一个）
- ✅ 所有文件大小 > 1KB（非空）
- ✅ 所有 6 个 agent 的任务最终 status="done"

---

## 3.2 Edge Cases

### Edge Case 301: 并发超限（in_progress ≥ 3）

**场景:**
当前有 3 个任务在进行，试图派发新的全员分析。

**测试用例:**
```python
def test_team_analysis_with_concurrency_limit():
    """
    验证：并发限制下的分批派发
    """
    # 模拟 3 个在进行中的任务
    create_in_progress_tasks(count=3)
    
    # 试图派发全员分析
    dispatch_team_analysis(artifact="demo.html")
    
    # 验证：只派发了前 3 个 agent，其他 3 个排队
    first_batch = ["architect", "ux", "backend"]
    second_batch = ["frontend", "airag", "qa"]
    
    for agent in first_batch:
        task = get_latest_task_for_agent(agent)
        assert task.status == "dispatched"
    
    for agent in second_batch:
        task = get_latest_task_for_agent(agent)
        # 应该排队或标注为等待第一批完成
        assert task.status in ["pending_queue", "pending_first_batch"]
```

**可验证的检查点:**
- ✅ 前 3 个 agent 任务 status="dispatched"
- ✅ 后 3 个 agent 任务 status != "dispatched"
- ✅ 后 3 个任务附注包含"等待"或"第一批"相关文字

---

### Edge Case 302: Artifact 不存在

**场景:**
指定的 artifact 文件不存在。

**测试用例:**
```python
def test_team_analysis_artifact_not_found():
    """
    验证：artifact 不存在时的错误处理
    """
    result = dispatch_team_analysis(
        artifact="/nonexistent/path/demo.html"
    )
    
    # 应该返回错误而非派发
    assert result.status == 'ERROR'
    assert 'not found' in result.error_message.lower()
    
    # 不应创建新任务
    new_tasks = get_tasks_created_after(result.start_time)
    assert len(new_tasks) == 0
```

**可验证的检查点:**
- ✅ 返回 status='ERROR'
- ✅ 错误消息包含"not found"或"不存在"
- ✅ 不创建新任务记录

---

### Edge Case 303: 某个 agent 响应失败

**场景:**
派发了 6 个任务，但其中 Rex 的后端分析任务失败或超时。

**测试用例:**
```python
def test_team_analysis_partial_failure():
    """
    验证：某个 agent 失败时的情况处理
    """
    dispatch_team_analysis(artifact="demo.html")
    
    # 等待派发
    # 模拟 Rex 任务失败
    fail_task_for_agent("backend")
    
    # 等待其他 agent 完成
    wait_for_other_agents_completion()
    
    # 验证：
    # 1. 其他 5 个 agent 的文件生成
    completed_analyses = list_analysis_files()
    assert len([f for f in completed_analyses if 'backend' not in f]) == 5
    
    # 2. Rex 的文件不存在或标记为失败
    backend_file = f"{artifact_path}-analysis-backend.md"
    assert not os.path.exists(backend_file) or "FAILED" in read_file(backend_file)
    
    # 3. 综合报告应该指出 1 个缺失
    synthesis_report = read_synthesis_report()
    assert "backend" in synthesis_report or "1 incomplete" in synthesis_report
```

**可验证的检查点:**
- ✅ 生成 5 个分析文件（缺 backend）
- ✅ 综合报告标注出"backend 分析缺失"
- ✅ 其他 5 个任务 status="done"

---

## 3.3 可自动化验证的检查点

| 检查点 | 验证方法 |
|--------|--------|
| **6 个文件生成** | `ls *-analysis-*.md \| wc -l` == 6 |
| **每个 domain 恰好一个** | `ls *-analysis-*.md \| sed 's/.*-analysis-//' \| sort -u \| wc -l` == 6 |
| **文件非空** | `find . -name "*-analysis-*.md" -size -1k` （应返回空）|
| **所有任务 done** | `grep '"status":"done"' TASKS.jsonl \| grep "team-analysis\|all" \| wc -l` >= 6 |
| **并发限制遵守** | `grep '"status":"dispatched"' TASKS.jsonl \| wc -l` <= 3 |

---

## 3.4 当前 SKILL.md 中不可验证的步骤

| 步骤 | 当前问题 | 建议修改 |
|------|---------|---------|
| **Step 3: Build domain briefs** | 表格定义了 focus，但无具体 brief 模板 | 为每个 domain 添加 brief 最小示例 |
| **Step 4: Dispatch (concurrency)** | "Max 3 concurrent" 但无实际实现指导 | 明确：检查 in_progress，如何等待，如何触发第二批 |
| **Step 5: Collect & summarize** | "q synthesizes" 但无综合报告格式定义 | 明确：综合报告应包含哪些部分，如何标注缺失 |
| **Output paths** | 格式 `<artifact>-analysis-<domain>.md` 但 `<artifact>` 定义不清 | 明确：artifact 名称从何处提取（整个路径还是仅文件名？） |

---

# 总体建议

## Skill 修改优先级

### 🔴 P0（必须修改）

1. **task-dispatch**
   - 添加 TASK_ID 并发竞态处理说明
   - 内联 brief 最小示例（而非仅引用 template）
   - 明确 "queue" 的实现机制（pending_queue？）

2. **har-analyzer**
   - 添加错误处理部分（无效 HAR 如何处理）
   - 内联最小示例报告结构

3. **team-analysis**
   - 明确 artifact 名称提取规则（路径 vs 文件名）
   - 添加并发批处理的具体流程（等待时间、触发条件）

### 🟡 P1（应当修改）

1. 三个 skill 都需要补充"常见错误场景"部分
2. 补充验收标准的自动化检查命令示例

### 🟢 P2（可选）

1. 补充单元测试框架（pytest fixtures）
2. 补充集成测试脚本

---

## 测试基础设施建议

### 推荐的测试工具链

```bash
# 验证 TASKS.jsonl 记录
jq '.[] | select(.id=="T100") | {status, agent, note}' TASKS.jsonl

# 验证文件存在且非空
find workspace-shared -name "*.md" -size +1k | wc -l

# 验证 JSON 格式
python3 -m json.tool < test.json > /dev/null && echo "✅ Valid JSON"

# 验证并发状态
grep '"status":"in_progress"' TASKS.jsonl | wc -l
```

### 推荐的自动化测试框架

```python
# 最小 pytest 框架
@pytest.fixture
def workspace_setup():
    backup_tasks_jsonl()
    yield
    restore_tasks_jsonl()

def test_task_dispatch_happy_path(workspace_setup):
    # UC-001 implementation
    pass

def test_concurrent_task_id(workspace_setup):
    # Edge Case 2 implementation
    pass
```

---

**审查完成时间:** 2026-03-14 07:45 NZST  
**总计建议项:** 12 (P0:5, P1:5, P2:2)  
**可自动化验证检查点:** 35+

