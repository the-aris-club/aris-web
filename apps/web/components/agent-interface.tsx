'use client'

import {
  GitPullRequest,
  GitMerge,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  GitCommit,
  Eye,
  Terminal,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// ── Data ─────────────────────────────────────────────────────────────────────

const ALL_PRS = [
  {
    additions: 57,
    agent: 'orchestrator',
    branch: 'feat/orchestration-v2',
    comments: 2,
    deletions: 4,
    id: 145,
    status: 'review',
    time: 'Just now',
    title: 'feat: multi-agent orchestration v2',
  },
  {
    additions: 18,
    agent: 'analyst-agent',
    branch: 'fix/ctx-overflow',
    comments: 1,
    deletions: 3,
    id: 144,
    status: 'review',
    time: '1m ago',
    title: 'fix: memory context window overflow',
  },
  {
    additions: 93,
    agent: 'monitor-agent',
    branch: 'feat/stream-tools',
    comments: 4,
    deletions: 11,
    id: 143,
    status: 'merged',
    time: '1m ago',
    title: 'feat: streaming tool response',
  },
  {
    additions: 84,
    agent: 'executor-agent',
    branch: 'feat/memory-ctx',
    comments: 3,
    deletions: 12,
    id: 142,
    status: 'merged',
    time: '2m ago',
    title: 'feat: add memory context to executor',
  },
  {
    additions: 31,
    agent: 'monitor-agent',
    branch: 'fix/rate-backoff',
    comments: 1,
    deletions: 8,
    id: 141,
    status: 'approved',
    time: '8m ago',
    title: 'fix: rate limit backoff strategy',
  },
  {
    additions: 142,
    agent: 'researcher-agent',
    branch: 'feat/parallel-tools',
    comments: 5,
    deletions: 27,
    id: 140,
    status: 'review',
    time: '22m ago',
    title: 'feat: parallel tool execution',
  },
  {
    additions: 209,
    agent: 'analyst-agent',
    branch: 'refactor/pipeline',
    comments: 7,
    deletions: 88,
    id: 139,
    status: 'merged',
    time: '1h ago',
    title: 'refactor: orchestrator pipeline',
  },
]

const ALL_REVIEW_FILES = [
  { file: 'agent/executor.ts', pct: 72 },
  { file: 'lib/tools/index.ts', pct: 45 },
  { file: 'core/planner.ts', pct: 88 },
  { file: 'utils/retry.ts', pct: 31 },
  { file: 'agent/memory.ts', pct: 60 },
]

const ALL_REVIEW_LINES: {
  type: 'comment' | 'approve' | 'change' | 'code'
  text: string
  author?: string
}[] = [
  { text: 'const ctx = await memory.load(task.id)', type: 'code' },
  {
    author: 'analyst-agent',
    text: 'Should we cache this per agent run?',
    type: 'comment',
  },
  { text: 'return researcher.execute(task, ctx)', type: 'code' },
  {
    author: 'monitor-agent',
    text: 'LGTM — memory scope looks correct',
    type: 'approve',
  },
  { text: 'export const run = async (task) => {', type: 'code' },
  {
    author: 'executor-agent',
    text: 'Consider adding retry logic here',
    type: 'change',
  },
  { text: '  const plan = await planner.run(goal)', type: 'code' },
  { author: 'orchestrator', text: 'Approved — ship it', type: 'approve' },
  { text: '  await ctx.memory.save(result)', type: 'code' },
  { author: 'monitor-agent', text: 'Add error boundary here', type: 'comment' },
  { text: 'return { status: "done", result }', type: 'code' },
  { author: 'analyst-agent', text: 'All checks pass', type: 'approve' },
]

const COMMITS = [
  {
    hash: 'a3f8c21',
    msg: 'fix: memory leak in long-running agents',
    time: 'Just now',
  },
  {
    hash: 'b7d2e09',
    msg: 'feat: streaming response for analyst',
    time: '4m ago',
  },
  {
    hash: 'c9a1f34',
    msg: 'chore: bump @agentic/sdk to 2.4.1',
    time: '12m ago',
  },
  {
    hash: 'd4e6b78',
    msg: 'perf: reduce token overhead by 18%',
    time: '31m ago',
  },
  {
    hash: 'e2c9d56',
    msg: 'feat: add guardrails to executor-agent',
    time: '1h ago',
  },
]

// Activity graph data — 7 cols x 5 rows like GitHub contributions
const ACTIVITY_SEED = Array.from({ length: 35 }, () => ({
  level: Math.random() > 0.4 ? Math.floor(Math.random() * 4) + 1 : 0,
}))

// ── Sub-components ────────────────────────────────────────────────────────────

// Smooth 60fps bar chart — canvas fills full container width
const MiniBarGraph = ({ seed }: { seed: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const barsRef = useRef<number[]>([])

  useEffect(() => {
    const N = 20
    // Initialise bars with a seeded pattern
    barsRef.current = Array.from(
      { length: N },
      (_, i) => 0.2 + 0.8 * Math.abs(Math.sin((i + seed) * 1.3))
    )

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    const draw = () => {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      canvas.width = W * devicePixelRatio
      canvas.height = H * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)

      ctx.clearRect(0, 0, W, H)

      // Slowly drift each bar toward a new random target
      barsRef.current = barsRef.current.map((v, i) => {
        const target =
          0.15 + 0.85 * Math.abs(Math.sin(Date.now() / 3000 + i * 0.8 + seed))
        // lerp — very smooth
        return v + (target - v) * 0.012
      })

      const bars = barsRef.current
      const gap = 2
      const bw = (W - gap * (N - 1)) / N

      for (const [i, v] of bars.entries()) {
        const bh = v * H
        const x = i * (bw + gap)
        const y = H - bh
        ctx.beginPath()
        ctx.roundRect(x, y, bw, bh, 2)
        ctx.fillStyle = `rgba(17,17,17,${0.12 + v * 0.65})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [seed])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', height: 28, width: '100%' }}
    />
  )
}

// Smooth 60fps area sparkline — fills full width
const LiveSparkline = ({ seed }: { seed?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const ptsRef = useRef<number[]>([])

  useEffect(() => {
    const N = 24
    ptsRef.current = Array.from(
      { length: N },
      (_, i) => 0.1 + 0.7 * Math.abs(Math.sin(i * 0.6 + (seed ?? 0)))
    )

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    const draw = () => {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      canvas.width = W * devicePixelRatio
      canvas.height = H * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
      ctx.clearRect(0, 0, W, H)

      // Scroll left: drop first point, lerp last toward new target
      const last = ptsRef.current.at(-1) ?? 0
      const target =
        0.1 + 0.85 * (0.5 + 0.5 * Math.sin(Date.now() / 2200 + (seed ?? 0)))
      ptsRef.current = [
        ...ptsRef.current.slice(1),
        last + (target - last) * 0.04,
      ]

      const pts = ptsRef.current
      const step = W / (N - 1)

      // Area fill
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, 'rgba(17,17,17,0.10)')
      grad.addColorStop(1, 'rgba(17,17,17,0)')
      ctx.beginPath()
      ctx.moveTo(0, H)
      for (const [i, v] of pts.entries()) {
        ctx.lineTo(i * step, H - v * H * 0.9)
      }
      ctx.lineTo(W, H)
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()

      // Line
      ctx.beginPath()
      for (const [i, v] of pts.entries()) {
        const x = i * step
        const y = H - v * H * 0.9
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.strokeStyle = 'rgba(17,17,17,0.75)'
      ctx.lineWidth = 1.5
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.stroke()

      // Dot at end
      const ex = W
      const ey = H - (pts.at(-1) ?? 0) * H * 0.9
      ctx.beginPath()
      ctx.arc(ex, ey, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(17,17,17,0.85)'
      ctx.fill()

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [seed])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', height: 28, width: '100%' }}
    />
  )
}

// Smooth 60fps dot/line graph — fills full width
const MiniDotGraph = ({ seed }: { seed?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const ptsRef = useRef<number[]>([])

  useEffect(() => {
    const N = 18
    ptsRef.current = Array.from(
      { length: N },
      (_, i) => 0.1 + 0.8 * Math.abs(Math.sin(i * 0.9 + (seed ?? 2)))
    )

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    const draw = () => {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      canvas.width = W * devicePixelRatio
      canvas.height = H * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
      ctx.clearRect(0, 0, W, H)

      const last = ptsRef.current.at(-1) ?? 0
      const target =
        0.1 +
        0.85 * (0.5 + 0.5 * Math.sin(Date.now() / 2800 + (seed ?? 2) * 1.5))
      ptsRef.current = [
        ...ptsRef.current.slice(1),
        last + (target - last) * 0.03,
      ]

      const pts = ptsRef.current
      const step = W / (N - 1)

      // Dashed connector line
      ctx.beginPath()
      for (const [i, v] of pts.entries()) {
        const x = i * step
        const y = H - v * H * 0.88
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.strokeStyle = 'rgba(17,17,17,0.15)'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.stroke()
      ctx.setLineDash([])

      // Dots
      for (const [i, v] of pts.entries()) {
        const x = i * step
        const y = H - v * H * 0.88
        ctx.beginPath()
        ctx.arc(x, y, 2.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(17,17,17,${0.2 + v * 0.65})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [seed])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', height: 28, width: '100%' }}
    />
  )
}

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = {
    approved: {
      bg: 'rgba(40,167,69,0.1)',
      color: '#28a745',
      icon: <CheckCircle2 style={{ height: 9, width: 9 }} />,
      label: 'Approved',
    },
    merged: {
      bg: 'rgba(130,80,255,0.1)',
      color: '#8250df',
      icon: <GitMerge style={{ height: 9, width: 9 }} />,
      label: 'Merged',
    },
    review: {
      bg: 'rgba(201,169,110,0.12)',
      color: '#b07d30',
      icon: <Eye style={{ height: 9, width: 9 }} />,
      label: 'In Review',
    },
  }[status] ?? { bg: '#eee', color: '#666', icon: null, label: status }

  return (
    <span
      style={{
        alignItems: 'center',
        background: cfg.bg,
        borderRadius: 99,
        color: cfg.color,
        display: 'inline-flex',
        fontFamily: 'monospace',
        fontSize: 8,
        fontWeight: 600,
        gap: 4,
        letterSpacing: '0.08em',
        padding: '2px 7px',
        textTransform: 'uppercase',
      }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

const Bar = ({
  pct,
  color = 'rgba(0,0,0,0.75)',
}: {
  pct: number
  color?: string
}) => {
  const [w, setW] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 600)
    return () => clearTimeout(t)
  }, [pct])
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.07)',
        borderRadius: 99,
        height: 2,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <div
        style={{
          background: color,
          borderRadius: 99,
          height: '100%',
          transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)',
          width: `${w}%`,
        }}
      />
    </div>
  )
}

const Counter = ({ to, suffix = '' }: { to: number; suffix?: string }) => {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let s: number | null = null
    const f = (ts: number) => {
      if (!s) {
        s = ts
      }
      const p = Math.min((ts - s) / 1100, 1)
      setVal(Math.round((1 - (1 - p) ** 3) * to))
      if (p < 1) {
        requestAnimationFrame(f)
      }
    }
    requestAnimationFrame(f)
  }, [to])
  return (
    <>
      {val}
      {suffix}
    </>
  )
}

const LiveDot = () => (
  <span
    style={{
      display: 'inline-flex',
      flexShrink: 0,
      height: 7,
      position: 'relative',
      width: 7,
    }}
  >
    <span
      style={{
        animation: 'ping 1.8s cubic-bezier(0,0,0.2,1) infinite',
        background: '#28a745',
        borderRadius: '50%',
        inset: 0,
        opacity: 0.4,
        position: 'absolute',
      }}
    />
    <span
      style={{
        background: '#28a745',
        borderRadius: '50%',
        height: '100%',
        width: '100%',
      }}
    />
  </span>
)

// Activity heatmap cell
const HeatCell = ({
  level,
  animDelay,
}: {
  level: number
  animDelay: number
}) => {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), animDelay)
    return () => clearTimeout(t)
  }, [animDelay])
  const colors = [
    'rgba(0,0,0,0.05)',
    'rgba(0,0,0,0.15)',
    'rgba(0,0,0,0.32)',
    'rgba(0,0,0,0.55)',
    'rgba(0,0,0,0.8)',
  ]
  return (
    <div
      style={{
        background: colors[level],
        borderRadius: 2,
        height: 9,
        opacity: visible ? 1 : 0,
        transition: `opacity 0.4s ease`,
        width: 9,
      }}
    />
  )
}

// Animated typing cursor in review
const ReviewLine = ({
  item,
  delay,
}: {
  item: (typeof ALL_REVIEW_LINES)[0]
  delay: number
}) => {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  if (!visible) {
    return null
  }

  if (item.type === 'code') {
    return (
      <div
        style={{
          animation: 'logIn 0.2s ease forwards',
          background: 'rgba(0,0,0,0.04)',
          borderLeft: '2px solid rgba(0,0,0,0.08)',
          margin: '2px 0',
          opacity: 0,
          padding: '3px 10px',
        }}
      >
        <code
          style={{
            color: 'rgba(0,0,0,0.55)',
            fontFamily: 'monospace',
            fontSize: 9,
          }}
        >
          {item.text}
        </code>
      </div>
    )
  }
  const iconCfg = {
    approve: {
      color: '#28a745',
      icon: (
        <CheckCircle2
          style={{ color: '#28a745', flexShrink: 0, height: 9, width: 9 }}
        />
      ),
    },
    change: {
      color: '#b07d30',
      icon: (
        <AlertCircle
          style={{ color: '#b07d30', flexShrink: 0, height: 9, width: 9 }}
        />
      ),
    },
    comment: {
      color: 'rgba(0,0,0,0.5)',
      icon: (
        <MessageSquare
          style={{
            color: 'rgba(0,0,0,0.35)',
            flexShrink: 0,
            height: 9,
            width: 9,
          }}
        />
      ),
    },
  }[item.type] ?? { color: 'rgba(0,0,0,0.5)', icon: null }

  return (
    <div
      style={{
        alignItems: 'flex-start',
        animation: 'logIn 0.2s ease forwards',
        display: 'flex',
        gap: 6,
        opacity: 0,
        padding: '4px 0',
      }}
    >
      {iconCfg.icon}
      <div>
        <span
          style={{ color: iconCfg.color, fontFamily: 'monospace', fontSize: 9 }}
        >
          {item.text}
        </span>
        {item.author && (
          <span
            style={{
              color: 'rgba(0,0,0,0.3)',
              fontFamily: 'monospace',
              fontSize: 8,
              marginLeft: 5,
            }}
          >
            — {item.author}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export const AgentInterface = ({
  revealDelay = 0,
}: {
  revealDelay?: number
}) => {
  const [revealed, setRevealed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [reqCount, setReqCount] = useState(1847)
  const [cursor, setCursor] = useState(true)
  const [prOffset, setPrOffset] = useState(0)
  const [reviewFileIdx, setReviewFileIdx] = useState(0)
  const [reviewFilePcts, setReviewFilePcts] = useState([72, 45, 88, 31, 60])
  const [reviewLineIdx, setReviewLineIdx] = useState(0)
  const [activity, setActivity] = useState(ACTIVITY_SEED)

  // Slide-up reveal synced to intro animation end
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), revealDelay)
    return () => clearTimeout(t)
  }, [revealDelay])

  // Internal content mounts 300ms after reveal starts (lets slide settle first)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), revealDelay + 300)
    return () => clearTimeout(t)
  }, [revealDelay])

  // Live tasks/min counter
  useEffect(() => {
    const t = setInterval(() => {
      setReqCount((v) => v + Math.floor(Math.random() * 8 + 2))
    }, 1600)
    return () => clearInterval(t)
  }, [])

  // PR list auto-scroll: new PR arrives every 5s, list shifts
  useEffect(() => {
    if (!mounted) {
      return
    }
    const t = setInterval(
      () => setPrOffset((v) => (v + 1) % (ALL_PRS.length - 3)),
      4000
    )
    return () => clearInterval(t)
  }, [mounted])

  // Code review: cycle through files and advance progress bars
  useEffect(() => {
    if (!mounted) {
      return
    }
    const t = setInterval(() => {
      setReviewFilePcts((p) =>
        p.map((v, i) => {
          const delta = Math.random() * 4 - 1
          return Math.max(
            10,
            Math.min(
              99,
              v + (i === reviewFileIdx ? Math.abs(delta) + 1 : delta * 0.3)
            )
          )
        })
      )
    }, 800)
    return () => clearInterval(t)
  }, [mounted, reviewFileIdx])

  // Cycle active file highlight every 3s
  useEffect(() => {
    if (!mounted) {
      return
    }
    const t = setInterval(
      () => setReviewFileIdx((v) => (v + 1) % ALL_REVIEW_FILES.length),
      2800
    )
    return () => clearInterval(t)
  }, [mounted])

  // Review lines appear one by one, then reset and loop
  useEffect(() => {
    if (!mounted) {
      return
    }
    const t = setInterval(() => {
      setReviewLineIdx((p) => {
        if (p >= ALL_REVIEW_LINES.length) {
          return 0
        }
        return p + 1
      })
    }, 650)
    return () => clearInterval(t)
  }, [mounted])

  // Heatmap: occasional cell lights up
  useEffect(() => {
    if (!mounted) {
      return
    }
    const t = setInterval(() => {
      setActivity((prev) => {
        const next = [...prev]
        const idx = Math.floor(Math.random() * next.length)
        next[idx] = { level: Math.min(4, next[idx].level + 1) }
        return next
      })
    }, 700)
    return () => clearInterval(t)
  }, [mounted])

  // Cursor blink
  useEffect(() => {
    const t = setInterval(() => setCursor((c) => !c), 530)
    return () => clearInterval(t)
  }, [])

  const anim = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(10px)',
    transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  })

  const panel: React.CSSProperties = {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: 10,
    overflow: 'hidden',
  }
  const visiblePRs = ALL_PRS.slice(prOffset, prOffset + 4)

  return (
    <div
      className="pointer-events-none relative z-10 flex w-full items-center justify-center px-3 select-none md:absolute md:inset-0 md:px-8 md:pt-[220px] md:pb-[8%]"
      style={{ paddingBottom: '16px', paddingTop: '16px' }}
    >
      <div
        style={{
          backdropFilter: 'blur(32px)',
          background: 'rgba(246,245,242,0.96)',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 18,
          boxShadow:
            '0 28px 70px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.95) inset',
          maxWidth: 900,
          // Slide up from bottom when revealed
          opacity: revealed ? 1 : 0,
          overflow: 'hidden',
          transform: revealed ? 'translateY(0)' : 'translateY(72px)',
          transition:
            'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
          width: '100%',
        }}
      >
        {/* Titlebar */}
        <div
          style={{
            alignItems: 'center',
            background: 'rgba(255,255,255,0.65)',
            borderBottom: '1px solid rgba(0,0,0,0.07)',
            display: 'flex',
            padding: '9px 14px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', gap: 5 }}>
            {['#ff5f56', '#ffbd2e', '#27c93f'].map((c) => (
              <span
                key={c}
                style={{
                  background: c,
                  borderRadius: '50%',
                  display: 'inline-block',
                  height: 10,
                  width: 10,
                }}
              />
            ))}
          </div>
          <span
            style={{
              color: 'rgba(0,0,0,0.28)',
              fontFamily: 'monospace',
              fontSize: 10,
              left: '50%',
              letterSpacing: '0.18em',
              position: 'absolute',
              transform: 'translateX(-50%)',
            }}
          >
            agentic / platform — main
          </span>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: 8,
              marginLeft: 'auto',
            }}
          >
            <LiveDot />
            <span
              style={{
                color: 'rgba(40,167,69,0.8)',
                fontFamily: 'monospace',
                fontSize: 8,
                letterSpacing: '0.16em',
              }}
            >
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
        </div>

        {/* Metrics strip — fixed height */}
        <div
          style={{
            background: 'rgba(251,250,247,0.9)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
          }}
        >
          {[
            {
              graph: <MiniBarGraph seed={0} />,
              icon: <GitMerge style={{ height: 11, width: 11 }} />,
              label: 'PRs Merged today',
              val: 18,
            },
            {
              graph: <MiniBarGraph seed={5} />,
              icon: <Eye style={{ height: 11, width: 11 }} />,
              label: 'Reviews completed',
              val: 34,
            },
            {
              graph: <MiniDotGraph seed={2} />,
              icon: <GitCommit style={{ height: 11, width: 11 }} />,
              label: 'Agent commits',
              val: 127,
            },
            {
              graph: <LiveSparkline seed={7} />,
              icon: <Zap style={{ height: 11, width: 11 }} />,
              label: 'Tasks / min',
              val: reqCount,
            },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                borderRight: i < 3 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                height: 82,
                overflow: 'hidden',
                padding: '9px 12px',
                ...anim(60 + i * 45),
              }}
            >
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  gap: 5,
                  marginBottom: 4,
                }}
              >
                <span style={{ color: 'rgba(0,0,0,0.32)' }}>{m.icon}</span>
                <span
                  style={{
                    color: 'rgba(0,0,0,0.32)',
                    fontFamily: 'monospace',
                    fontSize: 7.5,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  {m.label}
                </span>
              </div>
              <div
                style={{
                  color: '#111',
                  fontFamily: 'monospace',
                  fontSize: 20,
                  fontWeight: 700,
                  lineHeight: 1,
                  marginBottom: 5,
                }}
              >
                {mounted ? <Counter to={m.val} /> : '—'}
              </div>
              {mounted && m.graph}
            </div>
          ))}
        </div>

        {/* Main 3-col body — fixed height container */}
        <div
          style={{
            display: 'grid',
            gap: 8,
            gridTemplateColumns: '1.1fr 1fr 0.85fr',
            height: 340,
            overflow: 'hidden',
            padding: 8,
          }}
        >
          {/* Col 1 — PR list */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              height: '100%',
              overflow: 'hidden',
              ...anim(160),
            }}
          >
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                flexShrink: 0,
                justifyContent: 'space-between',
                padding: '0 2px',
              }}
            >
              <div style={{ alignItems: 'center', display: 'flex', gap: 5 }}>
                <GitPullRequest
                  style={{ color: 'rgba(0,0,0,0.38)', height: 10, width: 10 }}
                />
                <span
                  style={{
                    color: 'rgba(0,0,0,0.38)',
                    fontFamily: 'monospace',
                    fontSize: 8.5,
                    letterSpacing: '0.13em',
                    textTransform: 'uppercase',
                  }}
                >
                  Pull Requests
                </span>
              </div>
              <span
                style={{
                  color: 'rgba(0,0,0,0.25)',
                  fontFamily: 'monospace',
                  fontSize: 7.5,
                }}
              >
                {ALL_PRS.filter((p) => p.status === 'review').length} OPEN
              </span>
            </div>

            {/* Fixed-height PR container — clips overflow, no layout shift */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              {visiblePRs.map((pr, i) => (
                <div
                  key={`${pr.id}-${prOffset}`}
                  style={{
                    ...panel,
                    animation:
                      i === 0
                        ? 'prSlideIn 0.4s cubic-bezier(0.16,1,0.3,1) both'
                        : 'none',
                    marginBottom: 5,
                    padding: '8px 10px',
                  }}
                >
                  <div
                    style={{
                      alignItems: 'flex-start',
                      display: 'flex',
                      gap: 5,
                      justifyContent: 'space-between',
                      marginBottom: 5,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: '#111',
                          fontSize: 9.5,
                          fontWeight: 600,
                          lineHeight: 1.3,
                          marginBottom: 2,
                        }}
                      >
                        {pr.title}
                      </div>
                      <div
                        style={{
                          color: 'rgba(0,0,0,0.32)',
                          fontFamily: 'monospace',
                          fontSize: 7.5,
                        }}
                      >
                        {pr.branch} · {pr.agent}
                      </div>
                    </div>
                    <StatusBadge status={pr.status} />
                  </div>
                  <div
                    style={{
                      alignItems: 'center',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 7 }}>
                      <span
                        style={{
                          color: '#28a745',
                          fontFamily: 'monospace',
                          fontSize: 7.5,
                        }}
                      >
                        +{pr.additions}
                      </span>
                      <span
                        style={{
                          color: '#d73a49',
                          fontFamily: 'monospace',
                          fontSize: 7.5,
                        }}
                      >
                        -{pr.deletions}
                      </span>
                      <div
                        style={{
                          alignItems: 'center',
                          display: 'flex',
                          gap: 2,
                        }}
                      >
                        <MessageSquare
                          style={{
                            color: 'rgba(0,0,0,0.28)',
                            height: 7,
                            width: 7,
                          }}
                        />
                        <span
                          style={{ color: 'rgba(0,0,0,0.28)', fontSize: 7.5 }}
                        >
                          {pr.comments}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{ alignItems: 'center', display: 'flex', gap: 3 }}
                    >
                      <Clock
                        style={{
                          color: 'rgba(0,0,0,0.22)',
                          height: 7,
                          width: 7,
                        }}
                      />
                      <span
                        style={{
                          color: 'rgba(0,0,0,0.28)',
                          fontFamily: 'monospace',
                          fontSize: 7.5,
                        }}
                      >
                        {pr.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Heatmap — fixed height, no layout shift */}
            <div
              style={{
                ...panel,
                flexShrink: 0,
                height: 76,
                overflow: 'hidden',
                padding: '8px 10px',
              }}
            >
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  gap: 5,
                  marginBottom: 6,
                }}
              >
                <Terminal
                  style={{ color: 'rgba(0,0,0,0.33)', height: 9, width: 9 }}
                />
                <span
                  style={{
                    color: 'rgba(0,0,0,0.33)',
                    fontFamily: 'monospace',
                    fontSize: 7.5,
                    letterSpacing: '0.13em',
                    textTransform: 'uppercase',
                  }}
                >
                  Commit Activity
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  height: 30,
                  maxWidth: 210,
                  overflow: 'hidden',
                }}
              >
                {activity.map((a, i) => (
                  <HeatCell key={i} level={a.level} animDelay={i * 18 + 300} />
                ))}
              </div>
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  gap: 3,
                  marginTop: 4,
                }}
              >
                <span
                  style={{
                    color: 'rgba(0,0,0,0.26)',
                    fontFamily: 'monospace',
                    fontSize: 7,
                  }}
                >
                  Less
                </span>
                {[0, 1, 2, 3, 4].map((l) => (
                  <div
                    key={l}
                    style={{
                      background: [
                        'rgba(0,0,0,0.05)',
                        'rgba(0,0,0,0.15)',
                        'rgba(0,0,0,0.32)',
                        'rgba(0,0,0,0.55)',
                        'rgba(0,0,0,0.8)',
                      ][l],
                      borderRadius: 1.5,
                      height: 7,
                      width: 7,
                    }}
                  />
                ))}
                <span
                  style={{
                    color: 'rgba(0,0,0,0.26)',
                    fontFamily: 'monospace',
                    fontSize: 7,
                  }}
                >
                  More
                </span>
              </div>
            </div>
          </div>

          {/* Col 2 — Code Review — fixed height */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              height: '100%',
              overflow: 'hidden',
              ...anim(210),
            }}
          >
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                flexShrink: 0,
                gap: 5,
                padding: '0 2px',
              }}
            >
              <Eye
                style={{ color: 'rgba(0,0,0,0.38)', height: 10, width: 10 }}
              />
              <span
                style={{
                  color: 'rgba(0,0,0,0.38)',
                  fontFamily: 'monospace',
                  fontSize: 8.5,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                }}
              >
                Code Review — #{ALL_PRS[reviewFileIdx % ALL_PRS.length].id}
              </span>
            </div>
            <div
              style={{
                ...panel,
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                overflow: 'hidden',
                padding: '9px 10px',
              }}
            >
              {/* Header — fixed */}
              <div
                style={{
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  flexShrink: 0,
                  marginBottom: 7,
                  paddingBottom: 7,
                }}
              >
                <div
                  style={{
                    color: '#111',
                    fontSize: 9.5,
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                >
                  feat: parallel tool execution
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  <span
                    style={{
                      color: '#28a745',
                      fontFamily: 'monospace',
                      fontSize: 7.5,
                    }}
                  >
                    +142
                  </span>
                  <span
                    style={{
                      color: '#d73a49',
                      fontFamily: 'monospace',
                      fontSize: 7.5,
                    }}
                  >
                    -27
                  </span>
                  <span style={{ color: 'rgba(0,0,0,0.28)', fontSize: 7.5 }}>
                    5 files
                  </span>
                </div>
              </div>

              {/* Progress bars — fixed height */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flexShrink: 0,
                  gap: 6,
                  marginBottom: 9,
                }}
              >
                {ALL_REVIEW_FILES.map((f, i) => (
                  <div
                    key={f.file}
                    style={{
                      opacity: i === reviewFileIdx ? 1 : 0.55,
                      transition: 'opacity 0.4s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{
                          color:
                            i === reviewFileIdx ? '#111' : 'rgba(0,0,0,0.42)',
                          fontFamily: 'monospace',
                          fontSize: 7.5,
                          transition: 'color 0.4s ease',
                        }}
                      >
                        {f.file}
                      </span>
                      <span
                        style={{
                          color: reviewFilePcts[i] > 70 ? '#28a745' : '#d73a49',
                          fontFamily: 'monospace',
                          fontSize: 7.5,
                          fontWeight: i === reviewFileIdx ? 700 : 400,
                          transition: 'color 0.4s ease',
                        }}
                      >
                        {Math.round(reviewFilePcts[i])}%
                      </span>
                    </div>
                    <Bar
                      pct={reviewFilePcts[i]}
                      color={i === reviewFileIdx ? '#111' : 'rgba(0,0,0,0.3)'}
                    />
                  </div>
                ))}
              </div>

              {/* Review comments — fixed height, clips overflow, no scroll */}
              <div
                style={{
                  borderTop: '1px solid rgba(0,0,0,0.05)',
                  flex: 1,
                  overflow: 'hidden',
                  paddingTop: 7,
                }}
              >
                {ALL_REVIEW_LINES.slice(0, reviewLineIdx)
                  .slice(-5)
                  .map((item, i) => (
                    <ReviewLine
                      key={`${reviewLineIdx}-${i}`}
                      item={item}
                      delay={0}
                    />
                  ))}
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: 3,
                    marginTop: 2,
                  }}
                >
                  <Terminal
                    style={{ color: 'rgba(0,0,0,0.18)', height: 7, width: 7 }}
                  />
                  <span
                    style={{
                      background: cursor ? 'rgba(0,0,0,0.38)' : 'transparent',
                      display: 'inline-block',
                      height: 9,
                      transition: 'background 0.08s',
                      width: 4,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Col 3 — Commits + CI — fixed height */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              height: '100%',
              overflow: 'hidden',
              ...anim(260),
            }}
          >
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                flexShrink: 0,
                gap: 5,
                padding: '0 2px',
              }}
            >
              <GitCommit
                style={{ color: 'rgba(0,0,0,0.38)', height: 10, width: 10 }}
              />
              <span
                style={{
                  color: 'rgba(0,0,0,0.38)',
                  fontFamily: 'monospace',
                  fontSize: 8.5,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                }}
              >
                Recent Commits
              </span>
            </div>
            <div style={{ ...panel, flexShrink: 0, overflow: 'hidden' }}>
              {COMMITS.slice(0, 4).map((c, i) => (
                <div
                  key={c.hash}
                  style={{
                    animation: mounted
                      ? `fadeSlide 0.3s ease ${280 + i * 55}ms both`
                      : 'none',
                    borderBottom: i < 3 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                    padding: '7px 10px',
                  }}
                >
                  <div
                    style={{
                      color: '#111',
                      fontSize: 8.5,
                      fontWeight: 500,
                      lineHeight: 1.35,
                      marginBottom: 2,
                    }}
                  >
                    {c.msg}
                  </div>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <span
                      style={{
                        color: '#8250df',
                        fontFamily: 'monospace',
                        fontSize: 7.5,
                      }}
                    >
                      {c.hash}
                    </span>
                    <span
                      style={{
                        color: 'rgba(0,0,0,0.28)',
                        fontFamily: 'monospace',
                        fontSize: 7.5,
                      }}
                    >
                      {c.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                flexShrink: 0,
                gap: 5,
                padding: '2px 2px 0',
              }}
            >
              <Zap
                style={{ color: 'rgba(0,0,0,0.38)', height: 10, width: 10 }}
              />
              <span
                style={{
                  color: 'rgba(0,0,0,0.38)',
                  fontFamily: 'monospace',
                  fontSize: 8.5,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                }}
              >
                CI / Agents
              </span>
            </div>
            <div style={{ ...panel, flexShrink: 0, overflow: 'hidden' }}>
              {[
                {
                  duration: '1m 32s',
                  name: 'researcher-agent',
                  status: 'passing',
                },
                {
                  duration: '0m 48s',
                  name: 'analyst-agent',
                  status: 'running',
                },
                {
                  duration: '2m 11s',
                  name: 'executor-agent',
                  status: 'passing',
                },
                {
                  duration: '0m 54s',
                  name: 'monitor-agent',
                  status: 'running',
                },
              ].map((a, i) => (
                <div
                  key={a.name}
                  style={{
                    alignItems: 'center',
                    borderBottom: i < 3 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                  }}
                >
                  <div
                    style={{ alignItems: 'center', display: 'flex', gap: 6 }}
                  >
                    {a.status === 'running' ? (
                      <div
                        style={{
                          animation: 'spin 0.9s linear infinite',
                          border: '1.5px solid rgba(0,0,0,0.5)',
                          borderRadius: '50%',
                          borderTopColor: 'transparent',
                          flexShrink: 0,
                          height: 8,
                          width: 8,
                        }}
                      />
                    ) : (
                      <CheckCircle2
                        style={{
                          color: '#28a745',
                          flexShrink: 0,
                          height: 8,
                          width: 8,
                        }}
                      />
                    )}
                    <span
                      style={{
                        color: '#111',
                        fontFamily: 'monospace',
                        fontSize: 8.5,
                      }}
                    >
                      {a.name}
                    </span>
                  </div>
                  <span
                    style={{
                      color: 'rgba(0,0,0,0.28)',
                      fontFamily: 'monospace',
                      fontSize: 7.5,
                    }}
                  >
                    {a.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ping { 75%, 100% { transform: scale(2.2); opacity: 0; } }
        @keyframes logIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeSlide { from { opacity: 0; transform: translateX(-5px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes prSlideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
