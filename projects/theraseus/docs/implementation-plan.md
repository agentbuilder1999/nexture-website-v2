# Nexture 实施计划 v1.1
> 状态：待审阅，未执行
> 更新：2026-03-09 20:10 NZST

---

## 一、已完成项（今晚已执行，无法撤回）

| 项目 | 详情 | 需重启 |
|------|------|-------|
| `sandbox.scope` → shared | 符合设计文档 | ✅ 需要 |
| `agentToAgent` 启用 | allow 7 agents | 否 |
| `heartbeat.activeHours` | 08:00–22:00 NZDT | 否 |
| `memorySearch.extraPaths` | workspace-shared/docs | 否 |
| `subagents.archiveAfterMinutes: 30` | 超时保护 | 否 |
| Aria/Atlas `tools.deny` | exec + apply_patch | 否 |
| workspace-shared/ 目录结构 | 含 task.sh + SQLite | 否 |
| Nova/Sage workspace 文件 | IDENTITY/USER/memory | 否 |
| resource-index.md | 两个项目资源索引 | 否 |
| 5 个 cron jobs | 见 Section 四 | 否 |
| Kvasir-SEG 部分下载 | 5.5MB / 46MB，已停止 | 否 |

**config 修正需要一次 gateway restart（等 nova/sage tokens 时一起重启）**

---

## 二、nexture-sandbox:v2 构建计划

### 当前 v1 现状（已验证）
```
Node.js  v18.20.4   ✅
npm      9.2.0      ✅
Python   3.11.2     ✅（但无 pip！）
git      2.39.5     ✅
Claude   2.1.71     ✅
sqlite3  3.40.1     ✅
jq       1.6        ✅
make     4.3        ✅
pnpm                ❌ Finn 必需
bun                 ❌ 可选
pip3                ❌ Rex 必需
uv                  ❌ Rex 推荐
gh CLI              ❌ PR 创建必需
```

### v2 Dockerfile（待审阅，未执行）
```dockerfile
FROM nexture-sandbox:v1

# Frontend tools (Finn)
RUN npm install -g pnpm@latest bun@latest

# Backend tools (Rex) - 修复 pip 并安装 uv
RUN apt-get update && apt-get install -y python3-pip python3-venv && \
    pip3 install --upgrade pip uv

# GitHub CLI (两者共用 - PR 创建/查看)
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    | tee /etc/apt/sources.list.d/github-cli.list > /dev/null && \
    apt-get update && apt-get install -y gh

# Backend Python packages (Rex 常用，预装加速)
RUN pip3 install \
    fastapi uvicorn[standard] \
    sqlalchemy alembic \
    pydantic \
    pytest pytest-asyncio httpx \
    black ruff mypy \
    python-dotenv \
    aiofiles \
    realesrgan basicsr

# Frontend global tools (Finn 常用)
RUN pnpm add -g typescript eslint prettier \
    @playwright/test \
    tsx

# 清理
RUN apt-get clean && rm -rf /var/lib/apt/lists/*
```

### 构建命令（待执行）
```bash
cd ~/.openclaw
docker build -t nexture-sandbox:v2 -f workspace-shared/scripts/Dockerfile.v2 .
# 预计大小：~800MB（v1 1.16GB → v2 ~1.5GB）
# 预计时间：~15-20 分钟
```

---

## 三、下载管理计划

### Part A：工具安装（sandbox 构建时自动完成，见 Section 二）

### Part B：数据集下载

| 数据集 | 大小 | 优先级 | 命令 |
|--------|------|--------|------|
| Kvasir-SEG（息肉分割）| 46MB | 🔴 高 | `~/.openclaw/workspace-shared/scripts/download-datasets.sh small` |
| CVC-ClinicDB | ~30MB | 🟡 中 | 需手动注册：https://polyp.grand-challenge.org |
| Kvasir v2（GI分类）| 3.5GB | 🟡 中 | `download-datasets.sh large`（需确认磁盘）|
| WCEbleedGen（出血）| ~2GB | 🟡 中 | https://zenodo.org/record/7789108 |
| HyperKvasir | 100GB | ⚪ 低 | 仅记录 URL，不下载 |
| KID2（胶囊内镜）| ~1GB | 🟡 中 | 需注册：https://mdss.uth.gr/datasets/endoscopy/kid/ |

### Part C：医疗 AI 完整工具清单

#### ⚠️ Mac Mini (arm64) 平台注意事项
| 工具 | Mac arm64 支持 | 说明 |
|------|--------------|------|
| TensorRT | ❌ 不支持 | NVIDIA GPU 专用，Mac 无 CUDA |
| OpenVINO | ⚠️ 有限 | 主要针对 Intel，arm64 支持不完整 |
| PyTorch (MPS) | ✅ 原生支持 | Apple Metal GPU 加速，替代 CUDA |
| ONNX Runtime | ✅ 支持 | arm64 可用，但无 TRT provider |

**结论**：TensorRT / OpenVINO 仅适合未来部署到 x86/NVIDIA 推理服务器，本地开发用 PyTorch + MPS + ONNX Runtime。

---

