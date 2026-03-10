# 数据集探索报告
> 日期: 2026-03-10

## Kvasir-SEG

| 属性 | 值 |
|------|-----|
| 来源 | Simula Research Laboratory |
| 图片数 | 1,000 张图 + 1,000 张 mask（共 2,000 文件）|
| 内容 | 息肉分割（images/ + masks/）|
| 格式 | JPEG |
| 磁盘 | 54MB（解压后）|
| 用途 | 息肉分割模型训练/验证（SAM2 fine-tune）|

## Kvasir v2

| 属性 | 值 |
|------|-----|
| 来源 | Simula Research Laboratory |
| 图片数 | 8,000 张（8类 × 1000 张）|
| 格式 | JPEG |
| 磁盘 | 2.4GB（解压后）|

### 类别分布（均匀）

| 类别 | 数量 | TheraSeus 相关性 |
|------|------|-----------------|
| **polyps** | 1,000 | ⭐⭐⭐⭐⭐ 核心检测目标 |
| **esophagitis** | 1,000 | ⭐⭐⭐⭐ 异常检测 |
| **ulcerative-colitis** | 1,000 | ⭐⭐⭐⭐ 异常检测 |
| **dyed-lifted-polyps** | 1,000 | ⭐⭐⭐ 术后标记，参考用 |
| **dyed-resection-margins** | 1,000 | ⭐⭐⭐ 术后标记，参考用 |
| **normal-pylorus** | 1,000 | ⭐⭐⭐⭐⭐ 正常样本（过滤训练）|
| **normal-cecum** | 1,000 | ⭐⭐⭐⭐⭐ 正常样本（过滤训练）|
| **normal-z-line** | 1,000 | ⭐⭐⭐⭐⭐ 正常样本（过滤训练）|

### TheraSeus 训练价值分析

**图像过滤模型**: 
- 正常类（pylorus/cecum/z-line）= 3,000 张 "无临床意义" 训练样本
- 异常类（polyps/esophagitis/colitis）= 3,000 张 "有临床意义" 训练样本
- **二分类训练集已就绪**: 6,000 张，50/50 分布

**检测模型**:
- polyps（1,000）: 直接用于 YOLOv8 检测训练（需标注 bbox）
- Kvasir-SEG 提供 1,000 张带 mask 的息肉分割数据

**缺口**:
- ❌ 无出血数据（需 WCEbleedGen 补充）
- ❌ 无胶囊内镜特有数据（Kvasir 主要是传统内镜）
- ❌ 无 bbox 标注（需用 Roboflow/Labelme 标注或转换 mask→bbox）

## 下一步

1. 下载 WCEbleedGen 数据集（出血检测，~2GB）
2. 用 Kvasir-SEG masks 转换为 YOLO bbox 格式
3. 混合 Kvasir v2 正常/异常类构建过滤二分类数据集
4. 评估是否需要 KID2 胶囊内镜专用数据集
