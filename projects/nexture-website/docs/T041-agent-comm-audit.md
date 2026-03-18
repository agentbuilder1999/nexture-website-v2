# T041: Agent Communication System — Full Regression & Gap Analysis

> Author: Atlas (architect) | Date: 2026-03-17 | Status: Complete
> Sage verification: Partially completed (Sage session rate-limited at 1M tokens; sandbox tests verified directly by Atlas via docker runs)

---

## Executive Summary

**The agent communication system has a fundamental architectural contradiction: AGENTS.md instructs sandboxed agents to use host-level CLI commands (`openclaw agent`, `curl`, `bash tasks.sh`) that are physically impossible to execute from within their Docker sandboxes (network=none, no openclaw binary). The only working communication path for sandboxed agents is `sessions_send`, but this is documented as a secondary/backup mechanism.**

Of the 7 communication mechanisms audited, **2 work reliably, 3 are dead-letter (documented but impossible to execute), and 2 have never been used in practice.**

---

## 1. Current State Matrix

| # | Mechanism | Documented? | Implemented? | Tested? | Working in Practice? | Notes |
|---|-----------|:-----------:|:------------:|:-------:|:-------------------:|-------|
| 1 | `openclaw agent --agent <id> --message` (dispatch) | ✅ AGENTS.md | ✅ Gateway CLI | ✅ | ⚠️ **q only** | Only q (sandbox=off) can execute. Sandboxed agents cannot. |
| 2 | `sessions_send` tool (report back) | ✅ alsoAllow config | ✅ Gateway tool | ✅ | ✅ **Works** | Gateway-side tool, no network needed. All agents have it. |
| 3 | `message` tool (Telegram send) | ✅ AGENTS.md | ✅ Gateway tool | ❌ | ⚠️ **4 of 6 agents** | Finn + Nova have `deny: group:messaging`. Others have it. |
| 4 | `curl` Bot API (status card update) | ✅ AGENTS.md | N/A (raw HTTP) | ❌ | ❌ **Broken** | Requires network. Sandbox has network=none. Dead letter. |
| 5 | `bash tasks.sh update` (task ledger) | ✅ AGENTS.md | ✅ Host script | ❌ | ❌ **Broken** | tasks.sh not in sandbox. /workspace/scripts/ doesn't exist in container. |
| 6 | `[[DISCUSS:agent_id]]` protocol | ✅ AGENTS.md + rules.md | ⚠️ SOP only | ❌ | ❌ **Never used** | Protocol exists on paper. Zero executions in production. |
| 7 | `[TEAM-DISCUSS]` protocol | ✅ AGENTS.md + rules.md | ⚠️ SOP only | ❌ | ❌ **Never used** | Same — documented, never triggered. |
| 8 | 3-level fallback (L1→L2→L3) | ✅ comms-spec-v2 | ⚠️ L1 only | ❌ | ⚠️ **L1 only** | L2 (Bot API) and L3 (DM Victor) require network. Only L1 works. |
| 9 | Heartbeat wake | ✅ Config | ✅ Gateway | ✅ | ✅ **Works** | 55min cycle, activeHours 08:00-22:00 |
| 10 | Cron systemEvent (task-monitor) | ✅ Cron config | ✅ Gateway | ✅ | ✅ **Works** | */15 systemEvent, detects stale tasks/locks/fallbacks |
| 11 | Cross-agent handoff | ❌ No formal spec | ❌ | ❌ | ❌ **No mechanism** | No auto-notification when Agent A completes for Agent B |

---

## 2. Gap Analysis

### GAP-1 (CRITICAL): Sandbox vs. AGENTS.md Protocol Mismatch

**The Problem:**
All 6 dev agents run in Docker sandbox with `network=none` and `capDrop=ALL`. Their AGENTS.md `回报协议` section instructs them to:

```bash
# This CANNOT work from inside sandbox:
openclaw agent --agent main --message "【任务完成】..."  # No openclaw binary in container
bash ~/.openclaw/workspace/scripts/tasks.sh update ...    # No tasks.sh in container
```

**Evidence (verified via docker run):**
- `openclaw` binary: NOT FOUND in nexture-sandbox:v1
- `tasks.sh` path: `/workspace/scripts/` does NOT EXIST in container
- Network: ALL outbound blocked (curl, wget, Python urllib — all fail)
- `/workspace-shared/TASKS.jsonl`: readable via ro bind mount ✅

**What Actually Works:**
- `sessions_send` tool → YES (Gateway-side, no network needed)
- `message` tool → YES for 4/6 agents (ux, architect, backend, qa); DENIED for Finn, Nova
- `read /workspace-shared/TASKS.jsonl` → YES (ro mount)
- Everything requiring network or host binaries → NO

