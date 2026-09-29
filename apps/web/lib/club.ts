// The club's own contact details, from recruitment-flow.md. Both are named in
// CONTEXT.md and both have to read identically everywhere they appear, which is
// why they live here rather than being written into each component that shows
// them: the landing page footer, the Apply block and the legal footer are three
// separate files, and a governance string that is copy-pasted into three is a
// governance string that will eventually disagree with itself.
//
// The mailbox is transitional and is not an official HCMIU address. The page
// says so out loud wherever it appears rather than implying otherwise, which is
// why the sentence is composed here too rather than reworded at each call site.

export const FORM_URL = 'https://forms.gle/RnSVePAY9JWeZsKn9'

export const CONTACT_EMAIL = 'thearisclub.hcmiu@gmail.com'

export const MAILBOX_NOTE = `${CONTACT_EMAIL} is a transitional service mailbox, not an official HCMIU address.`
