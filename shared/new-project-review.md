# Code Review — new-project.sh

> Reviewer: Atlas (Architect) | Date: 2026-03-11
> File: `~/.openclaw/workspace/scripts/new-project.sh`
> Severity: 🔴 Critical · 🟠 High · 🟡 Medium · ⚪ Low

---

## Summary

| Category | 🔴 | 🟠 | 🟡 | ⚪ |
|---|---|---|---|---|
| Shell 健壮性 & 错误处理 | 1 | 2 | 2 | 0 |
| openclaw config set 正确性 | 0 | 2 | 1 | 0 |
| Telegram API 调用 | 1 | 1 | 1 | 0 |
| --dry-run 覆盖 | 0 | 1 | 0 | 0 |
| 安全隐患 | 1 | 1 | 1 | 0 |
| **Total** | **3** | **7** | **5** | **0** |

---

## 1. Shell 健壮性 & 错误处理

### 🔴 R1: `eval` in `run()` — command injection risk + fragile quoting

```bash
run() {
  if $DRY_RUN; then
    echo "  [DRY-RUN] $*"
  else
    eval "$*"   # ← DANGEROUS
  fi
}
```

**Problem:** `eval` re-interprets the entire string including shell metacharacters.
Combined with user-supplied `$PROJECT_NAME` and `$PROJECT_DESC`, this opens a
command injection vector. Even without malicious intent, descriptions containing
quotes, backticks, or `$()` will break or execute unexpectedly.

**Fix:**
```bash
run() {
  if $DRY_RUN; then
    echo "  [DRY-RUN] $*"
  else
    "$@"   # Execute arguments directly, no re-interpretation
  fi
}

# Call pattern changes from:
#   run "$OC config set ..."
# To:
#   run "$OC" config set "channels.telegram..." '{"requireMention":false}'
```

### 🟠 H1: No `set -o pipefail` — pipe failures silently ignored

```bash
set -e
```

**Problem:** `set -e` alone won't catch failures in pipe chains.
Line like `echo "$RESPONSE" | python3 -c "..."` — if `echo` succeeds but
python3 fails, the pipe returns python3's exit code, but intermediate
failures in other pipes could be masked.

**Fix:**
```bash
set -euo pipefail
```

Adding `-u` also catches unset variable references (e.g., if `$3` is missing
and `--dry-run` is in position 3, `$PROJECT_DESC` silently becomes "--dry-run"
instead of erroring — see DRY-RUN issue D1).

### 🟠 H2: `$TOKEN` extraction has no error handling

```bash
TOKEN=$(python3 -c "import json; d=json.load(open('$HOME/.openclaw/openclaw.json')); print(d['channels']['telegram']['accounts']['default']['botToken'])")
```

**Problems:**
- If `openclaw.json` doesn't exist → unhandled Python exception, script dies with cryptic traceback
- If the JSON path is wrong (e.g., key renamed) → KeyError, same result
- File path baked with `$HOME` inside Python string — if HOME has quotes, breaks

**Fix:**
```bash
CONFIG_FILE="$HOME/.openclaw/openclaw.json"
if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "❌ Config file not found: $CONFIG_FILE"
  exit 1
fi
TOKEN=$(python3 -c "
import json, sys
try:
    d = json.load(open(sys.argv[1]))
    print(d['channels']['telegram']['accounts']['default']['botToken'])
except (KeyError, FileNotFoundError) as e:
    print(f'❌ Cannot read bot token: {e}', file=sys.stderr)
    sys.exit(1)
" "$CONFIG_FILE") || exit 1
```

### 🟡 M1: Step 6 Gateway restart — no exit code check, no timeout

```bash
$OC gateway restart && log "  ✅ Gateway 重启完成"
```

**Problem:** If restart hangs (e.g., gateway is in a bad state), the script
blocks indefinitely. The `&&` only catches non-zero exit, not timeouts.

**Fix:**
```bash
timeout 30 "$OC" gateway restart && log "  ✅ Gateway 重启完成" || {
  log "⚠️ Gateway restart failed or timed out"
  # Non-fatal: project is created, restart can be done manually
}
```

### 🟡 M2: No cleanup on partial failure

**Problem:** If the script fails at Step 4 (PROJECTS.json), Steps 1-3 have
already created a Telegram topic and written config. There's no rollback,
leaving orphaned state. With `set -e`, any failure exits immediately.

**Fix:** Add a `trap` for cleanup:
```bash
CLEANUP_TOPIC=false
trap 'if $CLEANUP_TOPIC && ! $DRY_RUN; then
  log "⚠️ Cleaning up: removing topic..."
  # Note: Telegram API doesn't support deleteForumTopic for non-admins easily
  # At minimum, log the orphaned state
  log "⚠️ Orphaned topic ID: $TOPIC_ID — manual cleanup needed"
fi' EXIT
```

---

