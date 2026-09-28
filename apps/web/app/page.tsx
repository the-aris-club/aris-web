'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useRef, useEffect, useState, useCallback } from 'react'

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
  image,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  image?: string
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
      {/* Backdrop. The card's shape is not fixed: it measures 159x304 at the
          md breakpoint and 279x208 above lg, a ratio of 0.52:1 at one end and
          1.34:1 at the other. The artwork is 16:9 throughout, so no single
          re-cut would fit that range — object-cover is what absorbs it, and
          the anchor keeps the subject in the top right at every width.

          The mask fades the artwork out toward the bottom. It is what makes a
          tall, narrow card work: there the subject is near the middle of the
          cropped frame and would otherwise sit under the text. Decorative:
          alt is empty. */}
      {image && (
        <Image
          src={image}
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 768px) 25vw, 100vw"
          className="pointer-events-none absolute inset-0 object-cover object-top-right"
          style={{
            WebkitMaskImage:
              'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.4) 22%, transparent 55%)',
            maskImage:
              'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.4) 22%, transparent 55%)',
          }}
        />
      )}
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

// ─── Club contact ─────────────────────────────────────────────────────────────
// Both are the club's own, from recruitment-flow.md. The mailbox is
// transitional and is not an official HCMIU address, which the page says out
// loud in both places it appears rather than implying otherwise.
const FORM_URL = 'https://forms.gle/RnSVePAY9JWeZsKn9'
const CONTACT_EMAIL = 'thearisclub.hcmiu@gmail.com'

