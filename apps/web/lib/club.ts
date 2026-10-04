// The club's own content, in one module.
//
// CONTEXT.md separates two kinds of text on this page and the module keeps them
// apart, because only one of them is answerable:
//
// - Quoted copy is reproduced from a club document. It names its source, in this
//   repository's private sibling the-aris-club, as file + section + line. Every
//   such source is verified against that repository, which is why the pointer is
//   a location and not a label.
// - Structural facts are enumerated by the club: the four technical
//   departments, the capability pool, the section anchors, the contact mailbox,
//   the recruitment numbers. They are countable, so they are data.
//
// Page voice is neither and is not here. It is connective prose that arranges
// these facts into an order a reader can follow, and it lives with the section
// that speaks it. The marquee's capability list, the CTA's wording and each
// department's one-line scope note are page voice, not quoted copy.
//
// Why provenance is file + section + line and not a link: the source repository
// is private, so a CI job on this repo cannot clone it and cannot fail a build
// on drift. A location a person or an agent can open in seconds is the most this
// repo can honestly offer. See docs/adr/0002-quoted-copy-carries-its-source.
//
// ponytail: The 'three unsourced marquee capabilities' below is a known gap, not
// an oversight. Ceiling: the page names three capabilities that no club document
// supports. Upgrade path: the Founding Group either confirms them in
// docs/operations/discord/ or they come off the marquee.

// ── Identity ────────────────────────────────────────────────────────────────

export const CLUB_NAME = 'The Aris Club'

// The extended name, and the one line of scope the page may claim.
export const EXTENDED_NAME = 'Autonomous Systems, Robotics, IoT & Software'

// ── Contact ─────────────────────────────────────────────────────────────────
// recruitment-flow.md:62 publishes the same Form URL. The mailbox is
// transitional and is not an official HCMIU address; the sentence is composed
// here so the claim travels with the address instead of being reworded at each
// call site.

export const FORM_URL = 'https://forms.gle/RnSVePAY9JWeZsKn9'

export const CONTACT_EMAIL = 'thearisclub.hcmiu@gmail.com'

export const MAILBOX_NOTE = `${CONTACT_EMAIL} is a transitional service mailbox, not an official HCMIU address.`

// ── Technical departments ───────────────────────────────────────────────────
// Four, never five. Operations and Development is a capability pool and gets no
// card in either place these departments appear.
//
// `scope` is page voice: it arranges the department's name against the club's
// own stated domains and introduces no fact of its own. It lives beside the name
// because the two are always printed together, and because it used to be typed
// twice — once here and once in the stacking cards — where a copy edit had two
// landing zones and could leave the two sections describing different clubs.
//
// Two artworks per department, not one. `artwork` is 16:9 and belongs to the
// Groups bento cards; `banner` is 6.5:1 and belongs to the stacking cards in
// #departments. They are separate files because one crop cannot serve both: the
// stacking card is 1152x177, so object-cover on a 16:9 picture keeps 27% of its
// height. They are separate fields rather than a shared one because the same
// four pictures two screens apart is the thing that was being avoided.

export interface TechnicalDepartment {
  artwork: string
  banner: string
  label: string
  name: string
  scope: string
}

export const TECHNICAL_DEPARTMENTS: readonly TechnicalDepartment[] = [
  {
    artwork: '/brand/dept-01.webp',
    banner: '/brand/dept-01-wide.webp',
    label: '01',
    name: 'Autonomous Systems',
    scope: 'Systems that decide and act under their own control.',
  },
  {
    artwork: '/brand/dept-02.webp',
    banner: '/brand/dept-02-wide.webp',
    label: '02',
    name: 'Robotics',
    scope: 'Hardware you can put on a table and make move.',
  },
  {
    artwork: '/brand/dept-03.webp',
    banner: '/brand/dept-03-wide.webp',
    label: '03',
    name: 'IoT',
    scope: 'Devices that report what they sense, and take instruction.',
  },
  {
    artwork: '/brand/dept-04.webp',
    banner: '/brand/dept-04-wide.webp',
    label: '04',
    name: 'Software',
    scope: 'The part that holds the other three together.',
  },
] as const

// ── Capability group ────────────────────────────────────────────────────────
// A pool of non-technical capabilities, explicitly not a fifth technical
// department: docs/governance/club-org-chart.md:37 and line 58, which describes
// it as coordinating non-technical capabilities with neither Board authority
// nor technical department authority.
//
// The members are the six roles the org chart gives this pool, at lines 58–63.
// The page previously named five of them in prose and added "communications",
// which the org chart does not list: University Liaison is the role that owns
// approved communication with HCMIU/HSV/CTSV. Naming the six from the chart is
// what makes the count checkable, and it is why the marquee's three extra
// capabilities cannot be reconciled with this list — see the note above.

export interface CapabilityGroup {
  members: readonly string[]
  name: string
}

export const CAPABILITY_GROUP: CapabilityGroup = {
  members: [
    'Operations and Development',
    'HR and Membership',
    'Finance and Records',
    'Community Moderation',
    'Projects',
    'University Liaison',
  ],
  name: 'Operations and Development',
}

