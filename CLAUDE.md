# 项目上下文

给在此仓库工作的 AI 助手的说明。人类可读的完整交接见 `HANDOFF.md`。

## 这是什么

一个以展示和交互为主的个人网站。前端是重点，后端只提供基础读取接口，
不涉及复杂计算或数据处理。

## 技术栈

- 前端：React 19 + Vite 6 + TypeScript + Tailwind CSS v4
- 后端：Node 22 + Hono + TypeScript
- 反向代理：Caddy（同时提供静态文件）
- 部署：Docker Compose，单机
- 对外：Cloudflare Tunnel（无入站端口）
- 数据库：**目前没有**。内容存在 `api/src/data/moments.json`

## 目录

```
web/                  前端
  src/App.tsx         主组件
  public/images/      静态图片，通过 /images/xxx.jpg 访问
api/                  后端
  src/index.ts        全部路由
  src/data/moments.json  内容数据
Caddyfile             路由：/api/* → 后端，其余 → 前端
Dockerfile.web        前端构建 + Caddy 运行
Dockerfile.api        后端构建 + 运行
docker-compose.yml
```

## 硬约束

改动时必须遵守，违反会导致部署失败或线上故障：

1. **服务器是 AWS Lightsail 东京，4GB 内存 / 2 vCPU。**
   compose 里每个服务都设了 `mem_limit`，新增服务时也要设。
   避免引入内存开销大的依赖。

2. **构建在服务器上进行**（`docker compose up -d --build`）。
   2 vCPU 的构建很慢，避免引入编译时间长的工具链。
   前端依赖尽量克制。

3. **对外只有 Cloudflare Tunnel，没有开放入站端口。**
   不要假设可以直接访问服务器 IP 或某个端口。
   宿主机的防火墙由 Lightsail 控制台管理，只放行 SSH。

4. **不要在宿主机上装东西。** 所有服务跑在容器里。
   这台机器之后还会跑代理软件，宿主机保持干净能避免 iptables 冲突。
   代理相关的规则应写入 `DOCKER-USER` 链，不要改 `FORWARD` 默认策略。

5. **Cloudflare 免费套餐的限制**：单请求 body 上限 100MB；
   源站响应超过 100 秒返回 524。长任务要改成异步。
   WebSocket 是支持的。

6. **不要用 localStorage / sessionStorage 之外的浏览器存储假设**，
   也不要引入需要服务端 session 的方案——目前没有 Redis。

## 约定

- API 路径一律以 `/api/` 开头，否则会被 Caddy 当成前端路由。
- 前端路由用 history 模式没问题，Caddyfile 里 `try_files` 已处理刷新 404。
- 后端返回 JSON，列表接口省略 `body` 字段，详情接口才返回完整对象。
- 新增内容改 `api/src/data/moments.json`，然后 `docker compose restart api`。
- `api/package.json` 的 build 脚本里有 `cp -r src/data dist/data`，
  因为 `tsc` 不复制非 TS 文件。新增静态资源目录时记得同步这行。

## 设计

前端目前是验证用的占位样式，**不是最终设计**，可以整体推翻重做。
方向未定，需要先和用户确认网站的具体内容和风格。

## 尚未决定 / 待办

- 网站的具体内容和功能范围
- 是否需要数据库（有写入需求时才加 Postgres）
- 图片存本地 volume 还是 Cloudflare R2
- CI/CD（目前是手动 `git pull && docker compose up -d --build`）
