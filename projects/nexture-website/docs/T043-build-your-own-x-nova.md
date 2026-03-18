# T043-ai 学习笔记：build-your-own-x AI/ML 视角分析

**任务**: T043-ai  
**分析人**: Nova (AI/ML Engineer)  
**日期**: 2026-03-17

---

## TL;DR

从 codecrafters-io/build-your-own-x 中提炼 3 条核心洞见：

| 洞见 | 来源 | 对 TheraSeus AI 的行动建议 |
|------|------|--------------------------|
| **1. 底层实现 = 更好的调参直觉** | Neural Network from Scratch 系列 | 手写反向传播 → 理解 learning rate/gradient 的物理意义 |
| **2. 两阶段过滤架构的经典范式** | Search Engine 系列（TF-IDF → Vector Space → PageRank） | 借鉴「粗筛→精排」模式设计 TheraSeus RAG |
| **3. 数据库选型的本质是索引结构** | Redis/B+Tree/Graph DB 系列 | 向量检索的底层是 ANN 索引，不是魔法 |

---

## 1. Neural Network / AI Model 系列

### 1.1 核心资源

| 资源 | 语言 | 亮点 |
|------|------|------|
| [A Neural Network in 11 lines of Python](https://iamtrask.github.io/2015/07/12/basic-python-network/) | Python | 极简实现，核心概念一目了然 |
| [Neural Networks: Zero to Hero](https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ) | Python | Andrej Karpathy，YYDS |
| [SlowTorch: PyTorch from scratch in pure Python](https://github.com/xames3/slowtorch) | Python | PyTorch 所有运算透明化 |
| [Traffic signs classification with CNN](https://navoshta.com/traffic-signs-classification/) | Python | 小目标检测实战，与胶囊图像类似 |
| [Building a CNN from Scratch](https://victorzhou.com/blog/intro-to-cnns-part-1/) | Python | 卷积/池化/梯度的直观解释 |

### 1.2 对 YOLOv8 训练的启示

**痛点场景**：训练 loss 不下降、mAP 停滞、梯度爆炸

**从零实现 NN 的帮助**：

| 问题 | 底层理解能做什么 | build-your-own-x 对应资源 |
|------|-----------------|-------------------------|
| Learning rate 调参无效 | 理解链式法则推导中的 lr 系数放大效应 | SlowTorch 自动微分追踪 |
| 梯度消失/爆炸 | Layer-norm 的位置、activation 的梯度流 | Neural Networks: Zero to Hero (BP 推导) |
| Batch size 影响泛化 | 理解 batch statistics 带来的 noise 正则化 | 11 lines NN 可调 batch 实验 |
| 小目标 recall 低 | 理解 anchor generation、feature pyramid | Traffic signs CNN（同类场景）|

**可落地的实验设计**（在 T054 数据集上）：

```python
# 对照实验：不同初始化策略对胶囊内镜小目标的收敛影响
scenarios = [
    ("kaiming_normal", "ResNet/ViT 推荐"),
    ("xavier_normal", "经典 CNN 推荐"),
    ("small_image_adapted", "胶囊图像特化：小 lr + 更多 epoch"),
]

for init in scenarios:
    # 用 ultralytics 自定义 backbone 初始化
    model = YOLO("yolov8s.pt")
    model.model.apply(init_weight_fn)
    train(...params)
    log(mAP50, recall, precision)
```

### 1.3 胶囊内镜场景的特殊性

胶囊图像 vs 自然图像的关键差异：

| 维度 | 胶囊内镜 | 自然图像（如 ImageNet） |
|-----|---------|----------------------|
| 目标大小 | 异常区域 5-25% 帧面积 | AlexNet 论文：平均目标占比 80%+ |
| 类内差异 | 出血颜色从鲜红到暗红（PH/时间）| 同类物体颜色稳定 |
| 背景干扰 | 肠道皱襞、食物残渣、气泡 | 单一背景或干净背景 |
| 数据规模 | 公开数据集 ~3000 张 | ImageNet 1.2M 张 |

**build-your-own-x 洞见**：
Traffic signs classification（Navoshta）解决的是「小目标 + 类内差异大 + 背景干扰」问题——完全对标胶囊内镜场景。

**行动建议**：
```
1. 复现 Traffic signs CNN pipeline
2. 迁移到 WCEbleedGen 数据集
3. 对比 YOLOv8（小目标检测专用）：
   • AP small (COCO 定义: <32²px) 
   • AP medium (32²-96²px)
   • AP large (>96²px)
4. 选择更适合胶囊场景的架构
```

---

## 2. Search Engine 系列（对 RAG Pipeline 的启示）

### 2.1 核心资源

| 资源 | 方法论 |
|------|-------|
| [Building a Vector Space Indexing Engine](https://boyter.org/2010/08/build-vector-space-search-engine-python/) | TF-IDF → 向量空间 |
| [Building a search engine using Redis](http://www.dr-josiah.com/2010/07/building-search-engine-using-redis-and.html) | 倒排索引 |
| [CSS Search Engine (Algolia story)](https://stories.algolia.com/a-search-engine-in-css-b5ec4e902e97) | 纯前端检索 |
| [Making text search learn from feedback](https://medium.com/filament-ai/making-text-search-learn-from-feedback-4fe210fd87b0) | 反馈驱动的相关性学习 |

### 2.2 两阶段检索的经典范式

**Search Engine 实现普遍采用**：

```
粗筛阶段（召回优先）          精排阶段（精度优先）
├── TF-IDF / BM25          ├── Learning to Rank
├── Inverted Index         ├── Query expansion
├── Hash-based LSH         └── Re-ranking
└── ~1000 候选             └── ~100 候选
```

**对 TheraSeus RAG 的映射**（借鉴自 T020 rag-pipeline-design.md）：

| RAG 阶段 | 对应 Search Engine 概念 | 具体实现 |
|---------|----------------------|---------|
| 帧级 embedding 检索 | 粗筛阶段的向量空间检索 | FAISS HNSW（~1000 候选）|
| 相似案例匹配 | PageRank 式的专家病例加权 | CLIP + 历史案例加权（~100 精排）|
| impressionMap 生成 | Learning to Rank | LLM 基于多维特征生成 |

**关键洞见**：
> RAG 不是「向量检索 + LLM」两个模块拼接，而是「检索→排序→生成」的完整信息检索系统。build-your-own-x 的 Search Engine 系列揭示了每个阶段的设计权衡。

### 2.3 向量数据库选型的本质

| 数据库 | 底层索引 | 适用场景 | TheraSeus 适用度 |
|--------|---------|---------|----------------|
| Redis | Hash / Sorted Set | 低延迟 Cache | ❌ 非向量原生 |
| PostgreSQL pgvector | IVFFlat / HNSW | 混合查询（结构+向量）| ⚠️ 中等 |
| Milvus / Zilliz | FAISS/DiskANN | 亿级向量 | ✅ 首选 |
| Pinecone | 专用分布式 | SaaS 托管 | ⚠️ 成本考虑 |
| Qdrant | HNSW Rust | 自托管友好 | ✅ 备选 |

**洞见来源**：build-your-own-x 的 Redis from Scratch 展示了「索引结构决定性能上限」——向量数据库同理。

**对 TheraSeus 向量数据库选择的建议**：

```
第一阶段（Phase 1）：
  • 帧数：55,000 帧 × 1 embedding = 55K 向量
  • 维度：CLIP ViT-B/32 = 512 维
  • QPS 需求：单用户查询，~1 QPS
  → 推荐：FAISS（内存）→ Qdrant/HNSW（扩展性）
  → 不推荐：Pinecone（55K 向量成本不划算）

第二阶段（Phase 2，扩展 10x）：
  • 帧数：550K 向量
  • 需要：持久化 + 多用户并发
  → 升级：Milvus / Zilliz Cloud
```

---

## 3. Database 系列（对向量检索的底层理解）

### 3.1 核心资源

| 资源 | 语言 | 关键概念 |
|------|------|---------|
| [Let's Build a Simple Database (SQLite from scratch)](https://cstack.github.io/db_tutorial/) | C | B+Tree → 磁盘存储 |
| [Build Your Own Redis from Scratch](https://build-your-own.org/redis) | C++ | 内存数据结构 |
| [Dagoba: in-memory graph database](http://aosabook.org/en/500L/dagoba-an-in-memory-graph-database.html) | JavaScript | 图遍历 = 递归 → 迭代 |
| [DBDB: Dog Bed Database](http://aosabook.org/en/500L/dbdb-dog-bed-database.html) | Python | 磁盘布局设计 |

### 3.2 对向量索引的类比

| 传统数据库 | 向量数据库 | build-your-own-x 启示 |
|-----------|-----------|---------------------|
| B+Tree | HNSW / IVF | 索引是分层的邻居图 |
| Hash Index | LSH | 桶化加速近似检索 |
| LSM-Tree | DiskANN | 磁盘友好的向量存储 |

**核心洞见**：「向量数据库」不是黑盒子——它们是：
- 用 **HNSW graph** 替代 B+Tree 做范围查询
- 用 **LSH/Product Quantization** 压缩高维向量
- 用 **top-k 优先队列** 实现 NN 搜索

### 3.3 对 TheraSeus 的具体影响

**为什么向量检索延迟不可控？**

从 Redis from Scratch 学到：

```
Redis 延迟 = 数据结构访问时间 + 网络开销
          = O(1) + 网络延迟

向量检索延迟 = ANN 索引搜索时间 + 结果收集
            = O(log N × M) + 排序开销
            where:
              N = 向量数量（55K → 550K → 5M）
              M = 每个节点的邻居数（HNSW efSearch）
```

**可落地的优化**：
```python
# 延迟预算分配（目标：embedding 检索 <100ms）
budget = {
    "hnsw_search": 50,     # 搜索 55K 向量，ef=16
    "topk_queue_sort": 20, # 排序 100 候选
    "network": 30,         # RTT + 序列化
}
```

---

## 4. 直接针对胶囊内镜 AI Pipeline 的资源

| build-your-own-x 资源 | 对应 TheraSeus 场景 | 借鉴点 |
|----------------------|--------------------|-------|
| [Traffic signs CNN](https://navoshta.com/traffic-signs-classification/) | 胶囊小目标检测 | 小目标 + 类内差异 |
| [OCR from scratch](http://aosabook.org/en/500L/optical-character-recognition-ocr.html) | 病灶区域文字识别 | bbox + 文字关联 |
| [SlowTorch: PyTorch from scratch](https://github.com/xames3/slowtorch) | 理解 YOLOv8 训练 | 自动微分追踪 |
| [Search learning from feedback](https://medium.com/filament-ai/making-text-search-learn-from-feedback-4fe210fd87b0) | RAG 反馈优化 | 医生标注 → 检索优化闭环 |

---

## 5. 3 条可落地洞见总结

### 洞见 1：手写 NN 是最好的超参调试指南

**现状**：我们直接使用 ultralytics YOLOv8，调参（lr, batch, patience）凭感觉。

**从 build-your-own-x 学到**：
- 11 lines NN（PyTorch）展示了 lr 如何通过链式法则逐层放大
- SlowTorch 可以追踪每个 epoch 的 gradient norm

**行动**：
```
T055（待确认）：实现胶囊场景的 loss diagnostic
  1. 复现 11 lines NN，数据集替换为 WCEbleedGen
  2. 每 10 epoch 打印 layer1 conv gradient norm
  3. 对比 YOLOv8 同位置 gradient norm
  4. 输出：对 lr=0.01 / 0.001 / 0.0001 的收敛影响报告
```

### 洞见 2：RAG = 检索 + 排序 + 生成，别当两个模块拼

**现状**：我们把 RAG 当作「向量检索（FAISS）+ LLM（Qwen2.5）」两件事。

**从 build-your-own-x 学到**：
- 搜索引擎的历史演进：TF-IDF → Vector Space → PageRank → Learning to Rank
- 每个阶段的设计目标不同：召回 vs 精度 vs 可解释性

**行动**：
```
T056（待确认）：Th

eraSeus RAG Pipeline 2.0 设计
  1. 粗筛（Recall ≥ 0.98）：embedding 检索 + FAISS HNSW
  2. 精排（Precision ≥ 0.80）：历史案例相似度加权 + 医生标注反馈
  3. 生成：impressionMap RAG → LLM 融合
  4. 分离每个阶段的 metrics，单独优化
```

### 洞见 3：向量数据库选型 = 索引结构选型

**现状**：RAG 向量库选型时只看「QPS 和成本」，忽视索引结构。

**从 build-your-own-x 学到**：
- Redis 选 Hash 还是 Sorted Set？取决于查询模式
- 同样，Milvus vs Qdrant 的选择取决于：查询类型 / 数据规模 / 扩展性

**行动**：
```
T057（待确认）：向量库基准测试
  1. 55K 胶囊帧 embedding（CLIP ViT-B/32）
  2. 对比：FAISS (mem), Qdrant (HNSW), Milvus (IVFFlat)
  3. 指标：P99 延迟 / 召回率 / 内存占用
  4. 输出：选型建议书
```

---

## 6. 后续建议（待 Victor 确认）

| 优先级 | 任务 | 来源资源 | 预计工作量 |
|--------|------|---------|-----------|
| P1 | 实现胶囊场景 loss diagnostic | 11 lines NN + SlowTorch | 2 天 |
| P1 | RAG Pipeline 2.0 设计（粗筛→精排）| Vector Space Indexing + Learning to Rank | 3 天 |
| P2 | 向量库基准测试（FAINS/Qdrant/Milvus）| Redis from Scratch | 1 天 |
| P2 | 迁移 Traffic signs CNN Pipeline | Traffic signs CNN | 2 天 |

---

*文档版本：v1.0 | Nova | 2026-03-17*  
*来源：https://github.com/codecrafters-io/build-your-own-x*