**Impact:** Every time q dispatches a task to a dev agent, the agent's documented reporting flow is broken. The agent can only use `sessions_send` — but AGENTS.md lists it nowhere in the 回报协议 section.

### GAP-2 (CRITICAL): No Cross-Agent Handoff Mechanism

**The Problem:**
When Agent A finishes work that Agent B depends on, there is no mechanism for:
1. Agent A to notify Agent B directly (agents cannot dispatch to each other)
2. Agent A to update a shared state that Agent B monitors
3. The system to automatically wake Agent B when Agent A's task completes

**Current workaround:** Agent A → sessions_send → q → q manually dispatches Agent B. This requires q to be active and paying attention. If q is idle (between heartbeats), the handoff stalls for up to 55 minutes.

**What's needed:** A task completion event that triggers downstream dispatch. OpenClaw hooks system supports lifecycle events, but no `task:completed` hook exists. The hooks available (boot-md, bootstrap-extra-files, command-logger, session-memory) are all session-lifecycle oriented, not task-oriented.

### GAP-3 (HIGH): 3-Level Fallback is 1-Level in Practice

**The Problem:**
The comms-spec-v2 defines:
- L1: `sessions_send` → q ✅ Works
- L2: Bot API curl → own topic ❌ Requires network (sandbox blocks)
- L3: DM Victor after 15min ❌ Requires network (sandbox blocks)

**For sandboxed agents, L2 and L3 are impossible.** If sessions_send fails (q session crashed, rate-limited), there is zero fallback. The agent is silently stuck.

**Exception:** Finn has `network: "bridge"` in sandbox config, so Finn CAN do L2/L3. But Finn also has `deny: group:messaging`, creating a different blocker.

### GAP-4 (HIGH): Discussion Protocols Are Dead Letter

**Root cause analysis — why [[DISCUSS]] and [TEAM-DISCUSS] have never been used:**

1. **Structural impossibility**: [[DISCUSS]] requires q to detect the tag in an agent's reply, then route to target agent. But agents reply via `sessions_send` (text injection into q's session), and q would need to parse inbound text for `[[DISCUSS:...]]` patterns during an active turn. There is no automated tag detection — q would need to manually notice the tag and act on it.

2. **No trigger mechanism**: The protocol assumes agents write `[[DISCUSS:agent_id]]` in their topic messages. But agents are sandboxed and cannot post to Telegram topics (no network, no curl). They can only `sessions_send` to q. The tag arrives as plain text in q's session, with no special handling.

3. **Cost deterrent**: Atlas costs ~$0.15/round, max 3 rounds. Most questions are easier to resolve by q making a unilateral decision than by paying $0.45+ for a 3-round discussion. The economic incentive actively discourages use.

4. **Missing orchestration layer**: [TEAM-DISCUSS] requires parallel dispatch to all agents, collection of responses within 90s, summarization, and conflict resolution. This is a multi-step orchestration workflow that q must execute manually. No automation exists for any step.

### GAP-5 (MEDIUM): Status Card Updates Are Broken

**The Problem:**
AGENTS.md contains detailed `curl` commands for each agent to update their status card (editMessageText). All require HTTP access to `api.telegram.org`. No sandboxed agent can execute these.

**Impact:** Status cards are never updated by agents. Only q (unsandboxed) updates them manually.

### GAP-6 (MEDIUM): task_monitor Detects But Cannot Act

