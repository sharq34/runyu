import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { HERO, PHOTOS, type Photo, type Tone } from './photos'

// ── 需要你确认的常量 ──────────────────────────────
const HER_NAME = 'Runyu' // TODO 确认她的名字或昵称
/** 认识的时刻。只知道日期，先按当天 0 点算；知道具体几点可以改这里。 */
const MET_AT = new Date(2020, 11, 23, 0, 0, 0)
// ────────────────────────────────────────────────

/* ───────── 小零件 ───────── */

/** 一朵绣球的小花（四瓣） */
function Floret({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <g fill="currentColor">
        <path d="M12 1.5c3.2 3 3.2 7.5 0 10.5-3.2-3-3.2-7.5 0-10.5Z" />
        <path d="M12 22.5c-3.2-3-3.2-7.5 0-10.5 3.2 3 3.2 7.5 0 10.5Z" />
        <path d="M1.5 12c3-3.2 7.5-3.2 10.5 0-3 3.2-7.5 3.2-10.5 0Z" />
        <path d="M22.5 12c-3 3.2-7.5 3.2-10.5 0 3-3.2 7.5-3.2 10.5 0Z" />
      </g>
      <circle cx="12" cy="12" r="1.7" fill="#fff" opacity="0.85" />
    </svg>
  )
}

/** 三朵小花凑成的标志 */
function Mark({ size = 28 }: { size?: number }) {
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <Floret className="absolute text-petal-deep" style={{ width: size * 0.64, height: size * 0.64, left: 0, top: size * 0.06 }} />
      <Floret className="absolute text-bloom-deep" style={{ width: size * 0.56, height: size * 0.56, right: 0, top: 0, transform: 'rotate(22deg)' }} />
      <Floret className="absolute text-petal" style={{ width: size * 0.5, height: size * 0.5, left: size * 0.3, bottom: 0, transform: 'rotate(-16deg)' }} />
    </span>
  )
}

