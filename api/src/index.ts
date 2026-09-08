import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export type Moment = {
  id: string
  date: string
  title: string
  summary: string
  body: string
  image: string | null
}

// 内容存在 JSON 文件里，进程启动时读一次。
// 改内容后重启容器生效：docker compose restart api
// 以后接数据库的话，把这个函数换成查询即可，接口形状不变。
async function loadMoments(): Promise<Moment[]> {
  const raw = await readFile(join(__dirname, 'data', 'moments.json'), 'utf-8')
  const moments = JSON.parse(raw) as Moment[]
  // 按日期倒序，最新的在前
  return moments.sort((a, b) => b.date.localeCompare(a.date))
}

const moments = await loadMoments()

const app = new Hono()

// 健康检查。部署后用它确认服务活着。
app.get('/api/health', (c) =>
  c.json({ ok: true, count: moments.length, time: new Date().toISOString() })
)

// 列表：不返回 body，减少传输量
app.get('/api/moments', (c) =>
  c.json(moments.map(({ body, ...rest }) => rest))
)

// 详情
app.get('/api/moments/:id', (c) => {
  const moment = moments.find((m) => m.id === c.req.param('id'))
  if (!moment) return c.json({ error: 'not found' }, 404)
  return c.json(moment)
})

const port = Number(process.env.PORT ?? 3000)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`api listening on :${info.port} (${moments.length} moments)`)
})
