import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Courier_Prime } from 'next/font/google'
import React from 'react'

import './globals.css'

const NAME = 'The Aris Club'
const SITE_URL = 'https://aris.resonance.io.vn'

// The extended name, and the one line of scope the page may claim. CONTEXT.md
// allows no dropped domain and no fifth.
const SCOPE = 'Autonomous Systems, Robotics, IoT & Software'

// Both halves are quoted rather than written: the scope is the extended name,
// and the second sentence is the Member job description verbatim. No HCMIU
// claim appears anywhere, which is how the charter's prohibition is met.
const DESCRIPTION = `The Aris Club is a student club working in ${SCOPE}. Membership does not require a technical background or a fixed number of hours.`

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
  authors: [{ name: NAME }],
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
    siteName: NAME,
    title: `${NAME} — ${SCOPE}`,
    type: 'website',
    url: SITE_URL,
  },
  title: `${NAME} — ${SCOPE}`,
  twitter: {
    card: 'summary_large_image',
    description: DESCRIPTION,
    title: `${NAME} — ${SCOPE}`,
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
