'use client'

import { useState, useEffect } from 'react'

// Quoted from the club's own English job descriptions. The panel, the step
// cards and the auto-advance timing are unchanged; only the content moved.
const STEPS = [
  {
    code: [
      { text: '// job-description/member.md', type: 'comment' },
      { type: 'gap' },
      { text: 'Membership does not require', type: 'plain' },
      { text: 'a technical background or a', type: 'plain' },
      { text: 'fixed number of hours.', type: 'plain' },
    ],
    desc: 'No background, no hour quota',
    file: 'membership',
    lang: 'text',
    num: '01',
    title: 'No required background',
  },
  {
    code: [
      { text: '// job-description/member.md', type: 'comment' },
      { type: 'gap' },
      { text: 'Technical and operational', type: 'plain' },
      { text: 'skills are learned through', type: 'plain' },
      { text: 'the department framework,', type: 'plain' },
      { text: 'tasks, reviews, workshops', type: 'plain' },
      { text: 'and mentorship.', type: 'plain' },
    ],
    desc: 'Learned inside the club, not before it',
    file: 'learning',
    lang: 'text',
    num: '02',
    title: 'Skills are learned',
  },
  {
    code: [
      { text: '// software-department-member.md', type: 'comment' },
      { type: 'gap' },
      { text: 'Prior experience is evidence', type: 'plain' },
      { text: 'and can shorten the path,', type: 'plain' },
      { text: 'not exclude an applicant.', type: 'plain' },
    ],
    desc: 'Evidence, never a precondition',
    file: 'evidence',
    lang: 'text',
    num: '03',
    title: 'Experience never excludes',
  },
  {
    code: [
      { text: '// recruitment-flow.md', type: 'comment' },
      { type: 'gap' },
      { text: 'Recruitment opens once a year,', type: 'plain' },
      { text: 'in a four-week window.', type: 'plain' },
      { type: 'gap' },
      { text: '\u2192 forms.gle/RnSVePAY9JWeZsKn9', type: 'url' },
    ],
    desc: 'One form, about ten minutes',
    file: 'apply',
    lang: 'text',
    num: '04',
    title: 'Apply once a year',
  },
]

// Only the line types the club's own quotations need. The output, success,
// command, prop and keyword branches that used to render the @agentic/sdk
// samples went with that data.
const CodeLine = ({ line }: { line: (typeof STEPS)[0]['code'][0] }) => {
  if (line.type === 'gap') {
    return <div className="h-3" />
  }
  if (line.type === 'comment') {
    return <div className="text-[#9ca3af]">{line.text}</div>
  }
  if (line.type === 'url') {
    return <div className="text-[#2563eb] underline">{line.text}</div>
  }
  if (line.type === 'plain') {
    return <div className="text-[#111]">{line.text}</div>
  }
  return null
}

export const DevExSection = () => {
  const [active, setActive] = useState(0)
  const [visible, setVisible] = useState(true)

  const selectStep = (i: number) => {
    if (i === active) {
      return
    }
    setVisible(false)
    setTimeout(() => {
      setActive(i)
      setVisible(true)
    }, 180)
  }

  // Auto-advance every 3s
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setActive((prev) => (prev + 1) % STEPS.length)
        setVisible(true)
      }, 180)
    }, 3200)
    return () => clearInterval(t)
  }, [])

  const step = STEPS[active]

  return (
    <section
      id="devex"
      className="border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-black/[0.05] px-3 py-1.5 text-[10px] tracking-widest text-black/40 uppercase">
            Eligibility
          </div>
          <h2 className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">
            Prior experience shortens
            <br />
            the path. It does not exclude.
          </h2>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-3">
          {/* Left — 4 clickable step cards, equal height, no flex stretch */}
          <div className="flex flex-col gap-3">
            {STEPS.map((s, i) => (
              <button
                key={s.num}
                type="button"
                aria-label={`${s.title} — ${s.desc}`}
                onClick={() => selectStep(i)}
                className="group flex-1 rounded-2xl border p-6 text-left transition-all duration-200"
                style={{
                  background:
                    active === i ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.7)',
                  borderColor:
                    active === i ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.06)',
                  boxShadow:
                    active === i
                      ? '0 1px 3px rgba(0,0,0,0.06)'
                      : '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-light transition-colors duration-200"
                    style={{
                      background:
                        active === i ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)',
                      color:
                        active === i ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.35)',
                    }}
                  >
                    {s.num}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-light transition-colors duration-200"
                      style={{
                        color:
                          active === i ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
                      }}
                    >
                      {s.title}
                    </p>
                    <p
                      className="mt-0.5 text-xs"
                      style={{ color: 'rgba(0,0,0,0.28)' }}
                    >
                      {s.desc}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right — fixed-size code panel */}
          <div
            className="flex flex-col rounded-2xl border border-black/[0.06] p-8 lg:col-span-2"
            style={{
              background: 'rgba(255,255,255,0.7)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              minHeight: '360px',
            }}
          >
            {/* Header */}
            <div className="mb-5 flex shrink-0 items-center justify-between">
              <div
                className="text-[10px] tracking-widest uppercase transition-all duration-200"
                style={{
                  color: 'rgba(0,0,0,0.3)',
                  filter: visible ? 'blur(0px)' : 'blur(4px)',
                  opacity: visible ? 1 : 0,
                  transition: 'opacity 200ms ease, filter 200ms ease',
                }}
              >
                {step.file}
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((d) => (
                  <div
                    key={d}
                    className="h-2 w-2 rounded-full transition-all duration-300"
                    style={{
                      background:
                        d === active % 3
                          ? 'rgba(0,0,0,0.25)'
                          : 'rgba(0,0,0,0.08)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Code block — fixed height, content doesn't affect layout */}
            <div
              className="flex-1 overflow-hidden rounded-xl p-6"
              style={{
                background: 'rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div
                className="font-mono text-[12px] leading-6"
                style={{
                  filter: visible ? 'blur(0px)' : 'blur(6px)',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(6px)',
                  transition:
                    'opacity 220ms cubic-bezier(0.16,1,0.3,1), filter 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                {step.code.map((line, i) => (
                  <CodeLine key={i} line={line} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
