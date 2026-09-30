'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { useReveal } from '@/lib/use-reveal'

// The reveal threshold. Low on purpose: the card is far taller than it is wide
// on mobile, so 10% is a fraction that a card clears almost immediately.
const REVEAL_THRESHOLD = 0.1

/**
 * The department artwork, in the crop that suits a three-column card. The card's
 * shape is not fixed: it measures 159x304 at the md breakpoint and 279x208
 * above lg, a ratio of 0.52:1 at one end and 1.34:1 at the other. The artwork
 * is 16:9 throughout, so no single re-cut would fit that range — object-cover is
 * what absorbs it, and the anchor keeps the subject in the top right at every
 * width.
 *
 * The mask fades the artwork out toward the bottom. It is what makes a tall,
 * narrow card work: there the subject is near the middle of the cropped frame
 * and would otherwise sit under the text. Decorative: alt is empty.
 *
 * A component rather than a card prop. The card took an `image` string and owned
 * the whole crop on the card's behalf, so the one card whose artwork wanted a
 * different anchor — Operations and Development, which is 1152 wide across
 * twelve columns — had no way to ask and built its own image by hand. A card
 * takes a node here, and picks this one when the default crop is right.
 */
export const DepartmentArtwork = ({ src }: { src: string }) => (
  <Image
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 object-cover object-top-right"
    fill
    sizes="(min-width: 768px) 25vw, 100vw"
    src={src}
    style={{
      WebkitMaskImage:
        'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.4) 22%, transparent 55%)',
      maskImage:
        'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.4) 22%, transparent 55%)',
    }}
  />
)

/**
 * The line mark inside each department card's tile. One per technical
 * department, keyed by name rather than by position: an index would put the
 * wrong mark on the wrong department the first time the list is reordered.
 * Decorative — aria-hidden, and the department name sits beside it.
 */
const DEPARTMENT_MARKS: Record<string, ReactNode> = {
  'Autonomous Systems': <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  IoT: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  Robotics: (
    <>
      <rect height="18" rx="2" width="18" x="3" y="3" />
      <path d="M8 10h8M8 14h5" />
    </>
  ),
  Software: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
}

export const DepartmentMark = ({ name }: { name: string }) => (
  <svg
    aria-hidden="true"
    fill="none"
    height="18"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="18"
  >
    {DEPARTMENT_MARKS[name]}
  </svg>
)

export const BentoCard = ({
  backdrop,
  children,
  className = '',
  delay = 0,
}: {
  /** Decorative artwork behind the content, under the hover glow. */
  backdrop?: ReactNode
  children: ReactNode
  className?: string
  delay?: number
}) => {
  const { inView, ref } = useReveal<HTMLDivElement>(REVEAL_THRESHOLD)

  // The hover glow follows the cursor through two custom properties, read by
  // the radial gradient below. Coalesced into one animation frame: a trackpad
  // fires well over 100 mousemove events a second, and each one measured the
  // card's box, which forces a layout flush ahead of the write. One measurement
  // per frame is the floor, and the last position is the one that renders.
  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    let frame = 0
    let x = 0
    let y = 0

    const onMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      if (frame !== 0) {
        return
      }
      frame = requestAnimationFrame(() => {
        frame = 0
        const rect = el.getBoundingClientRect()
        el.style.setProperty('--mouse-x', `${x - rect.left}px`)
        el.style.setProperty('--mouse-y', `${y - rect.top}px`)
      })
    }

    el.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      el.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [ref])

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-2xl border border-black/[0.07] bg-white hover:border-black/[0.15] hover:bg-[#fafaf8] ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms, border-color 0.3s ease, background-color 0.3s ease`,
      }}
    >
      {backdrop}
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
