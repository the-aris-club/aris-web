# The Aris Club (web)

Glossary for this repository. This is the public web page for The Aris Club, a student club focused on Autonomous Systems, Robotics, IoT and Software. Club governance, the charter and the canonical glossary live in the separate private `the-aris-club` repository; the terms here are the ones this codebase has to get right.

## Identity

**The Aris Club**: the club's English name. Used in metadata, structured data and the page footer. _Avoid_: Agentic, the organisation, the company.

**Extended name**: `Autonomous Systems, Robotics, IoT & Software`. The club's scope, and the one line of scope the page is allowed to claim. _Avoid_: dropping a domain, adding a fifth.

**Founding Group**: the group preparing the club's paperwork. It has no authority to represent the university. The page is written for a post-approval launch and therefore never names it, but the term governs what the page may not claim. _Avoid_: official club, the board.

## Publication state

**Deployed**: false. The site is not published until the competent authority confirms the club. This is a release gate, not a setting. _Avoid_: launching early, previewing publicly.

**HCMIU claim**: any statement, name, logo, colour or link implying the university's recognition. Prohibited outright, in the charter and again in the Community Terms §3. The page satisfies this by making no such claim anywhere rather than by carrying a disclaimer. _Avoid_: disclaimer-as-permission, university-affiliated, in partnership with.

**Sponsorship**: money, equipment or personnel offered by an organisation. The page must not solicit it. Charter §8 forbids collecting fees or sponsorship until HSV confirms the club's right to, and no fee figure exists anywhere. _Avoid_: donate, sponsor, support us financially, become a partner.

## Content

**Quoted copy**: text on the page that is reproduced word for word from a club document that already exists in English. Each block names its source file. _Avoid_: paraphrasing a governance document, translating one.

**Translated copy**: Vietnamese source material rendered into English for the page. Currently none, by decision. This is what would create a second source of truth, which the club's own documents forbid. _Avoid_: informal translation, summary standing in for a source.

**Page voice**: connective prose written for this page. It quotes no document and may introduce no number, boundary, promise or prohibition that a club document does not already state. It may only arrange quoted facts into an order a reader can follow, and say what a quoted fact means for that reader. The test: strip the page voice and every remaining number and prohibition must still trace to a named source file. _Avoid_: marketing copy, original copy, unsourced copy.

**House fact**: a number the page shows that the club has committed to in writing, such as four technical departments, three selection rounds, a four-week annual window. The page has no usage metrics and no traction figures, because the club has none. _Avoid_: 50M+, 99.9%, 180+, users, teams, agents active.

**Placeholder content**: a section showing structure where no real content exists, such as a live activity feed before any activity has run. Not used. _Avoid_: live feed, coming soon, empty state with a spinner.

## Interface

**Selection round**: one of the three fixed stages of recruitment, application review, interview and skills test. Results are notified after each. On the landing page only as the count behind the Apply link; the round-by-round detail is not on it. _Avoid_: step, phase, stage of onboarding.

**Bot authority**: what the club's automation may and may not do. It may prepare drafts, reminders and approval cards. It may not decide membership, recruitment, discipline, money, law, medicine, education or deployment, and it may not accept, reject, promote, remove, vote, merge, deploy, spend or bypass an approval. This is the Automation section, quoted from Community Terms §9. _Avoid_: automation policy, bot rules, AI guardrails.

**Technical department**: Autonomous Systems, Robotics, IoT or Software. Four, never five. _Avoid_: department for Operations and Development.

**Primary department**: the one technical department a member belongs to. A member has exactly one, and it is one of the four. Quoted from Community Terms §11. _Avoid_: home department, main department, first department.

**Support assignment**: an explicit assignment to support a second department alongside the primary one. It neither replaces the primary department nor adds a second one, and it is explicit rather than implied. Quoted from Community Terms §11. _Avoid_: secondary department, second department, also a member of.

**Capability group**: Operations and Development. A pool of non-technical capabilities, explicitly not a fifth technical department. The page names it in the marquee and does not give it a department card. _Avoid_: technical department, marketing department, admin.

**Community Terms of Use**: the club's participation terms, version 0.1-draft. Published on this site as a copy of the document held in the club repository. _Avoid_: legal contract, privacy policy, university policy.

**Contact mailbox**: `thearisclub.hcmiu@gmail.com`. Transitional, and explicitly not an official HCMIU address. The page says so in both places it appears, the Apply block and the footer. _Avoid_: official address, club domain.

**Quoted clause**: a block of the page reproduced from a named section of a club document, recorded in `lib/club.ts` with the file, the section and the line it came from, in the private `the-aris-club` repository. Provenance is a location rather than a link because the source repository is private, so nothing on this repository's CI can fetch it; a person or an agent opens it in seconds. A quoted clause that is not verbatim says so where it is declared — **MSSV** is rendered as **Student ID** in exactly one place, and the reason lives with the clause. _Avoid_: an uncited quotation, a paraphrase presented as a quotation.

**Club content module**: `lib/club.ts`, the one home for the club's quoted copy, its structural facts and its contact details. It holds what the club can be asked about and what it has committed to. It does not hold page voice, which is the connective prose that arranges those facts and belongs to the section speaking it. _Avoid_: a content management system, a place for marketing copy.

**Landing page sections**, in order: Groups, Departments, Projects, Your work, Automation. The section anchors are `#groups`, `#departments`, `#projects`, `#ownership` and `#automation`; the fourth is anchored `ownership` rather than `your-work` because an anchor should not carry a space or a hyphen that the copy does not. Two sections the template shipped were deleted rather than rewritten: a live activity feed, which would be placeholder content, and pricing, which Charter §8 forbids. A third, the SDK tutorial, was deleted because the four real services are a disclaimer in §14 and not a marketing section. _Avoid_: adding a section back because the template had one. That list is `LANDING_PAGE_SECTIONS` in the club content module: the anchor is both the nav href and the section id, so a link and its target are the same value, and `club.test.ts` asserts the order.
