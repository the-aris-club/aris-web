'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { EASE, EASE_CURTAIN, EASE_EXIT } from '@/lib/motion'

// The letters are traced out of the wordmark in aris-logo.png by
// tools/build-brand-assets.py, not typed. No published typeface is close
// enough to the drawn one, and a bitmap of them goes soft: the source
// wordmark is 76px tall and this draws it near 370px. Vector is crisp at
// either, and the four files together are under 2 KB.
//
// The widths include each letter's share of the drawn letterspacing, so these
// butted together are the wordmark exactly. Do not add a gap here: the drawn
// gaps are not even, and a single value restyles it.
const LETTERS = [
  { height: 76, src: '/brand/letters/a.svg', width: 123 },
  { height: 76, src: '/brand/letters/r.svg', width: 108 },
  { height: 76, src: '/brand/letters/i.svg', width: 34 },
  { height: 76, src: '/brand/letters/s.svg', width: 103 },
]

// Rendered cap height. The four are 368px wide at a 76px cap, so the word is
// 4.84x this. Capping on width as well as height keeps it inside any viewport:
// when this resolves on vw the word comes to 92vw, and when it resolves on vh
// that only happens past 1.37vh, which puts the word under 100vw.
const CAP_HEIGHT = 'min(26vh, 19vw)'

// ms between each letter appearing
const LETTER_IN_STAGGER = 90
// duration of each letter appear transition
const LETTER_IN_DUR = 700
// hold fully visible before exit
const HOLD_DURATION = 300
const LETTERS_IN_TOTAL =
  LETTER_IN_STAGGER * (LETTERS.length - 1) + LETTER_IN_DUR + HOLD_DURATION

// ms between each letter disappearing
const LETTER_OUT_STAGGER = 55
// duration of each letter fade out
const LETTER_OUT_DUR = 450
const LETTERS_OUT_TOTAL =
  LETTER_OUT_STAGGER * (LETTERS.length - 1) + LETTER_OUT_DUR

const CURTAIN_DELAY = LETTERS_IN_TOTAL + 100
// matches the CSS transition on the curtain div
const CURTAIN_DURATION = 1300
const ANIM_TOTAL = CURTAIN_DELAY + LETTERS_OUT_TOTAL + 1400

// Exported: ms before curtain fully done to start hero animations (overlap for smoothness)
export const HERO_REVEAL_MS = CURTAIN_DELAY + CURTAIN_DURATION - 150

type Phase = 'idle' | 'in' | 'out' | 'done'

interface LetterVisual {
  blur: number
  opacity: number
  translateY: number
}

// Resting look of a letter, per phase. 'done' never renders.
const LETTER_VISUALS: Record<Exclude<Phase, 'done'>, LetterVisual> = {
  idle: { blur: 36, opacity: 0, translateY: 48 },
  in: { blur: 0, opacity: 1, translateY: 0 },
  out: { blur: 24, opacity: 0, translateY: -20 },
}

export const IntroAnimation = ({ onDone }: { onDone: () => void }) => {
  const [phase, setPhase] = useState<Phase>('idle')
  const [curtainUp, setCurtainUp] = useState(false)

  useEffect(() => {
    // Tiny delay so the browser has painted before we start transitioning
    const t0 = setTimeout(() => setPhase('in'), 80)
    const t1 = setTimeout(() => setPhase('out'), LETTERS_IN_TOTAL)
    const t2 = setTimeout(() => setCurtainUp(true), CURTAIN_DELAY)
    const t3 = setTimeout(() => onDone(), HERO_REVEAL_MS)
    const t4 = setTimeout(() => setPhase('done'), ANIM_TOTAL)

    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [onDone])

  if (phase === 'done') {
    return null
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100]"
      aria-hidden="true"
    >
      {/* Gradient curtain — retracts upward, revealing mountains from bottom */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          background: '#f5f4f1',
          bottom: curtainUp ? '100%' : '0%',
          transition: curtainUp ? `bottom 1.3s ${EASE_CURTAIN}` : 'none',
        }}
      />

      {/* Club wordmark, cut from the logo artwork. items-end puts the letters
          on their shared baseline; the letterspace is inside the images. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-end">
          {LETTERS.map((letter, i) => {
            const inDelay = i * LETTER_IN_STAGGER
            const outDelay = i * LETTER_OUT_STAGGER

            const isIn = phase === 'in'
            const isOut = phase === 'out'
            const { blur, opacity, translateY } = LETTER_VISUALS[phase]

            let transition = 'none'
            if (isOut) {
              transition = `opacity ${LETTER_OUT_DUR}ms ${EASE_EXIT} ${outDelay}ms,
                 filter  ${LETTER_OUT_DUR}ms ${EASE_EXIT} ${outDelay}ms,
                 transform ${LETTER_OUT_DUR}ms ${EASE_EXIT} ${outDelay}ms`
            } else if (isIn) {
              transition = `opacity ${LETTER_IN_DUR}ms ${EASE} ${inDelay}ms,
                 filter  ${LETTER_IN_DUR}ms ${EASE} ${inDelay}ms,
                 transform ${LETTER_IN_DUR}ms ${EASE} ${inDelay}ms`
            }

            return (
              <Image
                alt=""
                height={letter.height}
                key={letter.src}
                src={letter.src}
                style={{
                  filter: `blur(${blur}px)`,
                  height: CAP_HEIGHT,
                  opacity,
                  transform: `translateY(${translateY}px)`,
                  transition,
                  width: 'auto',
                  willChange: 'opacity, filter, transform',
                }}
                width={letter.width}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
