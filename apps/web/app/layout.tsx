import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import React from 'react'

import './globals.css'

// The vietnamese subset is loaded because the page names the club in both
// scripts even though the copy itself is English. See ADR-0002.
const beVietnamPro = Be_Vietnam_Pro({
  display: 'swap',
  subsets: ['latin', 'vietnamese'],
  variable: '--font-be-vietnam-pro',
  weight: ['300', '400', '500', '600', '700'],
})

const SITE_URL = 'https://aris.resonance.io.vn'
const NAME = 'The Aris Club'

// Verbatim from brand-catalog.md, the club's only slogan.
const SLOGAN = 'We build systems that turn complexity into capability.'

// Verbatim from ADR-0001, CONTEXT.md and the supplied banner artwork.
const SCOPE = 'Autonomous Systems, Robotics, IoT & Software'

// Verbatim from the recruitment form description in FormBuilder.gs.
const DESCRIPTION =
  'The Aris Club is a student club focused on Autonomous Systems, Robotics, IoT and Software. We recruit on evidence of how you learn and work, not on what you already know. No prior technical background is required.'

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

// Structured data for search and generative engines. Only claims the club has
// actually made are encoded here; see ADR-0002 for what is deliberately absent.
// Serialised once at module scope: this is a literal, so the string is stable.
const structuredData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  description: DESCRIPTION,
  logo: `${SITE_URL}/brand/aris-logo.png`,
  name: NAME,
  slogan: SLOGAN,
  url: SITE_URL,
})

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html className={beVietnamPro.variable} lang="en">
    <body className="font-sans antialiased">
      {children}
      <script type="application/ld+json">{structuredData}</script>
      <Analytics />
    </body>
  </html>
)

export default RootLayout
