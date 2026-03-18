# T042: Sandbox Removal + Communication Architecture Rebuild

> Author: Atlas (architecture), Rex (operations) | Date: 2026-03-17
> Status: Ready for Victor Review
> Executive Sponsor: Victor | Implementation: q + Rex
> T042 Prerequisites: T041 (communication audit) ✅ Complete

---

## 1. Executive Summary

**Purpose:** Remove Docker sandbox from 6 dev agents to enable direct `openclaw agent` CLI dispatch, fully implementing the hub model (q as sole dispatcher).

| Current State | Target State |
|---------------|--------------|
| Agents in sandbox (network=none) | Agents on host (full access) |
| Communication: 2/11 mechanisms work | Communication: 9/11 mechanisms work |
| Dead-letter protocols (5) | Only valid protocols documented |
| No agent-to-agent restrictions | Dispatch hierarchy enforced |

**Key Benefits:**
- All 6 dev agents can run `openclaw agent --agent main` (primary dispatch)
- Status card via curl now works (network available)
- tasks.sh directly callable from agents
- L2/L3 fallback paths now functional
- Clear enforcement architecture (q = hub, agent → agent =)

---

## 2. Core Principle (Victor Confirmed)

```
Dispatch Hierarchy (one-way only):
┌─────────────────────────────────────────────────────────┐
│  q → [any agent]            ✅ dispatch (hub model)     │
│  Agent → q                   ✅ report back only         │
│  Agent → Agent               ❌ FORBIDDEN (loss of control) │
└─────────────────────────────────────────────────────────┘
```

**Rationale for Agent → Agent FORBIDDEN:**
- Prevents dispatch loops (A→B→C→A...)
- Prevents loss of central coordination (q always knows task state)
- Task dependencies explicitly via `blocked_on:T-xxx` in TASKS.jsonl, not direct handoff
- q acts as orchestrator, checking `blocked_on` after each completion

---

## 3. Technical Implementation Steps

### Phase 1: Configuration Changes (Rex lead)

#### Step 1.1: Backup Current Config (IMMEDIATELY)
```bash
# Before any changes, backup openclaw.json
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.backup.$(date +%Y%m%d-%H%M%S)
```

```bash
# Backup all AGENTS.md
mkdir -p ~/.openclaw/workspace/backup-agents-md
for agent in ux architect frontend backend airag qa; do
  cp ~/.openclaw/workspace-${agent}/AGENTS.md ~/.openclaw/workspace/backup-agents-md/${agent}.AGENTS.md.$(date +%Y%m%d-%H%M%S)
done
echo "AGENTS.md backups complete"
```

#### Step 1.2: Modify openclaw.json

**Target configuration for each dev agent:**

```json5
{
  "id": "ux",
  "sandbox": {
    "mode": "off"  // Change from default (non-main)
  },
  "tools": {
    "elevated": {
      "enabled": false  // Keep restricted
    }
  }
}
```

**Key changes per agent:**

| Agent | Current sandbox.mode | Target | Comment |
|-------|---------------------|--------|---------|
| ux | default (=non-main) | "off" | Full host access |
| architect | "none" (with docker) | "off" | Remove docker override |
| frontend | default (=non-main) | "off" | Remove (network=bridge→off) |
| backend | default (=non-main) | "off" | Full host access |
| airag | "none" (with docker) | "off" | Remove docker override |
| qa | "non-main" | "off" | Remove from sandbox |

**Config changes required (openclaw.json diff):**

