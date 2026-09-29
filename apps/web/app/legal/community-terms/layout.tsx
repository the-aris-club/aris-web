import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  description:
    'How people may participate in The Aris Club, its community services, events and research.',
  title: 'Community Terms of Use — The Aris Club',
}

/**
 * page.mdx is a manual copy of the club's community-terms-of-use document, which
 * lives in a private repository and so cannot be linked to directly.
 *
 * ponytail: page.mdx IS a second source of truth for a governance document,
 * which the club's own docs forbid. Manual sync was chosen over a build-time
 * fetch, and that is only tolerable because VERSION and STATUS render verbatim
 * below, so a stale copy announces itself. Ceiling: the copy silently rots the
 * first time the club amends the source without telling this repo. Upgrade
 * path: fetch at build time and delete the copy, or publish the source document
 * and link to it. Rationale in docs/brand-rollout.md.
 *
 * Three consequences of the copy worth knowing:
 * - The source has two relative links into the same private repository. They
 *   became plain text here, because linking would 404.
 * - This note lives in a TSX file rather than in the MDX, because a JSX comment
 *   in MDX is parsed as a JavaScript expression: a slash pair in the prose
 *   reads as a regular expression whose trailing characters are then rejected as
 *   invalid flags. The formatter also rewrites the comment braces.
 *
 * A third, deliberate divergence. Two occurrences of "MSSV" are rendered here
 * as "Student ID". The source document still says MSSV, so this copy is no
 * longer verbatim, which is the one thing the rest of this note exists to
 * prevent. It is a public page: MSSV is the Vietnamese abbreviation for student
 * number and means nothing to the audience the site addresses. The club has
 * already solved this elsewhere in English -- membership-screening-rules.md and
 * server-rules.md both write "MSSV (student ID)" -- so this follows the club's
 * own convention rather than inventing one. Re-syncing from the source will
 * reintroduce MSSV, so the fix belongs upstream in
 * community-terms-of-use.md.
 *
 * The status banner below is load-bearing, not decorative. The document is a
 * draft that declares itself not to be a contract, and rendering that
 * declaration is the only thing that makes publishing it honest.
 *
 * This layout owns the document only. The canvas and the footer belong to
 * app/legal/layout.tsx, which every page under /legal renders inside.
 */
const VERSION = '0.1-draft'
const STATUS =
  'Draft for internal preparation. This document is not an official HCMIU policy, does not create a legal contract and does not make The Aris Club an officially recognized club.'

const CommunityTermsLayout = ({ children }: { children: ReactNode }) => (
  <div className="mx-auto max-w-3xl px-6 py-24 md:px-12">
    <Link
      className="text-sm text-black/45 transition-colors hover:text-black"
      href="/"
    >
      ← The Aris Club
    </Link>

    <div className="border-aris-blue/25 bg-aris-blue/[0.05] mt-12 rounded-2xl border p-6">
      <p className="text-aris-ink text-sm font-medium">
        Version {VERSION} · Owner: Founding Group
      </p>
      <p className="mt-2 text-sm leading-relaxed text-black/60">{STATUS}</p>
    </div>

    <article className="mt-12">{children}</article>
  </div>
)

export default CommunityTermsLayout
