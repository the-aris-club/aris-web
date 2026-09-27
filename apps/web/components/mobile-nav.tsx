'use client'

import Image from 'next/image'
import { useState } from 'react'

// The live recruitment form. Public, English, and the club's own.
const FORM_URL = 'https://forms.gle/RnSVePAY9JWeZsKn9'

// Anchors are the section ids the page actually renders. Three of these were
// dead for a while: the ids below the hero are #platform, #agents, #workflow,
// #integrations, #security and #devex.
const NAV_LINKS = [
  { href: '#platform', label: 'Departments' },
  { href: '#agents', label: 'Automation' },
  { href: '#workflow', label: 'Projects' },
  { href: '#integrations', label: 'Tools' },
  { href: '#security', label: 'Privacy' },
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
        <nav
          className="flex items-center justify-between rounded-2xl border border-black/[0.06] px-5 py-3"
          style={NAV_STYLE}
        >
          <a className="flex items-center" href="#top">
            <Image
              alt="The Aris Club"
              height={28}
              priority
              src="/brand/aris-mark.webp"
              style={{ height: 22, width: 'auto' }}
              width={40}
            />
          </a>

          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                className="text-[11px] tracking-wide text-black/60 transition-colors duration-200 hover:text-black"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a
              className="hidden rounded-xl border border-black/10 px-4 py-2 text-[11px] tracking-wide text-black/60 transition-all duration-200 hover:border-black/20 hover:bg-black/[0.03] hover:text-black md:block"
              href={FORM_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              APPLY
            </a>

            <button
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] rounded-lg transition-colors hover:bg-black/[0.04] md:hidden"
              onClick={() => setOpen((v) => !v)}
              type="button"
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

        <div
          className="mt-2 overflow-hidden transition-all duration-300 ease-in-out md:hidden"
          style={{ maxHeight: open ? '320px' : '0px', opacity: open ? 1 : 0 }}
        >
          <div
            className="flex flex-col rounded-2xl border border-black/[0.06] px-2 py-2"
            style={NAV_STYLE}
          >
            {NAV_LINKS.map((link) => (
              <a
                className="rounded-xl px-4 py-3 text-sm tracking-wide text-black/60 transition-colors hover:bg-black/[0.03] hover:text-black"
                href={link.href}
                key={link.href}
                onClick={close}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-1 px-2 pb-1">
              <a
                className="block w-full rounded-xl border border-black/10 px-4 py-2.5 text-center text-[11px] tracking-wide text-black/60 transition-all duration-200 hover:border-black/20 hover:bg-black/[0.03] hover:text-black"
                href={FORM_URL}
                onClick={close}
                rel="noopener noreferrer"
                target="_blank"
              >
                APPLY
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