```diff
--- a/.openclaw/openclaw.json
+++ b/.openclaw/openclaw.json
@@ -150,8 +150,7 @@
     {
       "id": "ux",
       "sandbox": {
-        "workspaceAccess": "rw",
-        "workspaceRoot": "/Users/dev_team_alpha/.openclaw/workspace-ux"
+        "mode": "off"
       },
       "tools": {
         "alsoAllow": ["sessions_send"],
@@ -163,18 +162,11 @@
     {
       "id": "architect",
       "sandbox": {
-        "workspaceAccess": "none",
-        "workspaceRoot": "/Users/dev_team_alpha/.openclaw/workspace-architect",
-        "docker": {
-          "binds": [...],
-          "dangerouslyAllowExternalBindSources": true
-        }
+        "mode": "off"
       },
       "tools": {
         "alsoAllow": ["sessions_send"],
-        "deny": ["apply_patch", "browser", "canvas", "nodes", "tts"]
+        "deny": ["apply_patch", "browser", "canvas", "nodes", "tts", "exec"]
       }
     },
@@ -184,10 +176,7 @@
         {"path": "/Users/dev_team_alpha/.openclaw/workspace-shared:/workspace-shared:ro"},
         {"path": "/Users/dev_team_alpha/.openclaw/workspace-frontend:/workspace-frontend:rw"}
       ],
-      "network": "bridge",
-      "env": {...},  // Remove tokens from sandbox
-      "dangerouslyAllowExternalBindSources": true
+      "mode": "off"
     },
     {
       "id": "backend",
@@ -219,10 +208,7 @@
         {"path": "/Users/dev_team_alpha/.openclaw/workspace-shared:/workspace-shared:ro"},
         {"path": "/Users/dev_team_alpha/.openclaw/workspace-airag:/workspace-airag:none"}
       ],
-      "network": "none",
-      "dangerouslyAllowExternalBindSources": true
+      "mode": "off"
     },
     {
       "id": "qa",
@@ -231,8 +217,7 @@
         {"path": "/Users/dev_team_alpha/.openclaw/workspace-shared:/workspace-shared:ro"},
         {"path": "/Users/dev_team_alpha/.openclaw/workspace-qa:/workspace-qa:rw"}
       ],
-      "mode": "non-main",
-      "network": "none"
+      "mode": "off"
     }
```

**Execute using `openclaw config set`:**

```bash
# Step 1: Apply config changes (requires Gateway restart)
openclaw gateway stop
# Edit openclaw.json manually or use config.patch
openclaw config patch agents.list.ux.sandbox.mode off
openclaw config patch agents.list.architect.sandbox.mode off
openclaw config patch agents.list.frontend.sandbox.mode off
openclaw config patch agents.list.backend.sandbox.mode off
openclaw config patch agents.list.airag.sandbox.mode off
openclaw config patch agents.list.qa.sandbox.mode off
openclaw gateway restart
```

**Critical note:** `openclaw config patch` merges; some fields require manual removal (docker overrides, network settings).

#### Step 1.3: Verify Sandbox Removal

After Gateway restart, verify each agent runs on host:

```bash
# Method 1: Agent reports its environment
for agent in ux architect frontend backend airag qa; do
  echo "=== $agent ==="
  cat > /tmp/test-${agent}.sh << EOF
#!/bin/bash
echo "=== Runtime Environment ==="
echo "User: \$(whoami)"
echo "Openclaw binary: \$(which openclaw 2>/dev/null || echo 'NOT FOUND')"
echo "PATH: \$PATH"
echo "Network test: \$(curl -s --connect-timeout 2 https://api.telegram.org 2>&1 | head -1 || echo 'FAILED')"
EOF
  openclaw agent --agent $agent --message "Run this: cat /tmp/test-${agent}.sh && bash /tmp/test-${agent}.sh"
done
```

Expected results:
- User: `dev_team_alpha` (or same user as Gateway)
- Openclaw binary: `/Users/dev_team_alpha/.nvm/versions/node/v24.14.0/bin/openclaw`
- Network test: `{"ok":true,...}` or similar success

#### Step 1.4: Update PATH for New Agents (if needed)

If openclaw binary isn't in PATH for new agents:

```bash
# Add to ~/.bash_profile or ~/.zprofile (host-wide)
export PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH"
export OPENCLAW_BIN="/Users/dev_team_alpha/.nvm/versions/node/v24.14.0/bin/openclaw"
```

Or create agent-specific wrapper in workspace directory:
```bash
#!/bin/bash
# ~/.openclaw/workspace/.openclaw-agent-wrapper
exec /Users/dev_team_alpha/.nvm/versions/node/v24.14.0/bin/openclaw "$@"
```

### Phase 2: AGENTS.md Updates (Atlas lead, q executes)

Rewrite 回报協議 section for all 6 dev agents. **Template:**