// ── Landing page sections ───────────────────────────────────────────────────
// The one list, in the order the page renders them. CONTEXT.md:47 fixes this
// order; `anchor` is the section id as well as the nav href, so a link and its
// target can no longer disagree, and `tag` is what the heading prints.
//
// The fourth section is anchored `ownership` and labelled "Your work" because an
// anchor should not carry a space or a hyphen that the copy does not.

export interface LandingPageSection {
  anchor: string
  label: string
  tag: string
  title: string
}

export const LANDING_PAGE_SECTIONS: readonly LandingPageSection[] = [
  {
    anchor: 'groups',
    label: 'Groups',
    tag: 'GROUPS',
    title: 'Four departments.\nOne capability group.',
  },
  {
    anchor: 'departments',
    label: 'Departments',
    tag: 'DEPARTMENTS',
    title: 'Pick the one you\nwant to get good at.',
  },
  {
    anchor: 'projects',
    label: 'Projects',
    tag: 'PROJECTS',
    title: 'Five things every\nproject must name.',
  },
  {
    anchor: 'ownership',
    label: 'Your work',
    tag: 'YOUR WORK',
    title: 'You keep what\nyou build.',
  },
  {
    anchor: 'automation',
    label: 'Automation',
    tag: 'AUTOMATION',
    title: 'What a bot\nmay not decide.',
  },
] as const

// ── Quoted copy ─────────────────────────────────────────────────────────────
// docs/governance/community-terms-of-use.md, unless a block says otherwise.

export interface QuotedClause {
  items: readonly string[]
  source: string
}

/** Quoted from Community Terms §8, lines 107–112. */
export const CLUB_MUST_NOT: QuotedClause = {
  items: [
    'Reuse private work for unrelated training or commercial purposes.',
    'Remove authorship or license information.',
    "Publish a work that contains another person's confidential data.",
    'Claim ownership of external libraries, data or third-party content.',
  ],
  source: 'Community Terms §8',
}

/** Quoted from Community Terms §11, lines 145–151. */
export const PROJECT_REQUIREMENTS: QuotedClause = {
  items: [
    'Purpose and owner.',
    'Deliverable and acceptance criteria.',
    'Deadline and escalation contact.',
    'Safety and data check.',
    'Handover or closing decision.',
  ],
  source: 'Community Terms §11',
}

/** Quoted from Community Terms §9, line 118. The count is `items.length`. */
export const BOT_RESERVED_DECISIONS: QuotedClause = {
  items: [
    'Membership',
    'Recruitment',
    'Disciplinary',
    'Financial',
    'Legal',
    'Medical',
    'Educational',
    'Deployment',
  ],
  source: 'Community Terms §9',
}

/** Quoted from Community Terms §9, line 124. */
export const BOT_FORBIDDEN_ACTIONS: QuotedClause = {
  items: [
    'Accept',
    'Reject',
    'Promote',
    'Remove',
    'Discipline',
    'Vote',
    'Merge',
    'Deploy',
    'Spend money',
    'Bypass an approval',
  ],
  source: 'Community Terms §9',
}

/**
 * Quoted from Community Terms §9, line 120, with one deliberate divergence: the
 * source says "MSSV" and this says "Student ID". MSSV is the Vietnamese
 * abbreviation for student number and means nothing to the audience this site
 * addresses. The divergence is documented where the Terms themselves are copied
 * — see app/legal/community-terms/layout.tsx — and re-syncing from the source
 * will reintroduce MSSV here, so the fix belongs upstream.
 *
 * Seven items, and the page renders seven cards: the source separates private
 * channels from moderation records and the page used to print them as one card,
 * which made six cards stand in for seven commitments.
 */
export const NEVER_SENT_TO_AI: QuotedClause = {
  items: [
    'Personal data',
    'Student ID',
    'Full CVs',
    'Raw answers',
    'Scores',
    'Private channels',
    'Moderation records',
  ],
  source: 'Community Terms §9',
}

// ── Community Terms ─────────────────────────────────────────────────────────
// The published copy of the club's participation terms. Its version and status
// are governance facts and belong here with the rest, not in the layout that
// happens to render them.

export const COMMUNITY_TERMS = {
  owner: 'Founding Group',
  status:
    'Draft for internal preparation. This document is not an official HCMIU policy, does not create a legal contract and does not make The Aris Club an officially recognized club.',
  version: '0.1-draft',
} as const

// ── House facts ─────────────────────────────────────────────────────────────
// Numbers the club has committed to in writing. The page has no usage metrics and
// no traction figures, because the club has none.

/**
 * docs/governance/recruitment-flow.md:15 and its Annual calendar at lines 27–30.
 * The window is four weeks — Weeks 1–4, application form through interview and
 * skills test — after which a final buffer period carries panel review, the Board
 * decision and notification.
 */
export const RECRUITMENT = {
  evaluatorsMinimum: 3,
  forms: 1,
  stages: ['Application form', 'Screening', 'Interview and skills test'],
  windowWeeks: 4,
} as const
