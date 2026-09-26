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

export const metadata: Metadata = {
  authors: [{ name: 'Agentic' }],
  description:
    'Deploy autonomous AI agents that think, act, and execute across any workflow. Connect 200+ integrations, run agents in parallel, and ship faster with the Agentic platform.',
  icons: {
    apple: '/apple-icon.png',
    icon: [
      {
        media: '(prefers-color-scheme: light)',
        url: '/icon-light-32x32.png',
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: '/icon-dark-32x32.png',
      },
      {
        type: 'image/svg+xml',
        url: '/icon.svg',
      },
    ],
  },
  keywords: [
    'AI agents',
    'autonomous agents',
    'LLM orchestration',
    'AI automation',
    'multi-agent platform',
  ],
  openGraph: {
    description:
      'Deploy autonomous AI agents that think, act, and execute across any workflow.',
    siteName: 'Agentic',
    title: 'Agentic — Autonomous AI Agents at Scale',
    type: 'website',
    url: 'https://agentic.ai',
  },
  title: 'Agentic — Autonomous AI Agents at Scale',
  twitter: {
    card: 'summary_large_image',
    description:
      'Deploy autonomous AI agents that think, act, and execute across any workflow.',
    title: 'Agentic — Autonomous AI Agents at Scale',
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
