import { components } from '@/mdx-components'

import Terms from './terms.mdx'

/**
 * The Community Terms are authored as MDX so the Founding Group can edit the
 * wording without touching TSX. See the layout beside this file for the
 * provenance note and the version banner.
 *
 * The component map is passed as a prop rather than through MDXProvider, and
 * that is the only thing that works here. MDX's provider is consulted only when
 * a file uses an element name that is not a standard HTML tag. This document
 * uses nothing but h1, h2, p, ul, li, em, strong and a, so the provider is
 * never called and the page renders as bare HTML no matter how it is wired.
 * `props.components` is the path that always applies.
 *
 * Three other mechanisms were tried first and each failed silently rather than
 * loudly, which is why they are listed:
 * - the loader `providerImportSource` option, because Turbopack accepts a rule's
 *   `options` key and never passes it to the loader, so the build succeeds even
 *   when the value names a module that does not exist
 * - the App Router root `mdx-components.tsx` convention, because next-mdx wires
 *   it through a resolveAlias to a turbopack-next module that is not on npm
 * - a `mdx.config.js` in apps/web, not found from the configured turbopack root
 *   which is two directories up
 *
 * The page is a server component. It carries no 'use client' directive and uses
 * no hooks: the component map is a module of plain function components and the
 * document is static MDX. The directive that used to sit at the top of this
 * file did nothing except opt the whole page out of the server, which is the
 * opposite of what the note above it claimed.
 */
const CommunityTermsPage = () => <Terms components={components} />

export default CommunityTermsPage
