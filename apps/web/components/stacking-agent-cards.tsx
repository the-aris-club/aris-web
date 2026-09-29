'use client'

import { useEffect, useRef, useState } from 'react'

import { Tag } from '@/components/tag'

// The four technical departments, in the order the server channels declare
// them (server-orientation.md). Exactly four: Operations and Development is a
// capability pool and gets no card here.
//
// No per-card figures. The club has run no projects, so any number on this card
// would be invented, and CONTEXT.md forbids that. The scope line under each
// name is page voice: it arranges the department's name and the club's stated
// domains and introduces no new fact.
const DEPARTMENTS = [
  {
    desc: 'Systems that decide and act under their own control.',
    label: '01',
    title: 'Autonomous Systems',
  },
  {
    desc: 'Hardware you can put on a table and make move.',
    label: '02',
    title: 'Robotics',
  },
  {
    desc: 'Devices that report what they sense, and take instruction.',
    label: '03',
    title: 'IoT',
  },
  {
    desc: 'The part that holds the other three together.',
    label: '04',
    title: 'Software',
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

export const StackingAgentCards = () => {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  // depth[i] = 0..N how many cards are currently stacked on top of card i
  const [depth, setDepth] = useState<number[]>(DEPARTMENTS.map(() => 0))

  useEffect(() => {
    // Measured on scroll, so the work is coalesced into one frame and then
    // thrown away when nothing moved. The previous version wrote a fresh array
    // on every scroll event, and a new array identity is a new render: four
    // cards re-rendered on every tick of the scroll for the whole section,
    // including the long stretches where the stack depth had not changed at all.
    let frame = 0

    const measure = () => {
      frame = 0
      const nextDepth = DEPARTMENTS.map((_, i) => {
        // Count how many cards j > i are currently in sticky position (i.e. have scrolled past card i)
        let count = 0
        for (let j = i + 1; j < DEPARTMENTS.length; j += 1) {
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

      setDepth((prev) =>
        prev.every((d, i) => d === nextDepth[i]) ? prev : nextDepth
      )
    }

    const onScroll = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(measure)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div
      className="flex flex-col"
      style={{ perspective: '1400px', perspectiveOrigin: '50% 0%' }}
    >
      {DEPARTMENTS.map((dept, i) => {
        const d = depth[i]
        const scale = 1 - d * SCALE_STEP
        const translateY = d * OFFSET_STEP

        return (
          <div
            key={dept.label}
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
                {/* Text only, while the Groups cards carry the department
                    artwork. This card is 1152x177, a ratio of 6.5:1, and the
                    artwork is 16:9 — object-cover would keep 27% of the image
                    height, and the same four pictures would appear twice
                    within two screens. The stock agent portraits that used to
                    sit here were never the club's. Give this its own wide
                    images before adding a backdrop. */}
                <div className="relative z-10 p-8">
                  <div className="md:max-w-[70%]">
                    <div className="mb-6 flex items-start justify-between">
                      <Tag>{dept.label}</Tag>
                    </div>
                    <h3 className="mb-3 text-xl font-light">{dept.title}</h3>
                    <p className="text-sm leading-relaxed text-black/45">
                      {dept.desc}
                    </p>
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
