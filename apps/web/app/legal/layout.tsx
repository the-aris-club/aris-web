import type { ReactNode } from 'react'

import Footer from '@/components/footer'

// The chrome every page under /legal shares: the canvas, and the footer.
//
// It is a layout of its own rather than part of the Community Terms layout so
// that a second document — a privacy policy, a code of conduct — gets the same
// frame by existing, not by being copied. The Community Terms layout below owns
// only what is specific to that document: the version banner and the measure.
//
// The footer is the landing page's, unmodified. It is given no sectionLinks,
// because its section nav is a set of same-page anchors and a document has no
// such sections — passing them here would produce five links that resolve to
// fragments of the Terms document and go nowhere.
//
// The column is a flex child that grows, which is what holds the footer against
// the bottom edge on a short document and lets it fall away naturally on a long
// one.

const LegalLayout = ({ children }: { children: ReactNode }) => (
  <div className="bg-aris-canvas text-aris-ink flex min-h-screen flex-col font-sans antialiased">
    <div className="flex-1">{children}</div>
    <Footer />
  </div>
)

export default LegalLayout
