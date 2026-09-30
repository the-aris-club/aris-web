import Image from 'next/image'

import {
  BentoCard,
  DepartmentArtwork,
  DepartmentMark,
} from '@/components/bento-card'
import Footer from '@/components/footer'
import { Hero } from '@/components/hero'
import { MobileNav } from '@/components/mobile-nav'
import { RevealText } from '@/components/reveal-text'
import {
  SectionHeading,
  SplitSectionHeading,
} from '@/components/section-heading'
import { StackingAgentCards } from '@/components/stacking-agent-cards'
import { Tag } from '@/components/tag'
import {
  BOT_FORBIDDEN_ACTIONS,
  BOT_RESERVED_DECISIONS,
  CAPABILITY_GROUP,
  CLUB_MUST_NOT,
  CONTACT_EMAIL,
  FORM_URL,
  LANDING_PAGE_SECTIONS,
  MAILBOX_NOTE,
  NEVER_SENT_TO_AI,
  PROJECT_REQUIREMENTS,
  TECHNICAL_DEPARTMENTS,
} from '@/lib/club'

// A server component. Everything below the hero is static markup, so it is
// rendered once on the server and costs no client JavaScript; only the four
// islands that genuinely need it — the hero reveal, the mobile nav, the bento
// reveals and the stacking cards — are client components.

// ─── Club contact ─────────────────────────────────────────────────────────────
// FORM_URL, CONTACT_EMAIL and MAILBOX_NOTE come from lib/club. The mailbox is
// transitional and is not an official HCMIU address, which the page says out
// loud in both places it appears rather than implying otherwise.

// ─── Section nav ──────────────────────────────────────────────────────────────
// The sections and their anchors are LANDING_PAGE_SECTIONS in lib/club, in the
// order the page renders them. The nav bar and the footer both take that one
// list, and each anchor is also the id of the section it points at, so a link
// and its target cannot disagree. Both components were carrying their own copy
// of this list, and the order here had drifted from CONTEXT.md's.
const SECTION_LINKS = LANDING_PAGE_SECTIONS.map((s) => ({
  href: `#${s.anchor}`,
  label: s.label,
}))

// ─── Marquee content ──────────────────────────────────────────────────────────
// Hoisted so the three repetitions of each row share one array rather than
// rebuilding it on every render.
const PRIMARY_CAPS = [
  'Autonomous Systems',
  'Robotics',
  'IoT',
  'Software',
  'Operations and Development',
]
const SECONDARY_CAPS = [
  'Moderation',
  'Membership operations',
  'Finance and records',
  'Project administration',
  'University liaison',
  'Communications',
  'Events',
  'Research',
  'Editing and media',
]
const MARQUEE_REPEATS = 3

// The lede above the bot-authority list reads its count off the list rather than
// restating it, so the two cannot disagree. Only the sentence-initial capital
// form, which is the one shape a count takes in this page's prose; the numbers
// inside the CTA below are page voice and stay written out.
const NUMERALS: Record<number, string> = { 8: 'Eight' }

// ─── Project card titles ─────────────────────────────────────────────────────
// Page voice: the four headings the five quoted §11 items are grouped into. The
// items themselves are quoted and live in lib/club; these are the titles this
// page gives them, and they are not the source's own wording.

const PROJECT_TITLES = [
  'Purpose and owner',
  'Deliverable and acceptance criteria',
  'Deadline and escalation contact',
  'Safety, data, and how it ends',
]