## 2. openclaw config set 正确性 & 幂等性

### 🟠 H3: Unclear if `config set` is a real openclaw subcommand

```bash
$OC config set "channels.telegram.accounts.${ACCT}.groups[...]" '{...}'
```

**Problem:** The known openclaw CLI commands (per docs) are:
- `openclaw gateway start|stop|restart|status`
- `openclaw config validate`

There is no documented `openclaw config set` subcommand. This may be a
planned feature or may not exist, causing all config steps to silently fail
(the `run()` + `eval` combination may mask errors).

**Action required:** Verify `openclaw config set` exists. If not, the
config updates must be done by:
1. Reading `openclaw.json` with `python3`/`jq`
2. Merging the new topic config
3. Writing back
4. Running `openclaw config validate`

### 🟠 H4: Idempotency — re-running overwrites without checking

**Problem:** Running the script twice for the same project will:
1. Create a **second** Telegram topic with the same name (Telegram allows duplicates)
2. Overwrite the previous config binding (topic IDs differ)
3. Overwrite the PROJECTS.json entry (losing the old topicId)

**Fix:** Add idempotency check at the top:
```bash
# Check if project already exists
if [[ -f "$PROJECTS_JSON" ]]; then
  EXISTS=$(python3 -c "
import json
with open('$PROJECTS_JSON') as f:
    d = json.load(f)
if '$PROJECT_NAME' in d:
    print(d['$PROJECT_NAME'].get('topicId',''))
" 2>/dev/null)
  if [[ -n "$EXISTS" ]]; then
    echo "⚠️ Project '$PROJECT_NAME' already exists (topic ID: $EXISTS)"
    echo "   Use --force to recreate, or manage manually."
    exit 1
  fi
fi
```

### 🟡 M3: Escaped quote hell in config set path

```bash
run "$OC config set \"channels.telegram.accounts.${ACCT}.groups[\\\"${GROUP_ID}\\\"].topics[\\\"${TOPIC_ID}\\\"]\" '{...}'"
```

**Problem:** Triple-escaped quotes passed through `eval` are extremely
fragile. A single misquote silently corrupts the JSON path. This is the
most likely source of runtime bugs.

**Fix:** Eliminate `eval` (see R1). Pass arguments directly:
```bash
run "$OC" config set \
  "channels.telegram.accounts.${ACCT}.groups[\"${GROUP_ID}\"].topics[\"${TOPIC_ID}\"]" \
  "{\"requireMention\":${REQUIRE_MENTION},\"agentId\":\"${AGENT_ID}\"}"
```

---

## 3. Telegram API 调用完整性

### 🔴 R2: Bot token leaked in process list

```bash
TOKEN=$(python3 -c "...print(d['...']['botToken'])")
```

Then used in:
```bash
curl -s -X POST "https://api.telegram.org/bot${TOKEN}/createForumTopic" ...
```

**Problem:** The `TOKEN` is visible in `/proc/*/cmdline` and `ps aux` output
during every `curl` call. On a shared system, any user can read it.

**Fix:** Use `--data @-` to pipe the token via stdin, or write to a temp
file with restrictive permissions:
```bash
# Option A: environment variable (still visible in /proc/environ but less exposed)
export TELEGRAM_TOKEN="$TOKEN"

# Option B: use curl config file
CURL_CFG=$(mktemp)
chmod 600 "$CURL_CFG"
trap "rm -f $CURL_CFG" EXIT
echo "-H \"Authorization: ...\"" > "$CURL_CFG"
```

Or better: the token is already in the URL path which `curl` passes as
an argument. The real fix is to use Telegram's newer authentication header
method, but that requires API changes. At minimum, mark the script as
**root/owner-only executable** (`chmod 700`).

### 🟠 H5: Telegram sendMessage curl exit code not checked

```bash
curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  ... > /dev/null
```

**Problem:** Both the brief (Step 5) and Victor notification (Step 7) pipe
curl output to `/dev/null` without checking the HTTP response or exit code.
If the bot is rate-limited (429) or the message is too long, it fails silently.

**Fix:**
```bash
SEND_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST ...)
HTTP_CODE=$(echo "$SEND_RESPONSE" | tail -1)
if [[ "$HTTP_CODE" != "200" ]]; then
  log "⚠️ sendMessage failed (HTTP $HTTP_CODE)"
fi
```

### 🟡 M4: Markdown escaping in sendMessage

```bash
BRIEF_TEXT="📌 *Project Brief — ${PROJECT_NAME}*\n...\n*关键路径:* \`workspace-shared/projects/${PROJECT_NAME}/\`"
```

