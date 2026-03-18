# T043-ux 学习笔记：build-your-own-x UX 设计视角分析
> 作者：Aria · 2026-03-17  
> 任务：Victor 指令 — 从 UX/产品设计视角分析 build-your-own-x 资源列表

---

## 一、核心洞见摘要

从「重建经典」的学习模式中，我提炼出 **5 条对 nexture 界面设计可落地的洞见**：

| # | 洞见 | 来源 | 对 nexture 的行动建议 |
|---|------|------|----------------------|
| 1 | **框架即权衡（Framework = Trade-offs）** | React/Virtual DOM 实现系列 | 设计组件 API 时，明确「给开发者自由度」vs「约束以保证一致性」的边界 |
| 2 | **状态流是 UX 的血管** | Redux / Zustand / 状态管理系列 | nexture 的医生工作流状态机需要更明确的 finite state 定义，减少隐式状态 |
| 3 | **交互反馈的底层是事件循环** | 游戏引擎 / 输入处理系列 | 按钮/卡片交互的 state change 要有清晰的 `idle → hover → active → committed` 路径 |
| 4 | **渲染抽象决定体验天花板** | 3D Renderer / WebGL 系列 | 设计医疗可视化时，理解「数据 → 几何 → 像素」的管线，才能设计出工程师能实现的 UI |
| 5 | **最小可行实现是设计的起点** | 160行 React / 500行 OpenGL | 拒绝「一开始就做全」，用 MVP 验证核心交互，再逐步增强 |

---

## 二、Front-end Framework / Library 板块

### 2.1 关键资源

| 资源 | 亮点 | UX 相关性 |
|------|------|----------|
| **WTF is JSX** | 理解 JSX → DOM 的转换链路 | 知道组件何时触发重渲染，帮助设计「防抖/节流」策略 |
| **A DIY guide to build your own React** | Virtual DOM diff 算法 | 理解「变更最小化」原则，可应用于医生界面的「局部刷新」设计 |
| **Build Yourself a Redux** | 单向数据流、不可变状态 | 为 nexture 的 case review 流程设计统一状态规范 |
| **Building a frontend framework from scratch** | 组件 / 模板 / 状态 / VDOM 全链路 | 设计组件库时，参考「关注点分离」原则 |

### 2.2 对 nexture 的启示

**（1）Virtual DOM 的 UX 类比**

React 的 reconcile 过程就像医生的「扫读模式」——只看变化的帧，不逐帧重审。利用这个类比说服 Finn：
- 医生界面不应该全量刷新
- 要有「脏区域」标记，只重新渲染变更的 DOM 节点

**（2）Redux 与医疗器械状态管理的类比**

医疗器械对「状态可预测性」要求极高。借鉴 Redux：
- 每一个 UI action 都有明确的 state change 结果
- 不可产生「幽灵状态」（ghost state）——医生无法复现的界面行为
- 建议：在 `visual-spec-v1.md` 中增加「状态可预测性」章节

**（3）框架扩展点的 UX 考量**

「Building a Custom React Renderer」展示了 React 如何渲染到不同 target（DOM / Canvas / Terminal）。对 nexture 的启示：
- TheraSeus 可能需要渲染到 PDF 报告、渲染到 DICOM viewer
- 在设计组件时，预留「renderer 抽象接口」

---

## 三、Game / 3D Renderer 板块

### 3.1 关键资源

| 资源 | 核心概念 | UX 相关性 |
|------|---------|----------|
| **How OpenGL works: 500 lines** | 管线、顶点着色、片元着色 | 理解 GPU 渲染管线，才能设计「GPU 友好」的动画 |
| **Ray Tracing in One Weekend** | 光线追踪、材质、阴影 | 为医疗可视化（病灶高亮、血流动画）提炼物理隐喻 |
| **Space Invaders from Scratch** | 游戏循环、输入处理、碰撞检测 | 「输入 → 反馈」最短路径的工程实现 |
| **Video Game Physics Tutorial** | 刚体动力学、碰撞响应 | 元素入场动画的「物理感」设计（ease-out, bounce） |

### 3.2 对 nexture 的启示

**（1）游戏循环 ≈ 医生工作流**

游戏循环的核心结构：
```
while (running) {
  handleInput()    // 医生点击/键盘
  updateState()    // 数据过滤/推荐
  render()         // 界面更新
}
```

这个模式直接映射到 TheraSeus 医生界面：
- **handleInput** = 医生翻阅帧、确认/否定 AI 建议
- **updateState** = 图像队列更新、confidence score 重新计算
- **render** = 高亮区域绘制、UI 组件响应

