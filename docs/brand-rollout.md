# Landing page rollout

`apps/web` was a landing page for a fictional AI-agent SaaS called Agentic. It is now the public page for The Aris Club. The instruction was to keep the existing layout and replace only the content, so every section, class name and animation is unchanged; what changed is the text, the figures, the images, the links and the metadata.

## What each section now says, and where it came from

Every string on the page is quoted from a document the club already has in English. Where the only version of something is Vietnamese, it is absent rather than translated.

| Section | Was | Now | Source |
| --- | --- | --- | --- |
| Intro | `AGENTIC` letters | `ARIS` | — |
| Hero headline | "Build & orchestrate AI agents while you sleep." | "We build systems that turn complexity into capability." | `brand-catalog.md` |
| Hero figures | 50M+ tasks, 99.9% uptime, 180+ countries | 4 technical departments, 5 groups, 0 fees charged | `server-orientation.md`, Community Terms §10 |
| Hero media | unrelated stock video | the club's own banner, cropped to the lab scene | supplied artwork |
| Departments | Visual Agent Builder, Real-time Monitoring, Memory & Context, Guardrails | Autonomous Systems, Robotics, IoT, Software | `server-orientation.md` |
| Automation | 4 plug-and-play agent types, 2.4M tasks, 98.2% accuracy | what a bot may assist with, may not decide, may not act | Community Terms §9 |
| Projects | Define, Compose, Test, Deploy | what every project has to name | Community Terms §11, §8, §6 |
| Tools | 200+ connectors, SDK code sample | the five services, and what each is for | `CONTEXT.md`, `automation/`, Community Terms §14 |
| Privacy | SOC 2 Type II, GDPR, HIPAA Ready, ISO 27001, live audit trail | what the club never collects, and what a sponsor does not control | Community Terms §7, §10 |
| Content and ownership | npm install @agentic/sdk | the four things the club will not do with your work | Community Terms §8 |
| Marquee | 20 AI capabilities | departments and real operational capabilities | `operations-development.md` |
| CTA | fake email capture, "You're on the list" | the decision-log statement, the Terms, and contact | Community Terms §11 |
| Footer | `AGENTIC`, four `href="#"` legal links | mark, real anchors, Terms, contact | — |

Recruitment content was removed from the landing page on request. The three sections that were about applying were replaced with the club's own operating rules, and the hero figures stopped counting rounds and windows. What survives is the word "recruitment" inside one quoted sentence, where it names one of eight decision types reserved to people, and the `APPLY` button in the nav.

### The Tools section is a grid, not an overlay

It started as a fixed-height 480px box with two glass cards absolutely positioned over the image, and that arrangement clipped itself: the card column measured 528px inside a 482px box, and `overflow-hidden` cut 63px off the top of the first card, taking its rounded corners with it. The image was also the full banner, which carries the club's own lockup and headline, so the section titled "The services we actually run" was showing a logo instead of any of its services.

It is now two grid cells. The cards sit in normal flow and `items-stretch` lets the image fill whatever height they take, so no content length can clip anything and there is no magic pixel value to re-tune. The image is the text-free lab crop so it supports the section rather than competing with it, and the card lists all five services, which is what the heading claims.

Keep the card column in normal flow. Moving it back to `absolute` reintroduces the bug the moment a line of text changes.

### The Projects section has four cards for five rules

Community Terms §11 lists five things every project must identify. The grid is four columns and changing that would alter the layout, so two of the five share a card with both item names printed verbatim beneath the title. The full list is at `/legal/community-terms`. If the layout is ever opened up, give the fifth one its own card.

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
- `app/legal/community-terms/terms.mdx` — the Community Terms, plain Markdown
- `app/legal/community-terms/page.tsx` — a thin client wrapper that supplies the component map
- `app/legal/community-terms/layout.tsx` — version banner and page chrome
- `mdx-components.tsx`, `mdx.d.ts` — the prose styles and the module declaration
- `app/icon.png`, `app/apple-icon.png`, `app/opengraph-image.jpg` — from the logo
- `public/brand/` — logo, mark, banner, hero crop
- `tools/build-brand-assets.py` — regenerates all of the above from source

### One thing to know before editing the Terms

The component map has to be passed to the MDX file as a `components` prop in `page.tsx`. Do not reach for `MDXProvider` or for a loader option instead, for two reasons that are not obvious.

MDX only consults its provider when a document uses an element name that is not a standard HTML tag. The Terms use nothing but `h1`, `h2`, `p`, `ul`, `li`, `em`, `strong` and `a`, so the provider is never called and the page renders as bare HTML however it is wired. `props.components` is the only path that applies.

Three other mechanisms look right and each fails **silently**, which is the reason this note exists:

- the loader `providerImportSource` option, because Turbopack accepts a rule's `options` key and then never passes it to the loader. The build succeeds even when the value names a module that does not exist.
- the App Router's root `mdx-components.tsx` convention, because `next-mdx` wires it through a `resolveAlias` to a `turbopack-next` module that is not published on npm.
- an `mdx.config.js` in `apps/web`, which is not found from the configured `turbopack.root`, two directories up.

If the page ever renders unstyled, check that the prop is still being passed before suspecting the styles.

## Regenerating the brand assets

```sh
python3 tools/build-brand-assets.py \
  ~/Downloads/aris-logo.png apps/web/public/brand \
  apps/web/app ~/Downloads/aris-banner.png
```

Requires Pillow and numpy, which are not project dependencies because this runs by hand. The script measures the mark and wordmark bands from the alpha channel, so a resized or re-cropped logo will not be sliced at the wrong rows.
