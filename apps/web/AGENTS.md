# apps/web

The Next.js app, and the only package. The root `AGENTS.md` is the parent and still applies — the monorepo, the quality gate, the issue tracker.

## Composition

Component rules, in the order they are worth breaking.

1. **No boolean props.** `isThread`, `isEditing`, `hasIcon` — each one doubles the state space and lands as a conditional somewhere. Add a component, not a flag.
2. **Name the shapes.** When a component would need a flag to tell two layouts apart, write the two layouts. `SectionHeading` and `SplitSectionHeading`, not `<SectionHeading split />`. Share the parts in a private core; let the variants differ only in what they wrap and what sits beside them.
3. **Nodes over paths.** A prop taking a filename, a class or a style is a prop that cannot express the one case that needed it. `BentoCard` took `image: string` and owned the whole crop, so the one card wanting a different anchor built its own image by hand. It takes `backdrop` now.
4. **Delete a dial nothing turns.** A prop with one value at every call site is a constant with a longer name. `RevealText` had five and no caller touched any of them. Per-call-site overrides are also how five copies of a heading drifted apart in the first place, which is why `SectionHeading`'s title classes are not a prop.
5. **One list, one home.** Data two components both render comes from one caller. `sectionLinks` is passed to `MobileNav` and to `Footer`, and the landing page passes one array to both.

**One exception, because rule 3 is not free.** `PixelIcon` takes a `type` union over four drawers rather than being four components, deliberately: `type` is in the effect deps, so a swap reallocates the canvas backing store — which resets the 2D context — and re-registers the shared `IntersectionObserver`. Do not split it.

`Footer`'s `sectionLinks` is the model for anything else page-specific: a slot the page fills, with the reason it has to be a slot written beside it.

## React 19

`ref` is a prop, not a `forwardRef` wrapper, and `use(Context)` replaces `useContext`. Neither appears in this app; do not reintroduce them.
