'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

// The three selection rounds, quoted from the recruitment form description in
// FormBuilder.gs and from recruitment-flow.md. Card mechanics are unchanged.
const AGENTS = [
  {
    desc: 'The recruitment Form. Eligibility and application review, with a reason recorded for every outcome.',
    img: '/brand/aris-hero.webp',
    label: 'ROUND 01',
    stats: [
      { l: 'takes', v: '~10 min' },
      { l: 'outcome', v: 'Recorded' },
    ],
    title: 'Application review',
  },
  {
    desc: 'Selection looks for people who can learn, contribute and follow the code of conduct.',
    img: '/brand/aris-hero.webp',
    label: 'ROUND 02',
    stats: [
      { l: 'format', v: 'Interview' },
      { l: 'scored', v: 'Indep.' },
    ],
    title: 'Interview',
  },
  {
    desc: 'A common part on safety, teamwork and openness, plus a part for the department you picked.',
    img: '/brand/aris-hero.webp',
    label: 'ROUND 03',
    stats: [
      { l: 'parts', v: '2' },
      { l: 'notified', v: 'Each' },
    ],
    title: 'Skills test',
  },
]

// matches top: 80px on first card
const STICKY_TOP = 80
// each card stacks 16px lower
const STICKY_STEP = 16
// scale reduction per card stacked on top
const SCALE_STEP = 0.04
// px pushed down per card stacked on top
const OFFSET_STEP = 8

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full bg-black/[0.04] px-3 py-1 font-sans text-[11px] tracking-widest text-black/40">
    {children}
  </span>
)

export const StackingAgentCards = () => {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  // depth[i] = 0..N how many cards are currently stacked on top of card i
  const [depth, setDepth] = useState<number[]>(AGENTS.map(() => 0))

  useEffect(() => {
    const onScroll = () => {
      const nextDepth = AGENTS.map((_, i) => {
        // Count how many cards j > i are currently in sticky position (i.e. have scrolled past card i)
        let count = 0
        for (let j = i + 1; j < AGENTS.length; j += 1) {
          const el = cardRefs.current[j]
          if (!el) {
            continue
          }
          const rect = el.getBoundingClientRect()
          const stickyTopJ = STICKY_TOP + j * STICKY_STEP
          // Card j is "on top of" card i when it has reached its sticky position
          if (rect.top <= stickyTopJ + 2) {
            count += 1
          }
        }
        return count
      })
      setDepth(nextDepth)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="flex flex-col"
      style={{ perspective: '1400px', perspectiveOrigin: '50% 0%' }}
    >
      {AGENTS.map((agent, i) => {
        const d = depth[i]
        const scale = 1 - d * SCALE_STEP
        const translateY = d * OFFSET_STEP

        return (
          <div
            key={agent.label}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className="sticky mb-4"
            style={{ top: `${STICKY_TOP + i * STICKY_STEP}px`, zIndex: 10 + i }}
          >
            <div
              style={{
                transform: `scale(${scale}) translateY(${translateY}px)`,
                transformOrigin: 'top center',
                transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                willChange: 'transform',
              }}
            >
              <div className="group relative cursor-pointer overflow-hidden rounded-2xl border border-black/[0.07] bg-[#faf9f7]">
                {/* ── MOBILE: image top, fades out at bottom ── */}
                {agent.img && (
                  <div className="pointer-events-none relative h-52 w-full md:hidden">
                    <Image
                      fill
                      src={agent.img}
                      alt={agent.label}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      style={{
                        WebkitMaskImage:
                          'linear-gradient(to bottom, black 0%, black 35%, transparent 85%)',
                        maskImage:
                          'linear-gradient(to bottom, black 0%, black 35%, transparent 85%)',
                      }}
                    />
                  </div>
                )}

                {/* ── DESKTOP: image right, fades out at left (absolute) ── */}
                {agent.img && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 md:block">
                    <Image
                      fill
                      src={agent.img}
                      alt={agent.label}
                      className="h-full w-full object-cover object-center"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(to right, #faf9f7 0%, transparent 55%)',
                      }}
                    />
                  </div>
                )}

                {/* Text content */}
                <div
                  className="relative z-10 p-8"
                  style={{ maxWidth: agent.img ? undefined : '100%' }}
                  // On desktop limit to left 60% so text doesn't overlap image
                >
                  <div className="md:max-w-[60%]">
                    <div className="mb-6 flex items-start justify-between">
                      <Tag>{agent.label}</Tag>
                    </div>
                    <h3 className="mb-3 text-xl font-light">{agent.title}</h3>
                    <p className="mb-8 text-sm leading-relaxed text-black/45">
                      {agent.desc}
                    </p>
                  </div>
                  <div className="flex gap-8 border-t border-black/[0.06] pt-6">
                    {agent.stats.map((s) => (
                      <div key={s.l}>
                        <div className="text-2xl font-light">{s.v}</div>
                        <div className="mt-0.5 text-[11px] tracking-widest text-black/35">
                          {s.l}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
