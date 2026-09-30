'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Everything the page does in response to the viewport, and the measurement that
// goes with it. One seam for three questions that were each answered separately:
//
//   - has this element come into view, and when?
//   - has the pointer moved, or the page scrolled, since the last frame drawn?
//   - how deep is each card in this sticky stack?
//
// The easing curve is here because it was written out ten times across four
// files, and a curve is a fact about the design, not a fact about a component.
// The two reveal recipes are deliberately not here: the bento card fades and
// lifts, the heading also blurs, and the distances differ. Unifying them would
// mean flags, and a flag is a prop with two meanings and no name.

// ── Easing ───────────────────────────────────────────────────────────────────
// Three curves, not one. They were written out ten times across four files, and
// they are not interchangeable: the curtain retracts on a symmetric ease-in-out
// and the letters leave on a slow-out one. Only the entrance curve repeats.

// Everything that fades, blurs or lifts into place.
export const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
// The intro curtain retracting off the top of the screen.
export const EASE_CURTAIN = 'cubic-bezier(0.76, 0, 0.24, 1)'
// The intro letters fading back out.
export const EASE_EXIT = 'cubic-bezier(0.4, 0, 1, 1)'

// ── Reveal ───────────────────────────────────────────────────────────────────
// One IntersectionObserver per distinct threshold, shared by every element on
// the page that reveals on scroll. There are ~30 of those (the bento cards and
// the headings) and the per-element version allocated a native observer, a
// callback and a retained target for each, none of which were ever released.
//
// A target fires at most once: it is unobserved the moment it intersects, so a
// revealed card costs nothing from then on. The observers themselves are keyed
// by threshold and are never disconnected, because the set of thresholds is
// fixed by the design rather than by the number of cards.

type OnIntersect = () => void

interface Registry {
  observer: IntersectionObserver
  targets: Map<Element, OnIntersect>
}

const registries = new Map<number, Registry>()

const createRegistry = (threshold: number): Registry => {
  const targets = new Map<Element, OnIntersect>()
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue
        }
        const fire = targets.get(entry.target)
        if (fire) {
          targets.delete(entry.target)
          observer.unobserve(entry.target)
          fire()
        }
      }
    },
    { threshold }
  )

  const registry: Registry = { observer, targets }
  registries.set(threshold, registry)
  return registry
}

/** Reveals an element once, the first time `threshold` of it enters the viewport. */
export const useReveal = <T extends HTMLElement>(threshold: number) => {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    const { observer, targets } =
      registries.get(threshold) ?? createRegistry(threshold)
    targets.set(el, () => setInView(true))
    observer.observe(el)
    return () => {
      targets.delete(el)
      observer.unobserve(el)
    }
  }, [threshold])

  return { inView, ref }
}

// ── One frame, one measurement ───────────────────────────────────────────────

/**
 * Coalesces a stream of events into at most one call per animation frame.
 *
 * A trackpad fires well over 100 mousemove events a second and a scroll fires
 * one per tick; measuring on each forces a layout flush ahead of the write, and
 * the last position of the frame is the only one that renders. Three call sites
 * each hand-rolled this, in three different shapes.
 *
 * The returned function is stable, so it is safe in an effect's dependency list,
 * and the callback it holds is always the most recent one.
 */
export const useFrameCallback = (cb: (time: number) => void) => {
  const cbRef = useRef(cb)
  const frame = useRef(0)

  useEffect(() => {
    cbRef.current = cb
  })

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current)
    },
    []
  )

  return useCallback(() => {
    if (frame.current !== 0) {
      return
    }
    frame.current = requestAnimationFrame((time) => {
      frame.current = 0
      cbRef.current(time)
    })
  }, [])
}

// ── Sticky stack depth ───────────────────────────────────────────────────────

/**
 * How many cards are stacked on top of each card, given where each one is.
 *
 * `tops[i]` is the top edge of card i in viewport coordinates, or `null` while it
 * is unmeasured. `stickyTops[j]` is where card j parks once it is sticky. Card j
 * counts as stacked on card i when it has reached that position.
 *
 * Pure, and the reason it is: this arithmetic was 24 lines inside a useEffect
 * closure, so the only way to check it was to scroll the page by hand, and the
 * 2px tolerance that decides whether a card counts as arrived was a magic number
 * visible in exactly one place.
 *
 * `tolerance` is in pixels, because a sub-pixel layout can leave a card sitting
 * a hair above its own sticky offset and flickering between two depths.
 */
export const stackDepths = (
  tops: readonly (number | null)[],
  stickyTops: readonly number[],
  tolerance = 2
): number[] =>
  tops.map((_, i) => {
    let count = 0
    for (let j = i + 1; j < tops.length; j += 1) {
      const top = tops[j]
      if (top !== null && top <= stickyTops[j] + tolerance) {
        count += 1
      }
    }
    return count
  })
