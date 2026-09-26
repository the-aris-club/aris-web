# aris-web

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo.

No deployment is configured yet. CI verifies (lint, typecheck, build) but does not deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_N2NcCuUUiZzyxPYcmnz5bSoR6Cw8)

## Getting Started

This is a pnpm monorepo. Install dependencies, then run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `apps/web/app/page.tsx`. The page auto-updates as you edit the file.

## Commands

| Command          | What it does                                            |
| ---------------- | ------------------------------------------------------- |
| `pnpm dev`       | Dev server on http://localhost:3000                     |
| `pnpm build`     | Production build (`turbo run build`)                    |
| `pnpm typecheck` | `tsc --noEmit` via turbo                                |
| `pnpm lint`      | ultracite — oxlint + oxfmt, every rule, no suppressions |
| `pnpm lint:fix`  | Applies every safe autofix, then formats                |
| `pnpm format`    | oxfmt only                                              |

CI runs lint, typecheck and build on every PR. A pre-commit hook formats staged files with oxfmt.

The lint gate is strict by choice — see [ADR-0001](docs/adr/0001-full-ultracite-strict-despite-shadcn-fork.md). In short: `shadcn add` output will not pass as generated, and the fix is to correct the component, never to suppress the rule.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
