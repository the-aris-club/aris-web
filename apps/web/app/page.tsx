'use client'

import Image from 'next/image'
import React, { useRef, useEffect, useState, useCallback } from 'react'

import { DevExSection } from '@/components/devex-section'
import { IntroAnimation, HERO_REVEAL_MS } from '@/components/intro-animation'
import { LiveAgentFeed, LiveAgentCounter } from '@/components/live-agent-feed'
import { MobileNav } from '@/components/mobile-nav'
import { PixelIcon } from '@/components/pixel-icon'
import { RevealText } from '@/components/reveal-text'
import { StackingAgentCards } from '@/components/stacking-agent-cards'

// ─── Intersection Observer hook ──────────────────────────────────────────────
const useInView = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { inView, ref }
}

// ─── Pointer tracking ────────────────────────────────────────────────────────
const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
  el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
}

// ─── Bento card ──────────────────────────────────────────────────────────────
const BentoCard = ({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) => {
  const { ref, inView } = useInView(0.1)
  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-2xl border border-black/[0.07] bg-white transition-all duration-700 hover:border-black/[0.15] hover:bg-[#fafaf8] ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms, border-color 0.3s ease, background-color 0.3s ease`,
      }}
    >
      {/* Hover glow spot */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,0,0,0.03), transparent 60%)',
        }}
      />
      {children}
    </div>
  )
}

// ─── Pill tag ─────────────────────────────────────────────────────────────────
const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1 font-sans text-[11px] tracking-widest text-black/40">
    {children}
  </span>
)

