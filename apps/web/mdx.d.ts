declare module '*.mdx' {
  import type { MDXComponents } from 'mdx/types.js'
  import type { ReactElement } from 'react'

  /**
   * MDX compiles to a component taking an optional `components` map. Passing it
   * is the only reliable way to style a document that uses nothing but standard
   * HTML tags, because the MDX provider is only consulted for non-standard
   * element names.
   */
  const MDXComponent: (props: { components?: MDXComponents }) => ReactElement
  export default MDXComponent
}
