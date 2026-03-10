# TheraSeus™ 医疗 AI 合规备忘录
> 基于 NZ / US / AU 法规框架
> 日期: 2026-03-10 | 研究者: q (CTO)
> ⚠️ 本文件为技术团队参考，非法律意见。正式合规需咨询法律顾问。

---

## 一、Medsafe — 新西兰（首要市场）

### 1.1 SaMD 分类

TheraSeus™ 属于 **Software as a Medical Device (SaMD)**。

Medsafe 对 AI/ML 医疗软件的分类基于 IMDRF 框架：
- **输入**: 胶囊内镜图像
- **输出**: AI 辅助检测结果 + 报告（**非最终诊断**）
- **预期用途**: 辅助临床决策，最终诊断权在医生

**推测分类**: Class IIa（中等风险）
- 理由: 提供诊断信息但不直接驱动治疗决策
- 如果 AI 输出直接用于治疗决策（如自动触发转诊），可能升级为 Class IIb

### 1.2 注册路径

| 步骤 | 内容 | 预计时间 |
|------|------|---------|
| 1 | 确定分类 | Medsafe 咨询 |
| 2 | 质量管理体系 (QMS) | ISO 13485 认证 |
| 3 | 临床证据收集 | 回顾性研究或前瞻性试验 |
| 4 | 技术文件提交 | 按 Medsafe WAND 系统 |
| 5 | 审查+批准 | 6-12 个月 |

### 1.3 关键要求

- ISO 13485（QMS）
- IEC 62304（软件生命周期）
- ISO 14971（风险管理）
- 临床评估报告（CER）
- 使用说明（IFU）

---

## 二、NZ Privacy Act 2020

### 2.1 信息隐私原则（IPP）适用于 TheraSeus

| IPP | 原则 | TheraSeus 应用 |
|-----|------|---------------|
| IPP1 | 合法收集目的 | 图像仅用于临床诊断辅助 |
| IPP3 | 告知当事人 | 患者需被告知 AI 参与分析 |
| IPP5 | 安全保护 | AES-256 加密、RBAC 访问控制 |
| IPP6 | 信息访问权 | 患者可要求查看其数据 |
| IPP9 | 保留期限 | 按临床记录保留法规（NZ: 10 年最低）|
| IPP10 | 使用限制 | 不将患者数据用于非授权目的（如营销）|
| IPP11 | 披露限制 | 不向第三方披露，除非法律要求 |
| IPP12 | 跨境传输 | 如数据出 NZ，需同等保护或明确同意 |

### 2.2 健康信息特别规定

NZ Health Information Privacy Code 1994（HIPC）:
- 比通用 Privacy Act 更严格
- 健康信息的收集、使用、存储、披露有额外限制
- **训练数据必须完全去标识化**（移除姓名、出生日期、NHI 号码等）

---

## 三、HIPAA — 美国市场

### 3.1 适用性

TheraSeus 处理 PHI（Protected Health Information），必须符合 HIPAA。

### 3.2 技术保障措施

| 类别 | 要求 | TheraSeus 实施 |
|------|------|---------------|
| 访问控制 | 唯一用户 ID + 应急访问 | RBAC + MFA + break-glass 机制 |
| 审计控制 | 所有 PHI 访问记录 | 审计日志（不可篡改）|
| 传输安全 | 加密传输 | TLS 1.3 |
| 完整性控制 | 防止未授权修改 | 数字签名 + 校验和 |
| 介质管理 | 数据销毁 | 加密删除 + 物理销毁协议 |

### 3.3 BAA（Business Associate Agreement）

如 TheraSeus 作为 SaaS 提供给美国医疗机构：
- Nexture 是 Business Associate
- 必须与每个 Covered Entity（医院/诊所）签署 BAA
- AWS 已有 BAA 模板（使用 HIPAA-eligible 服务）

### 3.4 AWS HIPAA 合规架构

```
VPC (隔离网络)
  ├── ALB (HTTPS only)
  ├── ECS/EKS (容器化服务)
  ├── S3 (SSE-S3/SSE-KMS 加密)
  ├── RDS (加密存储 + 自动备份)
  ├── CloudTrail (审计日志)
  └── KMS (密钥管理)
```

---

## 四、FDA — 美国 SaMD 注册（远期）

### 4.1 分类

基于 FDA AI/ML SaMD 框架:
- TheraSeus 属于 **Class II** 医疗器械
- 预期用途: CADe（计算机辅助检测）+ CADt（计算机辅助分类）
- 注册路径: **510(k)** 或 **De Novo**

### 4.2 FDA 对 AI/ML 的特殊要求

- **Predetermined Change Control Plan**: AI 模型更新计划需预先提交
- **Algorithm transparency**: 提供模型架构、训练数据描述、性能指标
- **Real-world performance monitoring**: 上市后持续监控 AI 表现
- **Bias assessment**: 评估不同人群（种族/年龄/性别）的性能差异

---

## 五、TheraSeus 合规实施优先级

| 优先级 | 项目 | 目的 |
|--------|------|------|
| 🔴 P0 | 数据加密（静态+传输）| 所有法规基础 |
| 🔴 P0 | RBAC + 审计日志 | HIPAA + NZ Privacy Act |
| 🔴 P0 | 训练数据去标识化流程 | HIPC + HIPAA |
| 🟡 P1 | ISO 13485 QMS 建立 | Medsafe 注册前提 |
| 🟡 P1 | AWS BAA 签署 | HIPAA 合规 |
| 🟡 P1 | 临床评估计划 | Medsafe + FDA |
| 🟢 P2 | FDA 510(k) 准备 | 美国市场进入 |
| 🟢 P2 | CE 标记准备 | 欧盟市场进入 |
