# Landing page rollout

`apps/web` was a landing page for a fictional AI-agent SaaS called Agentic. It is now the public page for The Aris Club. The instruction was to keep the existing layout and replace only the content, so every section, class name and animation is unchanged; what changed is the text, the figures, the images, the links and the metadata.

## What each section now says, and where it came from

Every string on the page is quoted from a document the club already has in English. Where the only version of something is Vietnamese, it is absent rather than translated.

| Section | Was | Now | Source |
| --- | --- | --- | --- |
| Intro | `AGENTIC` letters | `ARIS` | — |
| Hero headline | "Build & orchestrate AI agents while you sleep." | "We build systems that turn complexity into capability." | `brand-catalog.md` |
| Hero figures | 50M+ tasks, 99.9% uptime, 180+ countries | 4 departments, 3 rounds, 4-week window | charter, form description |
| Hero media | unrelated stock video | the club's own banner, cropped to the lab scene | supplied artwork |
| Departments | Visual Agent Builder, Real-time Monitoring, Memory & Context, Guardrails | Autonomous Systems, Robotics, IoT, Software | `server-orientation.md` |
| Selection | 4 plug-and-play agent types, 2.4M tasks, 98.2% accuracy | 3 real rounds, Application review / Interview / Skills test | `FormBuilder.gs`, `recruitment-flow.md` |
| Window | Define, Compose, Test, Deploy | Apply, Screening, Interview, Decision | `recruitment-flow.md` calendar |
| Tools | 200+ connectors, SDK code sample | Discord, GitHub, Forms, Sheets, Apps Script | `CONTEXT.md`, `automation/` |
| Privacy | SOC 2 Type II, GDPR, HIPAA Ready, ISO 27001, live audit trail | what the club never collects, from the Community Terms | `community-terms-of-use.md` §7 |
| Eligibility | npm install @agentic/sdk | four quotations about background and experience | `job-description/` |
| Marquee | 20 AI capabilities | departments and real operational capabilities | `operations-development.md` |
| CTA | fake email capture, "You're on the list" | a link to the live recruitment form | `FormBuilder.gs` |
| Footer | `AGENTIC`, four `href="#"` legal links | mark, real anchors, Terms, contact | — |

## Two sections removed rather than rewritten

- **Live agents.** The club has run zero activities. `docs/meetings/` and `docs/projects/` are README-only stubs, and the decision log has four entries. A live feed and a ticking counter cannot be filled with anything true.
- **Pricing.** Charter §8 forbids collecting fees or sponsorship before HSV confirms the club's right to do so, and no fee figure exists anywhere in the club repository. Three tiers cannot be filled in honestly.

Everything else kept the original layout, including the bento proportions, the scroll-stacked cards, the auto-advancing panel, the marquee and the pixel icons.

## What is still not on the page, and why

- **The three priority domains, healthcare, education and law.** Only a Vietnamese original exists, in `README.md` and ADR-0001. The page therefore never says which problems the club works on. This is the largest single gap.
- **The six charter principles and the L0–L5 learning ladder.** Vietnamese only, for the same reason.
- **Operations and Development** appears only in the marquee, because `club-org-chart.md` is explicit that it is a capability pool rather than a fifth technical department, and the Departments section has room for exactly four.

Closing any of these needs the club to publish an English original first. A translation made here would be a second source of truth, which is the thing the club's own documents forbid.

## Held back deliberately

- **Blog and events sections.** No blog exists and no event has been held. They are not placeholders on the page.
- **Sponsorship copy.** The page does not ask for money. Charter §8 has not been satisfied.
- **A "not yet an official HCMIU club" banner.** Omitted by decision. The constraint is met the other way round: the page makes no HCMIU claim anywhere, which is what the charter actually prohibits, rather than disclaiming one.

## Files

- `app/page.tsx`, `app/layout.tsx`, `app/globals.css` — content, metadata, font
- `components/intro-animation.tsx`, `mobile-nav.tsx`, `stacking-agent-cards.tsx`, `devex-section.tsx`, `reveal-text.tsx` — content only
- `app/legal/community-terms/` — the Community Terms, MDX plus a layout
- `app/icon.png`, `app/apple-icon.png`, `app/opengraph-image.jpg` — from the logo
- `public/brand/` — logo, mark, banner, hero crop
- `tools/build-brand-assets.py` — regenerates all of the above from source

## Regenerating the brand assets

```sh
python3 tools/build-brand-assets.py \
  ~/Downloads/aris-logo.png apps/web/public/brand \
  apps/web/app ~/Downloads/aris-banner.png
```

Requires Pillow and numpy, which are not project dependencies because this runs by hand. The script measures the mark and wordmark bands from the alpha channel, so a resized or re-cropped logo will not be sliced at the wrong rows.