```markdown
## 调度层级 ⚠️IMPORTANT

q 是唯一调度者。禁止 agent 之间直接派发。

```
q → [任何 agent]     ✅ 正确：q 派发任务
Agent → q            ✅ 正确：向 q 回报
Agent → Agent        ❌ 禁止：防止循环派发失控
```

调度指令格式：
```bash
/Users/dev_team_alpha/.nvm/versions/node/v24.14.0/bin/openclaw agent --agent main --message "<指令>"
```

## 回报协议

**任务完成时：**
```bash
# PRIMARY: openclaw agent CLI（现在可用，之前 sandbox 中无法执行）
/Users/dev_team_alpha/.nvm/versions/node/v24.14.0/bin/openclaw agent --agent main --message "【任务完成】<taskId> <summary>"

/Users/dev_team_alpha/.nvm/versions/node/v24.14.0/bin/openclaw agent --agent main --message "【状态更新】<内容>"  # 可选
```

**阻塞时：必须附带 blocked_on：**
```bash
/Users/dev_team_alpha/.nvm/versions/node/v24.14.0/bin/openclaw agent --agent main --message "【阻塞】<taskId> <原因>"
/Users/dev_team_alpha/.nvm/versions/node/v24.14.0/bin/openclaw agent --agent main --message "【阻塞】T042 sandbox removal blocked_on:T041"
```

**Fallback 如果 openclaw agent 失败：**
```bash
# 使用 sessions_send 工具作为备用路径
sessions_send(sessionKey="agent:main:main", message="【任务完成】<taskId> <summary>")
```

## 状态卡更新

```bash
# Agent 现在可以直接更新状态卡（网络可用）
ARIA_TOKEN=$(python3 -c "import json; d=json.load(open('/Users/dev_team_alpha/.openclaw/openclaw.json')); print(d['channels']['telegram']['accounts']['aria']['botToken'])")

SCRIPT='{"chat_id": -1003837566356, "message_id": 427, "text": "🎨 Aria · UI/UX Designer\n✅ 已完成：<内容>\n⏳ 进行中：<内容>\n🚧 阻塞：<内容或无>"}'

curl -s -X POST "https://api.telegram.org/bot${ARIA_TOKEN}/editMessageText" \
  -H "Content-Type: application/json" \
  -d "$SCRIPT"
```

**L2/L3 Fallback（所有路径失败时）：**
```bash
# L2: Bot API 发到自己的 topic（#aria #atlas 等）
# L3: 15min 无响应后 DM Victor (@okupup)
```

---

## 4. Communication Architecture (Post-Sandbox)

### Complete Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        POST-SANDBOX COMMUNICATION FLOW                        │
└──────────────────────────────────────────────────────────────────────────────┘

Task Completion Flow:
┌─────────┐     ┌────────────────────────────────────────────────────────────────────────┐
│ Agent   │────>│ 1. PRIMARY: openclaw agent --agent main --message "【任务完成】..."   │
│         │     │    ✅ Runs on host, reaches Gateway directly                          │
└─────────┘     └────────────────────────────────────────────────────────────────────────┘
                      │
                      v
              ┌───────────────┐
              │   Gateway     │───────────────────────────────────────────┐
              │ event queue   │                                           │
              └───────────────┘                                           │
                      │                                                   │
                      v                                                   v
          ┌───────────────────┐                               ┌───────────────────┐
          │ q receives        │                               │ sessions_send     │
          │ processes message │                               │ fallback           │
          └───────────────────┘                               └───────────────────┘
                      │                                                   │
                      v                                                   v
          ┌───────────────────┐                               ┌───────────────────┐
          │ q auto-handles:   │                               │ q receives same   │
          │ 1. tasks.sh update│                               │ (same outcome)    │
          │ 2. check blocked_on│                               └───────────────────┘
          │ 3. dispatch downstream │                                       │
          └───────────────────┘                                               │
                      │                                                       │
                      v                                                       │
          ┌───────────────────┐                                               │
          │ Update status card│                                               │
          │ (curl Bot API)    │                                               │
          └───────────────────┘                                               │
                                                                              │
              ┌───────────────────────────────────────────────────────────────┤
              │ L2/L3 Fallback (if both PRIMARY + sessions_send fail):       │
              │   • L2: curl Bot API to own topic                             │
              │   • L3: curl DM Victor after 15min                            │
              └───────────────────────────────────────────────────────────────┘
```

