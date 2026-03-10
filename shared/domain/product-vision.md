# Product Vision — Nexture / TheraSeus™

## Nexture
新西兰医疗 AI 公司，专注胃肠道内镜 AI 辅助诊断。

## TheraSeus™ MVP
**核心理念：医生为中心，AI 是助手。**

### 解决的问题
胶囊内镜每次检查产生 5-8 万张图片，医生需要数小时逐帧审阅。
TheraSeus 通过 AI 分类过滤，将医生需要审阅的帧减少 60%+，不遗漏有临床意义的帧。

### 核心原则
1. **非破坏性**：任何图片永远不删除，AI 只做分类标签
2. **医生控制**：AI 灵敏度可调（保守/标准/激进），医生最终决策
3. **工作流优先**：先优化审片效率（Phase 1），后增强病灶识别（Phase 2）

### 目标用户
- 消化科/放射科医生（核心用户）
- 医院/诊所采购负责人（决策者）

### 技术栈
- 前端：Next.js + TypeScript
- 后端：FastAPI + PostgreSQL（AWS RDS）
- AI：EfficientNet 分类 + YOLOv8 检测（AWS EC2/SageMaker）
- 存储：AWS S3（加密）
- 合规：HIPAA