**Problem:** If `$PROJECT_NAME` contains Markdown special characters
(`_`, `*`, `` ` ``, `[`), the message will render incorrectly or fail with
Telegram's "Bad Request: can't parse entities" error.

**Fix:** Escape Markdown in variables, or switch to `parse_mode: MarkdownV2`
with proper escaping:
```bash
SAFE_NAME=$(echo "$PROJECT_NAME" | sed 's/[_*`\[]/\\&/g')
```

---

## 4. --dry-run 模式覆盖

### 🟠 D1: `--dry-run` position detection is buggy

```bash
PROJECT_DESC="${3:-No description}"
DRY_RUN=false
[[ "${4}" == "--dry-run" || "${3}" == "--dry-run" ]] && DRY_RUN=true
```

**Problem:** If user runs:
```bash
bash new-project.sh myproj website --dry-run
```

Then:
- `$PROJECT_DESC` = `"--dry-run"` (not "No description")
- `$DRY_RUN` = `true` (correct, but desc is polluted)

The description `"--dry-run"` will be written to PROJECTS.json and
sent in the Telegram brief if the user later runs without --dry-run
but forgets to add a description.

**Fix:** Parse flags properly:
```bash
DRY_RUN=false
POSITIONAL=()
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    *) POSITIONAL+=("$arg") ;;
  esac
done

PROJECT_NAME="${POSITIONAL[0]:?用法: ...}"
PROJECT_TYPE="${POSITIONAL[1]:?请指定类型: ...}"
PROJECT_DESC="${POSITIONAL[2]:-No description}"
```

---

## 5. 安全隐患

### 🔴 R3: `$PROJECT_DESC` injected into Python heredoc unsanitized

```bash
python3 << EOF
...
data["$PROJECT_NAME"] = {
    ...
    "description": "$PROJECT_DESC",
    ...
}
EOF
```

**Problem:** `$PROJECT_DESC` is expanded by bash BEFORE passing to Python.
A description containing `"` breaks the Python syntax. A description
containing `", "status": "pwned", "__import__('os').system('rm -rf /')": "` could
inject arbitrary Python code or corrupt the JSON structure.

**Fix:** Quote the heredoc delimiter to prevent bash expansion, and pass
values as arguments:
```bash
python3 - "$PROJECTS_JSON" "$PROJECT_NAME" "$PROJECT_TYPE" "$PROJECT_DESC" "$TOPIC_ID" << 'EOF'
import json, os, sys
from datetime import datetime

path, name, ptype, desc, topic_id = sys.argv[1:6]
os.makedirs(os.path.dirname(path), exist_ok=True)

try:
    with open(path) as f:
        data = json.load(f)
except:
    data = {}

data[name] = {
    "type": ptype,
    "topicId": int(topic_id),
    "status": "active",
    "description": desc,
    "created": datetime.now().strftime("%Y-%m-%d"),
    "sprint": "planning"
}

with open(path, "w") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print("  ✅ PROJECTS.json 已更新")
EOF
```

### 🟠 H6: `openclaw.json` path readable by script = token accessible

**Problem:** The script reads the bot token directly from `openclaw.json`.
Any process running this script (or any copy of it) has access to the
Telegram bot token. If the script is shared in a repo, the token extraction
pattern is documented for attackers.

**Mitigation:**
- Ensure `openclaw.json` is `chmod 600`
- Consider sourcing the token from an environment variable or a dedicated
  secrets manager instead of parsing the config file directly
- Add `openclaw.json` to `.gitignore` (likely already done)

### 🟡 M5: GROUP_ID and VICTOR_ID hardcoded

```bash
GROUP_ID="-1003837566356"
VICTOR_ID="6663682303"
```

**Problem:** These should be configuration, not code. If the group changes
or another admin needs notifications, the script must be edited.

**Fix:** Read from environment or a config file:
```bash
GROUP_ID="${NEXTURE_GROUP_ID:?Set NEXTURE_GROUP_ID}"
VICTOR_ID="${NEXTURE_NOTIFY_ID:-$GROUP_ID}"
```

---

## 6. Additional Observations

### ⚪ Missing features (not bugs)

1. **No `--force` flag** for re-creating existing projects
2. **No project directory creation** — the script creates a Telegram topic and
   config binding but doesn't `mkdir -p` the workspace directory
   (`workspace-shared/projects/$PROJECT_NAME/{docs,assets,delivery}`)
3. **No REGISTRY update** — `$REGISTRY` variable is defined but never written to
4. **No rollback** — if Step 4+ fails, Steps 1-3 leave orphaned state

---

## Recommendation

| Priority | Action |
|---|---|
| **Immediate** | Fix R1 (eval→direct exec), R2 (token exposure), R3 (heredoc injection) |
| **Before production use** | Fix H1-H6 (pipefail, idempotency, error checking, arg parsing) |
| **Nice to have** | Add project dir creation, REGISTRY write, `--force` flag |

**Overall assessment:** Script achieves its goal but has 3 critical security/robustness
issues that must be fixed before non-dry-run production use. The `eval` + unescaped
user input combination is the highest risk.

---

*Reviewed by Atlas · 2026-03-11*