### q Auto-Handler (New SOP)

q must implement this handler for task completion:

```markdown
## Task Completion Handler (q auto-execute)

When receiving "【任务完成】<taskId> <summary>":

1. **Update TASKS.jsonl**
   ```bash
   bash ~/.openclaw/workspace/scripts/tasks.sh update <taskId> done "<summary>"
   ```

2. **Check downstream dependencies**
   ```bash
   bash ~/.openclaw/workspace/scripts/tasks.sh list | grep "blocked_on:${taskId}" | awk '{print $1}'
   ```
   If downstream tasks found (format: T-xxx blocked_on:T-yyy):
   - For each downstream task, send alert to its agent via sessions_send or openclaw agent

3. **Update status card**
   - Edit status card for completing agent via Bot API

4. **Confirm receipt**
   - Optional: sessions_send acknowledge to completing agent
```

### Agent Dispatch Restriction Enforcement

Agents MUST NOT dispatch to each other. Enforcement:

1. **Documentation**: AGENTS.md explicitly forbids it
2. **Tools check**: Add appropriate tool denials
3. **Testing**: Post-implementation verification

---

## 5. Risk Assessment & Mitigation

| Risk | Likelihood | Impact | Severity | Mitigation |
|------|------------|--------|----------|------------|
| Agent deletes critical files (esp. openclaw.json) | Low | Critical | 🔴 HIGH | 1. Keep backup before restart 2. Read-only where possible 3. q monitors activity |
| Agent misuses dispatch (dispatch loop A→B→A) | Medium | High | 🔴 HIGH | AGENTS.md explicitly forbids; q auto-handler enforces q as hub |
| Session lock contention (maxConcurrent=2) | Medium | Medium | 🟡 MEDIUM | Monitor queue; increase if needed |
| PATH/binary not found | Low | High | 🟡 MEDIUM | Pre-test; add wrapper script |
| Gateway crash during transition | Medium | High | 🔴 HIGH | Backup first; rollback ready; brief downtime acceptable |
| agents.edit AGENTS.md incorrectly | Medium | Medium | 🟡 MEDIUM | Use provided template; q reviews |
| Agent generates excessive network calls | Low | Medium | 🟡 MEDIUM | Token quotas enforce limits; monitor |
| Lost task state during restart | Low | High | 🟡 MEDIUM | Gateway auto-saves; TASKS.jsonl persisted |
| LLM model confusion (multiple agents) | Low | Low | 🟢 LOW | Each workspace has distinct AGENTS.md |

### Detailed Mitigations

**Risk: Agent deletes critical files**
```bash
# Pre-implementation
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.backup.$(date +%Y%m%d)
cp -r ~/.openclaw/agents ~/.openclaw/agents.backup.$(date +%Y%m%d)

# During: q keeps watch
# After: Verification tests confirm integrity
```

**Risk: Agent dispatch loop (violating hub model)**
```
Enforcement strategy:
1. AGENTS.md contains explicit violation rule
2. Agents cannot use "openclaw agent --agent <non-main>"
3. q monitors for agent→agent dispatch patterns

If rule violated:
- Agent receives warning in next turn
- Repeat violations require human review
```

**Risk: Gateway crash during transition**
```bash
# Rollback plan (see Section 6)
# Gateway restart takes ~10-30s
# No data loss (sessions persisted)
```

---

## 6. Rollback Plan

### Immediate Rollback (Within 1 hour of implementation)

If any critical issues detected:

```bash
# Step 1: Restore openclaw.json
cp ~/.openclaw/openclaw.json.backup.[TIMESTAMP] ~/.openclaw/openclaw.json

# Step 2: Restore AGENTS.md
for agent in ux architect frontend backend airag qa; do
  cp ~/.openclaw/workspace/backup-agents-md/${agent}.AGENTS.md.[TIMESTAMP] ~/.openclaw/workspace-${agent}/AGENTS.md
done

# Step 3: Restart Gateway
openclaw gateway restart

# Step 4: Verify
openclaw gateway status
```

