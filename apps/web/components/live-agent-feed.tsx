'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

const AGENT_NAMES = [
  'analyst-7f2a',
  'executor-3b1c',
  'monitor-9d4e',
  'researcher-2c8f',
  'planner-5a3d',
  'writer-1e9b',
  'auditor-4f2c',
  'coder-8d1a',
  'reviewer-6b3e',
  'scheduler-0c7f',
]

const TASKS = [
  'Reviewing 14 open PRs on main branch',
  'Summarizing weekly Slack threads',
  'Generating Q2 financial report',
  'Running integration test suite',
  'Scraping competitor pricing data',
  'Drafting 23 cold emails from CRM',
  'Parsing inbound invoices → DB',
  'Monitoring uptime across 8 regions',
  'Refactoring auth module — 3 files',
  'Analyzing user churn signals',
  'Syncing Notion docs with Linear',
  'Tagging 1,200 support tickets',
  'Deploying to staging environment',
  'Processing webhook payloads',
]

const REGIONS = ['us-east', 'eu-west', 'ap-south', 'us-west', 'eu-central']
const STATUSES = [
  { color: '#4ade80', label: 'running' },
  { color: '#4ade80', label: 'running' },
  { color: '#4ade80', label: 'running' },
  { color: '#facc15', label: 'queued' },
  { color: '#60a5fa', label: 'complete' },
]

interface AgentRow {
  id: string
  name: string
  task: string
  region: string
  status: (typeof STATUSES)[number]
  progress: number
  elapsed: string
  key: number
}

const randomRow = (key: number): AgentRow => ({
  elapsed: `${Math.floor(Math.random() * 14 + 1)}m ${Math.floor(Math.random() * 59)}s`,
  id: Math.random().toString(36).slice(2, 8).toUpperCase(),
  key,
  name: AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)],
  progress: Math.floor(Math.random() * 85 + 10),
  region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
  status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
  task: TASKS[Math.floor(Math.random() * TASKS.length)],
})

// Animated progress bar that slowly ticks forward
const ProgressBar = ({ initial }: { initial: number }) => {
  const [pct, setPct] = useState(initial)
  const rafRef = useRef<number>(0)
  const pctRef = useRef(initial)

  useEffect(() => {
    const tick = () => {
      pctRef.current = Math.min(99, pctRef.current + 0.015)
      setPct(Math.round(pctRef.current))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.08)',
        borderRadius: 9,
        height: 2,
        width: '100%',
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.35)',
          borderRadius: 9,
          height: '100%',
          transition: 'width 0.5s linear',
          width: `${pct}%`,
        }}
      />
    </div>
  )
}

// Stable seed rows — same on server and client, no random values
const SEED_ROWS: AgentRow[] = [
  {
    elapsed: '3m 12s',
    id: 'A1B2C3',
    key: 0,
    name: 'analyst-7f2a',
    progress: 42,
    region: 'us-east',
    status: STATUSES[0],
    task: 'Generating Q2 financial report',
  },
  {
    elapsed: '7m 48s',
    id: 'D4E5F6',
    key: 1,
    name: 'executor-3b1c',
    progress: 67,
    region: 'eu-west',
    status: STATUSES[0],
    task: 'Running integration test suite',
  },
  {
    elapsed: '1m 05s',
    id: 'G7H8I9',
    key: 2,
    name: 'researcher-2c8f',
    progress: 18,
    region: 'us-west',
    status: STATUSES[3],
    task: 'Scraping competitor pricing data',
  },
  {
    elapsed: '5m 30s',
    id: 'J0K1L2',
    key: 3,
    name: 'planner-5a3d',
    progress: 55,
    region: 'eu-central',
    status: STATUSES[0],
    task: 'Syncing Notion docs with Linear',
  },
  {
    elapsed: '11m 22s',
    id: 'M3N4O5',
    key: 4,
    name: 'coder-8d1a',
    progress: 80,
    region: 'ap-south',
    status: STATUSES[0],
    task: 'Refactoring auth module — 3 files',
  },
  {
    elapsed: '14m 01s',
    id: 'P6Q7R8',
    key: 5,
    name: 'monitor-9d4e',
    progress: 99,
    region: 'us-east',
    status: STATUSES[4],
    task: 'Monitoring uptime across 8 regions',
  },
]

