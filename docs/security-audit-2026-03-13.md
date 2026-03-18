# OpenClaw Security Audit Report
**Date:** 2026-03-13  
**Auditor:** Rex (backend)  
**Scope:** Full OpenClaw deployment — channel security, gateway, sandbox, secrets, cron, agent permissions, file permissions, LaunchAgent services  
**Account:** AWS 399699944899 | Host: macOS Darwin 25.3.0 (arm64)

---

## Executive Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 2 |
| 🟠 High     | 3 |
| 🟡 Medium   | 4 |
| 🟢 Low / Info | 5 |

**Immediate action required on 2 critical items.**

---

## 🔴 Critical Issues

### C1 — AWS IAM credentials hardcoded in openclaw.json (docker env)

**Location:** `agents.defaults.sandbox.docker.env`  
**Detail:**  
```
AWS_ACCESS_KEY_ID:     AKIAV2D7...4DPE  (plaintext, 20 chars)
AWS_SECRET_ACCESS_KEY: GUmXb4z7...RmPo  (plaintext, 40 chars)
```
`openclaw.json` is a single config file containing **all 7 bot tokens + AWS long-term IAM key pair in plaintext**. If this file is accidentally committed to git, shared, or read by a compromised agent, the entire AWS account is exposed.

**Impact:** Full AWS account takeover. IAM long-term keys have no automatic expiry.

**Fix:**
1. Remove credentials from `openclaw.json` immediately
2. Replace with IAM role (preferred on EC2/ECS) or AWS profile reference:
   ```json
   "env": {
     "AWS_REGION": "us-east-1",
     "AWS_PROFILE": "theraseus-bedrock",
     "CLAUDE_CODE_USE_BEDROCK": "1"
   }
   ```
3. Rotate the exposed key pair now (even if not leaked, treat as compromised by principle)
4. Use `~/.aws/credentials` (already mode 0o600) as the auth source instead

---

### C2 — exec-approvals wildcard `*` pattern for global default and main agent

**Location:** `~/.openclaw/exec-approvals.json`  
```json
"agents": {
  "*":    { "allowlist": [{"pattern": "*", ...}] },
  "main": { "allowlist": [..., {"pattern": "*", lastUsedCommand: "echo ..."}] }
}
```
The global `*` entry means **every agent** (including any future compromised sub-agent) can run **any shell command** without approval. The `main` agent also has an unconditional `*` wildcard added after a `switching to elevated full` operation.

**Impact:** Any agent that receives a crafted prompt can run arbitrary OS commands, exfiltrate data, or modify system files — no approval required.

**Fix:**
1. Remove the `*` wildcard from the global `"*"` entry
2. Remove the `*` wildcard from `main` (keep only explicit script paths)
3. Set `defaults.askFallback` from `"allow"` → `"deny"` to fail-safe on unknown commands
4. After cleanup, test that critical scripts still work via their explicit allowlist entries

---

## 🟠 High Issues

### H1 — `defaults.askFallback = "allow"` (fail-open on unknown commands)

**Location:** `exec-approvals.json` → `defaults.askFallback`  
**Detail:** When a command doesn't match any allowlist entry and the approval socket is unreachable, the system **allows execution** rather than blocking. This is a fail-open design.

**Fix:** Change to `"deny"`. Acceptable unknown commands should be explicitly allowlisted. This is a one-line config change with no operational impact if allowlists are complete.

---

### H2 — Nova and Sage `allowFrom` not set in openclaw.json (only in credentials file)

**Location:** `channels.telegram.accounts.nova` and `.sage`  
**Detail:**
- `groupPolicy: "allowlist"` is set ✅
- But `allowFrom` field is **absent** from `openclaw.json` itself
- Actual `allowFrom: ["6663682303"]` lives in separate credential files (`~/.openclaw/credentials/telegram-{nova,sage}-allowFrom.json`)

If gateway loads `openclaw.json` first and credential files fail to load (e.g., permissions issue, restart race), Nova and Sage bots would temporarily accept messages from **any Telegram user**.

**Fix:** Confirm gateway always loads credential files before accepting messages; add startup validation that rejects bot activation if `allowFrom` is unresolved. Consider merging into openclaw.json directly.

---

### H3 — `nodes.denyCommands: []` (no node command restrictions)

**Location:** `gateway.nodes.denyCommands`  
**Detail:** Paired nodes (mobile/device) have zero command restrictions. Any paired node can issue any command to the gateway's exec surface.

**Fix:** Populate with a deny list of high-risk patterns at minimum:
```json
"denyCommands": ["rm -rf", "sudo", "chmod 777", "curl * | sh", "wget * | sh"]
```
Or switch to an allowlist model if node commands are predictable.

---

## 🟡 Medium Issues

### M1 — All 7 bot tokens stored plaintext in openclaw.json

**Detail:** 7 Telegram bot tokens (len=46 each) are stored in openclaw.json alongside the AWS secret. While `openclaw.json` is mode `0o600` ✅, a single file exfiltration exposes all bots simultaneously.

**Risk:** Token revocation requires rotating all 7 bots at once if the file is compromised.

**Recommendation:** Consider externalizing tokens to `~/.openclaw/credentials/` (already used for Nova/Sage allowFrom) or use a secrets manager. Not blocking but improves blast radius containment.

---

### M2 — `frontend` and `airag` agents have no `tools.deny` restrictions

