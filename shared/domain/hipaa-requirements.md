# HIPAA Requirements — TheraSeus Compliance Checklist

> 主要读者：Atlas（架构）、Rex（后端）、Nova（AI pipeline）

## 核心要求

### PHI（Protected Health Information）定义
以下信息在胶囊内镜系统中属于 PHI，必须保护：
- 患者姓名、出生日期、地址
- 检查日期、医生姓名
- 图像文件（含患者元数据）
- 诊断报告

### 技术保护措施（TheraSeus 必须实现）

| 要求 | 实现方式 |
|------|---------|
| 数据加密（静态）| AWS S3 SSE-KMS 加密 |
| 数据加密（传输）| TLS 1.2+ 全程 HTTPS |
| 访问控制 | AWS IAM 最小权限原则 |
| 审计日志 | CloudTrail + 应用层审计日志 |
| 数据备份 | S3 跨区域复制 |
| 数据销毁 | 支持安全删除（符合 NIST 800-88）|

### 访问控制要求
- 基于角色（医生/管理员/技术人员）
- 多因素认证（MFA）
- 会话超时（闲置15分钟自动登出）
- 失败登录锁定（5次失败锁定30分钟）

### 审计日志必须记录
- 用户登录/登出
- 图像查看
- 标注操作
- 报告生成/下载
- 数据导出

### BAA（Business Associate Agreement）
- AWS 已签署 BAA（默认覆盖 HIPAA eligible 服务）
- 第三方服务接入前必须确认 BAA

## 开发红线
- ❌ 禁止在日志中打印 PHI
- ❌ 禁止在非加密信道传输图像
- ❌ 禁止在前端存储 PHI（LocalStorage/SessionStorage）
- ❌ 禁止 PHI 进入 AI 训练数据（去标识化后才能用）
