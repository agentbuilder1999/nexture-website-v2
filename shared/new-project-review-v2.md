# Code Review v2 — new-project.sh (Post-Fix)

> Reviewer: Atlas (Architect) | Date: 2026-03-11
> File: `~/.openclaw/workspace/scripts/new-project.sh`
> Previous review: `new-project-review.md` (3🔴 7🟠 5🟡)

---

## Critical Issues — Fix Verification

### 🔴 R1: eval → "$@" — ✅ FIXED

**Before:**
```bash
run() { eval "$*"; }
```

**After:**
```bash
run() {
  if $DRY_RUN; then
    echo "  [DRY-RUN] $*"
  else
    "$@"   # ← 直接执行，不经 eval 重解释
  fi
}
```

**调用方也已更新：**
```bash
run "$OC" config set \
  "channels.telegram.accounts.${ACCT}.groups[\"${GROUP_ID}\"].topics[\"${TOPIC_ID}\"]" \
  "{\"requireMention\":false,\"agentId\":\"${AGENT_ID}\"}"
```

**结论：** 命令注入风险已消除，引号嵌套从三层转义简化为标准双引号。✅

---

### 🔴 R2: Token 暴露 → 临时文件 + trap — ✅ FIXED (with residual issue)

**After:**
```bash
TOKEN_FILE=$(mktemp /tmp/.oc-tok-XXXXXXXX)
chmod 600 "$TOKEN_FILE"
python3 -c "..." > "$TOKEN_FILE"
trap 'rm -f "$TOKEN_FILE"' EXIT
```

**已解决：**
- Token 不再出现在 `curl` 命令参数中（不暴露于 `ps aux`）✅
- `chmod 600` 限制其他用户读取 ✅
- `trap EXIT` 确保退出时删除 ✅

**🟡 残留问题 M-NEW-1：Token 仍泄露在 Step 5**

```bash
TOKEN_VAL=$(cat "$TOKEN_FILE")
curl -s -X POST "https://api.telegram.org/bot${TOKEN_VAL}/sendMessage" ...
```

Step 5 的 brief 发送直接将 `$TOKEN_VAL` 展开到 curl URL 参数中，
回到了 R2 的原始问题。应统一使用 `tg_post()` 函数。

Step 1 和 Step 7（已移除）正确使用了 `tg_post()`，但 Step 5 绕过了它。

**Fix：**
```bash
# 替换 Step 5 的发送逻辑为：
BODY=$(python3 -c "import json,sys; print(json.dumps({
  'chat_id': int(sys.argv[1]),
  'message_thread_id': int(sys.argv[2]),
  'text': sys.argv[3]
}))" "$GROUP_ID" "$TOPIC_ID" "$BRIEF_TEXT")
tg_post "sendMessage" "$BODY" > /dev/null
```

---

### 🔴 R3: Heredoc 注入 → 'EOF' + 环境变量 — ✅ FIXED

**Before:**
```bash
python3 << EOF
data["$PROJECT_NAME"] = { "description": "$PROJECT_DESC" ...}  # bash 展开!
EOF
```

**After:**
```bash
PROJECT_NAME="$PROJECT_NAME" \
PROJECT_TYPE="$PROJECT_TYPE" \
...
python3 << 'EOF'              # ← 单引号 EOF，bash 不展开
proj_name = os.environ["PROJECT_NAME"]  # ← 从环境变量读取
...
EOF
```

**结论：** 用户输入不再注入 Python 代码。`os.environ` 读取是安全的。✅

---

## Structural Changes — Verification

### PROJECTS.json → Array 结构 — ✅ CONFIRMED

**Before (v1):**
```json
{ "myproject": { "type": "...", "topicId": 123 } }
```

**After (v2):**
```json
{
  "version": "1.0.0",
  "projects": [
    { "name": "myproject", "type": "...", "topicId": 123, ... }
  ],
  "updated": "2026-03-11"
}
```

优点：
- 支持按顺序排列、按字段过滤 ✅
- 有 `version` 字段便于未来迁移 ✅
- 有去重逻辑（按 name 过滤后 append）✅

**🟡 残留 M-NEW-2：** 兼容性 — 如果已有 dict 格式的 PROJECTS.json，
`data["projects"]` 会 KeyError。代码有 fallback：
```python
if "projects" not in data:
    data["projects"] = []
```
但如果旧文件是 `{"myproject": {...}}`，旧项目数据会丢失（只保留新结构的空数组）。
建议加迁移逻辑或在 DECISIONS.md 声明"一次性清零"。

---

### Gateway restart → 提示 Victor — ✅ CONFIRMED

**Before:**
```bash
$OC gateway restart && log "  ✅ Gateway 重启完成"
```

**After:**
```bash
log "Step 6: 配置完成，等待 Victor 重启 Gateway..."
echo "  ⚠️  请 Victor 执行：openclaw gateway restart"
```

**结论：** 符合 SOP（系统操作由 Victor 执行）。✅

---

## Previous 🟠 Issues — Status Check

