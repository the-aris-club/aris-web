'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { Tag } from '@/components/tag'
import { TECHNICAL_DEPARTMENTS } from '@/lib/club'
import { EASE, stackDepths, useFrameCallback } from '@/lib/motion'

// The four technical departments, in the order the server channels declare them
// (server-orientation.md), are TECHNICAL_DEPARTMENTS in lib/club: the bento cards
// in #groups print the same four, and this used to carry its own copy of both the
// names and the scope lines. Exactly four — Operations and Development is a
// capability pool and gets no card here.
//
// No per-card figures. The club has run no projects, so any number on this card
// would be invented, and CONTEXT.md forbids that.

/**
 * A department's wide banner, behind the text on a stacking card. Its own
 * pictures, cut for this card: the Groups bento cards carry the same four
 * departments in 16:9, and object-cover on those would keep 27% of the image
 * height here — and print the same four pictures twice within two screens.
 *
 * Anchored right, not centre. The card is 1152 wide inside `max-w-6xl`, and
 * narrower below that, so object-cover crops the width away from whichever edge
 * it is given. These files are 1152x177 with the subject in the right third and
 * the left two thirds empty, so cropping from the left is free and cropping from
 * the right would cut the subject off. No mask: the empty side is already
 * transparent. Decorative — alt is empty, the department name is beside it.
 *
 * Hidden below md. The `md:max-w-[70%]` that leaves the artwork its column only
 * applies from md up; narrower than that the text runs the full width of the
 * card and prints straight over the subject. The card is also taller there, so
 * there is no room to move the artwork to instead.
 */
const DepartmentBanner = ({ src }: { src: string }) => (
  <Image
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 hidden object-cover object-right md:block"
    fill
    sizes="(min-width: 1024px) 1152px, 100vw"
    src={src}
  />
)

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
  const [depth, setDepth] = useState<number[]>(
    TECHNICAL_DEPARTMENTS.map(() => 0)
  )

  // Where each card parks once it is sticky. These, and the depth arithmetic in
  // lib/motion, are the only things that decide how deep a card is stacked.
  const stickyTops = TECHNICAL_DEPARTMENTS.map(
    (_, i) => STICKY_TOP + i * STICKY_STEP
  )

  // Measured on scroll, so the work is coalesced into one frame and then thrown
  // away when nothing moved. The previous version wrote a fresh array on every
  // scroll event, and a new array identity is a new render: four cards
  // re-rendered on every tick of the scroll for the whole section, including the
  // long stretches where the stack depth had not changed at all.
  const measure = useFrameCallback(() => {
    const nextDepth = stackDepths(
      cardRefs.current.map((el) => el?.getBoundingClientRect().top ?? null),
      stickyTops
    )

    setDepth((prev) =>
      prev.every((d, i) => d === nextDepth[i]) ? prev : nextDepth
    )
  })

  useEffect(() => {
    window.addEventListener('scroll', measure, { passive: true })
    measure()
    return () => {
      window.removeEventListener('scroll', measure)
    }
  }, [measure])

  return (
    <div
      className="flex flex-col"
      style={{ perspective: '1400px', perspectiveOrigin: '50% 0%' }}
    >
      {TECHNICAL_DEPARTMENTS.map((dept, i) => {
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
                transition: `transform 0.3s ${EASE}`,
                willChange: 'transform',
              }}
            >
              <div className="group relative cursor-pointer overflow-hidden rounded-2xl border border-black/[0.07] bg-[#faf9f7]">
                <DepartmentBanner src={dept.banner} />

                <div className="relative z-10 p-8">
                  <div className="md:max-w-[70%]">
                    <div className="mb-6 flex items-start justify-between">
                      <Tag>{dept.label}</Tag>
                    </div>
                    <h3 className="mb-3 text-xl font-light">{dept.name}</h3>
                    <p className="text-sm leading-relaxed text-black/45">
                      {dept.scope}
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
