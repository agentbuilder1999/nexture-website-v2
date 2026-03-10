# Nexture Resource Index
> 快速查阅索引。获取命令直接复制执行，无需查文档。

---

## 🌐 nexture.nz 官网改版

### 框架 & 工具
```bash
# 初始化 Next.js 15 项目
pnpm create next-app@latest --typescript --tailwind --app --src-dir

# 核心依赖
pnpm add framer-motion @radix-ui/react-* class-variance-authority clsx tailwind-merge
pnpm add -D @playwright/test vitest @testing-library/react

# shadcn/ui 初始化
npx shadcn@latest init
```

### 关键文档 URL
- Next.js 15 docs: https://nextjs.org/docs
- Tailwind v4: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
- Framer Motion: https://www.framer.com/motion/
- Vercel Deploy: https://vercel.com/docs/deployments/overview

---

## 🏥 医疗 AI — 胶囊内窥镜分析系统

### 核心模型

#### 检测/分割
```bash
# YOLOv8-x (Ultralytics) — 高精度病灶检测（批处理/离线分析）
pip install ultralytics
python -c "from ultralytics import YOLO; YOLO('yolov8x.pt')"  # 自动下载 ~130MB

# Real-ESRGAN — 512×512 超分辨率预处理（检测前放大，显著提升精度）
pip install realesrgan basicsr
wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-x4v3.pth \
  -O ~/.openclaw/workspace-shared/models/realesr-general-x4v3.pth

# YOLOv11n (Ultralytics) — 病灶实时检测（轻量版）
pip install ultralytics
python -c "from ultralytics import YOLO; YOLO('yolo11n.pt')"  # 自动下载 ~6MB

# SAM2 (Meta) — 精细分割
pip install 'git+https://github.com/facebookresearch/sam2.git'
# 下载权重 (~150MB)
wget https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_tiny.pt

# DINOv2 — 特征提取 / 异常检测
pip install timm
python -c "import timm; m=timm.create_model('vit_small_patch14_dinov2',pretrained=True)"  # ~300MB

# BiomedCLIP — 生物医学零样本分类
pip install open_clip_torch
# 模型: microsoft/BiomedCLIP-PubMedBERT_256-vit_L_14 (~400MB via HuggingFace)
```

#### 本地 LLM 报告生成
```bash
# 已安装: ollama/qwen2.5:7b
# 报告生成 prompt 模板在 templates/report-prompt.txt
```

### 核心框架
```bash
# MONAI — 医学影像 AI 框架 (最重要)
pip install monai[all]

# 图像处理
pip install opencv-python-headless albumentations scikit-image Pillow

# 视频/帧处理
pip install scenedetect[opencv] ffmpeg-python

# 推理优化
pip install onnxruntime  # CPU
pip install onnxruntime-gpu  # GPU (如有 NVIDIA)
```

### 完整 requirements.txt
```
# Core AI
torch>=2.2.0
torchvision>=0.17.0
timm>=0.9.0
ultralytics>=8.2.0
monai[all]>=1.3.0
open_clip_torch

# Image processing
opencv-python-headless>=4.9.0
albumentations>=1.4.0
scikit-image>=0.22.0
Pillow>=10.2.0

# Video
scenedetect[opencv]>=0.6.3
ffmpeg-python>=0.2.0

# Data/Report
pandas>=2.2.0
numpy>=1.26.0
reportlab>=4.1.0
fpdf2>=2.7.0

# API/Server
fastapi>=0.110.0
uvicorn[standard]>=0.27.0
pydantic>=2.6.0
sqlalchemy>=2.0.0
aiofiles>=23.2.0

# ML utilities
scikit-learn>=1.4.0
matplotlib>=3.8.0
seaborn>=0.13.0
tqdm>=4.66.0
```

### 开放数据集

| 数据集 | 内容 | 大小 | 下载 |
|--------|------|------|------|
| **Kvasir-SEG** | 息肉分割 1000张 | 46MB | `wget https://datasets.simula.no/downloads/kvasir-seg.zip` |
| **CVC-ClinicDB** | 结肠镜息肉 612张 | ~30MB | https://polyp.grand-challenge.org/CVCClinicDB/ |
| **Kvasir v2** | GI分类 8类 8000张 | ~3.5GB | `wget https://datasets.simula.no/downloads/kvasir/kvasir-dataset-v2.zip` |
| **WCEbleedGen** | 胶囊镜出血检测 | ~2GB | https://zenodo.org/record/7789108 |
| **HyperKvasir** | GI全类型 110,079张 | ~100GB | https://datasets.simula.no/hyper-kvasir/ (需注册) |
| **SUN-SEG** | 结肠镜视频分割 | ~100GB | https://github.com/GewelsJI/SUN-SEG |
| **KID2** | 胶囊内镜异常 | ~1GB | https://mdss.uth.gr/datasets/endoscopy/kid/ |

### 算法参考

| 任务 | 推荐方法 | 论文/代码 |
|------|---------|---------|
| 息肉检测 | YOLOv11 fine-tune | https://github.com/ultralytics/ultralytics |
| 息肉分割 | SAM2 + prompt | https://github.com/facebookresearch/sam2 |
| 出血检测 | HSV颜色分析 + CNN | WCEbleedGen baseline |
| 帧去重 | pHash + 感知哈希 | `pip install imagehash` |
| 帧质量过滤 | Laplacian方差 | OpenCV built-in |
| 无临床意义分类 | EfficientNet-B3 transfer | timm |
| 异常检测(无标注) | DINOv2 + KNN | HuggingFace hub |
| 报告生成 | Qwen2.5:7b (已有) | ollama |

### 下载脚本（按需执行）
```bash
# 小数据集立即下载 (~76MB)
~/.openclaw/workspace-shared/scripts/download-datasets.sh small

# 模型权重 (~500MB)
~/.openclaw/workspace-shared/scripts/download-models.sh core

# 大数据集 (需确认磁盘空间，>10GB)
~/.openclaw/workspace-shared/scripts/download-datasets.sh large
```

---

## 📦 Sandbox 镜像规划

| 镜像 | 用途 | 状态 |
|------|------|------|
| `nexture-sandbox:v1` | 通用开发 (Node+claude-code+sqlite3) | ✅ 已构建 |
| `nexture-sandbox:v2` | 含 Python dev 工具 | 📋 待构建 |
| `medical-ai:v1` | 医疗AI完整环境 (torch+monai+yolo) | 📋 待构建 |

