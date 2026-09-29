'use client'

import { useEffect, useRef } from 'react'

// Each icon is a 12×12 pixel grid animated at 60fps with RAF
// Colors are black at varying opacity to match the light theme

type IconType = 'platform' | 'agents' | 'workflow' | 'integrations' | 'pricing'

interface PixelIconProps {
  type: IconType
  // rendered px size (default 40)
  size?: number
}

// ── Platform icon: rotating gear / node graph ────────────────────────────────
const drawPlatform = (ctx: CanvasRenderingContext2D, W: number, t: number) => {
  const cx = W / 2
  const cy = W / 2
  const r = W * 0.36
  // pixel size
  const ps = W / 12

  // Central node — pulsing
  const pulse = 0.6 + 0.4 * Math.sin(t * 0.003)
  ctx.fillStyle = `rgba(0,0,0,${pulse})`
  const cs = ps * 1.4
  ctx.fillRect(cx - cs / 2, cy - cs / 2, cs, cs)

  // 6 orbiting nodes
  const nodeCount = 6
  for (let i = 0; i < nodeCount; i += 1) {
    const angle = (i / nodeCount) * Math.PI * 2 + t * 0.0015
    const nx = cx + Math.cos(angle) * r
    const ny = cy + Math.sin(angle) * r
    const opacity = 0.3 + 0.5 * ((Math.sin(angle * 2 + t * 0.002) + 1) / 2)
    ctx.fillStyle = `rgba(0,0,0,${opacity})`
    ctx.fillRect(
      Math.round(nx / ps) * ps - ps / 2,
      Math.round(ny / ps) * ps - ps / 2,
      ps,
      ps
    )

    // Connector line (pixelated)
    const steps = 5
    for (let s = 1; s < steps; s += 1) {
      const lx = cx + (nx - cx) * (s / steps)
      const ly = cy + (ny - cy) * (s / steps)
      const lo = (0.06 + 0.1 * (s / steps)) * pulse
      ctx.fillStyle = `rgba(0,0,0,${lo})`
      ctx.fillRect(
        Math.round(lx / ps) * ps,
        Math.round(ly / ps) * ps,
        ps * 0.7,
        ps * 0.7
      )
    }
  }
}

// ── Agents icon: humanoid pixel figure running ───────────────────────────────
// Frames as 8×8 pixel masks (row-major, 1=lit)
const AGENT_FRAMES: number[][][] = [
  // Frame 0 — stand
  [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
  ],
  // Frame 1 — step left
  [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0],
  ],
  // Frame 2 — stand (same as 0)
  [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
  ],
  // Frame 3 — step right
  [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0],
  ],
]

const drawAgents = (ctx: CanvasRenderingContext2D, W: number, t: number) => {
  // animation speed in "frames per second equivalent"
  const fps = 6
  const frameIdx = Math.floor(t / (1000 / fps)) % AGENT_FRAMES.length
  const frame = AGENT_FRAMES[frameIdx]
  const rows = frame.length
  const cols = frame[0].length
  const ps = Math.floor(W / cols)
  const offX = Math.floor((W - cols * ps) / 2)
  const offY = Math.floor((W - rows * ps) / 2)

  // Subtle walk offset
  const bobY = Math.sin(t * 0.012) * ps * 0.4

  for (const [r, row] of frame.entries()) {
    for (const [c, cell] of row.entries()) {
      if (!cell) {
        continue
      }
      const opacity = 0.5 + 0.5 * Math.sin(t * 0.001 + r * 0.3)
      ctx.fillStyle = `rgba(0,0,0,${opacity})`
      ctx.fillRect(offX + c * ps, offY + r * ps + bobY, ps - 1, ps - 1)
    }
  }
}

// ── Workflow icon: hourglass shape — top half fills, drains to bottom ─────────
const drawWorkflow = (ctx: CanvasRenderingContext2D, W: number, t: number) => {
  const ps = Math.floor(W / 12)
  const cx = W / 2
  const cy = W / 2

  // Hourglass pixel mask: 7 rows × 7 cols, symmetric
  const shape = [
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
  ]

  const rows = shape.length
  const cols = shape[0].length
  const offX = cx - (cols * ps) / 2
  const offY = cy - (rows * ps) / 2

  // Sand fill: top half empties, bottom half fills — period 2s
  const period = 2400
  // 0→1
  const fill = (t % period) / period

  for (const [r, row] of shape.entries()) {
    for (const [c, cell] of row.entries()) {
      if (!cell) {
        continue
      }

      // Determine if this pixel is "sand"
      const isTopHalf = r < rows / 2
      const isMid = r === Math.floor(rows / 2)
      let sandAlpha: number

      if (isTopHalf) {
        // Top: pixels disappear row by row from top
        const rowFill = 1 - Math.min(1, fill * rows * 1.4 - r)
        sandAlpha = Math.max(0, rowFill)
      } else if (isMid) {
        // Center pixel pulses
        sandAlpha = 0.5 + 0.4 * Math.sin(t * 0.008)
      } else {
        // Bottom: pixels appear row by row from center
        const rowFromCenter = r - Math.floor(rows / 2)
        const rowFill = Math.min(1, fill * rows * 1.4 - rowFromCenter)
        sandAlpha = Math.max(0, rowFill)
      }

      // Outline always visible at low opacity
      const baseAlpha = 0.12
      const alpha = Math.max(baseAlpha, sandAlpha * 0.85)
      ctx.fillStyle = `rgba(0,0,0,${alpha})`
      ctx.fillRect(offX + c * ps, offY + r * ps, ps - 1, ps - 1)
    }
  }
}

