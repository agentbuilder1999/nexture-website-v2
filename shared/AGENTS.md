
## Telegram Topic 消息规范（2026-03-12 Victor 授权固化）

### 🔴 核心规则

**agent 之间通信 / q 派发任务 → 内部路由：**
```bash
openclaw agent --agent <agentId> --message "<内容>"
```

**禁止：用其他 agent 的 bot token 或 default token 发到不属于自己的 topic**

### Bot Token → Topic 对应表

| Account | 只能发消息到 |
|---------|------------|
| `default` (q) | topic 1, 263, 368, 369 |
| `aria` | topic 8 |
| `atlas` | topic 10 |
| `finn` | topic 12 |
| `rex` | topic 14 |
| `nova` | topic 16 |
| `sage` | topic 18 |

每个 agent 只能用自己的 token 在自己的 topic 发消息。