// ─── Main page ────────────────────────────────────────────────────────────────
const ArisPage = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [heroReady, setHeroReady] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const handleIntroDone = useCallback(() => {
    setHeroReady(true)
  }, [])

  // Start video zoom slightly before hero content reveals, for seamless overlap
  useEffect(() => {
    const t = setTimeout(() => setVideoReady(true), HERO_REVEAL_MS)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans text-[#111] antialiased">
      {/* ── INTRO ANIMATION ───────────────────────────────────────────────── */}
      <IntroAnimation onDone={handleIntroDone} />

      {/* ── STICKY NAV ────────────────────────────────────────────────────── */}
      <MobileNav />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative h-screen overflow-hidden">
        {/* Video background — zooms in once intro is done */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentic-hero-9yW3wnTNMfn2U6lsVhTTZSJFEvAoSj.mp4"
          style={{
            transform: videoReady ? 'scale(1.05)' : 'scale(0.85)',
            transition: 'transform 2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Progressive blur + light gradient rising from bottom */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            background:
              'linear-gradient(to top, #F5F4F0 0%, #F5F4F0 18%, rgba(245,244,240,0.85) 35%, rgba(245,244,240,0.5) 55%, rgba(245,244,240,0.15) 75%, transparent 100%)',
            height: '65%',
          }}
        />
        {/* Backdrop blur layers — progressively lighter toward top */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            WebkitBackdropFilter: 'blur(12px)',
            WebkitMaskImage:
              'linear-gradient(to top, black 0%, transparent 100%)',
            backdropFilter: 'blur(12px)',
            height: '20%',
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            WebkitBackdropFilter: 'blur(6px)',
            WebkitMaskImage:
              'linear-gradient(to top, black 0%, transparent 100%)',
            backdropFilter: 'blur(6px)',
            height: '38%',
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            WebkitBackdropFilter: 'blur(2px)',
            WebkitMaskImage:
              'linear-gradient(to top, black 0%, transparent 100%)',
            backdropFilter: 'blur(2px)',
            height: '55%',
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          }}
        />

        {/* Spacer so hero content doesn't sit under the fixed nav */}
        <div className="h-20" />

        {/* Title + metrics — anchored to bottom left */}
        <div className="absolute inset-x-0 bottom-0 z-30 flex max-w-3xl flex-col px-6 pb-12 md:px-12">
          {/* Title */}
          <h1
            className="mb-10 font-sans text-6xl leading-[1.0] font-light tracking-tight text-[#111] sm:text-7xl md:text-8xl"
            style={{
              filter: heroReady ? 'blur(0px)' : 'blur(24px)',
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? 'translateY(0px)' : 'translateY(32px)',
              transition:
                'opacity 1s cubic-bezier(0.16,1,0.3,1) 0ms, filter 1s cubic-bezier(0.16,1,0.3,1) 0ms, transform 1s cubic-bezier(0.16,1,0.3,1) 0ms',
            }}
          >
            Build &amp;
            <br />
            orchestrate AI
            <br />
            agents while
            <br />
            you sleep.
          </h1>

          {/* 3 metrics — staggered after title */}
          <div className="flex gap-8 sm:gap-12">
            {[
              { label: 'Tasks', value: '50M+' },
              { label: 'Uptime', value: '99.9%' },
              { label: 'Countries', value: '180+' },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  filter: heroReady ? 'blur(0px)' : 'blur(16px)',
                  opacity: heroReady ? 1 : 0,
                  transform: heroReady ? 'translateY(0px)' : 'translateY(20px)',
                  transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms`,
                }}
              >
                <div className="font-sans text-3xl font-light tracking-tight text-[#111] sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 font-sans text-xs tracking-widest text-black/40 uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM OVERVIEW (bento) ──────────────────────────────────────── */}
      <section id="platform" className="px-6 py-32 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <PixelIcon type="platform" size={40} />
            <div className="mt-4">
              <Tag>PLATFORM</Tag>
            </div>
            <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl lg:text-6xl">
              {'Everything you need\nto ship agents.'}
            </RevealText>
          </div>

          <div
            className="grid-rows-auto grid grid-cols-12 gap-3"
            onMouseMove={handleMouse}
          >
            {/* Big left card — full width now that multi-agent is removed */}
            <BentoCard
              className="relative col-span-12 flex min-h-[200px] flex-col justify-between overflow-hidden p-8"
              delay={0}
            >
              {/* Arc background image — always fills container, objects pushed to bottom third */}
              <Image
                src="/images/arc.png"
                alt=""
                aria-hidden="true"
                fill
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: 'center 70%' }}
              />
              {/* Progressive blur layer — blurs from 45% downward */}
              <div
                className="absolute inset-0"
                style={{
                  WebkitBackdropFilter: 'blur(16px)',
                  WebkitMaskImage:
                    'linear-gradient(to bottom, transparent 45%, black 100%)',
                  backdropFilter: 'blur(16px)',
                  maskImage:
                    'linear-gradient(to bottom, transparent 45%, black 100%)',
                }}
              />
              {/* Fade-to-background gradient — matches site bg color #f5f4f0 */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to bottom, transparent 35%, rgba(245,244,240,0.3) 50%, rgba(245,244,240,0.75) 65%, rgba(245,244,240,0.95) 80%, rgb(245,244,240) 100%)',
                }}
              />
              {/* Content */}
              <div className="relative z-10">
                <div
                  className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white/60"
                  style={{ backdropFilter: 'blur(8px)' }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                    <path d="m4.93 4.93 2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-light">
                  Visual Agent Builder
                </h3>
                <p className="max-w-sm text-sm leading-relaxed text-black/45">
                  Drag, connect, and configure agents through an intuitive graph
                  editor. No boilerplate. Ship in minutes, not days.
                </p>
              </div>
            </BentoCard>

            {/* Bottom row */}
            <BentoCard
              className="col-span-12 min-h-[200px] p-8 md:col-span-4"
              delay={120}
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-black/10">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-light">Real-time Monitoring</h3>
              <p className="text-sm leading-relaxed text-black/45">
                Trace every decision. Debug with full execution history and live
                logs.
              </p>
            </BentoCard>

            <BentoCard
              className="col-span-12 min-h-[200px] p-8 md:col-span-4"
              delay={160}
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-black/10">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M8 10h8M8 14h5" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-light">Memory & Context</h3>
              <p className="text-sm leading-relaxed text-black/45">
                Persistent long-term memory across sessions. Agents learn from
                every interaction.
              </p>
            </BentoCard>

            <BentoCard
              className="col-span-12 min-h-[200px] p-8 md:col-span-4"
              delay={200}
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-black/10">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-light">
                Guardrails & Permissions
              </h3>
              <p className="text-sm leading-relaxed text-black/45">
                Define what agents can and cannot do. Fine-grained access
                control per tool.
              </p>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ── BUILD YOUR AGENTS (4 cards) ───────────────────────────────────── */}
      <section
        id="agents"
        className="border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <PixelIcon type="agents" size={40} />
              <div className="mt-4">
                <Tag>AGENT TYPES</Tag>
              </div>
              <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">
                {'Plug-and-play agents\nready to deploy.'}
              </RevealText>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-black/45">
              Start with a pre-built agent or compose your own from primitives.
              Every agent is versioned, testable, and observable.
            </p>
          </div>

          <StackingAgentCards />
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section
        id="workflow"
        className="overflow-hidden border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <PixelIcon type="workflow" size={40} />
            <div className="mt-4">
              <Tag>WORKFLOW</Tag>
            </div>
            <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">
              {'From idea to running agent\nin four steps.'}
            </RevealText>
          </div>

          <div
            className="grid grid-cols-1 gap-3 md:grid-cols-4"
            onMouseMove={handleMouse}
          >
            {[
              {
                delay: 0,
                desc: 'Describe your agent in plain language. Set objectives, tools, and boundaries.',
                img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/define-5aafAmGBrxZpOqJ3XLHY3n3qzC2I5K.png',
                n: '01',
                title: 'Define',
              },
              {
                delay: 80,
                desc: 'Chain agents together in the visual editor. Wire triggers, conditions, and outputs.',
                img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/compose-5RT5VR4f1Y3GoFmovqTKLTG4UXp3g2.png',
                n: '02',
                title: 'Compose',
              },
              {
                delay: 140,
                desc: 'Run sandboxed simulations. Inspect every decision in the execution trace.',
                img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test-zm8guZwxJHtwWsJ7XO4B0CF7GzlNK8.png',
                n: '03',
                title: 'Test',
              },
              {
                delay: 200,
                desc: 'Push globally in one click. Agents auto-scale, self-heal, and report back.',
                img: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deploy-an8fgHSLzniojkcmRyGGIFQUJF9T5J.png',
                n: '04',
                title: 'Deploy',
              },
            ].map((step) => (
              <BentoCard
                key={step.n}
                className="relative flex min-h-[320px] flex-col overflow-hidden"
                delay={step.delay}
              >
                {/* Image at top — mask fades it out strongly before the bottom edge */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-56">
                  <Image
                    src={step.img}
                    alt={step.title}
                    fill
                    className="h-full w-full object-cover object-top"
                    style={{
                      WebkitMaskImage:
                        'linear-gradient(to bottom, black 0%, black 30%, transparent 80%)',
                      maskImage:
                        'linear-gradient(to bottom, black 0%, black 30%, transparent 80%)',
                    }}
                  />
                </div>
                {/* Number top-left */}
                <div className="relative z-10 p-7">
                  <span className="font-pixel block text-[11px] tracking-widest text-black/20">
                    {step.n}
                  </span>
                </div>
                {/* Text pushed further down */}
                <div className="relative z-10 mt-auto px-7 pt-16 pb-7">
                  <h3 className="mb-3 text-2xl font-light">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-black/45">
                    {step.desc}
                  </p>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ──────────────────────────────────────────────────── */}
      <section
        id="integrations"
        className="border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <PixelIcon type="integrations" size={40} />
              <div className="mt-4">
                <Tag>INTEGRATIONS</Tag>
              </div>
              <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">
                {'Connect any tool.\nControl any system.'}
              </RevealText>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-black/45">
              200+ native connectors. Everything from Slack to your internal
              database. Build custom tools with our SDK in minutes.
            </p>
          </div>

          {/* Full-width image block with glass cards */}
          {/* Mobile: flex-col, image + cards stacked. Desktop: image fills block, cards absolute */}
          <div
            className="flex flex-col overflow-hidden rounded-2xl border border-black/[0.07] md:relative md:block"
            onMouseMove={handleMouse}
          >
            {/* Image */}
            <div className="relative h-[280px] w-full shrink-0 md:h-[480px]">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Org%20Arc%20-%20Upscaled-Sk90jShfu7nltLnhoQbaMJC1YaQKuU.png"
                alt="Agent orchestration architecture"
                fill
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>

            {/* Cards — flex row on mobile (equal spacing), absolute on desktop */}
            <div className="flex flex-col gap-3 p-4 md:absolute md:right-4 md:bottom-4 md:w-72 md:p-0">
              <div
                className="rounded-xl border border-white/50 p-6"
                style={{
                  WebkitBackdropFilter: 'blur(24px)',
                  backdropFilter: 'blur(24px)',
                  background: 'rgba(255,255,255,0.60)',
                }}
              >
                <Tag>SDK</Tag>
                <h3 className="mt-3 mb-2 text-lg font-light">
                  Build custom tools
                </h3>
                <p className="mb-4 text-xs leading-relaxed text-black/45">
                  Define any function as a tool your agents can call. TypeScript
                  and Python.
                </p>
                <div className="rounded-lg border border-black/[0.07] bg-black/[0.05] p-3 font-mono text-[11px] leading-relaxed text-black/50">
                  <span className="text-black/25">
                    &#47;&#47; tool definition
                  </span>
                  <br />
                  <span className="text-blue-600/70">defineTool</span>
                  {'({'}
                  <br />
                  {'  '}
                  <span className="text-amber-700/70">name</span>:{' '}
                  <span className="text-green-700/70">
                    &apos;fetchPrice&apos;
                  </span>
                  ,<br />
                  {'  '}
                  <span className="text-amber-700/70">run</span>:{' '}
                  <span className="text-black/35">async (q) </span>={'>'}
                  <br />
                  {'    '}
                  <span className="text-blue-600/70">api</span>.get(q)
                  <br />
                  {'})'}
                </div>
              </div>

              <div
                className="rounded-xl border border-white/50 p-6"
                style={{
                  WebkitBackdropFilter: 'blur(24px)',
                  backdropFilter: 'blur(24px)',
                  background: 'rgba(255,255,255,0.60)',
                }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500/80" />
                  <span className="text-xs tracking-widest text-black/40">
                    LIVE API
                  </span>
                </div>
                <p className="text-sm text-black/45">
                  Full REST + WebSocket API. Stream agent outputs directly into
                  your product.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY & OBSERVABILITY ──────────────────────────────────��──── */}
      <section
        id="security"
        className="border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <PixelIcon type="platform" size={40} />
            <div className="mt-4">
              <Tag>SECURITY</Tag>
            </div>
            <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">
              {'Enterprise-grade\nfrom day one.'}
            </RevealText>
          </div>

          {/* Asymmetric grid: left text + title, right interactive audit log */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left side — descriptions */}
            <div className="space-y-6">
              <p className="text-sm leading-relaxed text-black/45">
                Every action is logged, every decision is traceable. Built for
                teams that need compliance without compromise.
              </p>

              <div className="space-y-4">
                {[
                  {
                    desc: 'Independently audited security controls',
                    label: 'SOC 2 Type II',
                  },
                  {
                    desc: 'Every decision logged with full traceability',
                    label: 'Full Audit Trail',
                  },
                  {
                    desc: 'Monitor, debug, and replay any execution',
                    label: 'Real-time Observability',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="w-1 shrink-0 rounded-full bg-black/10" />
                    <div>
                      <h3 className="mb-1 text-sm font-light">{item.label}</h3>
                      <p className="text-xs text-black/35">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compliance badges — vertical stack */}
              <div className="flex flex-col gap-2 pt-4">
                {['SOC 2', 'GDPR', 'HIPAA Ready', 'ISO 27001'].map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-2 text-xs text-black/25"
                  >
                    <span className="h-1 w-1 rounded-full bg-black/25" />
                    {badge}
                  </div>
                ))}
              </div>
            </div>

            {/* Right side — live audit log visualization */}
            <BentoCard className="p-6 lg:row-span-1" delay={0}>
              <div className="mb-4 text-xs tracking-widest text-black/30 uppercase">
                Live Audit Trail
              </div>
              <div className="space-y-2">
                {[
                  {
                    action: 'agent_executed',
                    status: 'success',
                    time: '12:34:21',
                  },
                  {
                    action: 'decision_logged',
                    status: 'success',
                    time: '12:34:18',
                  },
                  {
                    action: 'tool_called',
                    status: 'success',
                    time: '12:34:15',
                  },
                  {
                    action: 'memory_updated',
                    status: 'success',
                    time: '12:34:12',
                  },
                  {
                    action: 'output_generated',
                    status: 'success',
                    time: '12:34:09',
                  },
                ].map((log, i) => (
                  <div
                    key={i}
                    className="group flex cursor-pointer items-center gap-3 rounded-lg border border-black/[0.04] bg-black/[0.02] px-3 py-2.5 transition-colors hover:bg-black/[0.04]"
                    style={{
                      animation: `fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both`,
                    }}
                  >
                    <span className="min-w-[60px] font-mono text-[10px] text-black/25">
                      {log.time}
                    </span>
                    <span className="flex-1 text-[11px] font-light text-black/50">
                      {log.action}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500/60 transition-colors group-hover:bg-green-500" />
                  </div>
                ))}
              </div>
              <style>{`
                @keyframes fadeInUp {
                  from { opacity: 0; transform: translateY(8px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ── DEVELOPER EXPERIENCE ──────────────────────────────────────────── */}
      <DevExSection />

      {/* ── MARQUEE CAPABILITIES ──────────────────────────────────────────── */}
      <section className="overflow-hidden border-t border-black/[0.06] py-0 select-none">
        <div
          className="flex border-b border-black/[0.06]"
          style={{ animation: 'marqueeLeft 28s linear infinite' }}
        >
          {Array.from({ length: 3 }).map((_, rep) => (
            <div key={rep} className="flex shrink-0">
              {[
                'Web Research',
                'Code Generation',
                'Email Drafting',
                'Data Analysis',
                'PR Reviews',
                'Scheduling',
                'SQL Queries',
                'API Calls',
                'File Processing',
                'Monitoring',
              ].map((cap) => (
                <div
                  key={cap}
                  className="flex shrink-0 items-center gap-6 border-r border-black/[0.06] px-10 py-5"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black/20" />
                  <span className="text-sm tracking-wide whitespace-nowrap text-black/45">
                    {cap}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div
          className="flex"
          style={{ animation: 'marqueeRight 22s linear infinite' }}
        >
          {Array.from({ length: 3 }).map((_, rep) => (
            <div key={rep} className="flex shrink-0">
              {[
                'Report Writing',
                'Slack Summaries',
                'Lead Scoring',
                'Image Tagging',
                'Test Running',
                'Deployment',
                'Log Parsing',
                'Invoice Processing',
                'Meeting Notes',
                'Sentiment Analysis',
              ].map((cap) => (
                <div
                  key={cap}
                  className="flex shrink-0 items-center gap-6 border-r border-black/[0.06] px-10 py-5"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black/12" />
                  <span className="text-sm tracking-wide whitespace-nowrap text-black/30">
                    {cap}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE AGENTS ��──────────────────────────────────────────────────── */}
      <section
        id="live"
        className="border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
            <div>
              <PixelIcon type="agents" size={40} />
              <div className="mt-4">
                <Tag>LIVE RIGHT NOW</Tag>
              </div>
              <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl lg:text-6xl">
                {'Agents working\n24 / 7, autonomously.'}
              </RevealText>
              <p className="mt-6 max-w-sm text-base leading-relaxed text-black/40">
                At any moment, thousands of agents are running tasks on behalf
                of teams around the world — no human in the loop.
              </p>
              <div className="mt-10 flex items-end gap-2">
                <LiveAgentCounter />
                <span className="mb-1 text-sm tracking-wide text-black/30">
                  agents active globally
                </span>
              </div>
            </div>
            <div className="relative">
              <LiveAgentFeed />
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────���────������─────────────── */}
      <section
        id="pricing"
        className="border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 flex flex-col items-center text-center">
            <PixelIcon type="pricing" size={40} />
            <div className="mt-4">
              <Tag>PRICING</Tag>
            </div>
            <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">
              Pay as your agents grow.
            </RevealText>
          </div>

          <div
            className="grid grid-cols-1 gap-3 md:grid-cols-3"
            onMouseMove={handleMouse}
          >
            {[
              {
                delay: 0,
                features: [
                  '5 agents',
                  '1,000 tasks/mo',
                  'Community support',
                  'Basic traces',
                ],
                name: 'Sandbox',
                price: 'Free',
                sub: 'Start experimenting',
              },
              {
                delay: 80,
                features: [
                  '50 agents',
                  '100K tasks/mo',
                  'Priority support',
                  'Full traces + replay',
                  'Custom tools',
                  'REST API',
                ],
                highlight: true,
                name: 'Builder',
                period: '/mo',
                price: '$49',
                sub: 'For teams shipping fast',
              },
              {
                delay: 140,
                features: [
                  'Unlimited agents',
                  'Unlimited tasks',
                  'Dedicated infra',
                  'SOC 2 / HIPAA',
                  'SLA guarantees',
                  'Custom contracts',
                ],
                name: 'Enterprise',
                price: 'Custom',
                sub: 'For orgs at scale',
              },
            ].map((plan) => (
              <BentoCard
                key={plan.name}
                className={`flex flex-col p-8 ${plan.highlight ? 'border-black/20 bg-[#F0EEE8]' : ''}`}
                delay={plan.delay}
              >
                <div className="mb-8">
                  <div className="font-pixel mb-4 text-[11px] tracking-widest text-black/40">
                    {plan.name}
                  </div>
                  <div className="mb-1 flex items-baseline gap-1">
                    <span className="text-4xl font-light">{plan.price}</span>
                    {plan.period && (
                      <span className="text-sm text-black/40">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="text-xs tracking-wide text-black/35">
                    {plan.sub}
                  </p>
                </div>
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 text-sm text-black/55"
                    >
                      <div className="h-1 w-1 shrink-0 rounded-full bg-black/25" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`w-full rounded-xl py-3 text-sm tracking-widest transition-all duration-200 ${
                    plan.highlight
                      ? 'bg-[#111] text-white hover:bg-[#333]'
                      : 'border border-black/10 text-black/60 hover:border-black/25 hover:bg-black/[0.04] hover:text-black'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'CONTACT SALES' : 'GET STARTED'}
                </button>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20">
        {/* Glass panels image — anchored to bottom center */}
        <Image
          src="/images/footer.png"
          alt=""
          aria-hidden="true"
          width={2720}
          height={1536}
          className="pointer-events-none absolute bottom-0 left-0 w-full object-cover object-bottom select-none"
          style={{ opacity: 0.85 }}
        />
        {/* Progressive blur from bottom — blends into site bg */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            WebkitBackdropFilter: 'blur(18px)',
            WebkitMaskImage:
              'linear-gradient(to top, transparent 0%, black 55%)',
            backdropFilter: 'blur(18px)',
            maskImage: 'linear-gradient(to top, transparent 0%, black 55%)',
          }}
        />
        {/* Colour fade from bottom to site bg #f5f4f0 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgb(245,244,240) 0%, rgba(245,244,240,0.92) 18%, rgba(245,244,240,0.55) 35%, transparent 55%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h2 className="mb-6 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl lg:text-6xl">
            Start building your
            <br />
            agent workforce.
          </h2>
          <p className="mb-10 text-sm leading-relaxed text-black/45">
            Join thousands of teams deploying AI agents that work around the
            clock, across every timezone.
          </p>
          {submitted ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/20 bg-emerald-50 px-6 py-3 text-sm text-emerald-700">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              You&apos;re on the list. We&apos;ll be in touch.
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (email) {
                  setSubmitted(true)
                }
              }}
              className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#111] transition-colors placeholder:text-black/25 focus:border-black/25 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#111] px-8 py-3 text-sm font-medium tracking-widest text-white transition-colors hover:bg-[#333]"
              >
                JOIN
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-black/[0.06] px-6 py-10 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <span className="font-pixel text-xs tracking-[0.25em] text-black/50">
            ARIS
          </span>

          {/* Nav sections */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {[
              { href: '#platform', label: 'Platform' },
              { href: '#agents', label: 'Agents' },
              { href: '#workflow', label: 'Workflow' },
              { href: '#integrations', label: 'Integrations' },
              { href: '#live', label: 'Live' },
              { href: '#pricing', label: 'Pricing' },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-xs tracking-widest text-black/35 transition-colors hover:text-black/70"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Legal links */}
          <div className="flex items-center gap-6">
            {[
              { href: '#', label: 'Privacy' },
              { href: '#', label: 'Terms' },
              { href: '#', label: 'Docs' },
              { href: '#', label: 'GitHub' },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-xs tracking-widest text-black/25 transition-colors hover:text-black/55"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-black/[0.04] pt-6">
          <span className="text-xs text-black/20">
            © 2026 The Aris Club. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  )
}

export default ArisPage