// ── Integrations icon: pixel grid of tiles that light up in sequence ──────────
const drawIntegrations = (
  ctx: CanvasRenderingContext2D,
  W: number,
  t: number
) => {
  const cols = 5
  const rows = 4
  const ps = Math.floor(W / (cols + 1))
  const gap = 2
  const offX = Math.floor((W - cols * (ps + gap)) / 2)
  const offY = Math.floor((W - rows * (ps + gap)) / 2)
  const total = cols * rows

  const wave = t * 0.0008

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const idx = r * cols + c
      const phase = (idx / total) * Math.PI * 2
      const alpha = 0.1 + 0.65 * ((Math.sin(wave + phase) + 1) / 2)
      const x = offX + c * (ps + gap)
      const y = offY + r * (ps + gap)
      ctx.fillStyle = `rgba(0,0,0,${alpha})`
      ctx.fillRect(x, y, ps, ps)
    }
  }
}

// ── Pricing icon: stacked bar chart growing ───────────────────────────────────
const drawPricing = (ctx: CanvasRenderingContext2D, W: number, t: number) => {
  const ps = Math.floor(W / 12)
  const bars = 3
  const bw = ps * 2
  const gap = ps
  const total = bars * bw + (bars - 1) * gap
  const offX = Math.floor((W - total) / 2)
  const maxH = W * 0.7

  const heights = [0.45, 0.75, 0.55]
  const wave = Math.sin(t * 0.0015) * 0.12

  for (const [i, h] of heights.entries()) {
    const animated = Math.max(0.1, h + wave * (i % 2 === 0 ? 1 : -1))
    const bh = animated * maxH
    const x = offX + i * (bw + gap)
    const y = W - bh - ps

    // Bar body (pixelated — fill row by row)
    const rowCount = Math.floor(bh / ps)
    for (let row = 0; row < rowCount; row += 1) {
      const progress = 1 - row / rowCount
      const alpha = 0.15 + progress * 0.7
      ctx.fillStyle = `rgba(0,0,0,${alpha})`
      ctx.fillRect(x, y + row * ps, bw, ps - 1)
    }
  }
}

// ── Canvas wrapper ────────────────────────────────────────────────────────────
// Six of these run on the page, one per section heading, and the section that
// repeats a heading runs two. They were each driving a 60fps loop from mount
// until the tab closed, whether or not anyone was looking at them.
//
// Two things stop that. A single shared observer counts how many icons are on
// screen and the loop runs only while that count is above zero, so scrolling to
// the footer costs nothing. And prefers-reduced-motion draws one frame and
// stops, which is what the setting is asking for.

// Which canvases are on screen right now. A Set keyed on the element, not a
// running count: an observer's first callback reports isIntersecting:false for
// every target that is off screen, and a counter would go negative by one per
// icon at mount and never climb back to zero.
const onScreen = new Set<Element>()
const screenListeners = new Set<() => void>()
let screenObserver: IntersectionObserver | null = null

// Built on first use, not at module scope: this module is evaluated during
// prerender, where there is no IntersectionObserver to construct.
const getScreenObserver = () => {
  screenObserver ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        onScreen.add(entry.target)
      } else {
        onScreen.delete(entry.target)
      }
    }
    for (const listener of screenListeners) {
      listener()
    }
  })
  return screenObserver
}

export const PixelIcon = ({ type, size = 40 }: PixelIconProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    // Size the backing store once. Assigning canvas.width reallocates it and
    // resets the whole 2D context, so doing this inside the draw loop
    // reallocated the store sixty times a second and re-applied the DPR
    // transform on every frame to compensate.
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)
    ctx.imageSmoothingEnabled = false

    // 0 means "not running", which is how start and stop stay idempotent.
    let raf = 0

    const draw = (t: number) => {
      ctx.clearRect(0, 0, size, size)

      switch (type) {
        case 'platform': {
          drawPlatform(ctx, size, t)
          break
        }
        case 'agents': {
          drawAgents(ctx, size, t)
          break
        }
        case 'workflow': {
          drawWorkflow(ctx, size, t)
          break
        }
        case 'integrations': {
          drawIntegrations(ctx, size, t)
          break
        }
        case 'pricing': {
          drawPricing(ctx, size, t)
          break
        }
        default: {
          break
        }
      }

      raf = requestAnimationFrame(draw)
    }

    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }
    const start = () => {
      if (raf === 0) {
        raf = requestAnimationFrame(draw)
      }
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (reducedMotion) {
      // One frame, no loop. The canvas is still aria-hidden by its surroundings
      // and carries no information of its own.
      draw(0)
      return
    }

    // This icon runs only while it is itself on screen. The listener is how it
    // learns that some other icon's visibility changed the shared picture.
    const sync = () => (onScreen.has(canvas) ? start() : stop())
    const observer = getScreenObserver()
    screenListeners.add(sync)
    observer.observe(canvas)
    sync()

    return () => {
      screenListeners.delete(sync)
      // unobserve fires no callback, so the entry has to go by hand.
      onScreen.delete(canvas)
      observer.unobserve(canvas)
      stop()
    }
  }, [type, size])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        flexShrink: 0,
        height: size,
        imageRendering: 'pixelated',
        width: size,
      }}
    />
  )
}
