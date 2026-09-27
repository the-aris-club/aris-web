import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import {
  Geist,
  Geist_Mono,
  IBM_Plex_Sans,
  Courier_Prime,
} from 'next/font/google'
import React from 'react'

import './globals.css'

const NAME = 'The Aris Club'
const SITE_URL = 'https://aris.resonance.io.vn'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })
const _courierPrime = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
})
const _ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
})

// Icons come from the app/ file conventions — icon.png, apple-icon.png and
// opengraph-image.jpg. An explicit metadata.icons block would override them and
// point the tab back at the Agentic set in public/.
export const metadata: Metadata = {
  authors: [{ name: NAME }],
  description:
    'Deploy autonomous AI agents that think, act, and execute across any workflow. Connect 200+ integrations, run agents in parallel, and ship faster with The Aris Club platform.',
  keywords: [
    'AI agents',
    'autonomous agents',
    'LLM orchestration',
    'AI automation',
    'multi-agent platform',
  ],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    description:
      'Deploy autonomous AI agents that think, act, and execute across any workflow.',
    siteName: NAME,
    title: `${NAME} — Autonomous AI Agents at Scale`,
    type: 'website',
    url: SITE_URL,
  },
  title: `${NAME} — Autonomous AI Agents at Scale`,
  twitter: {
    card: 'summary_large_image',
    description:
      'Deploy autonomous AI agents that think, act, and execute across any workflow.',
    title: `${NAME} — Autonomous AI Agents at Scale`,
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