// ─── Main page ────────────────────────────────────────────────────────────────
const ArisPage = () => (
  <div className="min-h-screen bg-[#F5F4F0] font-sans text-[#111] antialiased">
    {/* ── INTRO ANIMATION + HERO ─────────────────────────────────────────── */}
    <Hero />

    {/* ── STICKY NAV ────────────────────────────────────────────────────── */}
    <MobileNav sectionLinks={SECTION_LINKS} />

    {/* ── PLATFORM OVERVIEW (bento) ──────────────────────────────────────── */}
    <section
      className="section-defer px-6 py-32 md:px-12 lg:px-20"
      id={LANDING_PAGE_SECTIONS[0].anchor}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          icon="platform"
          tag="GROUPS"
          title={'Four departments.\nOne capability group.'}
        />

        <div className="grid-rows-auto grid grid-cols-12 gap-3">
          {/* Big left card — full width now that multi-agent is removed */}
          <BentoCard
            backdrop={
              <>
                {/* Arc background image — always fills container, objects pushed to bottom third */}
                <Image
                  src="/images/arc.webp"
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(min-width: 1024px) 1152px, 100vw"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: 'center 70%' }}
                />
                {/* Progressive blur layer — blurs from 45% downward */}
                <div
                  className="absolute inset-0"
                  style={{
                    WebkitBackdropFilter: 'blur(16px)',
                    WebkitMaskImage:
                      'linear-gradient(to bottom, transparent 45%, black 100%)',
                    backdropFilter: 'blur(16px)',
                    maskImage:
                      'linear-gradient(to bottom, transparent 45%, black 100%)',
                  }}
                />
                {/* Fade-to-background gradient — matches site bg color #f5f4f0 */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to bottom, transparent 35%, rgba(245,244,240,0.3) 50%, rgba(245,244,240,0.75) 65%, rgba(245,244,240,0.95) 80%, rgb(245,244,240) 100%)',
                  }}
                />
              </>
            }
            className="relative col-span-12 flex min-h-[200px] flex-col justify-between overflow-hidden p-8"
            delay={0}
          >
            {/* Content */}
            <div className="relative z-10">
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white/60">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  <path d="m4.93 4.93 2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-light">
                {CAPABILITY_GROUP.name}
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-black/45">
                The umbrella group for capabilities that are not technical
                departments and are not the governing Board:{' '}
                {CAPABILITY_GROUP.members.join(', ').toLowerCase()}.
              </p>
            </div>
          </BentoCard>

          {/* Four technical departments. The grid is twelve columns, so four
              cells at three each. Not five: Operations and Development is a
              capability pool, not a technical department. */}
          {TECHNICAL_DEPARTMENTS.map((dept, i) => (
            <BentoCard
              className="col-span-12 min-h-[200px] p-8 md:col-span-3"
              delay={120 + i * 40}
              key={dept.label}
            >
              <DepartmentArtwork src={dept.artwork} />

              <div className="relative z-10">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-black/10">
                  <DepartmentMark name={dept.name} />
                </div>
                <h3 className="mb-2 text-lg font-light">{dept.name}</h3>
                <p className="text-sm leading-relaxed text-black/45">
                  {dept.scope}
                </p>
              </div>
            </BentoCard>
          ))}
        </div>
      </div>
    </section>

    {/* ── BUILD YOUR AGENTS (4 cards) ───────────────────────────────────── */}
    <section
      className="section-defer border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20"
      id={LANDING_PAGE_SECTIONS[1].anchor}
    >
      <div className="mx-auto max-w-6xl">
        <SplitSectionHeading
          aside="A member has one primary department and may support another with an explicit assignment."
          icon="agents"
          tag="DEPARTMENTS"
          title={'Pick the one you\nwant to get good at.'}
        />

        <StackingAgentCards />
      </div>
    </section>

    {/* ── WHAT A PROJECT MUST NAME ──────────────────────────────────────── */}
    <section
      className="section-defer overflow-hidden border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20"
      id={LANDING_PAGE_SECTIONS[2].anchor}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          icon="workflow"
          lede={`Quoted from ${PROJECT_REQUIREMENTS.source}. A Discord message is not one of the five: a project is a formal record, not a conversation.`}
          tag="PROJECTS"
          title={'Five things every\nproject must name.'}
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {PROJECT_REQUIREMENTS.items.slice(0, 3).map((item, i) => (
            <BentoCard
              className="relative flex min-h-[320px] flex-col overflow-hidden"
              delay={i * 80}
              key={item}
            >
              {/* Number top-left */}
              <div className="relative z-10 p-7">
                <span className="font-pixel block text-[11px] tracking-widest text-black/20">
                  {`0${i + 1}`}
                </span>
              </div>
              {/* Text pushed further down */}
              <div className="relative z-10 mt-auto px-7 pt-16 pb-7">
                <h3 className="mb-3 text-2xl font-light">
                  {PROJECT_TITLES[i]}
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-line text-black/45">
                  {item}
                </p>
              </div>
            </BentoCard>
          ))}

          {/* The grid is four columns and §11 lists five items, so the last two
              share a card. Both are printed verbatim, built from the quoted list
              rather than typed as one string, so renumbering cannot leave the
              card out of step. If the layout is ever opened up, give 05 its own
              card. */}
          <BentoCard
            className="relative flex min-h-[320px] flex-col overflow-hidden"
            delay={240}
          >
            <div className="relative z-10 p-7">
              <span className="font-pixel block text-[11px] tracking-widest text-black/20">
                04
              </span>
            </div>
            <div className="relative z-10 mt-auto px-7 pt-16 pb-7">
              <h3 className="mb-3 text-2xl font-light">{PROJECT_TITLES[3]}</h3>
              <p className="text-sm leading-relaxed whitespace-pre-line text-black/45">
                {PROJECT_REQUIREMENTS.items
                  .slice(3)
                  .map((item, i) => `0${i + 4} — ${item}`)
                  .join('\n')}
              </p>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>

    {/* ── CONTENT AND OWNERSHIP ─────────────────────────────────────────── */}
    <section
      className="section-defer border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20"
      id={LANDING_PAGE_SECTIONS[3].anchor}
    >
      <div className="mx-auto max-w-6xl">
        <SplitSectionHeading
          aside="A member keeps ownership of work they create unless a separate written agreement says otherwise."
          icon="integrations"
          tag="YOUR WORK"
          title={'You keep what\nyou build.'}
        />

        {/* Cards sit in normal flow, never absolute. An earlier revision
            positioned this column over the image and overflow-hidden cut the
            top off the first card, taking its rounded corners with it. */}
        <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-2">
          <BentoCard className="flex flex-col p-7" delay={0}>
            <div>
              <Tag>OWNERSHIP</Tag>
            </div>
            <h3 className="mt-3 mb-2 text-lg font-light">
              The licence is limited
            </h3>
            <p className="text-sm leading-relaxed text-black/45">
              Submitting work to a club project grants a non-exclusive, limited
              licence to store, run, review, display, maintain and hand over
              that work for the club&rsquo;s stated purpose.
            </p>
          </BentoCard>

          <BentoCard className="flex flex-col p-7" delay={80}>
            <div>
              <Tag>UNPUBLISHED</Tag>
            </div>
            <h3 className="mt-3 mb-2 text-lg font-light">
              Held until it is clean
            </h3>
            <p className="text-sm leading-relaxed text-black/45">
              Work containing another person&rsquo;s data, a restricted dataset
              or an unclear licence must not be published until the issue is
              resolved.
            </p>
          </BentoCard>
        </div>

        <div className="mt-16">
          <RevealText className="mb-6 text-2xl leading-[1.1] font-light tracking-tight">
            The club must not:
          </RevealText>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {CLUB_MUST_NOT.items.map((item, i) => (
              <BentoCard
                key={item}
                className="flex items-start gap-4 p-6"
                delay={i * 80}
              >
                <span className="font-pixel mt-1 block shrink-0 text-[11px] tracking-widest text-black/20">
                  ✕
                </span>
                <p className="text-sm leading-relaxed text-black/55">{item}</p>
              </BentoCard>
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-black/35">
            Quoted from {CLUB_MUST_NOT.source}.
          </p>
        </div>
      </div>
    </section>

    {/* ── SECURITY & OBSERVABILITY ──────────────────────────────────────── */}
    <section
      className="section-defer border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20"
      id={LANDING_PAGE_SECTIONS[4].anchor}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          icon="platform"
          lede={`AI may assist with drafting, questions, summaries, translation, search, data-quality checks and routine reminders. ${NUMERALS[BOT_RESERVED_DECISIONS.items.length]} decisions are never one of them.`}
          tag="AUTOMATION"
          title={'What a bot\nmay not decide.'}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left — the eight decisions reserved to people, §9 */}
          <div>
            <div className="mb-5 text-xs tracking-widest text-black/30 uppercase">
              Reserved to people
            </div>
            <div className="grid grid-cols-2 gap-3">
              {BOT_RESERVED_DECISIONS.items.map((item, i) => (
                <BentoCard
                  className="flex items-center gap-3 p-5"
                  delay={i * 40}
                  key={item}
                >
                  <span className="font-pixel block shrink-0 text-[11px] text-black/20">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-light">{item}</span>
                </BentoCard>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-black/35">
              A person may refuse an AI-assisted process without losing the
              right to a fair human review.
            </p>
          </div>

          {/* Right — what a bot may not independently do, §9 */}
          <BentoCard className="flex flex-col p-7" delay={0}>
            <div className="mb-5 text-xs tracking-widest text-black/30 uppercase">
              A bot may not independently
            </div>
            <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2.5 self-start">
              {BOT_FORBIDDEN_ACTIONS.items.map((item) => (
                <div className="flex items-center gap-2.5" key={item}>
                  <span className="shrink-0 text-[11px] text-black/20">✕</span>
                  <span className="text-sm text-black/50">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 border-t border-black/[0.06] pt-4 text-xs leading-relaxed text-black/35">
              It may prepare a draft, reminder or approval card. Quoted from{' '}
              {BOT_FORBIDDEN_ACTIONS.source}.
            </p>
          </BentoCard>
        </div>

        <div className="mt-16">
          <RevealText className="mb-6 text-2xl leading-[1.1] font-light tracking-tight">
            What the club never sends to an AI provider
          </RevealText>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {NEVER_SENT_TO_AI.items.map((item, i) => (
              <BentoCard className="p-5" delay={i * 60} key={item}>
                <span className="text-sm text-black/55">{item}</span>
              </BentoCard>
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-black/35">
            Not by default, and any AI interview dataset needs a separate
            policy, opt-in, de-identification, retention rule and human review.
            Quoted from {NEVER_SENT_TO_AI.source}.
          </p>
        </div>
      </div>
    </section>

    {/* ── MARQUEE CAPABILITIES ──────────────────────────────────────────── */}
    <section className="section-defer overflow-hidden border-t border-black/[0.06] py-0 select-none">
      <div
        className="flex border-b border-black/[0.06]"
        style={{ animation: 'marqueeLeft 28s linear infinite' }}
      >
        {Array.from({ length: MARQUEE_REPEATS }).map((_, rep) => (
          <div key={rep} className="flex shrink-0">
            {PRIMARY_CAPS.map((cap) => (
              <div
                key={cap}
                className="flex shrink-0 items-center gap-6 border-r border-black/[0.06] px-10 py-5"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black/20" />
                <span className="text-sm tracking-wide whitespace-nowrap text-black/45">
                  {cap}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div
        className="flex"
        style={{ animation: 'marqueeRight 22s linear infinite' }}
      >
        {Array.from({ length: MARQUEE_REPEATS }).map((_, rep) => (
          <div key={rep} className="flex shrink-0">
            {SECONDARY_CAPS.map((cap) => (
              <div
                key={cap}
                className="flex shrink-0 items-center gap-6 border-r border-black/[0.06] px-10 py-5"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black/12" />
                <span className="text-sm tracking-wide whitespace-nowrap text-black/30">
                  {cap}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>

    {/* ── CTA ───────────────────────────────────────────────────────────── */}
    <section className="section-defer relative overflow-hidden border-t border-black/[0.06] px-6 py-32 md:px-12 lg:px-20">
      {/* Glass panels image — anchored to bottom center */}
      <Image
        src="/images/footer.webp"
        alt=""
        aria-hidden="true"
        width={2720}
        height={1536}
        className="pointer-events-none absolute bottom-0 left-0 w-full object-cover object-bottom select-none"
        style={{ opacity: 0.85 }}
      />
      {/* Progressive blur from bottom — blends into site bg */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          WebkitBackdropFilter: 'blur(18px)',
          WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 55%)',
          backdropFilter: 'blur(18px)',
          maskImage: 'linear-gradient(to top, transparent 0%, black 55%)',
        }}
      />
      {/* Colour fade from bottom to site bg #f5f4f0 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgb(245,244,240) 0%, rgba(245,244,240,0.92) 18%, rgba(245,244,240,0.55) 35%, transparent 55%)',
        }}
      />
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <h2 className="mb-6 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl lg:text-6xl">
          A clear path from
          <br />
          application to
          <br />
          meaningful first work.
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-black/45">
          Four weeks, one form, three evaluators at least. The status is
          controlled by the Recruitment Panel or the Board, and an applicant
          cannot change it directly.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-[#111] px-8 py-3 text-sm font-medium tracking-widest text-white transition-colors hover:bg-[#333]"
          >
            APPLY
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="rounded-xl border border-black/10 bg-white px-8 py-3 text-sm font-medium tracking-widest text-[#111] transition-colors hover:border-black/25"
          >
            EMAIL US
          </a>
        </div>
        <p className="mt-8 text-xs leading-relaxed text-black/35">
          {MAILBOX_NOTE}
        </p>
      </div>
    </section>

    {/* ── FOOTER ────────────────────────────────────────────────────────── */}
    <Footer sectionLinks={SECTION_LINKS} />
  </div>
)

export default ArisPage