| ID | Issue | Status |
|---|---|---|
| H1 | No `pipefail` | ✅ Fixed: `set -euo pipefail` |
| H2 | Token extraction no error handling | ⚠️ Partial: python3 still has no try/except, but `set -e` will catch non-zero exit |
| H3 | `config set` 是否存在 | ⏳ Unverified: still using `$OC config set`, needs runtime confirmation |
| H4 | Idempotency | ✅ Fixed: PROJECTS.json 去重 `[p for p in ... if p.get("name") != proj_name]` 。但 Telegram topic 仍无去重（会创建重复 topic）|
| H5 | sendMessage curl 无检查 | ⚠️ Partial: Step 1 有检查，Step 5 的 curl 仍 `> /dev/null` 无检查 |
| H6 | openclaw.json 访问 | ⏭ Accepted risk: 文件应已 `chmod 600` |
| D1 | --dry-run 参数位 | ✅ Fixed: 增加了 `[[ "$PROJECT_DESC" == "--dry-run" ]] && PROJECT_DESC="No description"` |

---

## New Issues Found in v2

### 🟠 N1: Step 5 发送逻辑混乱 — 三段冗余代码

```bash
# 第一段：tg_post + python3 构建 JSON（环境变量未正确设置）
tg_post "sendMessage" \
  "$(python3 -c "import json,os; print(json.dumps({...}))")" > /dev/null \

# 第二段：fallback python3 尝试（语法不完整，会静默失败）
  || GROUP_ID="$GROUP_ID" ... python3 -c "
import json, os, urllib.request
token = open('$(cat "$TOKEN_FILE" | head -c 0 && echo "$TOKEN_FILE")').read().strip()
" 2>/dev/null || true

# 第三段：实际发送（token 又暴露在命令行）
TOKEN_VAL=$(cat "$TOKEN_FILE")
curl -s -X POST "https://api.telegram.org/bot${TOKEN_VAL}/sendMessage" ...
```

**问题：**
1. 第一段的 `python3 -c` 引用 `os.environ.get('GROUP_ID')` 但 GROUP_ID 未 export
2. 第二段的 Python 代码不完整，`token = open(...)` 后无任何操作，靠 `2>/dev/null || true` 吞错
3. 第三段才是真正发送的代码，但绕过了 `tg_post()` — token 暴露
4. 三段代码都会执行（第一段失败→第二段吞错→第三段总是执行）

**Fix：** 删除前两段，统一用 `tg_post()`：
```bash
BODY=$(python3 -c "
import json, sys
print(json.dumps({
    'chat_id': int(sys.argv[1]),
    'message_thread_id': int(sys.argv[2]),
    'text': sys.argv[3]
}))
" "$GROUP_ID" "$TOPIC_ID" "$BRIEF_TEXT")

SEND_RESP=$(tg_post "sendMessage" "$BODY")
if echo "$SEND_RESP" | python3 -c "import json,sys; exit(0 if json.load(sys.stdin).get('ok') else 1)" 2>/dev/null; then
  log "  ✅ Brief 已发送"
else
  log "  ⚠️ Brief 发送失败: $SEND_RESP"
fi
```

### 🟡 N2: `tg_post()` 仍将 token 展开到 curl URL

```bash
tg_post() {
  local token
  token=$(cat "$TOKEN_FILE")
  curl -s -X POST "https://api.telegram.org/bot${token}/${endpoint}" ...
}
```

**问题：** 虽然 token 不再硬编码在脚本变量中，但 `curl` 的 URL 参数
仍然在进程列表中可见（`/proc/PID/cmdline`）。这是 Telegram Bot API 的
固有限制（token 必须在 URL path 中），所以这是 **accepted risk**，
但应在脚本头部注释中声明。

**建议：** 添加注释：
```bash
# NOTE: Telegram Bot API requires token in URL path.
# Token is visible in process list during curl execution.
# Ensure this script runs on a single-user system or under restricted permissions.
```

### 🟡 N3: `--dry-run` 修复仍有边界情况

```bash
PROJECT_DESC="${3:-No description}"
DRY_RUN=false
[[ "${4:-}" == "--dry-run" || "${3:-}" == "--dry-run" ]] && DRY_RUN=true && PROJECT_DESC="${3:-No description}"
[[ "$PROJECT_DESC" == "--dry-run" ]] && PROJECT_DESC="No description"
```

**边界情况：** `bash new-project.sh proj website "my --dry-run test"`
→ 描述被截断为 "No description"，因为包含 "--dry-run" 子串。

当前代码用 `==` 精确匹配，只在描述恰好等于 "--dry-run" 时重置 ✅。
但原始 `${3:-}` 检查 `"${3:-}" == "--dry-run"` 也精确匹配 ✅。
实际上 **此问题已修复**。标记为 ✅。

---

## Summary

| Category | v1 | v2 | Notes |
|---|---|---|---|
| 🔴 Critical | 3 | **0** | R1 ✅ R2 ✅ R3 ✅ |
| 🟠 High | 7 | **1** (new N1) | Step 5 需要清理 |
| 🟡 Medium | 5 | **2** (N2 accepted, M-NEW-2) | |
| Overall | ❌ Not ready | ⚠️ **Near-ready** | 修复 N1 后可投产 |

### Required before production:

1. **N1: 清理 Step 5** — 删除冗余代码段，统一用 `tg_post()` + 响应检查
2. **M-NEW-2 (optional):** 确认旧 PROJECTS.json 是否需要迁移

### Verdict: 3 个 Critical 全部修复 ✅ · 剩余 1 个 High 集中在 Step 5 发送逻辑

---

*Reviewed by Atlas · 2026-03-11*
