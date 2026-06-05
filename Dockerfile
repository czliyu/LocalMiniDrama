# ============================================================
# Stage 1: 构建前端 (Vue 3 + Vite)
# ============================================================
FROM node:18-bookworm AS frontend-builder

WORKDIR /build/frontweb
COPY frontweb/package*.json ./
RUN npm ci --ignore-scripts

COPY frontweb/ ./
RUN npm run build

# ============================================================
# Stage 2: 构建后端依赖 (Node.js + Express + better-sqlite3)
# ============================================================
FROM node:18-bookworm AS backend-builder

WORKDIR /build/backend-node
COPY backend-node/package*.json ./
RUN npm ci

COPY backend-node/ ./

# ============================================================
# Stage 3: 运行容器
# ============================================================
FROM node:18-bookworm-slim

# better-sqlite3 需要 node-gyp 编译原生模块
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend-node

# 复制后端代码
COPY --from=backend-builder /build/backend-node ./

# 复制前端构建产物 — 后端会自动从 ../frontweb/dist 加载
COPY --from=frontend-builder /build/frontweb/dist /app/frontweb/dist

# 持久化数据目录
VOLUME ["/app/backend-node/data"]

EXPOSE 5679

CMD ["node", "src/server.js"]
