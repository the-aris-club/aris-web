// The .js extension is required: that is the specifier @mdx-js/react itself
// uses internally, and the bare "mdx/types" form does not resolve.
import type { MDXComponents } from 'mdx/types.js'
import type { ReactNode } from 'react'

// Prose styling for the Community Terms. The source document is plain Markdown
// with sixteen `##` sections and no tables, so the work here is entirely
// typographic: a readable measure, a real heading hierarchy, and links that
// look like links.

interface HeadingProps {
  children?: ReactNode
}

const SectionHeading = ({ children }: HeadingProps) => (
  <h2 className="text-aris-ink mt-16 mb-4 scroll-mt-28 border-t border-black/[0.07] pt-10 text-2xl font-medium">
    {children}
  </h2>
)

export const components: MDXComponents = {
  a: ({ children, ...props }) => (
    <a
      className="text-aris-blue underline underline-offset-4 hover:opacity-75"
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-aris-blue/20 bg-aris-blue/[0.04] my-8 rounded-2xl border px-6 py-5 text-base leading-relaxed text-black/70">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-black/[0.05] px-1.5 py-0.5 font-mono text-[0.9em]">
      {children}
    </code>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }: HeadingProps) => (
    <h1 className="text-4xl leading-tight font-light md:text-5xl">
      {children}
    </h1>
  ),
  h2: SectionHeading,
  h3: ({ children }: HeadingProps) => (
    <h3 className="mt-10 mb-3 text-lg font-medium">{children}</h3>
  ),
  hr: () => <hr className="my-12 border-black/[0.07]" />,
  li: ({ children }) => (
    <li className="my-1.5 pl-1 leading-relaxed">{children}</li>
  ),
  ol: ({ children }) => (
    <ol className="my-5 list-decimal space-y-1.5 pl-6 text-black/70">
      {children}
    </ol>
  ),
  p: ({ children }) => (
    <p className="my-5 leading-relaxed text-black/70">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="text-aris-ink font-medium">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="my-5 list-disc space-y-1.5 pl-6 text-black/70">
      {children}
    </ul>
  ),
}

// Next.js App Router looks for this export in the project root.
export const useMDXComponents = (provided: MDXComponents): MDXComponents => ({
  ...components,
  ...provided,
})