#### 📦 核心深度学习框架

```bash
# PyTorch (Mac MPS 加速)
pip install torch torchvision torchaudio

# Ultralytics (YOLOv8 + YOLOv11)
pip install ultralytics          # 含 YOLOv8n/s/m/l/x + YOLOv11

# ONNX Runtime (推理优化，跨平台部署)
pip install onnxruntime           # CPU
# onnxruntime-gpu 仅 CUDA 平台可用

# OpenVINO SDK (标注，arm64 仅部分功能)
pip install openvino              # 工具链，非推理引擎

# TensorRT — 跳过本地，仅记录部署服务器使用
# pip install tensorrt            # ⛔ Mac 不可用
```

---

#### 🔍 图像处理

```bash
pip install opencv-python-headless scikit-image Pillow
```

| 库 | 用途 | 大小 |
|----|------|------|
| opencv-python-headless | 图像读写、预处理、光流、质量检测 | ~50MB |
| scikit-image | 形态学处理、SSIM、比较算法 | ~30MB |
| Pillow | 基础图像格式转换 | ~5MB |

---

#### 🔧 超分辨率（SR）

| 模型 | 特点 | 权重大小 | 安装 |
|------|------|---------|------|
| **Real-ESRGAN** | 通用 × 4 SR，适合胶囊内镜 | ~65MB | `pip install realesrgan basicsr` |
| **SwinIR** | Transformer 架构，细节更锐利 | ~125MB | `pip install timm` + 手动下载权重 |
| **EDSR** | 经典 SR，医学图像基线对比 | ~40MB | `pip install basicsr` 含 EDSR |

```bash
# SR 全家桶
pip install realesrgan basicsr

# SwinIR 权重
wget https://github.com/JingyunLiang/SwinIR/releases/download/v0.0/003_realSR_BSRGAN_DFO_s64w8_SwinIR-M_x4_GAN.pth \
  -O ~/.openclaw/workspace-shared/models/swinir-x4.pth

# Real-ESRGAN 权重
wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth \
  -O ~/.openclaw/workspace-shared/models/realesr-general-x4v3.pth
```

---

#### 🧠 模型训练辅助

| 工具 | 类型 | 安装方式 | 说明 |
|------|------|---------|------|
| **TensorBoard** | 本地可视化 | `pip install tensorboard` | 训练曲线，集成 PyTorch |
| **Weights & Biases** | 云端 MLOps | `pip install wandb` | 免费 tier，实验追踪首选 |
| **DVC** | 数据版本控制 | `pip install dvc` | 大文件 / 数据集版本管理，配合 git |
| **ClearML** | MLOps 平台 | `pip install clearml` 或 Docker | 可自托管，实验+数据+模型全管 |

```bash
pip install tensorboard wandb dvc clearml
# ClearML 自托管服务器（可选，Docker 部署）
docker run -d --name clearml-server   -p 8080:80 -p 8008:8008 -p 8081:8081   allegroai/clearml-server:latest
```

---

#### 🗂 数据标注

| 工具 | 类型 | 部署方式 | 说明 |
|------|------|---------|------|
| **CVAT** | 本地标注平台 | Docker Compose | 专业视频/图像标注，支持 YOLO 格式导出 |
| **Labelme** | 轻量本地工具 | `pip install labelme` | 简单快速，JSON 格式 |
| **Roboflow** | 云端平台 | SDK `pip install roboflow` | 数据增强+导出，免费 tier 可用 |

```bash
# Labelme (轻量本地)
pip install labelme

# Roboflow SDK
pip install roboflow

# CVAT (Docker，完整标注平台)
git clone https://github.com/opencv/cvat
cd cvat && docker compose up -d
# 访问 http://localhost:8080
```

---

#### 🧪 后处理

```bash
pip install numpy scipy
# opencv 已在图像处理中安装
```

---

#### 🚀 部署

```bash
# FastAPI (Rex 已包含在 sandbox v2)
pip install fastapi uvicorn[standard]

# Docker — 已安装（Mac Docker Desktop v29.3.0）
docker --version  # ✅ 已就绪

# ONNX 模型导出
pip install onnx onnxruntime
```

---

#### 📋 完整 requirements-medical-ai.txt（待用）

```
# Framework
torch>=2.2.0
torchvision>=0.17.0
torchaudio>=2.2.0
ultralytics>=8.2.0

# Image processing
opencv-python-headless>=4.9.0
scikit-image>=0.22.0
Pillow>=10.2.0

# Super Resolution
realesrgan>=0.3.0
basicsr>=1.4.2

# Feature extraction / segmentation
timm>=0.9.0
segment-anything  # SAM2 via git install

# ML training
tensorboard>=2.15.0
wandb>=0.16.0
dvc>=3.30.0
clearml>=1.14.0

# Post-processing
numpy>=1.26.0
scipy>=1.12.0

# Annotation SDK
labelme>=5.3.0
roboflow>=1.1.0

# Deployment
fastapi>=0.110.0
uvicorn[standard]>=0.27.0
onnx>=1.16.0
onnxruntime>=1.17.0
openvino>=2024.0.0
```

---

