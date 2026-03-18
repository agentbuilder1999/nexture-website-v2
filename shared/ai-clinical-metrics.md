# AI Clinical Metrics Mapping
> 版本: v1.0 | 维护: Nova（AI层）+ Atlas（临床+合规层）
> 适用: TheraSeus 胶囊内镜 AI | 创建: 2026-03-12

---

## 一、核心指标映射表

| AI 指标 | 临床语义 | 合规门槛 | 测量方法 | FDA 文档要求 |
|---------|---------|---------|---------|------------|
| Sensitivity (Recall) | 灵敏度：漏检率 | FNR < 2%（P0） | per-lesion detection | 510(k) primary endpoint |
| Specificity (1-FPR) | 特异度：误报率 | FPR < 5%（P1） | per-frame classification | 510(k) secondary endpoint |
| mAP@0.5 | 整体检测质量 | > 0.85（内部基线） | COCO eval | 性能声明支撑数据 |
| 置信度校准 (ECE) | 过度自信风险 | ECE < 0.05 | reliability diagram | AI/ML SaMD 透明度要求 |
| P95 推理延迟 | 临床工作流影响 | < 500ms/帧 | percentile latency | 非功能性规格 |
| 边界案例覆盖率 | 罕见病变可靠性 | ≥ 80% 已知类型 | curated edge set | 预定功能边界声明 |

---

## 二、触发重新验证的变化阈值

| 指标变化 | 重新验证级别 | 负责人 |
|---------|------------|-------|
| Sensitivity 下降 > 1% | 完整 V&V（Atlas 评估） | Nova + Atlas |
| mAP 下降 > 3% | 内部回归测试 | Nova |
| 延迟 P95 > 500ms | 性能回归 | Rex + Nova |
| 新病变类型加入训练集 | 完整 V&V | Nova + Atlas |

---

## 三、FDA SaMD 文档映射
> 参考：FDA AI/ML-Based SaMD Action Plan (2021)

| 文档要求 | 对应指标 | IEC 62304 章节 |
|---------|---------|---------------|
| 预定功能声明 | Sensitivity/Specificity 门槛 | 5.2 |
| 软件性能测试 | mAP、置信度校准 | 5.7 |
| 上市后监督计划 | 全部指标 + 漂移检测 | 6.1 |

---

## 四、版本记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-03-12 | 初始创建（Nova + Atlas 联合） |
