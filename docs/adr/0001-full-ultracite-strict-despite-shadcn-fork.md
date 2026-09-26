# Full ultracite strict, even though it forks shadcn/ui from upstream

We adopted oxlint + oxfmt + ultracite as the repo-wide quality gate and chose to satisfy **every** rule with no per-file exceptions and no suppression comments, accepting that this pulls `apps/web/components/ui/*` away from the shadcn/ui shapes upstream ships. `eslint(func-style)` and `react(function-component-definition)` alone accounted for 634 of the original 1268 findings, and satisfying them means rewriting component and function declarations in vendored shadcn files.

## Considered Options

- **Disable the two rules that fight the shadcn idiom, keep the rest strict.** Recommended during setup; would have left ~228 findings to fix. Rejected in favour of consistency with the rest of the workspace, where TaxEasy-Platform, Ecopick-Platform and XaDaoXa all run ultracite without rule carve-outs.
- **Baseline the remainder as per-file ignores.** Rejected: parked findings tend never to be revisited.
- **Keep Prettier for formatting and add oxlint for linting.** Rejected because ultracite's own `doctor` lists Prettier as a conflicting tool, and two formatters in one repo disagree.

## Consequences

- **Running `shadcn add` will reintroduce violations.** The generated component must be fixed to pass, not suppressed. This is the ongoing cost of this decision and the thing most likely to make someone reconsider it.
- `apps/web/components/ui/*` is now a fork. Upstream diffs will not apply cleanly.
- A repo-wide gate is a root script, not a turbo task: `pnpm lint` runs `ultracite check --max-warnings=0` directly, because the config lives at the root and covers all packages. Only `typecheck` and `build` go through turbo, since those are genuine per-package tasks.
- **Never add a suppression to make CI green.** If a rule is wrong for this codebase, change `oxlint.config.ts` in its own reviewed commit instead.
