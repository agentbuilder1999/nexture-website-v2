# Nexture Code Conventions
> Finn / Rex 必读。所有代码必须符合本规范。

## Git 规范

### 分支命名
```
feat/frontend-<feature>   # Finn
feat/backend-<feature>    # Rex
fix/frontend-<issue>
fix/backend-<issue>
```

### Commit 格式（Conventional Commits）
```
feat: add user authentication endpoint
fix: resolve null pointer in image upload
test: add unit tests for task service
docs: update API spec for /health endpoint
refactor: extract validation logic to utils
```
- 小写开头，不加句号，≤72 字符
- commit early, commit often — 每个逻辑单元独立 commit

### PR 规则
- 目标分支：`develop`（不直接 merge main）
- PR 描述必须包含：What / Why / How to test
- Victor 审阅后合并

---

## Frontend（Finn）

### 技术栈
- Next.js 15 (App Router)
- TypeScript（严格模式）
- Tailwind CSS v4 + shadcn/ui
- pnpm 包管理

### 文件结构
```
src/
  app/          # 路由页面
  components/   # 可复用组件
    ui/         # shadcn 基础组件
    features/   # 业务组件
  lib/          # 工具函数
  types/        # TypeScript 类型
  hooks/        # 自定义 hooks
```

### 规范
- 组件文件名：PascalCase（`UserCard.tsx`）
- 工具函数：camelCase（`formatDate.ts`）
- 每个组件必须有 TypeScript props 类型定义
- 禁止 `any` 类型
- 测试：Vitest + Testing Library

---

## Backend（Rex）

### 技术栈
- Python 3.11+
- FastAPI + Pydantic v2
- SQLAlchemy 2.0 (async)
- uv 包管理
- pytest 测试

### 文件结构
```
src/
  api/          # 路由 (routers/)
  models/       # SQLAlchemy 模型
  schemas/      # Pydantic schemas
  services/     # 业务逻辑
  core/         # 配置、依赖注入
  tests/        # pytest 测试
```

### 规范
- 文件名：snake_case
- 类名：PascalCase
- 每个端点必须有 response_model
- 所有函数必须有类型注解
- 数据库操作走 service 层，不在 router 里直接操作

---

## 共同规范

- 敏感信息：环境变量，禁止 hardcode
- TODO 注释格式：`# TODO(agent-id): description`
- 删除废弃代码，不注释保留
- 临时调试代码用完即删
- `.env.example` 必须随代码更新
