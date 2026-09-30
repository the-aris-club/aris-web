import Image from 'next/image'
import Link from 'next/link'

import { CLUB_NAME, CONTACT_EMAIL, FORM_URL, MAILBOX_NOTE } from '@/lib/club'

interface FooterProps {
  /**
   * The middle column: links to sections of the page the footer sits on.
   *
   * Optional, and only the landing page passes it. These are same-page anchors
   * with no leading slash, which is what lets the browser scroll to a section
   * without a navigation. That is exactly why they cannot be shared blindly with
   * a page that has no such sections: from /legal/community-terms, `#groups`
   * would resolve to a fragment on the Terms document and go nowhere. A page
   * without sections omits this and gets the lockup, the standing links and the
   * copyright line.
   */
  sectionLinks?: { href: string; label: string }[]
}

const Footer = ({ sectionLinks }: FooterProps) => (
  <footer className="border-t border-black/[0.06] px-6 py-10 md:px-12 lg:px-20">
    <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
      {/* The full lockup, mark over wordmark. There is room for it here,
          which the nav bar does not have. */}
      <Image
        src="/brand/aris-logo.webp"
        alt={CLUB_NAME}
        width={367}
        height={280}
        className="h-16 w-auto shrink-0"
      />

      {sectionLinks ? (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          {sectionLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-xs tracking-widest text-black/35 transition-colors hover:text-black/70"
            >
              {l.label}
            </a>
          ))}
        </div>
      ) : null}

      {/* Every one of these points somewhere that exists, and all three are
          absolute, so they mean the same thing from any page. The club has no
          public GitHub organisation or Discord invite yet, so those links are
          absent rather than left as href="#". */}
      <div className="flex items-center gap-6">
        <Link
          href="/legal/community-terms"
          className="text-xs tracking-widest text-black/25 transition-colors hover:text-black/55"
        >
          Terms
        </Link>
        <a
          href={FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs tracking-widest text-black/25 transition-colors hover:text-black/55"
        >
          Apply
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-xs tracking-widest text-black/25 transition-colors hover:text-black/55"
        >
          Contact
        </a>
      </div>
    </div>
    <div className="mx-auto mt-8 max-w-6xl border-t border-black/[0.04] pt-6">
      <span className="text-xs text-black/20">
        © 2026 {CLUB_NAME}. {MAILBOX_NOTE}
      </span>
    </div>
  </footer>
)

export default Footer
