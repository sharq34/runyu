# 交接文档

## 1. 目标与分工

给太太做一个以展示、交互为主的个人网站。后端只做基础读取，不涉及复杂计算。

- **本文档产生的 session**：负责选型、搭骨架、跑通 Lightsail + Cloudflare 部署链路
- **本地 IDE 的开发**：负责功能开发和视觉设计

## 2. 环境现状

| 项目 | 值 |
|---|---|
| 服务器 | AWS Lightsail，东京区 |
| 配置 | 4GB 内存 / 2 vCPU / 80GB SSD / 4TB 流量 |
| 价格 | $24/月 |
| 网络类型 | Dual-stack（有公网 IPv4） |
| 系统 | Ubuntu |
| 登录用户 | `ubuntu`（root 不能直接 SSH，用 `sudo -i`） |
| 静态 IP | 已绑定 |
| 域名 | 已在 Cloudflare 注册，DNS 托管在 Cloudflare |

已在服务器上完成：系统更新、Docker、2GB swap、时区、`~/app` 工作目录。

**没有装 ufw，也不要装。** Lightsail 控制台的防火墙在实例外部生效，
机器内再装一层会和 Docker 自己管理的 iptables 链冲突。

## 3. 架构

```
用户 ──▶ Cloudflare 边缘 ◀══════ cloudflared ──▶ web(Caddy) ──┬─▶ 静态文件
        (TLS/CDN/WAF)      出站长连接                          └─▶ api(Node):3000
```

三个容器：

| 服务 | 作用 | 内存上限 |
|---|---|---|
| `web` | Caddy，提供前端静态文件 + 反代 `/api` | 256MB |
| `api` | Node + Hono，读取 JSON 返回数据 | 512MB |
| `cloudflared` | 向 Cloudflare 建立出站隧道 | 128MB |

**没有数据库。** 内容存在 `api/src/data/moments.json`。等出现真实写入需求
（留言、后台编辑）再加 Postgres。

## 4. 选型理由

记录下来是为了以后有人问"为什么不用 X"时不用重新推导。

**为什么 VPS + Docker，不用 Cloudflare Workers**
Workers 的 workerd 运行时不是完整 Node，没有常驻进程，有 CPU 时间上限，
且 vendor lock-in 重。VPS 换来任意语言、真数据库、长连接、本地即生产。

**为什么 Lightsail，不用 EC2**
EC2 要自己配 VPC、子网、路由表、安全组、EBS、弹性 IP，账单也是拼出来的。
Lightsail 是一口价、开箱即用，底层同样是 AWS 基础设施。
真需要伸缩或托管数据库时再迁 EC2，Docker 封装让迁移成本很低。

**为什么东京，不用香港**
这台机器之后要兼做访问 AI 服务的出口。香港 IP 被 OpenAI 和 Anthropic 屏蔽。
（注：如果最终走美国住宅代理出口，机房位置就不影响这一点了。）

**为什么 Cloudflare Tunnel，不用 A 记录 + 橙云代理**
Tunnel 是出站连接，因此不用开任何入站端口、不用装证书、不暴露真实 IP。
代价是多一跳延迟，以及依赖 Cloudflare 可用性。
另外这台机器要跑代理软件，代理常占用 443，Tunnel 避开了端口冲突。

**为什么 Node/TS 后端，不用 Go 或 Rust**
前端必然写 TypeScript，后端同语言可共享类型定义。
Go 的性能优势在纯 CRUD 上体现不出来；Rust 在 2 vCPU 机器上的编译时间会
严重拖慢迭代。以后想换，改一个 Dockerfile 即可，前端零改动。

**为什么用 Caddy 而不是 Nginx**
配置文件短得多，且前端产物直接烤进 Caddy 镜像，省掉一个容器。

## 5. 部署

### 首次

```bash
ssh ubuntu@<静态IP>
cd ~/app
git clone <仓库地址> .
cp .env.example .env
vi .env            # 填 TUNNEL_TOKEN
docker compose up -d --build
```

### 更新

```bash
cd ~/app && git pull && docker compose up -d --build
```

### Cloudflare Tunnel 配置

1. Cloudflare Dashboard → Zero Trust → Networks → Tunnels → Create a tunnel
2. 选 Cloudflared，命名，拿到 token，填进服务器上的 `.env`
3. Public Hostname 里加一条：
   - Subdomain：留空（或填 `www`）
   - Domain：你的域名
   - Service：`HTTP` → `web:80`

`web` 是 compose 服务名，`cloudflared` 容器通过 Docker 内置 DNS 解析它。

## 6. 运维手册

```bash
docker compose ps                  # 容器状态
docker compose logs -f             # 全部日志
docker compose logs -f api         # 只看后端
docker compose restart api         # 改完 JSON 内容后重启
docker compose down                # 停止
docker system prune -a             # 清理镜像和构建缓存，释放磁盘
free -h                            # 内存
df -h /                            # 磁盘
```

排查顺序：

1. `docker compose ps` — 有没有容器挂了
2. `docker compose logs cloudflared` — 隧道连上没有
3. `curl localhost:80/api/health` — 在服务器上直接打，绕过 Cloudflare
4. Cloudflare Dashboard 看 Tunnel 状态是不是 Healthy

## 7. 已知限制与坑

- **Cloudflare 免费套餐**：请求 body 上限 100MB；源站响应超 100 秒返回 524。
  大文件上传要走 R2 预签名，长任务要改异步。WebSocket 支持没问题。
- **Lightsail 静态 IP 闲置计费**：解绑后超过 1 小时按 $0.005/小时 收费。
  删实例时记得一并删 IP。
- **Lightsail 停机不停计费**：stop 之后照样收，不用了要 delete。
- **升级配置要走快照**：Lightsail 不能原地改配置，流程是
  快照 → 用快照建新实例（更大套餐）→ 把静态 IP 转挂过去 → 删旧实例。
  只能升不能降。
- **`tsc` 不复制 JSON**：`api/package.json` 的 build 脚本里有
  `cp -r src/data dist/data`。新增静态资源目录要同步改这行。
- **以后装代理软件时**：先装 Docker 再装代理；代理的转发规则写进
  `DOCKER-USER` 链，不要改 `FORWARD` 默认策略，否则容器网络会断。

## 8. 待办

按优先级：

1. **确定网站内容和功能范围** — 决定后面所有事
2. **视觉设计** — 当前前端是验证用占位，可整体推翻
3. **图片方案** — 本地 volume（简单，要自己备份）vs Cloudflare R2（出网免费，配置多一点）
4. **数据库** — 有写入需求时加 Postgres；届时记得配置 volume 和 `pg_dump` 备份，
   并真的演练一次恢复
5. **CI/CD** — 现在是手动 `git pull`。可换成 GitHub Actions 构建镜像推 GHCR，
   服务器上 pull
6. **代理迁移** — 搬瓦工到期后把代理迁到这台

## 9. 数据备份

**目前没有需要备份的数据**——内容在 Git 仓库里的 JSON 文件中。

加了 Postgres 之后，必须建立备份：`pg_dump` 定时导出 + 上传到 R2/S3，
并且**真的演练一次恢复**。没验证过的备份等于没有备份。
