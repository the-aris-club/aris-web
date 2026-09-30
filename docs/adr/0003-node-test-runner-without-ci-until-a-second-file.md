# node --test, and no CI step until a second test file exists

The repository's first test runs on the test runner built into Node, with no test dependency, and is not yet wired into CI. There is no `test` script, no turbo task and no workflow step.

## Considered Options

- **Vitest in `apps/web` with a `test` task through turbo and a CI step.** The conventional choice, and it is what a test suite in a Next.js app usually looks like. Rejected for now because there is one test file and the DOM-shaped tests that would justify Vitest do not exist yet: the deep candidate they would cover is the on-screen motion module, whose interface has not been decided. Adding a test framework now buys the ability to test in a DOM, which nothing currently needs, and costs a dependency in a repository whose whole quality story so far is a lint gate and a compiler.
- **Node's built-in runner with a `test` script and a turbo task from the start.** Strictly better than the option taken once there is more than one file, and it is what this will become. Rejected as premature: a turbo task and a CI step are two places to keep in step with the file list, and one test file does not justify either. It also puts `test` in the root scripts where it looks like a gate that runs, when it would not run on anything but a developer's machine.
- **Playwright or an end-to-end suite for the landing page.** The page's real risk is visual and behavioural: does a card reveal, does the mobile nav open, does the marquee connect. Rejected because a browser suite cannot check what the first test checks — that a nav href and a section id are the same value — and because the page's remaining logic is small. Revisit if the page gains interaction the compiler cannot see.

## Consequences

- **`apps/web/lib/club.test.ts` is run by hand**, with `node --test`, from `apps/web`. It must be typed correctly because `next build` runs the TypeScript compiler over it, and it must stay free of imports the `@/*` alias hides: it imports `./club.ts` relatively, since Node does not read `tsconfig.json` paths. A future test that needs a different module has to solve that first.
- **A test can pass locally and never be run.** This is the accepted cost. The assertions are narrow and behavioural — the section order, the four-department count, the quoted counts — so a test that has silently stopped running is a slow leak rather than a false guarantee, and the alternative is infrastructure for one file.
- **Adding the second test file carries this decision with it.** When a second test appears, add the `test` script, the turbo task and the CI step in the same change, and supersede this ADR rather than editing it.
- **The runner is chosen by what the tests need, not by convention.** Node strips the types natively on the current version, so a `.ts` test file needs no build step and no transform. A test that needs a DOM, module mocking or a watch mode is the signal to move to Vitest, and that signal is written down here so the next person does not add the dependency on a hunch.
