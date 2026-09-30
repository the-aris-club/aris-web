'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

import { HERO_REVEAL_MS, IntroAnimation } from '@/components/intro-animation'
import { EXTENDED_NAME } from '@/lib/club'
import { EASE } from '@/lib/motion'

// The hero is the one section that cannot be static: the banner zoom, the
// headline blur and the scope line are all driven by a single flag the intro
// animation raises when its curtain finishes retracting. That flag is state
// held here rather than in the page, so everything below the fold renders on the
// server with no client JavaScript at all.

// Hero entrance stagger. i is in 80ms steps, matching the old metrics row.
const stagger = (ready: boolean, i: number) => ({
  filter: ready ? 'blur(0px)' : 'blur(16px)',
  opacity: ready ? 1 : 0,
  transform: ready ? 'translateY(0px)' : 'translateY(20px)',
  transition: `opacity 0.8s ${EASE} ${120 + i * 80}ms, filter 0.8s ${EASE} ${120 + i * 80}ms, transform 0.8s ${EASE} ${120 + i * 80}ms`,
})

// The scope, then the barrier a prospective member actually worries about — both
// The barrier a prospective member actually worries about, quoted. It stays
// here rather than in lib/club because it has one call site, and a fact with
// one call site is a constant with a longer name — the same reason PixelIcon
// has no size prop.
//
//   job-description/member.md:11, verbatim second sentence, in the private
//   the-aris-club repository. The extended name beside it moves to lib/club as
//   EXTENDED_NAME; this file's ADR pointer was wrong, since 0005 is project
//   lifecycle and safety and the scope is 0001.
const BARRIER =
  'Membership does not require a technical background or a fixed number of hours.'

export const Hero = () => {
  const [heroReady, setHeroReady] = useState(false)
  const [videoReady, setVideoReady] = useState(false)

  const handleIntroDone = useCallback(() => {
    setHeroReady(true)
  }, [])

  // Start video zoom slightly before hero content reveals, for seamless overlap
  useEffect(() => {
    const t = setTimeout(() => setVideoReady(true), HERO_REVEAL_MS)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <section className="relative h-screen overflow-hidden">
        {/* Banner — the club's own artwork, zooms in once intro is done.
          object-cover on a 16:9 image inside a portrait viewport shows only
          the centre ~26%, which put the arm's shoulder behind the headline on
          mobile. Anchoring to 20% below md shows the quiet left of the frame
          and pushes the arm clear to the right; from md up the viewport is
          roughly 16:9, the whole frame fits, and centring is correct. */}
        <Image
          src="/brand/aris-hero.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 z-0 h-full w-full object-cover object-[20%_50%] md:object-center"
          style={{
            transform: videoReady ? 'scale(1.05)' : 'scale(0.85)',
            transition: `transform 2s ${EASE}`,
          }}
        />

        {/* Progressive blur + light gradient rising from bottom */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            background:
              'linear-gradient(to top, #F5F4F0 0%, #F5F4F0 18%, rgba(245,244,240,0.85) 35%, rgba(245,244,240,0.5) 55%, rgba(245,244,240,0.15) 75%, transparent 100%)',
            height: '65%',
          }}
        />
        {/* Backdrop blur layers — progressively lighter toward top */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            WebkitBackdropFilter: 'blur(12px)',
            WebkitMaskImage:
              'linear-gradient(to top, black 0%, transparent 100%)',
            backdropFilter: 'blur(12px)',
            height: '20%',
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            WebkitBackdropFilter: 'blur(6px)',
            WebkitMaskImage:
              'linear-gradient(to top, black 0%, transparent 100%)',
            backdropFilter: 'blur(6px)',
            height: '38%',
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          style={{
            WebkitBackdropFilter: 'blur(2px)',
            WebkitMaskImage:
              'linear-gradient(to top, black 0%, transparent 100%)',
            backdropFilter: 'blur(2px)',
            height: '55%',
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          }}
        />

        {/* Spacer so hero content doesn't sit under the fixed nav */}
        <div className="h-20" />

        {/* Title + scope — anchored to bottom left. No figures: the club has no
          traction to report and CONTEXT.md forbids inventing any. */}
        <div className="absolute inset-x-0 bottom-0 z-30 flex max-w-3xl flex-col px-6 pb-12 md:px-12">
          {/* Slogan, verbatim from brand-catalog.md */}
          <h1
            className="mb-8 font-sans text-5xl leading-[1.02] font-light tracking-tight text-[#111] sm:text-6xl md:text-7xl"
            style={{
              filter: heroReady ? 'blur(0px)' : 'blur(24px)',
              opacity: heroReady ? 1 : 0,
              transform: heroReady ? 'translateY(0px)' : 'translateY(32px)',
              transition: `opacity 1s ${EASE} 0ms, filter 1s ${EASE} 0ms, transform 1s ${EASE} 0ms`,
            }}
          >
            We build systems
            <br />
            that turn complexity
            <br />
            into capability.
          </h1>

          <div style={stagger(heroReady, 0)}>
            <p className="font-sans text-sm tracking-wide text-black/50 uppercase">
              {EXTENDED_NAME}
            </p>
            <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-black/45">
              {BARRIER}
            </p>
          </div>
        </div>
      </section>

      {/* A sibling of the section, not a child of it. The curtain is
          position:fixed, which escapes the section's overflow:hidden — but only
          while the section stays a plain containing block. Inside it, the first
          transform or filter added here would clip the whole intro to the
          viewport-sized box. */}
      <IntroAnimation onDone={handleIntroDone} />
    </>
  )
}
