'use client'

import { useState } from 'react'

const NAV_LINKS = [
  { href: '#platform', label: 'Platform' },
  { href: '#agents', label: 'Agents' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#integrations', label: 'Integrations' },
  { href: '#pricing', label: 'Pricing' },
]

const NAV_STYLE = {
  WebkitBackdropFilter: 'blur(16px)',
  backdropFilter: 'blur(16px)',
  background: 'rgba(245,244,240,0.30)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
} as const

export const MobileNav = () => {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-3xl">
        {/* Main bar */}
        <nav
          className="flex items-center justify-between rounded-2xl border border-black/[0.06] px-5 py-3"
          style={NAV_STYLE}
        >
          <span className="font-pixel text-xs tracking-[0.25em] text-black/70">
            ARIS
          </span>

          {/* Desktop links */}
          <div
            className="hidden items-center gap-7 md:flex"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[11px] tracking-wide text-black/60 transition-colors duration-200 hover:text-black"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden rounded-xl border border-black/10 px-4 py-2 text-[11px] tracking-wide text-black/60 transition-all duration-200 hover:border-black/20 hover:bg-black/[0.03] hover:text-black md:block"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              START BUILDING
            </button>

            {/* Burger — mobile only */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] rounded-lg transition-colors hover:bg-black/[0.04] md:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <span
                className="block h-px origin-center bg-black/60 transition-all duration-300"
                style={{
                  transform: open ? 'translateY(6px) rotate(45deg)' : 'none',
                  width: '18px',
                }}
              />
              <span
                className="block h-px bg-black/60 transition-all duration-300"
                style={{
                  opacity: open ? 0 : 1,
                  transform: open ? 'scaleX(0)' : 'none',
                  width: '18px',
                }}
              />
              <span
                className="block h-px origin-center bg-black/60 transition-all duration-300"
                style={{
                  transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none',
                  width: '18px',
                }}
              />
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        <div
          className="mt-2 overflow-hidden transition-all duration-300 ease-in-out md:hidden"
          style={{ maxHeight: open ? '320px' : '0px', opacity: open ? 1 : 0 }}
        >
          <div
            className="flex flex-col rounded-2xl border border-black/[0.06] px-2 py-2"
            style={NAV_STYLE}
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={close}
                className="rounded-xl px-4 py-3 text-sm tracking-wide text-black/60 transition-colors hover:bg-black/[0.03] hover:text-black"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-1 px-2 pb-1">
              <button
                type="button"
                className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-[11px] tracking-wide text-black/60 transition-all duration-200 hover:border-black/20 hover:bg-black/[0.03] hover:text-black"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                START BUILDING
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