**Detail:**
- `frontend`: `deny=[]` — can use `exec`, `web_fetch`, `browser`, `nodes`, etc.
- `airag`: `deny=[]` — same unrestricted toolset
- Compare: `architect` has `deny=['apply_patch', 'browser', 'canvas', 'nodes', 'tts']`

**Risk:** Frontend agent (Finn) running browser automation + exec with no restrictions is a wider attack surface than necessary for a UI-focused role.

**Recommendation:**
- `frontend`: deny `['nodes', 'tts', 'canvas']` at minimum
- `airag`: deny `['browser', 'nodes', 'tts']` — AI/RAG work doesn't need these

---

### M3 — `main` agent inherits defaults sandbox (no explicit scope override)

**Detail:** `main` agent has no sandbox override, meaning it uses `scope=shared` and `workspaceAccess=ro` from defaults. However, main is the orchestrator — it should have the most **explicitly defined** permissions, not fall back to defaults.

**Risk:** If defaults change (e.g., a future config update bumps `workspaceAccess` to `rw`), main silently gains write access.

**Recommendation:** Add an explicit sandbox block for `main`:
```json
{"scope": "workspace", "workspaceAccess": "rw", "workspaceRoot": "~/.openclaw/workspace"}
```

---

### M4 — `trustedProxies` includes `192.168.1.0/24` (LAN subnet)

**Location:** `gateway.trustedProxies`  
**Detail:** The entire `192.168.1.0/24` LAN subnet is trusted for proxy headers (`X-Forwarded-For` etc.). Any device on the local network can spoof the source IP seen by the gateway.

**Risk:** IP-based access controls or rate limiting could be bypassed by LAN devices.

**Recommendation:** If no reverse proxy runs on the LAN, remove `192.168.1.0/24` and keep only `127.0.0.1`.

---

## 🟢 Low / Info (Verified OK)

### L1 — Gateway port binding ✅
Port 18789 binds exclusively to `127.0.0.1` and `::1` (loopback only). Confirmed via `lsof`:
```
TCP 127.0.0.1:18789 (LISTEN)
TCP [::1]:18789 (LISTEN)
```
Not externally reachable. ✅

### L2 — Gateway auth token strength ✅
`gateway.auth.token`: 48-char hex string = ~192 bits entropy. Well above the 128-bit minimum. ✅

### L3 — File permissions ✅
| File | Mode | Status |
|------|------|--------|
| `~/.openclaw/openclaw.json` | `0o600` | ✅ owner-only |
| `~/.openclaw/` directory | `0o700` | ✅ owner-only |
| `~/.openclaw/credentials/` | `0o700` | ✅ owner-only |
| `~/.openclaw/config-backups/*.json` | `0o600` | ✅ owner-only |
| `~/.aws/credentials` | `0o600` | ✅ owner-only |
| Gateway plist Umask | `63` (0o077) | ✅ restrictive |

### L4 — Telegram channel allowFrom (5/7 agents) ✅
aria, atlas, finn, rex, default — all have `groupPolicy=allowlist` + `allowFrom=['tg:6663682303']` correctly configured. ✅  
nova and sage — functional via credentials files, see H2.

### L5 — LaunchAgent services ✅
- `ai.openclaw.gateway.plist`: `RunAtLoad=true`, `KeepAlive=true`, Umask=0o077. No sensitive env vars in plist (credentials not in plist, correctly read from config). ✅
- `com.openclaw.config-backup.plist`: runs at 03:00 daily, `RunAtLoad=false`. No sensitive data. ✅
- No system-level (`/Library/LaunchAgents/`) OpenClaw services. ✅

---

## Remediation Priority

| Priority | Item | Owner | Effort |
|----------|------|-------|--------|
| 🔴 P0 immediate | C1: Rotate AWS IAM key + remove from openclaw.json | Rex + Victor | 30min |
| 🔴 P0 immediate | C2: Remove `*` wildcard from exec-approvals + set askFallback=deny | q | 15min |
| 🟠 P1 this week | H1: Set askFallback=deny | q | 5min |
| 🟠 P1 this week | H2: Validate Nova/Sage allowFrom load order | q/Atlas | 1h |
| 🟠 P1 this week | H3: Populate nodes.denyCommands | q | 15min |
| 🟡 P2 next sprint | M1: Externalize bot tokens to credentials/ | q | 2h |
| 🟡 P2 next sprint | M2: Add tools.deny for frontend + airag | q | 15min |
| 🟡 P2 next sprint | M3: Explicit main sandbox config | q | 15min |
| 🟡 P2 next sprint | M4: Remove 192.168.1.0/24 from trustedProxies | q | 5min |

---

## Notes

- **Docker sandbox** (`nexture-sandbox:v1`): `readOnlyRoot=true`, `network=none`, `capDrop=ALL`, `user=1000:1000` — these are strong defaults. The only gap is the AWS credentials injected via env vars (C1).
- **Cron jobs**: reviewed 1 job (`jobs.json` — appeared to be a wrapper). Insufficient detail to audit individual cron job security; recommend follow-up review of all 4 active cron jobs' payload content.
- **Sandbox `scope=shared`**: all non-main agents use shared sandbox scope. This means agents share the same sandbox filesystem view. Combined with `workspaceAccess` settings this is acceptable, but worth monitoring as agent count grows.

---

*Report generated by Rex (⚙️ backend) — 2026-03-13*  
*Tools used: openclaw.json inspection, exec-approvals.json, lsof, LaunchAgent plist review, credentials directory audit*
