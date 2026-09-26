'use client'

import { useEffect, useRef, useState } from 'react'
import type { Ref } from 'react'

// Splits text into words and reveals each with staggered opacity+blur+translateY
// matching the AGENTIC intro animation style.
export const RevealText = ({
  children,
  className = '',
  as: Tag = 'h2',
  // ms between each word
  stagger = 80,
  // ms per word transition
  duration = 700,
  // initial delay before first word
  delay = 0,
  // IntersectionObserver threshold
  threshold = 0.2,
}: {
  children: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  stagger?: number
  duration?: number
  delay?: number
  threshold?: number
}) => {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  // Split on spaces but preserve line breaks (rendered via <br />)
  const lines = children.split('\n')
  const words: { word: string; index: number }[] = []
  let wordIndex = 0
  for (const [lineIndex, line] of lines.entries()) {
    if (lineIndex > 0) {
      words.push({ index: (wordIndex += 1), word: '\n' })
    }

    const chunks = line.split(' ')
    for (const [i, w] of chunks.entries()) {
      if (w) {
        words.push({
          index: (wordIndex += 1),
          word: i < chunks.length - 1 ? `${w}\u00A0` : w,
        })
      }
    }
  }

  return (
    <Tag
      ref={ref as Ref<HTMLHeadingElement>}
      className={className}
      style={{ display: 'block', overflow: 'hidden' }}
    >
      {words.map(({ word, index }) => {
        if (word === '\n') {
          return <br key={`br-${index}`} />
        }

        const wordDelay = delay + index * stagger

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              filter: visible ? 'blur(0px)' : 'blur(8px)',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transition: visible
                ? `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${wordDelay}ms,
                   filter  ${duration}ms cubic-bezier(0.16,1,0.3,1) ${wordDelay}ms,
                   transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${wordDelay}ms`
                : 'none',
            }}
          >
            {word}
          </span>
        )
      })}
    </Tag>
  )
}
