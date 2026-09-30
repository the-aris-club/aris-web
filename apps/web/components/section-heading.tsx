import { PixelIcon } from '@/components/pixel-icon'
import { RevealText } from '@/components/reveal-text'
import { Tag } from '@/components/tag'

// The icon, pill and title that open every section on the landing page. Five
// sections used to write this block out by hand, which is how the Groups title
// ended up one size larger than the other four: nothing in the markup recorded
// that the size was meant to be the same, so one section drifted.
//
// Two layouts, because the two shapes genuinely differ in what they hold: the
// stacked heading runs a lede under the title, the split one puts a short aside
// beside it. Two components rather than one with a `split` boolean — a flag
// would carry the entire meaning of which shape you get and nothing else, and
// nothing would stop the two children being passed to the wrong one.
//
// The title classes are deliberately not a prop. Per-call-site overrides are
// how the five copies drifted in the first place.

interface SectionHeadingProps {
  icon: 'platform' | 'agents' | 'workflow' | 'integrations'
  tag: string
  title: string
}

// Shared core. The two layouts below differ only in what wraps this and what
// sits beside it.
const Heading = ({ icon, tag, title }: SectionHeadingProps) => (
  <>
    <PixelIcon type={icon} />
    <div className="mt-4">
      <Tag>{tag}</Tag>
    </div>
    <RevealText className="mt-5 text-4xl leading-[1.05] font-light tracking-tight md:text-5xl">
      {title}
    </RevealText>
  </>
)

// Lede under the title, on the full measure of the section.
export const SectionHeading = ({
  icon,
  lede,
  tag,
  title,
}: SectionHeadingProps & { lede?: string }) => (
  <div className="mb-16">
    <Heading icon={icon} tag={tag} title={title} />
    {lede ? (
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-black/45">
        {lede}
      </p>
    ) : null}
  </div>
)

// Aside beside the title, sharing its baseline. For an aside that is a single
// sentence and a title short enough to leave it room.
export const SplitSectionHeading = ({
  aside,
  icon,
  tag,
  title,
}: SectionHeadingProps & { aside: string }) => (
  <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
    <div>
      <Heading icon={icon} tag={tag} title={title} />
    </div>
    <p className="max-w-xs text-sm leading-relaxed text-black/45">{aside}</p>
  </div>
)
