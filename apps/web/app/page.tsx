'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useRef, useEffect, useState, useCallback } from 'react'

import { DevExSection } from '@/components/devex-section'
import { IntroAnimation, HERO_REVEAL_MS } from '@/components/intro-animation'
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
  const [heroReady, setHeroReady] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const handleIntroDone = useCallback(() => {
    setHeroReady(true)
  }, [])

  // Start the hero zoom slightly before hero content reveals, for seamless overlap
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
      <section className="relative h-screen overflow-hidden" id="top">
        {/* Hero artwork — the club's own lab scene, cropped free of text and
            lockup so the page headline has room. The stock video that was here
            showed unrelated footage. The scale-in on reveal is unchanged. */}
        <Image
          alt=""
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover"
          fill
          priority
          sizes="100vw"
          src="/brand/aris-hero.webp"
          style={{
            objectPosition: 'center 40%',
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
            className="mb-10 text-6xl leading-[1.0] font-light tracking-tight text-[#111] sm:text-7xl md:text-8xl"
            style={{
              filter: heroReady ? 'blur(0px)' : 'blur(24px)',
              fontFamily: '"IBM Plex Sans", sans-serif',
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? 'translateY(0px)' : 'translateY(32px)',
              transition:
                'opacity 1s cubic-bezier(0.16,1,0.3,1) 0ms, filter 1s cubic-bezier(0.16,1,0.3,1) 0ms, transform 1s cubic-bezier(0.16,1,0.3,1) 0ms',
            }}
          >
            We build
            <br />
            systems that
            <br />
            turn complexity
            <br />
            into capability.
          </h1>

          {/* 3 metrics — staggered after title */}
          <div className="flex gap-8 sm:gap-12">
            {[
              { label: 'Technical departments', value: '4' },
              { label: 'Groups in the club', value: '5' },
              { label: 'Fees charged', value: '0' },
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
                <div
                  className="text-3xl font-light tracking-tight text-[#111] sm:text-4xl"
                  style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
                >
                  {stat.value}
                </div>
                <div
                  className="mt-1 text-xs tracking-widest text-black/40 uppercase"
                  style={{ fontFamily: '"IBM Plex Sans", sans-serif' }}
                >
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
              <Tag>DEPARTMENTS</Tag>
            </div>
            <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl lg:text-6xl">
              {'Four technical\ndepartments.'}
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
                <h3 className="mb-3 text-xl font-light">Autonomous Systems</h3>
                <p className="max-w-sm text-sm leading-relaxed text-black/45">
                  Modelling, control, sensing and autonomous systems. A
                  department counts as operating with a lead and at least three
                  active members.
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
              <h3 className="mb-2 text-lg font-light">Robotics</h3>
              <p className="text-sm leading-relaxed text-black/45">
                Robots, control, simulation and hardware. Mechanisms, motors and
                completed machines.
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
              <h3 className="mb-2 text-lg font-light">IoT</h3>
              <p className="text-sm leading-relaxed text-black/45">
                Sensing, networking, edge devices and the data they produce.
                Microcontrollers and connected hardware.
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
              <h3 className="mb-2 text-lg font-light">Software</h3>
              <p className="text-sm leading-relaxed text-black/45">
                Software, data, APIs, testing and operations. Bots, internal
                tools, the website and automation.
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
                <Tag>AUTOMATION</Tag>
              </div>
              <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">
                {'What a bot may do,\nand what it may not.'}
              </RevealText>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-black/45">
              AI may assist with drafting, questions, summaries, translation,
              search, data-quality checks and routine reminders.
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
              <Tag>PROJECTS</Tag>
            </div>
            <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">
              {'What every project\nhas to name.'}
            </RevealText>
          </div>

          <div
            className="grid grid-cols-1 gap-3 md:grid-cols-4"
            onMouseMove={handleMouse}
          >
            {[
              {
                delay: 0,
                desc: 'Roles are assigned for a scope and term. They are not ranks.',
                img: '/brand/aris-hero.webp',
                n: '01',
                title: 'Purpose and owner',
              },
              {
                delay: 80,
                desc: 'A member keeps ownership of work they create unless a separate written agreement says otherwise.',
                img: '/brand/aris-hero.webp',
                n: '02',
                title: 'Deliverable and acceptance criteria',
              },
              {
                delay: 140,
                desc: 'Deadline and escalation contact. Safety and data check.',
                img: '/brand/aris-hero.webp',
                n: '03',
                title: 'Safety and data check',
              },
              {
                delay: 200,
                desc: 'Members must complete handover before losing access.',
                img: '/brand/aris-hero.webp',
                n: '04',
                title: 'Handover or closing decision',
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
                <Tag>TOOLS</Tag>
              </div>
              <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">
                {'The services\nwe actually run.'}
              </RevealText>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-black/45">
              Any of these may be changed, paused or replaced. A service is not
              guaranteed to be always available, and an important record must
              never exist only in a chat message.
            </p>
          </div>

          {/* Image and card as two grid cells rather than a fixed-height box
              with cards floated over it. The absolute version had a hardcoded
              480px against a card column that measured 528px, and
              overflow-hidden sliced 63px off the top of the first card. Here
              the cards are in normal flow and items-stretch lets the image
              fill whatever height they take, so content length can no longer
              clip anything. */}
          <div
            className="grid gap-3 md:grid-cols-[1fr_20rem] md:items-stretch"
            onMouseMove={handleMouse}
          >
            <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-black/[0.07] md:min-h-[520px]">
              <Image
                alt="Robotics and IoT workbench in a lab"
                fill
                sizes="(min-width: 768px) 60vw, 100vw"
                src="/brand/aris-hero.webp"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>

            <BentoCard className="p-8" delay={0}>
              <h3 className="mb-6 text-lg font-light">
                Five services, and what each is for
              </h3>
              <ul className="space-y-5">
                {[
                  {
                    detail: 'Coordination, community and announcements.',
                    name: 'Discord',
                  },
                  {
                    detail: 'Issues, pull requests and project records.',
                    name: 'GitHub',
                  },
                  {
                    detail: 'Recruitment intake, minimal data only.',
                    name: 'Google Forms',
                  },
                  {
                    detail: 'Operating ledgers, not legal records.',
                    name: 'Google Sheets',
                  },
                  {
                    detail: 'The automation behind the recruitment pipeline.',
                    name: 'Apps Script',
                  },
                ].map((service) => (
                  <li
                    className="border-t border-black/[0.06] pt-5 first:border-0 first:pt-0"
                    key={service.name}
                  >
                    <div className="text-base font-medium">{service.name}</div>
                    <div className="mt-1 text-sm text-black/50">
                      {service.detail}
                    </div>
                  </li>
                ))}
              </ul>
            </BentoCard>
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
              <Tag>PRIVACY</Tag>
            </div>
            <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">
              {'What we never\nask you for.'}
            </RevealText>
          </div>

          {/* Asymmetric grid: left text + title, right interactive audit log */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left side — descriptions */}
            <div className="space-y-6">
              <p className="text-sm leading-relaxed text-black/45">
                The club collects the minimum data needed for the stated
                purpose. These are never submitted to a public form, a shared
                sheet, Git or Discord.
              </p>

              <div className="space-y-4">
                {[
                  {
                    desc: 'An identity document is never requested at intake',
                    label: 'CCCD',
                  },
                  {
                    desc: 'Only through the restricted verification flow, never in a public form',
                    label: 'Student ID',
                  },
                  {
                    desc: 'Not a full CV unless the restricted flow explicitly asks',
                    label: 'Full CV',
                  },
                  {
                    desc: 'Passwords, tokens, private keys, MFA codes and API keys',
                    label: 'Secrets',
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

              {/* The charter's hard prohibitions plus the sponsorship limit,
                  which is a limit on what an outsider may do and so belongs
                  with the other things the club will not do. */}
              <div className="flex flex-col gap-2 pt-4">
                {[
                  'No medical, legal or educational authority',
                  'No outcome promised without evidence',
                  'No HCMIU logo, name or claim of recognition',
                  'No sponsor control over results or members',
                ].map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-2 text-xs text-black/35"
                  >
                    <span className="h-1 w-1 rounded-full bg-black/25" />
                    {badge}
                  </div>
                ))}
              </div>
            </div>

            {/* Right side — the never-collect list, static and labelled as such */}
            <BentoCard className="p-6 lg:row-span-1" delay={0}>
              <div className="mb-4 text-xs tracking-widest text-black/30 uppercase">
                Never collected here
              </div>
              <div className="space-y-2">
                {[
                  'Identity document',
                  'Date of birth',
                  'Home address',
                  'Phone number',
                  'Health or student data',
                  'Unnecessary personal data',
                ].map((item, i) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-lg border border-black/[0.04] bg-black/[0.02] px-3 py-2.5"
                    style={{
                      animation: `fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both`,
                    }}
                  >
                    <span className="flex-1 text-[11px] font-light text-black/50">
                      {item}
                    </span>
                    <span className="font-mono text-[10px] text-black/25">
                      excluded
                    </span>
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
                'Autonomous Systems',
                'Robotics',
                'IoT',
                'Software',
                'Operations and Development',
                'Modelling and control',
                'Simulation',
                'Sensing and networking',
                'APIs and testing',
                'Bots and automation',
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
                'Community moderation',
                'Membership operations',
                'Finance and records',
                'Project administration',
                'University liaison',
                'Communications',
                'Events',
                'Editing and media',
                'Research and testing',
                'Workshops and labs',
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
            A decision log,
            <br />
            not a chat history.
          </h2>
          <p className="mb-10 text-sm leading-relaxed text-black/45">
            The club&rsquo;s decision log, ADRs, meeting records and project
            records remain separate from informal chat. The Community Terms of
            Use are published in full.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              className="rounded-xl border border-black/10 px-8 py-3 text-sm font-medium tracking-widest text-black/70 transition-colors hover:border-black/25 hover:bg-black/[0.04] hover:text-black"
              href="/legal/community-terms"
            >
              COMMUNITY TERMS
            </Link>
            <a
              className="rounded-xl border border-black/10 px-8 py-3 text-sm font-medium tracking-widest text-black/70 transition-colors hover:border-black/25 hover:bg-black/[0.04] hover:text-black"
              href="mailto:thearisclub.hcmiu@gmail.com"
            >
              CONTACT
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-black/[0.06] px-6 py-10 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <Image
            alt="The Aris Club"
            height={100}
            src="/brand/aris-mark.webp"
            style={{ height: 40, width: 'auto' }}
            width={72}
          />

          {/* Nav sections */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {[
              { href: '#platform', label: 'Departments' },
              { href: '#agents', label: 'Automation' },
              { href: '#workflow', label: 'Projects' },
              { href: '#integrations', label: 'Tools' },
              { href: '#security', label: 'Privacy' },
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
            <Link
              className="text-xs tracking-widest text-black/25 transition-colors hover:text-black/55"
              href="/legal/community-terms"
            >
              Terms
            </Link>
            <a
              className="text-xs tracking-widest text-black/25 transition-colors hover:text-black/55"
              href="mailto:thearisclub.hcmiu@gmail.com"
            >
              Contact
            </a>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-black/[0.04] pt-6">
          <span className="text-xs text-black/20">
            © 2026 The Aris Club. Autonomous Systems, Robotics, IoT &amp;
            Software.
          </span>
        </div>
      </footer>
    </div>
  )
}

export default ArisPage
