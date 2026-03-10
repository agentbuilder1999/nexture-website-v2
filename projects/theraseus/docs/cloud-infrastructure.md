# Cloud Infrastructure Planning
> 状态：草案。医疗 AI 项目和 nexture.nz 的云端环境规划。

---

## 一、用途分层

| 层 | 用途 | 推荐平台 |
|----|------|---------|
| **开发** | Agent 编码、规划、编排 | Mac Mini (已有) |
| **训练** | YOLOv8-x / SAM2 fine-tune | GPU 云（按需）|
| **推理** | 批量图像分析 pipeline | GPU 云（按需）|
| **部署** | API 服务、Web 前端 | VPS / Serverless |
| **存储** | 数据集、模型权重 | S3 / R2 |

---

## 二、GPU 训练/推理选项

| 平台 | 优势 | 劣势 | 适用场景 |
|------|------|------|---------|
| **RunPod** | 最便宜（$0.2-0.5/hr A100）, Spot 可用 | 无 SLA | 训练、批量推理 |
| **Lambda Labs** | 稳定、开发者友好 | 较贵 | 长期推理服务 |
| **AWS EC2 (g4dn/p3)** | 与 Bedrock 同账号，IAM 统一 | 按需贵 | 已有 AWS 信用额度时优先 |
| **Google Colab Pro** | 最便宜入门 | 无持久化，不适合生产 | 原型验证 |

**推荐**: 训练用 RunPod Spot，推理 API 用 AWS EC2（消耗现有 $5000 额度）。

---

## 三、医疗 AI Pipeline 云端架构（草案）

```
原始图像（胶囊内窥镜视频）
  ↓
[帧提取 + 去重]  ffmpeg + pHash  (CPU, cheap)
  ↓
[超分辨率]  Real-ESRGAN × 2  (GPU, 512→1024px)
  ↓
[检测]  YOLOv8-x  (GPU, 병变定位)
  ↓
[分割]  SAM2  (GPU, 精细边界)
  ↓
[分类]  EfficientNet-B3  (GPU, 临床意义)
  ↓
[报告生成]  Qwen2.5:7b (Mac本地 / 云端)
  ↓
结构化报告 PDF
```

**存储**: 原始视频 → S3；处理结果 → PostgreSQL + S3；模型权重 → S3

---

## 四、nexture.nz 部署方案

| 方案 | 成本 | 复杂度 | 推荐度 |
|------|------|--------|--------|
| **Vercel** | 免费/Pro $20/mo | 最低 | ⭐⭐⭐⭐⭐ 首选 |
| Cloudflare Pages | 免费 | 低 | ⭐⭐⭐⭐ |
| AWS Amplify | 消耗 Bedrock 账号额度 | 中 | ⭐⭐⭐ |

**推荐**: Next.js 官方支持 Vercel，零配置部署。

---

## 五、待决策

- [ ] 云端 GPU 服务商最终选型
- [ ] 数据存储：AWS S3 vs Cloudflare R2（R2 无出口流量费）
- [ ] 医疗数据合规（HIPAA/NZ Privacy Act）— 上线前必须确认
- [ ] 模型推理：自建服务 vs 托管 API（Replicate/Modal）