// The rows live outside React so the feed can start on deterministic rows (what
// the server renders) and swap in random ones on mount without a setState in an
// effect: the subscription is the update channel, exactly like the interval.
const listeners = new Set<() => void>()
let clientRows: AgentRow[] | undefined
let nextKey = 100
let ticker: ReturnType<typeof setInterval> | undefined

const clientFeed = () =>
  (clientRows ??= Array.from({ length: 6 }, (_, i) => randomRow(i)))

const getRows = () => clientRows ?? SEED_ROWS

const subscribe = (onChange: () => void) => {
  listeners.add(onChange)
  clientFeed()
  ticker ??= setInterval(() => {
    nextKey += 1
    clientRows = [...clientFeed().slice(1), randomRow(nextKey)]
    for (const listener of listeners) {
      listener()
    }
  }, 2800)
  onChange()
  return () => {
    listeners.delete(onChange)
    if (listeners.size === 0) {
      clearInterval(ticker)
      ticker = undefined
    }
  }
}

export const LiveAgentFeed = () => {
  const rows = useSyncExternalStore(subscribe, getRows, getRows)

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Table header */}
      <div
        style={{
          background: 'rgba(0,0,0,0.03)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'grid',
          gridTemplateColumns: '80px 1fr 80px 70px',
          padding: '8px 16px',
        }}
      >
        {['AGENT', 'TASK', 'REGION', 'STATUS'].map((h) => (
          <span
            key={h}
            style={{
              color: 'rgba(0,0,0,0.30)',
              fontFamily: 'monospace',
              fontSize: 8,
              letterSpacing: '0.16em',
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div style={{ overflow: 'hidden' }}>
        {rows.map((row, i) => (
          <div
            key={row.key}
            style={{
              alignItems: 'center',
              animation:
                i === rows.length - 1
                  ? 'rowSlideIn 0.4s cubic-bezier(0.16,1,0.3,1) both'
                  : 'none',
              borderBottom: '1px solid rgba(0,0,0,0.04)',
              display: 'grid',
              gap: 8,
              gridTemplateColumns: '80px 1fr 80px 70px',
              padding: '10px 16px',
            }}
          >
            {/* Agent */}
            <div>
              <div
                style={{
                  color: 'rgba(0,0,0,0.65)',
                  fontFamily: 'monospace',
                  fontSize: 9,
                  marginBottom: 1,
                }}
              >
                {row.name}
              </div>
              <div
                style={{
                  color: 'rgba(0,0,0,0.25)',
                  fontFamily: 'monospace',
                  fontSize: 7.5,
                }}
              >
                #{row.id}
              </div>
            </div>

            {/* Task + progress */}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: 'rgba(0,0,0,0.50)',
                  fontSize: 9,
                  lineHeight: 1.35,
                  marginBottom: 5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {row.task}
              </div>
              <ProgressBar initial={row.progress} />
            </div>

            {/* Region */}
            <div
              style={{
                color: 'rgba(0,0,0,0.30)',
                fontFamily: 'monospace',
                fontSize: 8,
              }}
            >
              {row.region}
            </div>

            {/* Status */}
            <div style={{ alignItems: 'center', display: 'flex', gap: 5 }}>
              <span
                style={{
                  animation:
                    row.status.label === 'running'
                      ? 'statusPulse 2s ease-in-out infinite'
                      : 'none',
                  background: row.status.color,
                  borderRadius: '50%',
                  boxShadow:
                    row.status.label === 'running'
                      ? `0 0 6px ${row.status.color}`
                      : 'none',
                  flexShrink: 0,
                  height: 5,
                  width: 5,
                }}
              />
              <span
                style={{
                  color: 'rgba(0,0,0,0.35)',
                  fontFamily: 'monospace',
                  fontSize: 8,
                }}
              >
                {row.status.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes rowSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

export const LiveAgentCounter = () => {
  const [count, setCount] = useState(3847)

  useEffect(() => {
    const t = setInterval(() => {
      setCount((v) => v + Math.floor(Math.random() * 3 - 1))
    }, 1200)
    return () => clearInterval(t)
  }, [])

  return (
    <span
      style={{
        color: 'rgba(0,0,0,0.85)',
        fontFamily: 'monospace',
        fontSize: 'clamp(3rem, 6vw, 5rem)',
        fontWeight: 300,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        transition: 'color 0.3s ease',
      }}
    >
      {/* 3847 renders as '3,847' on the server too, so no hydration gate. */}
      {count.toLocaleString('en-US')}
    </span>
  )
}
