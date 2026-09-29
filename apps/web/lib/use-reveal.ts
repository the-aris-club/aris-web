'use client'

import { useEffect, useRef, useState } from 'react'

// One IntersectionObserver per distinct threshold, shared by every element on
// the page that reveals on scroll. There are ~26 of those (20 bento cards, 6
// headings) and the per-element version allocated a native observer, a callback
// and a retained target for each, none of which were ever released.
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
