import { useEffect, useState } from 'react'

type MomentSummary = {
  id: string
  date: string
  title: string
  summary: string
  image: string | null
}

type Moment = MomentSummary & { body: string }

type State =
  | { status: 'loading' }
  | { status: 'ready'; moments: MomentSummary[] }
  | { status: 'error'; message: string }

export default function App() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [openId, setOpenId] = useState<string | null>(null)
  const [detail, setDetail] = useState<Moment | null>(null)

  useEffect(() => {
    fetch('/api/moments')
      .then((res) => {
        if (!res.ok) throw new Error(`后端返回 ${res.status}`)
        return res.json()
      })
      .then((moments: MomentSummary[]) => setState({ status: 'ready', moments }))
      .catch((err: Error) => setState({ status: 'error', message: err.message }))
  }, [])

  // 展开某一条时才去取正文
  useEffect(() => {
    if (!openId) {
      setDetail(null)
      return
    }
    let cancelled = false
    fetch(`/api/moments/${openId}`)
      .then((res) => res.json())
      .then((m: Moment) => {
        if (!cancelled) setDetail(m)
      })
    return () => {
      cancelled = true
    }
  }, [openId])

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <header>
          <h1 className="text-3xl font-medium tracking-tight">待命名</h1>
          <p className="mt-2 text-stone-600">
            内容来自 api/src/data/moments.json，改那个文件就能改这里。
          </p>
        </header>

        <div className="mt-14">
          {state.status === 'loading' && (
            <p className="text-stone-500">载入中…</p>
          )}

          {state.status === 'error' && (
            <div className="rounded border border-red-200 bg-red-50 p-4">
              <p className="font-medium text-red-900">读取后端数据失败</p>
              <p className="mt-1 text-sm text-red-700">{state.message}</p>
              <p className="mt-3 text-sm text-red-700">
                确认后端在运行：<code>docker compose ps</code>
              </p>
            </div>
          )}

          {state.status === 'ready' && (
            <ul className="space-y-10">
              {state.moments.map((m) => {
                const isOpen = openId === m.id
                return (
                  <li key={m.id} className="border-l-2 border-stone-300 pl-6">
                    <time className="block text-sm text-stone-500">{m.date}</time>
                    <h2 className="mt-1 text-lg font-medium">{m.title}</h2>
                    <p className="mt-1 text-stone-600">{m.summary}</p>

                    {m.image && (
                      <img
                        src={m.image}
                        alt=""
                        loading="lazy"
                        className="mt-4 w-full rounded"
                      />
                    )}

                    <button
                      onClick={() => setOpenId(isOpen ? null : m.id)}
                      className="mt-3 text-sm text-stone-500 underline underline-offset-4 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {isOpen ? '收起' : '展开'}
                    </button>

                    {isOpen && (
                      <div className="mt-4 space-y-3 text-stone-700">
                        {detail?.id === m.id ? (
                          detail.body
                            .split('\n\n')
                            .map((p, i) => <p key={i}>{p}</p>)
                        ) : (
                          <p className="text-stone-400">载入中…</p>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
