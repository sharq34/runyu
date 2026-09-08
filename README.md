# 项目骨架

前端 React + Vite + Tailwind，后端 Node + Hono，Caddy 做静态服务和 API 反代，
Cloudflare Tunnel 负责对外暴露。目前不含数据库。

## 目录

```
web/            前端
api/            后端
Dockerfile.web  前端构建 + Caddy 运行镜像
Dockerfile.api  后端构建 + 运行镜像
Caddyfile       路由规则：/api/* → 后端，其余 → 前端
docker-compose.yml
```

## 本地开发

前后端分两个终端跑，改代码即时生效。

```bash
# 终端 1
cd api && npm install && npm run dev

# 终端 2
cd web && npm install && npm run dev
```

打开 http://localhost:5173 。前端请求 `/api/*` 会被 Vite 代理到 3000 端口的后端。

## 部署到服务器

```bash
git clone <你的仓库> app && cd app
cp .env.example .env
# 编辑 .env，填入 TUNNEL_TOKEN
docker compose up -d --build
```

查看状态和日志：

```bash
docker compose ps
docker compose logs -f
```

更新代码后重新部署：

```bash
git pull && docker compose up -d --build
```

## 常用命令

```bash
docker compose down          # 停止并删除容器（数据卷保留）
docker compose restart api   # 只重启后端
docker system prune -a       # 清理镜像和构建缓存，释放磁盘
```
# runyu
