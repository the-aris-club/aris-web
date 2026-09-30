import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Courier_Prime } from 'next/font/google'
import React from 'react'

import './globals.css'

import { CLUB_NAME, EXTENDED_NAME } from '@/lib/club'

const SITE_URL = 'https://aris.resonance.io.vn'

// Both halves are quoted rather than written: the scope is the extended name
// (docs/adr/0001-club-identity-and-scope.md:6) and the second sentence is the
// Member job description verbatim (job-description/member.md:11), both in the
// private the-aris-club repository. No HCMIU claim appears anywhere, which is how
// the charter's prohibition is met.
const DESCRIPTION = `${CLUB_NAME} is a student club working in ${EXTENDED_NAME}. Membership does not require a technical background or a fixed number of hours.`

// These three back the --font-sans, --font-mono and --font-pixel tokens in
// globals.css. Every text style on the page goes through one of those tokens.
// IBM Plex Sans used to be loaded here as a fourth family, referenced only by
// three hardcoded inline fontFamily styles; it is gone, because resolving its
// font files failed the build on Vercel ("Can't resolve
// '@vercel/turbopack-next/internal/font/google/font'").
const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })
const _courierPrime = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
})

// Icons come from the app/ file conventions — icon.png, apple-icon.png and
// opengraph-image.jpg. An explicit metadata.icons block would override them and
// point the tab back at the Agentic set in public/.
export const metadata: Metadata = {
  authors: [{ name: CLUB_NAME }],
  description: DESCRIPTION,
  keywords: [
    'student club',
    'Autonomous Systems',
    'Robotics',
    'IoT',
    'Software',
    'robotics club',
    'student organisation',
  ],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    description: DESCRIPTION,
    siteName: CLUB_NAME,
    title: `${CLUB_NAME} — ${EXTENDED_NAME}`,
    type: 'website',
    url: SITE_URL,
  },
  // The release gate, enforced. CONTEXT.md calls Deployed: false a gate and
  // not a setting, and the custom domain is public because Vercel's SSO
  // protection exempts custom domains. Without this the page is fully
  // indexable by any search engine.
  //
  // A noindex meta rather than a robots.txt Disallow, deliberately. A
  // Disallow stops the crawler fetching the page at all, which is how
  // facebookexternalhit and Twitterbot end up with an empty card instead of a
  // preview. noindex lets them fetch and read the Open Graph tags while keeping
  // the page out of search results, which is the actual requirement here.
  //
  // Remove this when the authority confirms the club.
  robots: {
    follow: false,
    index: false,
  },
  title: `${CLUB_NAME} — ${EXTENDED_NAME}`,
  twitter: {
    card: 'summary_large_image',
    description: DESCRIPTION,
    title: `${CLUB_NAME} — ${EXTENDED_NAME}`,
  },
}

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="en">
    <body className="font-sans antialiased">
      {children}
      <Analytics />
    </body>
  </html>
)

export default RootLayout
