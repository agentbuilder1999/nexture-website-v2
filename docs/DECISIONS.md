# DECISIONS.md — 团队决策记录

---

## 2026-03-12 · Agent 配置优化审阅

**发起人**: Victor
**审阅人**: q + Atlas
**状态**: ✅ 已执行

### 背景
2026-03-11 Victor 发起全员配置优化征集，6 个 agent 提交共 38 条建议。因模型临时降级 haiku 暂停审阅。2026-03-12 模型恢复后，q + Atlas 联合审阅并执行。

### 审阅结果
- ✅ 采纳: 26 条
- ⚠️ 修改后采纳: 10 条
- ❌ 拒绝: 2 条

### Config 变更（openclaw config set）

| Agent | Model | wsAccess | 其他 |
|-------|-------|----------|------|
| Aria (ux) | haiku→sonnet | none→rw | — |
| Atlas (architect) | haiku→opus | 保持none | deny+4项(browser/canvas/nodes/tts), memExtra+theraseus/docs |
| Finn (frontend) | haiku→sonnet | none→rw | — |
| Rex (backend) | haiku→sonnet | none→rw | — |
| Nova (airag) | 保持haiku | 保持none | 任务分级写入SOUL |
| Sage (qa) | 保持haiku | none→rw | 限定workspace-qa可写 |

### 文件变更（SOUL/IDENTITY/TOOLS）

| Agent | 变更 |
|-------|------|
| Aria | +双轨视角(医生/客户), +设计参考更新规则, +TOOLS补齐(web_search/peekaboo/browser) |
| Atlas | +协作边界(不直接派任务), IDENTITY补TheraSeus Chief Architect |
| Finn | +交付物标准(Lighthouse>90/截图对标/首屏<2s), +TOOLS补browser/peekaboo |
| Rex | +故障诊断流程(6步), +TOOLS补exec/docker/aws |
| Nova | +职责边界(vs Rex), +实验记录模板, +模型分级策略, +TOOLS补wandb/jq/docker |
| Sage | +P0回归权限, +讨论风格补充, +冒烟预检流程, +医疗测试指标, +TOOLS write权限 |

### 拒绝项

| Agent | 建议 | 理由 |
|-------|------|------|
| Finn | screenshot-verify skill | 已有 peekaboo 可复用 |
| Nova | dataset-inspect skill 扩展 | 仅单人使用，放 scripts/ 即可 |

### 修改项要点

1. Aria 设计参考更新需 q 审批后才写入 shared
2. Finn 设计交接统一写入 AGENTS.md checkpoint
3. Rex docker 仅 CLI 调用（非 DinD），git 规范统一到 CONVENTIONS.md
4. Nova 安装包改为 docker 镜像预装
5. Sage write 限定 workspace-qa，医疗指标需与 Atlas FDA 要求对齐

### 成本影响
- Finn/Rex haiku→sonnet: +~$80-100/月
- Nova/Sage 保持 haiku: 节省 ~$20/月
- 净增: ~$60-80/月