**设计行动**：将医生工作流建模为显式的游戏循环，每个阶段的 UX 都要「响应即渲染」。

**（2）3D 渲染管线隐喻 → 医疗可视化设计**

从「Computer Graphics from scratch」学到的管线：
```
Application → Vertex Processing → Rasterization → Fragment Processing → Framebuffer
```

类比到医生界面：
```
临床输入 → AI 预处理（特征提取） → 置信度计算 → 可视化渲染 → UI 反馈
```

这帮助我理解：AI 推荐的「置信度」应该像 3D 渲染的「深度缓冲区」一样——有清晰的分层和优先级。

**设计行动**：在 T044（T-Reviewer UX 分析）中，将 AI 推荐分层设计为 Z-buffer 类比。

**（3）交互原语来自游戏设计**

游戏引擎提供了最成熟的「交互原语」库：
- Hover / Focus / Click 状态
- Drag & Drop
- Collision / Hit testing
- Physics-based animation

这些原语可以直接迁移到医疗 UI。对 nexture 的启发：
- **帧导航**借鉴游戏的「快进/慢放」控制
- **病灶标记**借鉴游戏的「高亮 + 详情弹窗」
- **批处理操作**借鉴 RTS 游戏的「框选」模式

---

## 四、「重建经典」学习模式的 UX 启示

### 4.1 为什么「从零建造」是 UX 学习的最佳路径

build-your-own-x 的核心理念：
> "What I cannot create, I do not understand." — Richard Feynman

这对 UX 设计师的启示：

| 误区 | 正确认知 |
|------|---------|
| 「设计师不需要懂实现」 | 理解实现约束，才能设计「可交付」方案 |
| 「交互感受是主观的」 | 好的交互来自对「输入 → 处理 → 输出」管线的精确控制 |
| 「动画是为了好看」 | 游戏动画服务于「反馈清晰度」和「空间感建立」 |

### 4.2 可落地的行动清单

| 行动项 | 具体做法 | 预期产出 |
|--------|---------|---------|
| 学习一个渲染管线 | 精读「500 lines OpenGL」，画管线图 | 对 GPU 加速动画有直观认知 |
| 实现一个最小状态机 | 用 React + 50 行代码实现 case review 工作流 | 为 T044 增加 state diagram |
| 拆解一个游戏交互 | 选一个开源小游戏，分析其 input → feedback 链路 | 提炼 3 个可复用的交互 pattern |
| 建立「框架约束」文档 | 基于 React 学习的收获，输出 nexture 组件设计约束 | 补充 `visual-spec-v1.md` |

---

## 五、推荐给 Nexture 团队的深度阅读

| 类别 | 资源 | 适用角色 | 推荐理由 |
|------|------|---------|---------|
| 框架 | [A DIY guide to build your own React](https://github.com/hexacta/didact) | 前端 / UX | 160 行理解 Virtual DOM，比文档更直观 |
| 渲染 | [How OpenGL works: 500 lines](https://github.com/ssloy/tinyrenderer/wiki) | 视觉 / 前端 | 软渲染理解 GPU 工作原理 |
| 游戏循环 | [Handmade Hero](https://handmadehero.org/) | 前端 / UX | 完整的「输入 → 更新 → 渲染」教学 |
| 状态管理 | [Build Yourself a Redux](https://zapier.com/engineering/how-to-build-redux/) | 前端 / 架构 | Redux 作者亲授，状态设计范式 |
| 3D 数学 | [Ray Tracing in One Weekend](https://raytracing.github.io/books/RayTracingInOneWeekend.html) | 视觉 / 医疗可视化 | 理解光/影/材质，对设计渲染效果有帮助 |

---

## 六、总结

### 核心收获

1. **框架是约束的艺术** — 设计组件时，明确「哪些是开发者可控的」，哪些必须是框架强制的
2. **状态 = UX 的血管** — 医疗界面尤其需要「零幽灵状态」的设计原则
3. **渲染管线决定体验上限** — 理解 GPU，才能设计「流畅」而不是「卡顿」的动效
4. **游戏交互是 UX 的原始语料库** — 按钮、拖拽、碰撞检测的模式，可以迁移到任何 UI
5. **从零建造是理解本质的最佳路径** — 不要只当「框架使用者」，要理解底层原理

### 下一步行动

- [ ] 为 T044（T-Reviewer UX）增加 State Machine Diagram（借鉴 Redux 模式）
- [ ] 补充 `visual-spec-v1.md` 的「渲染性能约束」章节
- [ ] 与 Finn 同步「帧导航」交互方案（借鉴游戏快进/慢放）

---

*Aria · 2026-03-17 · Sprint-03*
