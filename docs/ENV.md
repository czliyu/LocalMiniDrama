# 环境变量

<!-- AUTO-GENERATED from codebase sources -->

## Docker 环境变量

| 变量 | 必需 | 描述 | 默认值 |
|------|------|------|--------|
| `CLOUDFLARE_TUNNEL_TOKEN` | 否 | Cloudflare Tunnel 令牌，设置后启用 cloudflared 容器 | - |
| `TZ` | 否 | 容器时区 | `Asia/Shanghai` |

## 后端环境变量

| 变量 | 必需 | 描述 | 默认值 |
|------|------|------|--------|
| `WEB_DIST_PATH` | 否 | 前端构建产物目录的绝对路径 | `../frontweb/dist`（相对于 `backend-node/`） |

<!-- END AUTO-GENERATED -->

> 本项目不依赖 `.env` 文件。后端配置通过 `backend-node/configs/config.yaml` 管理，AI 服务配置通过软件内「AI 配置」页面管理。