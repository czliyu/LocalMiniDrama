# 贡献指南

## 项目结构

```
LocalMiniDrama/
├── backend-node/        # Express + SQLite 后端
│   ├── src/
│   │   ├── routes/      # API 路由
│   │   ├── services/    # 业务逻辑
│   │   ├── db/          # 数据库连接与迁移
│   │   ├── config/      # 配置加载
│   │   ├── utils/       # 工具函数
│   │   ├── constants/   # 常量定义
│   │   ├── app.js       # Express 应用工厂
│   │   └── server.js    # 入口文件
│   └── configs/         # YAML 配置文件
├── frontweb/            # Vue 3 + Vite 前端
│   └── src/
│       ├── api/         # API 请求封装
│       ├── views/       # 页面组件
│       ├── stores/      # Pinia 状态管理
│       ├── router/      # Vue Router 路由
│       ├── components/  # 通用组件
│       ├── composables/ # 组合式函数
│       ├── utils/       # 工具函数
│       ├── constants/   # 常量定义
│       └── styles/      # 全局样式
├── docs/                # 文档
└── desktop/             # (已废弃) Electron 桌面端
```

## 环境要求

| 依赖 | 版本要求 |
|------|----------|
| Node.js | >= 18 |
| npm | 随 Node.js 附带 |

## 可用脚本

### 后端 (`backend-node/`)

| 命令 | 描述 |
|------|------|
| `npm start` | 启动生产服务（端口 5679） |
| `npm run dev` | 开发模式，`node --watch` 热重载 |
| `npm run migrate` | 手动执行数据库迁移 |
| `npm run migrate:07` | 运行特定迁移脚本 |

### 前端 (`frontweb/`)

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器（端口 3013，代理 API 到 5679） |
| `npm run build` | 生产构建 |
| `npm run preview` | 预览构建产物 |

## 启动开发环境

```bash
# 终端 1：启动后端
cd backend-node
npm install
npm run migrate   # 首次运行需要
npm run dev

# 终端 2：启动前端
cd frontweb
npm install
npm run dev
```

浏览器访问 `http://localhost:3013`。

## 测试

```bash
# 后端测试
cd backend-node && node --test test/*.test.js

# 前端测试
cd frontweb && node --test test/*.test.js
```

本项目使用 Node.js 内置测试运行器 (`node:test`)，未配置 ESLint 或其他 lint 工具。

## 代码风格

- 纯 JavaScript，不使用 TypeScript
- 后端使用 CommonJS (`require`/`module.exports`)
- 前端使用 ES Modules (`import`/`export`)
- 遵循 [common/coding-style.md](../.claude/rules/ecc/common/coding-style.md) 中的编码风格

## API 规范

- 所有 API 路由注册在 `backend-node/src/routes/index.js`
- 基础路径：`/api/v1`
- 响应格式遵循统一的 `{ success, data, error, timestamp }` 结构（定义在 `backend-node/src/response.js`）
- 分页响应：`{ success, data: { items, pagination } }`

## AI 配置

AI 服务通过软件内「AI 配置」页面管理，无需手动编辑 YAML。详见 [AI 配置指南](configuration.md)。

## 数据库

- SQLite，自动创建在 `backend-node/data/drama_generator.db`
- 迁移脚本位于 `backend-node/migrations/`，启动时自动执行
- 首次运行需执行 `npm run migrate`

## 提交 PR

1. 确保所有测试通过
2. 提交信息使用约定式提交格式：`<type>: <description>`
3. 类型：feat, fix, refactor, docs, test, chore, perf, ci