**The Problem:**
task_monitor.py (systemEvent in q's main session) detects stale tasks, dead sessions, stale locks, and model fallbacks. But it can only:
- Print alerts to q's session output
- Send Telegram notifications (via q's unsandboxed context)

It cannot:
- Auto-dispatch to blocked agents
- Auto-reassign stale tasks
- Wake idle agents to resume work
- Trigger cross-agent handoffs

It's a **passive monitor**, not an **active orchestrator**.

### GAP-7 (LOW): TASKS.jsonl Write Access

Agents can READ `/workspace-shared/TASKS.jsonl` (ro mount) but cannot WRITE to it. The `tasks.sh update` command runs on the host. This means agents cannot update their own task status — only q can.

---

## 3. Root Cause Analysis

### Architectural Root Cause
The communication system was designed with an implicit assumption that agents run on the host (or at least have network access). The sandbox isolation (network=none) was added later for security, but the communication protocols were never updated to account for the restricted environment.

### Specific Root Causes by Gap

| Gap | Root Cause |
|-----|-----------|
| GAP-1 | AGENTS.md 回报协议 written before sandbox enforcement; never updated for sandbox reality |
| GAP-2 | OpenClaw has no task-completion event/hook; task lifecycle is external (TASKS.jsonl) not platform-native |
| GAP-3 | L2/L3 fallback designed for unsandboxed agents; sandbox made them impossible |
| GAP-4 | Discussion protocol requires multi-step orchestration that no automation supports; pure SOP without tooling |
| GAP-5 | Status card curl commands require network; sandbox blocks all HTTP |
| GAP-6 | task_monitor is a detection tool, not an orchestration engine |
| GAP-7 | TASKS.jsonl is on host; sandbox has ro mount only |

### The Fundamental Design Tension
**Security (sandbox isolation) and Communication (inter-agent coordination) are in direct conflict.** The current architecture chose security (rightly), but never adapted the communication layer to work within those constraints.

---

## 4. Optimization Proposals (Prioritized by Impact)

### P0: Fix the Reporting Protocol (Immediate — config + docs only)

**Problem:** AGENTS.md tells agents to use impossible commands.
**Fix:** Rewrite all dev agent AGENTS.md 回报协议 to use ONLY tools that work in sandbox:

```markdown
## 回报协议（sandbox-compatible）

### Task Completion
1. sessions_send → q (sessionKey: agent:main:main)
   Message: "【任务完成】<taskId> <summary>"
2. q updates TASKS.jsonl on host (agent cannot write)

### Task Blocked  
1. sessions_send → q (sessionKey: agent:main:main)
   Message: "【阻塞】<taskId> <reason> blocked_on:<T-xxx>"
2. q updates TASKS.jsonl on host

### Status Card
- Agent CANNOT update status card (no network)
- Include status update request in sessions_send message
- q updates status card on behalf of agent
```

**Effort:** 1 hour (update 6 AGENTS.md files)
**Impact:** Fixes the most fundamental broken flow

### P1: Implement q-side Auto-Orchestration (This Sprint)

**Problem:** q must manually detect task completion and dispatch downstream work.
**Fix:** Add a task completion handler to q's AGENTS.md/HEARTBEAT.md:

```markdown
## Task Completion Handler (q auto-execute on sessions_send receipt)
When receiving "【任务完成】<taskId>":
1. Run: tasks.sh update <taskId> done "<summary>"
2. Check: tasks.sh list | grep blocked_on:<taskId>
3. If downstream tasks found: openclaw agent --agent <blocked_agent> --message "Dependency <taskId> completed. Resume your task."
4. Update status card for completing agent
```

This makes q the orchestration hub — receiving completion notifications and auto-dispatching downstream work. No platform changes needed; just SOP in q's workspace.

**Effort:** 2 hours (q AGENTS.md update + HEARTBEAT.md checklist)
**Impact:** Solves cross-agent handoff (GAP-2) and makes q a reactive orchestrator

### P2: Consolidate to sessions_send-Only Communication (This Sprint)

**Problem:** Multiple communication channels documented, only one works.
**Fix:** 
- Remove ALL `curl` Bot API commands from dev agent AGENTS.md
- Remove ALL `openclaw agent --agent main` from dev agent AGENTS.md  
- Remove ALL `bash tasks.sh` from dev agent AGENTS.md
- Make `sessions_send` the single, canonical communication tool for sandboxed agents
- q handles all host-side operations (tasks.sh, curl, openclaw agent dispatch)

3-level fallback becomes:
- L1: `sessions_send` → q (only reliable path)
- L2: If sessions_send fails, agent includes failure in next turn's output (passive)
- L3: task_monitor detects stale task after 15min, alerts q

**Effort:** 1 hour (AGENTS.md cleanup)
**Impact:** Eliminates confusion, dead-letter commands, and false expectations

### P3: Discussion Protocol — Decide: Fix or Remove (Next Sprint)

**Problem:** [[DISCUSS]] and [TEAM-DISCUSS] exist only on paper.
**Options:**

**Option A: Build Real Automation** (~$5-10 token cost per Sprint)
- Create a cron job or q heartbeat check that parses inbound sessions_send messages for `[[DISCUSS:...]]` tags
- Auto-route to target agent via `openclaw agent`
- Track round counts in TASKS.jsonl
- Build [TEAM-DISCUSS] as a q-side script that parallel-dispatches and collects

**Option B: Remove and Simplify** (Recommended)
- Remove [[DISCUSS]] and [TEAM-DISCUSS] from all AGENTS.md
- Replace with: "Need input from another agent? Tell q in your sessions_send. q will route."
- This is what actually happens today. Formalizing reality is cheaper than building automation for a protocol nobody uses.

**Effort:** Option A: 1 Sprint. Option B: 1 hour.
**Impact:** Eliminates dead-letter protocols; Option B reduces AGENTS.md complexity

### P4: Message Tool for Status Cards (Next Sprint)

**Problem:** Agents can't update status cards via curl, but 4/6 agents have `message` tool access.
**Fix:** 
- Grant `message` tool to Finn and Nova (remove from deny lists)
- Update AGENTS.md status card section to use `message` tool instead of `curl`:

```
message(action="edit", messageId="437", channel="telegram", message="🔍 Sage · QA\n✅ Done: T041\n⏳ None\n🚧 None")
```

Note: This requires verification that the `message` tool supports `editMessageText` equivalent with `message_thread_id` targeting. If not, this remains a q-only operation.

**Effort:** 2 hours (config + testing)
**Impact:** Restores agent self-service for status cards

### P5: Enhanced task_monitor with Auto-Dispatch (Future)

**Problem:** task_monitor detects issues but cannot act.
**Fix:** Convert task_monitor from passive alerter to active orchestrator:
- On detecting stale `in_progress` task → `openclaw agent --agent <id> --message "Your task <id> appears stalled. Status?"`
- On detecting `blocked` task with completed dependency → auto-dispatch wake
- On detecting dead session → auto-cleanup and re-dispatch

**Effort:** 1 Sprint (Rex implements)
**Impact:** Self-healing task system; reduces q's manual orchestration burden

---

## 5. Sage Verification Results

Sage was dispatched via `openclaw agent --agent qa` for sandbox capability verification. Sage's session was rate-limited (1M+ tokens consumed today, model returned timeout). 

**Atlas conducted direct verification instead:**

| Test | Method | Result |
|------|--------|--------|
| `openclaw` binary in sandbox | `docker run nexture-sandbox:v1 which openclaw` | ❌ NOT FOUND |
| `tasks.sh` in sandbox | `docker run nexture-sandbox:v1 ls /workspace/scripts/` | ❌ NOT FOUND |
| Network from sandbox | `docker run --network=none nexture-sandbox:v1 curl ...` | ❌ BLOCKED |
| `/workspace-shared/TASKS.jsonl` readable | `docker run -v ... cat /workspace-shared/TASKS.jsonl` | ✅ READABLE |
| `nsenter/unshare/mount/chroot` in sandbox | Tested with `--cap-drop=ALL` | ❌ All blocked (Operation not permitted) |
| `sessions_send` as Gateway tool | Config check: `alsoAllow: ['sessions_send']` | ✅ ALL agents have it |

---

## 6. Immediate Action Items

| Priority | Action | Owner | Effort |
|----------|--------|-------|--------|
| 🔴 P0 | Rewrite all dev agent AGENTS.md 回报協議 for sandbox-only tools | q | 1h |
| 🔴 P1 | Add task completion handler to q's AGENTS.md (auto-dispatch downstream) | q + Atlas | 2h |
| 🟡 P2 | Remove all dead-letter commands (curl, openclaw agent, tasks.sh) from dev AGENTS.md | q | 1h |
| 🟡 P3 | Decision: remove [[DISCUSS]]/[TEAM-DISCUSS] or build automation | Victor | 30min decision |
| 🟢 P4 | Grant `message` tool to Finn/Nova; test status card via message tool | q + Sage | 2h |
| 🟢 P5 | Enhance task_monitor to auto-dispatch on dependency completion | Rex | 1 Sprint |

---

## Appendix A: Communication Flow Diagrams

### Current (Broken) Flow
```
Agent completes task
  → tries openclaw agent --agent main (FAILS: no binary)
  → tries bash tasks.sh update (FAILS: no script)
  → tries curl Bot API (FAILS: no network)
  → if agent knows to use sessions_send → works
  → if agent follows AGENTS.md literally → silent failure, q never knows
```

### Proposed (Fixed) Flow
```
Agent completes task
  → sessions_send → q: "【任務完成】T-xxx summary"
  → q auto-handles:
      1. tasks.sh update T-xxx done
      2. Check blocked_on:T-xxx → dispatch downstream agents
      3. Update status card for completing agent
      4. Acknowledge receipt to agent
```

### Cross-Agent Handoff (Proposed)
```
Agent A finishes T-001 (Agent B's T-002 blocked_on T-001)
  → A: sessions_send → q: "【任務完成】T-001 done"
  → q: tasks.sh update T-001 done
  → q: tasks.sh list | grep blocked_on:T-001 → finds T-002 (Agent B)
  → q: openclaw agent --agent B --message "T-001 done. Resume T-002."
  → B wakes, continues work
```