### Partial Rollback (Agent by Agent)

If only one agent has issues:

```bash
# Restore specific agent config only
openclaw config patch agents.list.[agent].sandbox.mode [original value]
openclaw gateway restart
```

### Rollback Verification

```bash
# Verify
openclaw agent --agent ux --message "Check environment: whoami && which openclaw && curl -s https://api.telegram.org | head -1"
```

### Recovery Time Estimates

| Scenario | Time | Data Risk |
|----------|------|-----------|
| Full config rollback | 2-5 min | Minimal (backed up) |
| Partial agent rollback | 1-2 min per agent | Minimal |
| Gateway crash recovery | 30s-2min | None (auto-persisted) |

---

## 7. Estimated Timeline

| Phase | Task | Duration | Owner |
|-------|------|----------|-------|
| P1D1 | Backup current config + AGENTS.md | 15 min | Rex |
| P1D1 | Modify openclaw.json (sandbox off) | 30 min | Rex |
| P1D1 | Gateway restart + verify | 10 min | Rex |
| P2D1 | Test agents on host environment | 30 min | Rex + q |
| P2D2 | Update AGENTS.md (6 agents) | 60 min | Atlas + q |
| P2D2 | q AGENTS.md task completion handler | 30 min | Atlas |
| P2D2 | Final verification tests | 30 min | q + Rex |
| P3D3 | Monitor + confirm stable | Ongoing | All |

**Total estimated: 4-5 hours over 2-3 days**

---

## 8. Verification Checklist

Post-implementation, verify these for ALL 6 dev agents:

- [ ] `whoami` returns `dev_team_alpha` (or Gateway user)
- [ ] `/Users/dev_team_alpha/.nvm/versions/node/v24.14.0/bin/openclaw agent --agent main --message "test"` succeeds
- [ ] `which openclaw` returns valid path
- [ ] `curl -s https://api.telegram.org/bot/...` returns `{"ok":true,...}`
- [ ] `bash ~/.openclaw/workspace/scripts/tasks.sh list` executes
- [ ] Status card curl command executes successfully
- [ ] sessions_send still works (fallback)
- [ ] Agent cannot access openclaw.json (fs read limits)

---

## 9. Rollout Sequence

**Safe Sequence (one agent at a time):**

```bash
# Round 1: Single agent (architect - lowest risk)
# Verify each change before proceeding...

# Round 2: 2 agents (ux, backend)
# Round 3: 2 agents (frontend, airag)
# Round 4: Final agent (qa)
```

**Rollout criteria:**
- All verification checks pass for agent
- Agent completes at least 1 task via new flow
- No errors in Gateway logs

---

## 10. Success Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| Working communication mechanisms | 2/11 | 9/11 | T041 → T042 audit |
| openclaw agent dispatch success | N/A (sandbox) | 100% | Post-implementation test |
| Status card via curl | 0% (no network) | 100% | Agent can update own card |
| sessions_send fallback | 100% | 100% | Still works as fallback |
| Agent dispatch hierarchy violations | N/A | 0 | Monitoring |

---

## Appendix A: Complete openclaw.json Diff

See Section 3.1 for detailed diff. Complete config will be provided in `T042-openclaw-full.json` for reference.

## Appendix B: AGENTS.md Template Files

Generated in `~/.openclaw/workspace-shared/projects/nexture-website/docs/T042-agents-md-templates/`:
- `ux-AGENTS.md.template`
- `architect-AGENTS.md.template`
- `frontend-AGENTS.md.template`
- `backend-AGENTS.md.template`
- `airag-AGENTS.md.template`
- `qa-AGENTS.md.template`

## Appendix C: Test Scripts

Generated in `~/.openclaw/workspace-shared/projects/nexture-website/docs/T042-test-scripts/`:
- `test-sandbox-removed.sh` - Verify each agent
- `test-communication-flow.sh` - End-to-end test
- `rollback-config.sh` - Automated rollback

---

**Prepared by Atlas (architecture) and Rex (operations)**  
**Ready for Victor Review**
