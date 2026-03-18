# T043-build-your-own-x-finn.md
## Finn · 前端工程师视角的 build-your-own-x 学习笔记

> 分析日期：2026-03-17  
> 任务来源：Victor 指令 T043-fe  
> 核心问题：我们能从"从零造轮子"中学到什么前端工程智慧？

---

## 一、核心洞见摘要（3 条可落地法则）

### 1.1 法则一：VDOM 不是魔法，是精心设计的数据结构

**洞察来源**：[pomb.us/build-your-own-react](https://pomb.us/build-your-own-react/)  
**对 Nexture 的启示**：

React 的 Virtual DOM 本质是一个「**纯 JS 对象树 + 增量更新算法**」。这不是魔法，而是：

```javascript
// VDOM 节点本质是一个 plain object
{
  type: 'div',
  props: { className: 'card', children: [...] },
  effectTag: 'UPDATE' // PLACEMENT | DELETION
}
```

**可落地行动**：
- 在高频更新的 UI 区域（如 FindingsTable 实时过滤），考虑手动管理「状态快照」而非依赖全量 re-render
- 理解 useMemo/useCallback 的真正价值：它是手动优化的 escape hatch，不是性能银弹

---

### 1.2 法则二：渲染器分离（Reconciler × Renderer）是架构复用的关键

**洞察来源**：[didact](https://github.com/hexacta/didact) + [Custom React Renderers](https://hackernoon.com/learn-you-some-custom-react-renderers-aed7164a4199)  
**对 Nexture 的启示**：

React 18+ 的架构分离（Reconciler ↔ Renderer）意味着：
- 同一套 diff 算法可以渲染到 DOM、Canvas、WebGL、甚至 Native

**可落地行动**：
- TheraSeus 的「55,000 帧 → 1,250 精选」过滤器，考虑用 Canvas 渲染预览而非 DOM 列表
- 如果将来要做医生端的桌面/移动 App，React Native 可复用同一个 reconciler

---

### 1.3 法则三：物理引擎思维 = 数据可视化的「可信度引擎」

**洞察来源**：
- [Game Physics Tutorial (Toptal)](https://www.toptal.com/game/video-game-physics-part-i-an-introduction-to-rigid-body-dynamics)
- [How Physics Engines Work](http://buildnewgames.com/gamephysics/)

**对 Nexture 的启示**：

医疗数据可视化（如bleeding detection confidence score 的热力图）需要：

| 物理引擎概念 | 医疗可视化映射 |
|-------------|--------------|
| 刚体碰撞检测 | 数据异常点定位 |
| 阻尼/摩擦力 | confidence 的平滑过渡 |
| 约束求解 (Constraint Solving) | 多维度指标关联（如位置 × 置信度 × 病变类型）|

**可落地行动**：
- 为 FindingsTable 添加「物理感」：hover/focus 动画使用 spring physics（[react-spring](https://www.react-spring.org/)）而非线性插值
- 粒子系统（HeroParticles）改用 GPU 加速，确保 60fps

---

## 二、深度分析：前端框架底层原理

### 2.1 React 核心机制速览

| 机制 | 原理 | Source |
|-----|------|--------|
| **createElement** | JSX → Plain Object 转换 | [pomb.us/build-your-own-react](https://pomb.us/build-your-own-react/) |
| **Fiber Tree** | 工作单元的可中断数据结构 | 同上 |
| **Reconciliation** | Diff 算法 + effectTag (PLACEMENT/UPDATE/DELETION) | 同上 |
| **Work Loop** | requestIdleCallback 调度 | 同上 |

### 2.2 Redux 核心机制速览

| 机制 | 原理 | Source |
|-----|------|--------|
| **Store** | 单向数据流 + listener 订阅模式 | [zapier.com/engineering/how-to-build-redux](https://zapier.com/engineering/how-to-build-redux/) |
| **Dispatcher** | Action → Reducer 纯函数转换 | 同上 |
| **Selector** | 派生数据的 memoization | 同上 |

**对 Nexture 的启示**：
- TheraSeus 的「分类过滤」逻辑可以借鉴 Redux 模式：filterState → derivedView
- 如果状态复杂度超过 3 个关联变量，考虑引入状态管理库（Zustand/Jotai 比 Redux 更轻量）

### 2.3 组件设计模式的可学之处

从 [Make Your Own AngularJS](http://teropa.info/blog/2013/11/03/make-your-own-angular-part-1-scopes-and-digest.html) 学的：

```javascript
// AngularJS $digest 循环原理
while (dirtyCheckCount < maxIterations) {
  scope.$evalAsync(); // 批量执行 watch
  if (!digestPending) break;
}
```

**关键认知**：
- 所有现代框架都在解决同一个问题：**「状态变更 → UI 同步」的最小化**
- dirty checking（脏检查）vs Virtual DOM diff，各有优劣场景

---

## 三、3D/可视化资源专项分析

### 3.1 必读资源清单

| 资源 | 语言 | 难度 | 推荐度 | 适用场景 |
|------|------|------|--------|---------|
| [Tiny Renderer](https://github.com/ssloy/tinyrenderer/wiki) | C++ | ⭐⭐⭐ | ★★★★★ | 理解 GPU 渲染管线 |
| [Learn how OpenGL works: 500 lines](https://github.com/ssloy/tinyrenderer) | C++ | ⭐⭐⭐ | ★★★★☆ | 软件渲染入门 |
| [Soft 3D Engine (JS/TS)](https://www.davrous.com/2013/06/13/tutorial-series-learning-how-to-write-a-3d-soft-engine-from-scratch-in-c-typescript-or-javascript/) | TypeScript | ⭐⭐ | ★★★★★ | Web 前端 3D 入门 |
| [Computer Graphics from Scratch](http://www.gabrielgambetta.com/computer-graphics-from-scratch/introduction.html) | Pseudocode | ⭐⭐ | ★★★★☆ | 射线追踪原理 |

### 3.2 对 Nexture 数据可视化的具体影响

**现状痛点**：
- HeroParticles 依赖 @tsparticles/react，GPU 利用率不明
- Canvas/WebGL 混用可能带来性能瓶颈

**建议行动**：
1. 学习 Tiny Renderer 的「Z-Buffer」原理，优化 FindingsTable 的层叠显示
2. 考虑用 WebGL 替代部分 Canvas 渲染（@react-three/fiber 更成熟）

---

## 四、性能与工程质量提升路径

### 4.1 代码质量提升资源

| 资源 | 核心收获 |
|------|---------|
| [Write a Hash Table in C](https://github.com/jamesroutley/write-a-hash-table) | 理解 O(1) 查找背后的数据结构设计 |
| [JavaScript Algorithms](https://github.com/trekhleb/javascript-algorithms) | 常见算法在前端的实践（memoization, debounce, throttle） |
| [Tiny Package Manager](https://github.com/g-plane/tiny-package-manager) | 理解 npm/yarn 依赖解析机制，升级时避免踩坑 |

### 4.2 性能意识 checklist

从 [Linux containers in 500 lines](https://blog.lizzie.io/linux-containers-in-500-loc.html) 学的：

> **所有性能问题都是资源分配问题**（CPU 时间片、内存、I/O 带宽）

**Nexture 前端性能红线**：
- [ ] 包体积 > 300KB gzipped → 拆分 code spliting
- [ ] 主线程阻塞 > 100ms → 迁移到 Web Worker
- [ ] 动画帧率 < 55fps → 检查 layout thrashing（forced synchronous layout）

---

## 五、Top 5 可落地行动清单

| 优先级 | 行动 | 预期收益 | 对应资源 |
|--------|------|---------|---------|
| P0 | FindingsTable → react-virtual 虚拟滚动 | 55,000 帧列表瞬间渲染 | 参考 [JavaScript Virtual DOM](https://medium.com/@deathmood/how-to-write-your-own-virtual-dom-ee6a3a23058d) |
| P0 | HeroParticles → @react-three/fiber 重写 | 60fps guaranteed | Tiny Renderer 原理 |
| P1 | 状态重构：提取 filterStore | 可测试性↑ bug ↓ | Redux 原理 |
| P2 | 添加 perf monitor (Lighthouse CI) | 性能退化早发现 | CI pipeline |
| P2 | 组件 API 文档化（.props.ts） | 协作效率↑ | 借鉴 Didact API 设计 |

---

## 六、推荐深入学习的资源

### 6.1 入门级（1-2 小时）

| 主题 | 资源 | 时长 |
|------|------|------|
| React Core | [WTF is JSX](https://jasonformat.com/wtf-is-jsx/) | 15min |
| Virtual DOM | [How to write your own Virtual DOM](https://medium.com/@deathmood/how-to-write-your-own-virtual-dom-ee6a3a23058d) | 20min |
| Redux | [Build Yourself a Redux](https://zapier.com/engineering/how-to-build-redux/) | 30min |

### 6.2 进阶级（1-2 天）

| 主题 | 资源 | 时长 |
|------|------|------|
| React Complete | [pomb.us/build-your-own-react](https://pomb.us/build-your-own-react/) | 2hr |
| Compiler Basics | [The Super Tiny Compiler](https://github.com/jamiebuilds/the-super-tiny-compiler) | 4hr |
| 3D Rendering | [Soft 3D Engine (TS)](https://www.davrous.com/2013/06/13/tutorial-series-learning-how-to-write-a-3d-soft-engine-from-scratch-in-c-typescript-or-javascript/) | 1day |

---

## 七、总结

build-your-own-x 项目的核心价值不是让我们真的去造轮子，而是：

1. **理解黑盒内部**：知道框架为什么那么设计（而不是盲目吐槽）
2. **建立性能直觉**：当 UI 卡顿时，能定位到是 reconciler/repaint/reflow 中的哪一层
3. **做架构决策时更有底气**：选择 Vue/React/Solid 时，不是跟风而是基于原理理解

**下一步**：建议在 Sprint-04 中选一个「小轮子」实际实现（如自己的 useWhyDidYouUpdate hook），巩固今日所学。

---

