# 运维手册

## 部署方式

### Docker 部署（推荐）

项目根目录提供了 `Dockerfile` 和 `docker-compose.yml`。

```bash
# 构建并启动
docker compose up -d

# 查看日志
docker compose logs -f localminidrama
```

服务默认运行在 `http://localhost:5679`。

Docker 部署包含两个容器：
- **localminidrama**：主应用（Node.js + SQLite）
- **cloudflared**：Cloudflare Tunnel（可选，通过 `CLOUDFLARE_TUNNEL_TOKEN` 环境变量启用）

持久化数据：
| 挂载点 | 说明 |
|--------|------|
| `lmd_data:/app/backend-node/data` | 数据库与上传文件 |
| `./backend-node/configs/config.yaml` | 自定义配置（只读） |

### 直接部署

```bash
cd backend-node
npm ci --production
npm run migrate
npm start
```

前端需先构建：
```bash
cd frontweb
npm ci
npm run build
```

构建产物位于 `frontweb/dist/`，后端会自动从该路径加载前端页面。

## 健康检查

| 端点 | 方法 | 说明 |
|------|------|------|
| `/health` | GET | 服务健康检查，返回 `{ status: "ok", app, version }` |
| `/api/v1/...` | - | 所有 API 端点前缀 |

## 配置文件

主配置文件：`backend-node/configs/config.yaml`

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `server.port` | 5679 | 后端端口 |
| `server.host` | 0.0.0.0 | 监听地址 |
| `server.cors_origins` | - | 允许的 CORS 来源 |
| `server.read_timeout` | 600 | 读取超时（秒） |
| `server.write_timeout` | 600 | 写入超时（秒） |
| `database.path` | ./data/drama_generator.db | SQLite 数据库路径 |
| `storage.local_path` | ./data/storage | 媒体文件存储目录 |
| `storage.base_url` | http://localhost:5679/static | 静态资源 URL |
| `video.generation_timeout_minutes` | 30 | 视频生成超时（分钟） |
| `language` | zh | 界面语言（zh/en） |
| `style.default_style` | - | 默认画风 |
| `style.default_image_ratio` | 16:9 | 默认图片比例 |
| `style.default_video_ratio` | 16:9 | 默认视频比例 |
| `vendor_lock.enabled` | false | 厂商锁定模式 |

## 数据目录

| 路径 | 说明 |
|------|------|
| `backend-node/data/drama_generator.db` | SQLite 数据库 |
| `backend-node/data/storage/images/` | 分镜图片 |
| `backend-node/data/storage/characters/` | 角色图片 |
| `backend-node/data/storage/scenes/` | 场景图片 |
| `backend-node/data/storage/videos/` | 视频片段 |
| `backend-node/data/storage/merged/` | 合成视频 |

## 常见问题

### Q: 后端启动报错 `Cannot find module 'better-sqlite3'`

```bash
cd backend-node
npm install
```

如果仍然报错，可能是 Node.js 版本不兼容，请升级到 >= 18。

### Q: 数据库损坏或迁移失败

停止服务后备份 `data/drama_generator.db`，删除该文件后重新启动，系统会自动创建新数据库并执行迁移。

### Q: 图片/视频生成失败

1. 检查 AI 配置是否正确（API Key、模型名称）
2. 查看后端日志中的错误信息
3. 确认 API 服务商账户余额充足

### Q: 文件上传限制

后端限制 JSON body 最大 10MB，文件上传最大 16MB（multer 配置）。

### Q: Docker 部署无法访问 API

确认 `docker-compose.yml` 中端口映射正确，且 `config.yaml` 中 `server.host` 为 `0.0.0.0`。

## 升级注意事项

- 升级前备份 `data/` 目录
- 数据库迁移脚本在启动时自动执行，一般无需手动操作
- 查看 [CHANGELOG.md](../CHANGELOG.md) 了解版本变更