/** 全屏飘落的小花，很淡；系统设置了减少动效时不显示 */
function Petals() {
  const petals = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        left: (i * 71 + 9) % 100,
        size: 9 + ((i * 7) % 11),
        dur: 16 + ((i * 5) % 14),
        delay: -((i * 3.7) % 16),
        sway: (i % 2 ? 1 : -1) * (30 + ((i * 13) % 70)),
        color: i % 3 === 0 ? 'text-bloom' : i % 3 === 1 ? 'text-petal' : 'text-petal-deep',
      })),
    []
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden motion-reduce:hidden" aria-hidden="true">
      {petals.map((p, i) => (
        <Floret
          key={i}
          className={`absolute top-0 opacity-50 ${p.color}`}
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              '--sway': `${p.sway}px`,
              animation: `drift ${p.dur}s linear ${p.delay}s infinite`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

const TONE_BG: Record<Tone, string> = { petal: 'ph-petal', bloom: 'ph-bloom', leaf: 'ph-leaf', sand: 'ph-sand', ink: 'ph-ink' }
const TONE_TEXT: Record<Tone, string> = { petal: 'text-ink/70', bloom: 'text-ink/70', leaf: 'text-ink/70', sand: 'text-ink/70', ink: 'text-paper/80' }

/**
 * 图片。外层先铺一层同色的底，加载前 / 加载失败时都不会是空白；
 * 文件不存在时显示说明和期望的文件名。
 * fill 模式下撑满父元素（父元素需要 relative 和固定尺寸），否则按原图比例占位。
 */
function Picture({ photo, className = '', imgClassName = '', fill = false }: { photo: Photo; className?: string; imgClassName?: string; fill?: boolean }) {
  const [failed, setFailed] = useState(false)
  return (
    <div
      className={`overflow-hidden ${TONE_BG[photo.tone]} ${fill ? 'absolute inset-0' : 'relative'} ${className}`}
      style={fill ? undefined : { aspectRatio: photo.ratio }}
    >
      {failed ? (
        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center ${TONE_TEXT[photo.tone]}`}>
          <Floret className="h-5 w-5 opacity-70" />
          <span className="text-[13px] leading-snug">{photo.label}</span>
          <code className="text-[10px] opacity-60">{photo.file}</code>
        </div>
      ) : (
        <img
          src={photo.file}
          alt={photo.caption}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
          style={photo.focus ? { objectPosition: photo.focus } : undefined}
        />
      )}
    </div>
  )
}

function Overline({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-[11px] font-medium uppercase tracking-[0.32em] text-ink-mute ${className}`}>{children}</p>
}

/* ───────── 计时 ───────── */

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

function elapsed(from: Date, nowMs: number) {
  const ms = Math.max(0, nowMs - from.getTime())
  const totalSeconds = Math.floor(ms / 1000)
  const totalDays = Math.floor(totalSeconds / 86_400)
  const h = Math.floor((totalSeconds % 86_400) / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  // 日历意义上的 年 / 月 / 日
  const now = new Date(nowMs)
  let years = now.getFullYear() - from.getFullYear()
  let months = now.getMonth() - from.getMonth()
  let days = now.getDate() - from.getDate()
  if (days < 0) {
    months -= 1
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }
  return { totalSeconds, totalDays, h, m, s, years, months, days }
}

/** 每个数字占固定宽度，跳动时不会左右抖 */
function Digits({ value, pad = 0, className = '' }: { value: number; pad?: number; className?: string }) {
  const text = pad ? String(value).padStart(pad, '0') : value.toLocaleString('en-US')
  return (
    <span className={`inline-flex ${className}`}>
      {text.split('').map((ch, i) => (
        <span key={i} className={`inline-block text-center ${ch === ',' ? 'w-[0.28em]' : 'w-[0.58em]'}`}>
          {ch}
        </span>
      ))}
    </span>
  )
}

function Hero() {
  const now = useNow(1000)
  const t = elapsed(MET_AT, now)
  return (
    <section id="top" className="relative -mt-14 min-h-[100svh] overflow-hidden">
      {/* 背景：抱着花束那张。手机上脸在上、文字在下；桌面上她在右、文字在左。 */}
      <Picture photo={HERO} fill imgClassName="object-[58%_50%] lg:object-[68%_12%]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-paper from-32% via-paper/85 via-55% to-paper/0 to-88% lg:bg-linear-to-r lg:from-paper lg:from-12% lg:via-paper/75 lg:via-38% lg:to-paper/0 lg:to-64%"
      />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-14 pt-32 sm:px-8 lg:justify-center lg:pb-0 lg:pt-14">
        <div className="max-w-lg">
          <Overline className="fade-up">Since 2020 · 12 · 23</Overline>

          <h1 className="fade-up mt-5 font-display text-4xl tracking-[0.18em] sm:text-5xl" style={{ animationDelay: '80ms' }}>
            在一起
          </h1>

          <div className="fade-up mt-3 flex items-baseline font-display leading-none [font-variant-numeric:lining-nums_tabular-nums]" style={{ animationDelay: '160ms' }}>
            <span className="mr-2 text-2xl text-ink-soft sm:mr-3 sm:text-4xl">第</span>
            <Digits value={t.totalDays} className="text-[92px] tracking-tight sm:text-[136px] lg:text-[156px]" />
            <span className="ml-2 text-2xl text-ink-soft sm:ml-3 sm:text-4xl">天</span>
          </div>

          <div
            className="fade-up mt-3 flex items-center font-display text-4xl text-ink [font-variant-numeric:lining-nums_tabular-nums] sm:text-5xl"
            style={{ animationDelay: '240ms' }}
            aria-label={`${t.h} 小时 ${t.m} 分 ${t.s} 秒`}
          >
            <Digits value={t.h} pad={2} />
            <span className="mx-1 text-petal-deep sm:mx-2">:</span>
            <Digits value={t.m} pad={2} />
            <span className="mx-1 text-petal-deep sm:mx-2">:</span>
            <Digits value={t.s} pad={2} />
          </div>

          <p className="fade-up mt-6 text-sm leading-relaxed text-ink-soft sm:text-base" style={{ animationDelay: '320ms' }}>
            {t.years} 年 {t.months} 个月 {t.days} 天
            <span className="mx-2 text-ink-mute">·</span>
            一共 <span className="[font-variant-numeric:lining-nums_tabular-nums]">{t.totalSeconds.toLocaleString('en-US')}</span> 秒
          </p>

          <p className="fade-up mt-8 font-display text-xl italic text-petal-deep sm:text-2xl" style={{ animationDelay: '400ms' }}>
            往后的每一秒，也都在一起。
          </p>

          <a
            href="#wall"
            className="fade-up mt-10 inline-flex items-center gap-2 text-[11px] tracking-[0.3em] text-ink-mute transition hover:text-ink"
            style={{ animationDelay: '480ms' }}
          >
            照片墙 <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </section>
  )
}

/* ───────── 照片墙 ───────── */

function Tile({ photo, index, onOpen }: { photo: Photo; index: number; onOpen: () => void }) {
  return (
    <article
      className={`group fade-up relative overflow-hidden rounded-2xl bg-paper-deep shadow-card transition-[transform,box-shadow] duration-500 ease-out hover:z-10 hover:scale-[1.045] hover:shadow-lift ${
        photo.wide
          ? // 跨两列：宽 = 2w + gap，高要等于竖格的 1.25w，所以是 62.5% 再减去 0.625 个 gap（gap 12 / 16 / 20px）
            'col-span-2 pb-[calc(62.5%-7.5px)] sm:pb-[calc(62.5%-10px)] lg:pb-[calc(62.5%-12.5px)]'
          : 'pb-[125%]'
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <button onClick={onOpen} className="absolute inset-0 block h-full w-full text-left focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-petal-deep" aria-label={`${photo.caption}，查看故事`}>
        <Picture photo={photo} fill className="transition-transform duration-[1100ms] ease-out group-hover:scale-110" />

        {/* 底部渐变，悬停时铺满整张 */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-ink/80 via-ink/35 to-transparent transition-all duration-500 ease-out group-hover:h-full group-hover:from-ink/85 group-hover:via-ink/60"
        />

        <div className="absolute inset-x-0 bottom-0 p-4 text-paper sm:p-5">
          <p className="font-display text-[19px] leading-tight sm:text-[22px]">{photo.caption}</p>
          {(photo.place || photo.date) && (
            <p className="mt-1 text-[10px] tracking-[0.2em] text-paper/60">{[photo.place, photo.date].filter(Boolean).join(' · ')}</p>
          )}
          <p className="mt-3 max-h-0 overflow-hidden text-[13px] leading-relaxed text-paper/85 opacity-0 transition-all duration-500 ease-out group-hover:max-h-48 group-hover:opacity-100 sm:text-sm">
            {photo.story}
          </p>
        </div>
      </button>
    </article>
  )
}

function Wall({ onOpen }: { onOpen: (p: Photo) => void }) {
  return (
    <section id="wall" className="mx-auto max-w-7xl scroll-mt-14 px-5 pb-28 pt-10 sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Overline>The wall</Overline>
          <h2 className="mt-2 font-display text-4xl leading-none tracking-tight sm:text-5xl">照片墙</h2>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
          <span className="hidden sm:inline">鼠标放上去，看每张照片背后的故事。</span>
          <span className="sm:hidden">点开一张，看它背后的故事。</span>
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {PHOTOS.map((p, i) => (
          <Tile key={p.id} photo={p} index={i} onOpen={() => onOpen(p)} />
        ))}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-ink/5 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 text-xs text-ink-mute sm:flex-row sm:px-8">
        <span className="flex items-center gap-2">
          <Mark size={18} /> 给 {HER_NAME}，和我们在一起的日子。
        </span>
        <span>since 2020.12.23</span>
      </div>
    </footer>
  )
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-paper/75 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <Mark />
          <span className="font-display text-[22px] italic leading-none">{HER_NAME}</span>
        </a>
        <nav className="flex gap-7 text-sm text-ink-soft">
          <a href="#top" className="hover:text-ink">在一起</a>
          <a href="#wall" className="hover:text-ink">照片墙</a>
        </nav>
      </div>
    </header>
  )
}

/* ───────── 灯箱：手机上没有悬停，点开看故事 ───────── */

function Lightbox({ photo, onClose, onStep }: { photo: Photo; onClose: () => void; onStep: (d: 1 | -1) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onStep(1)
      if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, onStep])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/92 p-4 backdrop-blur-sm sm:p-10" onClick={onClose} role="dialog" aria-modal="true">
      <figure className="grid w-full max-w-6xl items-center gap-6 lg:grid-cols-12 lg:gap-10" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto w-full overflow-hidden rounded-xl lg:col-span-8" style={{ maxWidth: `min(100%, calc(62vh * ${photo.ratio}))` }}>
          <Picture photo={photo} />
        </div>
        <figcaption className="text-paper lg:col-span-4">
          <p className="font-display text-3xl leading-tight">{photo.caption}</p>
          {(photo.place || photo.date) && (
            <p className="mt-2 text-[11px] tracking-[0.2em] text-paper/50">{[photo.place, photo.date].filter(Boolean).join(' · ')}</p>
          )}
          <p className="mt-5 leading-relaxed text-paper/80">{photo.story}</p>
        </figcaption>
      </figure>
      <button onClick={(e) => { e.stopPropagation(); onStep(-1) }} aria-label="上一张" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-3 text-paper/70 hover:bg-white/10 hover:text-paper sm:left-6">
        ←
      </button>
      <button onClick={(e) => { e.stopPropagation(); onStep(1) }} aria-label="下一张" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-3 text-paper/70 hover:bg-white/10 hover:text-paper sm:right-6">
        →
      </button>
      <button onClick={onClose} aria-label="关闭" className="absolute right-4 top-4 rounded-full p-2 text-paper/70 hover:bg-white/10 hover:text-paper">
        ✕
      </button>
    </div>
  )
}

/* ───────── 页面 ───────── */

export default function App() {
  const [active, setActive] = useState<Photo | null>(null)
  const open = useCallback((p: Photo) => setActive(p), [])
  const close = useCallback(() => setActive(null), [])
  const step = useCallback((d: 1 | -1) => {
    setActive((cur) => {
      if (!cur) return cur
      const i = PHOTOS.findIndex((p) => p.id === cur.id)
      return PHOTOS[(i + d + PHOTOS.length) % PHOTOS.length]
    })
  }, [])

  return (
    <div className="paper-glow relative min-h-screen">
      <Petals />
      <div className="relative z-10">
        <Nav />
        <main>
          <Hero />
          <Wall onOpen={open} />
        </main>
        <Footer />
      </div>
      {active && <Lightbox photo={active} onClose={close} onStep={step} />}
    </div>
  )
}
