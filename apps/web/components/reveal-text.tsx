'use client'

import { useReveal } from '@/lib/use-reveal'

// Splits text into words and reveals each with staggered opacity+blur+translateY
// matching the ARIS intro animation style.
//
// The timings and the element are fixed. They were props once, and nothing ever
// passed them, so they only ever had one value to have — five dials that could
// not be turned, and a union of five element types that made the ref need a
// cast. If a second timing or a paragraph ever wants to exist, that is the
// moment to add a prop, and to add it as the one value it has.

// ms between each word
const STAGGER = 80
// ms per word transition
const DURATION = 700
// IntersectionObserver threshold
const THRESHOLD = 0.2

export const RevealText = ({
  children,
  className = '',
}: {
  children: string
  className?: string
}) => {
  // The observer is shared with every other reveal on the page, keyed by
  // threshold, rather than one native observer per heading.
  const { inView: visible, ref } = useReveal<HTMLHeadingElement>(THRESHOLD)

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
    <h2
      ref={ref}
      className={className}
      style={{ display: 'block', overflow: 'hidden' }}
    >
      {words.map(({ word, index }) => {
        if (word === '\n') {
          return <br key={`br-${index}`} />
        }

        const wordDelay = index * STAGGER

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              filter: visible ? 'blur(0px)' : 'blur(8px)',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transition: visible
                ? `opacity ${DURATION}ms cubic-bezier(0.16,1,0.3,1) ${wordDelay}ms,
                   filter  ${DURATION}ms cubic-bezier(0.16,1,0.3,1) ${wordDelay}ms,
                   transform ${DURATION}ms cubic-bezier(0.16,1,0.3,1) ${wordDelay}ms`
                : 'none',
            }}
          >
            {word}
          </span>
        )
      })}
    </h2>
  )
}
