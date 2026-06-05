# Plan: 多用户认证 + 数据隔离（最小化方案）

**Complexity**: Small-Medium

## Summary

为 LocalMiniDrama 添加用户认证（注册/登录/JWT）和 dramas 表级别的数据隔离。核心原则：**不动 46 个现有路由/服务文件**，只新增 auth 层 + 在 drama 列表查询加 `user_id` 过滤。

## 不改的文件（明确豁免）

- `src/services/*.js`（24 个服务文件）— 零改动
- `src/routes/*.js` 中除 `drama.js` 外的 22 个路由文件 — 零改动
- `src/app.js`、`src/server.js`、`src/response.js`、`src/logger.js` — 零改动
- `configs/config.yaml` — 零改动
- 前端 `FilmCreate.vue`、`DramaDetail.vue`、`AiConfig.vue` 等核心页面 — 零改动

## 依赖

```bash
cd backend-node && npm install bcryptjs
```

`jsonwebtoken` 已在 `package.json` 中（被 Kling JWT 使用），无需新增。

## 文件改动清单

| # | 文件 | 操作 | 行数 |
|---|------|------|------|
| 1 | `backend-node/migrations/23_create_users.sql` | CREATE | ~25 |
| 2 | `backend-node/migrations/24_add_dramas_user_id.sql` | CREATE | ~3 |
| 3 | `backend-node/src/db/migrate.js` | UPDATE (+5行) | 在 `ensureAllColumns` 末尾加 users 表兜底建表 + 补 user_id 列 |
| 4 | `backend-node/src/middleware/auth.js` | CREATE | ~50 |
| 5 | `backend-node/src/routes/auth.js` | CREATE | ~90 |
| 6 | `backend-node/src/routes/index.js` | UPDATE (+4行) | 注册 auth 路由 + 挂载中间件 |
| 7 | `backend-node/src/routes/drama.js` | UPDATE (+4行) | `listDramas`/`getDramaStats` 加 `WHERE user_id = ?`；`createDrama` 加 `user_id` |
| 8 | `frontweb/src/views/Login.vue` | CREATE | ~180 |
| 9 | `frontweb/src/stores/auth.js` | CREATE | ~60 |
| 10 | `frontweb/src/router/index.js` | UPDATE (+6行) | 加 `/login` 路由 + 导航守卫 |
| 11 | `frontweb/src/utils/request.js` | UPDATE (+8行) | 请求拦截器 token + 401 跳转 |

## 数据隔离逻辑

```
dramas 表加 user_id → 每个用户只能看到自己的项目
  │
  ├─ characters (通过 drama_id 归属)          → 无需 user_id
  ├─ episodes   (通过 drama_id 归属)          → 无需 user_id
  ├─ storyboards (通过 episode_id → drama_id) → 无需 user_id
  ├─ scenes/props/image/video 同理            → 无需 user_id
  └─ ai_service_configs 不隔离               → 全局共享
```

API 路径本身就包含 drama_id/episode_id，不存在跨用户访问的通道。

## 风险

| 风险 | 概率 | 缓解 |
|------|------|------|
| token 签发后无法撤销 | 低 | 方案三也不做撤销，可接受 |
| 遗漏 drama 查询点 | 低 | 只有 3 个点：listDramas, createDrama, getDramaStats |
| bcryptjs 密码 hash 性能 | 低 | 仅登录/注册时调用，单用户场景无压力 |