### Part D：AI 模型权重下载清单

| 模型 | 大小 | 优先级 | 命令 |
|------|------|--------|------|
| **YOLOv8-x** | ~130MB | 🔴 高 | `YOLO('yolov8x.pt')` 自动 |
| **YOLOv11n** | ~6MB | 🔴 高 | `YOLO('yolo11n.pt')` 自动 |
| **SAM2 tiny** | ~150MB | 🔴 高 | `download-models.sh core` |
| **Real-ESRGAN** | ~65MB | 🔴 高 | wget（见上）|
| **SwinIR x4** | ~125MB | 🟡 中 | wget（见上）|
| **DINOv2-small** | ~300MB | 🟡 中 | timm 自动 |
| **BiomedCLIP** | ~400MB | 🟡 中 | HuggingFace 自动 |
| **EfficientNet-B3** | ~48MB | 🟡 中 | timm 自动 |



| 模型 | 大小 | 优先级 | 命令 |
|------|------|--------|------|
| SAM2 tiny 权重 | 150MB | 🔴 高 | `download-models.sh core` |
| YOLOv11n | 6MB | 🔴 高 | 首次 `from ultralytics import YOLO` 自动下载 |
| DINOv2-small | ~300MB | 🟡 中 | `timm.create_model('vit_small_patch14_dinov2', pretrained=True)` |
| BiomedCLIP | ~400MB | 🟡 中 | HuggingFace: `microsoft/BiomedCLIP-PubMedBERT_256-vit_L_14` |
| EfficientNet-B3 | ~48MB | 🟡 中 | `timm.create_model('efficientnet_b3', pretrained=True)` |
| **YOLOv8-x** | ~130MB | 🔴 高 | `from ultralytics import YOLO; YOLO('yolov8x.pt')` — 高精度检测（超过 v11n）|
| **Real-ESRGAN** | ~65MB | 🔴 高 | 见下方说明 — 512×512 图像超分辨率预处理 |

### Real-ESRGAN 说明（胶囊内镜关键预处理）

> 作用：将 512×512 低分辨率图像放大至 1024×1024 或 2048×2048，再送入 YOLO 检测，显著提升小病灶识别率。

```bash
# 安装
pip install realesrgan basicsr

# 下载权重（~65MB）
wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth \
  -O ~/.openclaw/workspace-shared/models/realesr-general-x4v3.pth

# 使用示例
from realesrgan import RealESRGANer
from basicsr.archs.rrdbnet_arch import RRDBNet
model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=6, num_grow_ch=32)
upsampler = RealESRGANer(scale=4, model_path='realesr-general-x4v3.pth', model=model)
sr_img, _ = upsampler.enhance(img_512x512, outscale=2)  # → 1024×1024
```

### YOLOv8-x vs YOLOv11n 选型说明

| 指标 | YOLOv11n | YOLOv8-x |
|------|----------|----------|
| 权重大小 | ~6MB | ~130MB |
| mAP (COCO) | ~39.5 | ~53.9 |
| 推理速度 | 极快 | 较慢 |
| 适用场景 | 实时预览、边端 | 高精度分析批处理 |

**推荐策略**：实时预览用 v11n，离线批量分析用 v8x + Real-ESRGAN 超分预处理

### Part D：前端资源（按项目初始化时自动处理）

```bash
# nexture.nz 官网改版 — Finn 初始化时执行
pnpm create next-app@latest nexture-web --typescript --tailwind --app --src-dir
cd nexture-web && npx shadcn@latest init

# 无需提前下载，pnpm 自动处理
```

---

## 四、Cron Jobs 当前状态（已创建）

| 名称 | 触发（UTC）| NZDT | 模型 | 目的 |
|------|-----------|------|------|------|
| morning-brief | 19:00 | 08:00 | Haiku | 汇报夜间完成情况 |
| evening-review | 08:00 | 21:00 | Haiku | 规划今晚任务 |
| night-dispatch | 09:00 | 22:00 | Sonnet | 触发重型任务 |
| night-monitor × 3 | 11/13/15:00 | 00/02/04:00 | Haiku | 巡检+续派 |

---

## 五、明日待办

| 任务 | 时间 | 操作 |
|------|------|------|
| Nova bot token | ~18:44 NZST | Victor → BotFather → q config set |
| Sage bot token | ~18:44 NZST | Victor → BotFather → q config set |
| Gateway restart | 拿到 tokens 后 | Victor 执行 `openclaw gateway restart` |
| nexture-sandbox:v2 构建 | 重启后 | 15-20 分钟后台构建 |
| 数据集/模型下载 | v2 构建后 | 后台下载 small tier (~200MB) |
| Phase 6 端到端测试 | 白天 | Victor 发指令，观察流程 |

---

## 六、待决策项

1. **nexture-sandbox:v2 是否立即构建？** 还是等正式项目启动再建？
2. **数据集下载 tier？** 建议先 small（~76MB），large 等立项后
3. **医疗 AI 沙箱是否单独建？** `medical-ai:v1` 体积预计 ~3GB（含 torch+monai）
4. **nexture.nz 改版正式立项时间？**

