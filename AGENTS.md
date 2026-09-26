## Agent skills

### Issue tracker

Issues live in GitHub Issues, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles using the default label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Monorepo

Turborepo + pnpm workspaces. The Next.js app is the only package, at `apps/web`. Task definitions live in each package; the root only delegates.

- `pnpm dev` / `pnpm build` / `pnpm start` / `pnpm typecheck` → `turbo run <task>`
- `pnpm lint` / `pnpm lint:fix` → `ultracite`, run from the root because the config is repo-wide

## Quality gate

oxlint + oxfmt + ultracite, satisfying **every** rule. No per-file exceptions, no suppression comments. If a rule is genuinely wrong here, change `oxlint.config.ts` in its own reviewed commit — never silence a rule to make CI green. See [ADR-0001](docs/adr/0001-full-ultracite-strict-despite-shadcn-fork.md).

`shadcn add` output will not pass as generated. Fix the new component; do not suppress it.

`next build` runs the TypeScript compiler — `typescript.ignoreBuildErrors` is deliberately not set. CI runs lint, typecheck and build on every PR.
