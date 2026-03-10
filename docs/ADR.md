# Architecture Decision Records (ADR)
> 记录 Nexture 团队关键架构决策，防止未来重复讨论。

---

## ADR-001: Mac = 开发节点，云端 = 执行节点
**日期**: 2026-03-09  
**状态**: 已确认

**决策**: Mac Mini 作为 AI agent 开发节点，负责代码生成、规划、编排。训练、推理、部署运行在云端 GPU 服务器。

**理由**: Mac arm64 无 NVIDIA CUDA，不适合 PyTorch 训练；Mac 24GB RAM 用于 OpenClaw 多 agent 并发；云端按需付费，避免本地资源浪费。

**影响**: Mac sandbox 不安装 opencv/ultralytics/torch 等运行时依赖，只安装 SDK 客户端和代码工具。

---

## ADR-002: 全 AWS Bedrock 模式，零现金支出
**日期**: 2026-03-09  
**状态**: 已确认

**决策**: 所有 LLM 调用（含 Claude Code）走 AWS Bedrock，消耗 $5000 额度。

**理由**: 避免 Claude Max 订阅费；$5000 额度可支撑 30+ 个中型项目；Bedrock 提供企业级 SLA。

**影响**: Claude Code 使用 `CLAUDE_CODE_USE_BEDROCK=1` + AWS IAM 凭证，无需 OAuth 挂载。

---

## ADR-003: sandbox.scope = shared
**日期**: 2026-03-09  
**状态**: 已确认

**决策**: 所有 worker agent 共用一个 sandbox 容器（scope: shared），而非每 session 独立容器。

**理由**: 节省内存（~800MB/agent）；符合 NEXTURE_TEAM.md 设计；worker 间可共享 /workspace 文件系统。

**影响**: 需要 gateway restart 后生效。

---

## ADR-004: Ollama Qwen-2.5-7B 专供 Sage
**日期**: 2026-03-09  
**状态**: 已确认

**决策**: 本地 Ollama 模型仅供 Sage (QA) 使用，其他 agent 全走 Bedrock。

**理由**: Sage 执行量大（测试/日志分析）但决策简单，本地推理零成本；其他 agent 需要更强推理能力。

**影响**: Ollama 必须常驻（brew services start ollama），冷启动会造成 Sage 超时。

---

## ADR-005: Telegram Forum Topics 多 agent 路由
**日期**: 2026-03-09  
**状态**: 已确认

**决策**: 使用单个 Forum Group + 多 Bot Token + topic 路由，替代多个独立群组方案。

**理由**: 保持对话上下文集中；Victor 只需管理一个群组；topic → agentId 路由配置清晰。

**关键配置**: group config 必须在 `channels.telegram.accounts.nexture.groups` 下，顶层 `groups` 在 multi-account 模式下被忽略（源码验证）。

---

## ADR-006: 医疗 AI 架构分层
**日期**: 2026-03-09  
**状态**: 草案

**决策（待确认）**: 
- 数据采集/预处理：云端批处理
- 超分辨率（Real-ESRGAN）→ 检测（YOLOv8-x）→ 分割（SAM2）：云端 GPU pipeline
- 报告生成：Qwen2.5:7b 本地（已有）
- 标注：Roboflow SDK（云端）

**待决策**: 云端服务商选型（AWS/GCP/RunPod）；是否自建推理服务或用托管 API。

---

## ADR-007: Nova 能力升级 — AI/ML Engineer
**日期**: 2026-03-10
**状态**: 已确认

**决策**: Nova 从 "AI/RAG Engineer" 升级为 "AI/ML Engineer"，覆盖模型训练、评估、MLOps、数据 pipeline、AWS SageMaker。

**理由**: TheraSeus™ 需要完整 ML 工程能力（训练 YOLOv8/SAM2/EfficientNet），现有 agent 中无人覆盖。扩展 Nova 优于新增 agent（保持 max 3 concurrent workers 约束）。

**影响**: Nova AGENTS.md 扩展；RAG 能力保留，新增训练/MLOps/SageMaker。

---

## ADR-008: Rex 能力升级 — AWS Cloud Ops
**日期**: 2026-03-10
**状态**: 已确认

**决策**: Rex 升级为 "Backend Engineer + AWS Cloud Ops"，新增 EC2/ECS/S3/RDS/IAM/KMS/CloudWatch/CloudTrail 和 HIPAA 合规架构能力。

**理由**: TheraSeus™ 需要 HIPAA 合规云架构；nexture.nz 需要 Vercel/AWS 部署。Rex 已有 DevOps 基础，AWS 运维是自然延伸。IaC 优先（CDK/Terraform），禁止手动 Console 操作。

**关注点**: Rex 兼任 Backend + Cloud Ops 工作量较重，若 TheraSeus 项目规模扩大，考虑拆分出独立 DevOps agent。