// ─── Hero entrance stagger ────────────────────────────────────────────────────
// The hero reveal is driven by heroReady rather than the scroll observer, so it
// needs its own helper. i is in 80ms steps, matching the old metrics row.
const stagger = (ready: boolean, i: number) => ({
  filter: ready ? 'blur(0px)' : 'blur(16px)',
  opacity: ready ? 1 : 0,
  transform: ready ? 'translateY(0px)' : 'translateY(20px)',
  transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${120 + i * 80}ms`,
})

// ─── Main page ────────────────────────────────────────────────────────────────
const ArisPage = () => {
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
        {/* Banner — the club's own artwork, zooms in once intro is done.
            object-cover on a 16:9 image inside a portrait viewport shows only
            the centre ~26%, which put the arm's shoulder behind the headline on
            mobile. Anchoring to 20% below md shows the quiet left of the frame
            and pushes the arm clear to the right; from md up the viewport is
            roughly 16:9, the whole frame fits, and centring is correct. */}
        <Image
          src="/brand/aris-hero.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 z-0 h-full w-full object-cover object-[20%_50%] md:object-center"
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

        {/* Title + scope — anchored to bottom left. No figures: the club has no
            traction to report and CONTEXT.md forbids inventing any. */}
        <div className="absolute inset-x-0 bottom-0 z-30 flex max-w-3xl flex-col px-6 pb-12 md:px-12">
          {/* Slogan, verbatim from brand-catalog.md */}
          <h1
            className="mb-8 font-sans text-5xl leading-[1.02] font-light tracking-tight text-[#111] sm:text-6xl md:text-7xl"
            style={{
              filter: heroReady ? 'blur(0px)' : 'blur(24px)',
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? 'translateY(0px)' : 'translateY(32px)',
              transition:
                'opacity 1s cubic-bezier(0.16,1,0.3,1) 0ms, filter 1s cubic-bezier(0.16,1,0.3,1) 0ms, transform 1s cubic-bezier(0.16,1,0.3,1) 0ms',
            }}
          >
            We build systems
            <br />
            that turn complexity
            <br />
            into capability.
          </h1>

          {/* Scope, then the barrier a prospective member actually worries
              about — both quoted, see docs/adr/0005 and job-description/member.md */}
          <div style={stagger(heroReady, 0)}>
            <p className="font-sans text-sm tracking-wide text-black/50 uppercase">
              Autonomous Systems, Robotics, IoT &amp; Software
            </p>
            <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-black/45">
              Membership does not require a technical background or a fixed
              number of hours.
            </p>
          </div>
        </div>
      </section>

      {/* ── PLATFORM OVERVIEW (bento) ──────────────────────────────────────── */}
      <section id="groups" className="px-6 py-32 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <PixelIcon type="platform" size={40} />
            <div className="mt-4">
              <Tag>GROUPS</Tag>
            </div>
            <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl lg:text-6xl">
              {'Four departments.\nOne capability group.'}
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
                  Operations and Development
                </h3>
                <p className="max-w-sm text-sm leading-relaxed text-black/45">
                  The umbrella group for capabilities that are not technical
                  departments and are not the governing Board: moderation,
                  membership operations, finance and records, project
                  administration, university liaison, and communications.
                </p>
              </div>
            </BentoCard>

            {/* Four technical departments. The grid is twelve columns, so four
                cells at three each. Not five: Operations and Development is a
                capability pool, not a technical department. */}
            <BentoCard
              className="col-span-12 min-h-[200px] p-8 md:col-span-3"
              delay={120}
              image="/brand/dept-01.webp"
            >
              <div className="relative z-10">
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
                <h3 className="mb-2 text-lg font-light">Autonomous Systems</h3>
                <p className="text-sm leading-relaxed text-black/45">
                  Systems that decide and act under their own control.
                </p>
              </div>
            </BentoCard>

            <BentoCard
              className="col-span-12 min-h-[200px] p-8 md:col-span-3"
              delay={160}
              image="/brand/dept-02.webp"
            >
              <div className="relative z-10">
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
                <h3 className="mb-2 text-lg font-light">Robotics</h3>
                <p className="text-sm leading-relaxed text-black/45">
                  Hardware you can put on a table and make move.
                </p>
              </div>
            </BentoCard>

            <BentoCard
              className="col-span-12 min-h-[200px] p-8 md:col-span-3"
              delay={200}
              image="/brand/dept-03.webp"
            >
              <div className="relative z-10">
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
                <h3 className="mb-2 text-lg font-light">IoT</h3>
                <p className="text-sm leading-relaxed text-black/45">
                  Devices that report what they sense, and take instruction.
                </p>
              </div>
            </BentoCard>

            <BentoCard
              className="col-span-12 min-h-[200px] p-8 md:col-span-3"
              delay={240}
              image="/brand/dept-04.webp"
            >
              <div className="relative z-10">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-black/10">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-light">Software</h3>
                <p className="text-sm leading-relaxed text-black/45">
                  The part that holds the other three together.
                </p>
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ── BUILD YOUR AGENTS (4 cards) ───────────────────────────────────── */}
      <section
        id="departments"
        className="border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <PixelIcon type="agents" size={40} />
              <div className="mt-4">
                <Tag>DEPARTMENTS</Tag>
              </div>
              <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">
                {'Pick the one you\nwant to get good at.'}
              </RevealText>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-black/45">
              A member has one primary department and may support another with
              an explicit assignment.
            </p>
          </div>

          <StackingAgentCards />
        </div>
      </section>

      {/* ── WHAT A PROJECT MUST NAME ──────────────────────────────────────── */}
      <section
        id="projects"
        className="overflow-hidden border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <PixelIcon type="workflow" size={40} />
            <div className="mt-4">
              <Tag>PROJECTS</Tag>
            </div>
            <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">
              {'Five things every\nproject must name.'}
            </RevealText>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-black/45">
              Quoted from Community Terms §11. A Discord message is not one of
              the five: a project is a formal record, not a conversation.
            </p>
          </div>

          <div
            className="grid grid-cols-1 gap-3 md:grid-cols-4"
            onMouseMove={handleMouse}
          >
            {[
              {
                delay: 0,
                desc: 'Who owns it, and what problem it exists to solve.',
                n: '01',
                title: 'Purpose and owner',
              },
              {
                delay: 80,
                desc: 'What is delivered, and what counts as done.',
                n: '02',
                title: 'Deliverable and acceptance criteria',
              },
              {
                delay: 140,
                desc: 'When it is due, and who to escalate to when it is not.',
                n: '03',
                title: 'Deadline and escalation contact',
              },
              {
                // The grid is four columns and §11 lists five items, so the last
                // two share a card. Both are printed verbatim under the title.
                // If the layout is ever opened up, give 05 its own card.
                delay: 200,
                desc: '04 — Safety and data check.\n05 — Handover or closing decision.',
                n: '04',
                title: 'Safety, data, and how it ends',
              },
            ].map((step) => (
              <BentoCard
                key={step.n}
                className="relative flex min-h-[320px] flex-col overflow-hidden"
                delay={step.delay}
              >
                {/* Number top-left */}
                <div className="relative z-10 p-7">
                  <span className="font-pixel block text-[11px] tracking-widest text-black/20">
                    {step.n}
                  </span>
                </div>
                {/* Text pushed further down */}
                <div className="relative z-10 mt-auto px-7 pt-16 pb-7">
                  <h3 className="mb-3 text-2xl font-light">{step.title}</h3>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-black/45">
                    {step.desc}
                  </p>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENT AND OWNERSHIP ─────────────────────────────────────────── */}
      <section
        id="ownership"
        className="border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <PixelIcon type="integrations" size={40} />
              <div className="mt-4">
                <Tag>YOUR WORK</Tag>
              </div>
              <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">
                {'You keep what\nyou build.'}
              </RevealText>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-black/45">
              A member keeps ownership of work they create unless a separate
              written agreement says otherwise.
            </p>
          </div>

          {/* Cards sit in normal flow, never absolute. An earlier revision
              positioned this column over the image and overflow-hidden cut the
              top off the first card, taking its rounded corners with it. */}
          <div
            className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-2"
            onMouseMove={handleMouse}
          >
            <BentoCard className="flex flex-col p-7" delay={0}>
              <div>
                <Tag>OWNERSHIP</Tag>
              </div>
              <h3 className="mt-3 mb-2 text-lg font-light">
                The licence is limited
              </h3>
              <p className="text-sm leading-relaxed text-black/45">
                Submitting work to a club project grants a non-exclusive,
                limited licence to store, run, review, display, maintain and
                hand over that work for the club&rsquo;s stated purpose.
              </p>
            </BentoCard>

            <BentoCard className="flex flex-col p-7" delay={80}>
              <div>
                <Tag>UNPUBLISHED</Tag>
              </div>
              <h3 className="mt-3 mb-2 text-lg font-light">
                Held until it is clean
              </h3>
              <p className="text-sm leading-relaxed text-black/45">
                Work containing another person&rsquo;s data, a restricted
                dataset or an unclear licence must not be published until the
                issue is resolved.
              </p>
            </BentoCard>
          </div>

          <div className="mt-16">
            <RevealText className="mb-6 text-2xl leading-[1.1] font-light tracking-tight">
              The club must not:
            </RevealText>
            <div
              className="grid grid-cols-1 gap-3 md:grid-cols-2"
              onMouseMove={handleMouse}
            >
              {[
                {
                  delay: 0,
                  desc: 'Reuse private work for unrelated training or commercial purposes.',
                },
                {
                  delay: 80,
                  desc: 'Remove authorship or license information.',
                },
                {
                  delay: 160,
                  desc: "Publish a work that contains another person's confidential data.",
                },
                {
                  delay: 240,
                  desc: 'Claim ownership of external libraries, data or third-party content.',
                },
              ].map((item) => (
                <BentoCard
                  key={item.desc}
                  className="flex items-start gap-4 p-6"
                  delay={item.delay}
                >
                  <span className="font-pixel mt-1 block shrink-0 text-[11px] tracking-widest text-black/20">
                    ✕
                  </span>
                  <p className="text-sm leading-relaxed text-black/55">
                    {item.desc}
                  </p>
                </BentoCard>
              ))}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-black/35">
              Quoted from Community Terms §8.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECURITY & OBSERVABILITY ──────────────────────────────────��──── */}
      <section
        id="automation"
        className="border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <PixelIcon type="platform" size={40} />
            <div className="mt-4">
              <Tag>AUTOMATION</Tag>
            </div>
            <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">
              {'What a bot\nmay not decide.'}
            </RevealText>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-black/45">
              AI may assist with drafting, questions, summaries, translation,
              search, data-quality checks and routine reminders. Eight decisions
              are never one of them.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left — the eight decisions reserved to people, §9 */}
            <div>
              <div className="mb-5 text-xs tracking-widest text-black/30 uppercase">
                Reserved to people
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Membership',
                  'Recruitment',
                  'Disciplinary',
                  'Financial',
                  'Legal',
                  'Medical',
                  'Educational',
                  'Deployment',
                ].map((item, i) => (
                  <BentoCard
                    key={item}
                    className="flex items-center gap-3 p-5"
                    delay={i * 40}
                  >
                    <span className="font-pixel block shrink-0 text-[11px] text-black/20">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-light">{item}</span>
                  </BentoCard>
                ))}
              </div>
              <p className="mt-5 text-xs leading-relaxed text-black/35">
                A person may refuse an AI-assisted process without losing the
                right to a fair human review.
              </p>
            </div>

            {/* Right — what a bot may not independently do, §9 */}
            <BentoCard className="flex flex-col p-7" delay={0}>
              <div className="mb-5 text-xs tracking-widest text-black/30 uppercase">
                A bot may not independently
              </div>
              <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2.5 self-start">
                {[
                  'Accept',
                  'Reject',
                  'Promote',
                  'Remove',
                  'Discipline',
                  'Vote',
                  'Merge',
                  'Deploy',
                  'Spend money',
                  'Bypass an approval',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <span className="shrink-0 text-[11px] text-black/20">
                      ✕
                    </span>
                    <span className="text-sm text-black/50">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 border-t border-black/[0.06] pt-4 text-xs leading-relaxed text-black/35">
                It may prepare a draft, reminder or approval card. Quoted from
                Community Terms §9.
              </p>
            </BentoCard>
          </div>

          <div className="mt-16">
            <RevealText className="mb-6 text-2xl leading-[1.1] font-light tracking-tight">
              What the club never sends to an AI provider
            </RevealText>
            <div
              className="grid grid-cols-1 gap-3 md:grid-cols-3"
              onMouseMove={handleMouse}
            >
              {[
                { delay: 0, desc: 'Personal data' },
                { delay: 60, desc: 'Student ID' },
                { delay: 120, desc: 'Full CVs' },
                { delay: 180, desc: 'Raw answers' },
                { delay: 240, desc: 'Scores' },
                { delay: 300, desc: 'Private channels and moderation records' },
              ].map((item) => (
                <BentoCard key={item.desc} className="p-5" delay={item.delay}>
                  <span className="text-sm text-black/55">{item.desc}</span>
                </BentoCard>
              ))}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-black/35">
              Not by default, and any AI interview dataset needs a separate
              policy, opt-in, de-identification, retention rule and human
              review. Quoted from Community Terms §9.
            </p>
          </div>
        </div>
      </section>

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
                'Moderation',
                'Membership operations',
                'Finance and records',
                'Project administration',
                'University liaison',
                'Communications',
                'Events',
                'Research',
                'Editing and media',
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
            A clear path from
            <br />
            application to
            <br />
            meaningful first work.
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-black/45">
            Four weeks, one form, three evaluators at least. The status is
            controlled by the Recruitment Panel or the Board, and an applicant
            cannot change it directly.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href={FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-[#111] px-8 py-3 text-sm font-medium tracking-widest text-white transition-colors hover:bg-[#333]"
            >
              APPLY
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="rounded-xl border border-black/10 bg-white px-8 py-3 text-sm font-medium tracking-widest text-[#111] transition-colors hover:border-black/25"
            >
              EMAIL US
            </a>
          </div>
          <p className="mt-8 text-xs leading-relaxed text-black/35">
            {CONTACT_EMAIL} is a transitional service mailbox, not an official
            HCMIU address.
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-black/[0.06] px-6 py-10 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          {/* The full lockup, mark over wordmark. There is room for it here,
              which the nav bar does not have. */}
          <Image
            src="/brand/aris-logo.png"
            alt="The Aris Club"
            width={367}
            height={280}
            className="h-16 w-auto shrink-0"
          />

          {/* Nav sections. Live and Pricing are gone with their sections. */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {[
              { href: '#groups', label: 'Groups' },
              { href: '#departments', label: 'Departments' },
              { href: '#projects', label: 'Projects' },
              { href: '#automation', label: 'Automation' },
              { href: '#ownership', label: 'Your work' },
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

          {/* Every one of these points somewhere that exists. The club has no
              public GitHub organisation or Discord invite yet, so those links
              are absent rather than left as href="#". */}
          <div className="flex items-center gap-6">
            <Link
              href="/legal/community-terms"
              className="text-xs tracking-widest text-black/25 transition-colors hover:text-black/55"
            >
              Terms
            </Link>
            <a
              href={FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs tracking-widest text-black/25 transition-colors hover:text-black/55"
            >
              Apply
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-xs tracking-widest text-black/25 transition-colors hover:text-black/55"
            >
              Contact
            </a>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-black/[0.04] pt-6">
          <span className="text-xs text-black/20">
            © 2026 The Aris Club. {CONTACT_EMAIL} is a transitional service
            mailbox, not an official HCMIU address.
          </span>
        </div>
      </footer>
    </div>
  )
}

export default ArisPage
