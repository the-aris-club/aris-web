import type { ReactNode } from 'react'

// The pill that labels a section or a department. It was written out twice —
// once in the landing page and once in the department cards — and the two
// copies had already drifted, so the gap between pill and label was declared
// on one and not the other even though both render text alone. One component,
// one class list.
//
// No gap: nothing is ever placed beside the label. Add one back here if
// something with an icon in it ever needs the pill.
export const Tag = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center rounded-full bg-black/[0.04] px-3 py-1 font-sans text-[11px] tracking-widest text-black/40">
    {children}
  </span>
)
