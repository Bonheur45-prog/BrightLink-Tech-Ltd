/**
 * The SEO checklist shown to editors while they write an article (see components/admin/SeoAssistant).
 * Pure functions, no server dependencies, so the same logic can run in the admin form and in tests.
 */

export type SeoInput = {
  title: string
  excerpt: string
  slug: string
  focusKeyword: string
  metaTitle: string
  metaDescription: string
  hasImage: boolean
  /** plain text of the article body */
  text: string
  headings: number
  internalLinks: number
}

export type SeoCheck = { id: string; label: string; status: 'good' | 'warn' | 'bad'; hint: string }

const has = (haystack: string, needle: string) => haystack.toLowerCase().includes(needle.toLowerCase())
const words = (t: string) => t.split(/\s+/).filter(Boolean).length

/** What Google will most likely show, using the same fallbacks the website uses. */
export function effectiveSeo(i: Pick<SeoInput, 'title' | 'excerpt' | 'metaTitle' | 'metaDescription'>) {
  return {
    title: (i.metaTitle || i.title || 'Article title').trim(),
    description: (i.metaDescription || i.excerpt || '').trim(),
  }
}

export function analyzeSeo(i: SeoInput): { checks: SeoCheck[]; score: number; total: number } {
  const { title, description } = effectiveSeo(i)
  const kw = i.focusKeyword.trim()
  const firstPart = i.text.split(/\s+/).slice(0, 120).join(' ')
  const wc = words(i.text)
  const checks: SeoCheck[] = []
  const add = (id: string, label: string, ok: boolean, hint: string, warn = false) =>
    checks.push({ id, label, status: ok ? 'good' : warn ? 'warn' : 'bad', hint })

  add('title-len', 'Google title length', title.length >= 30 && title.length <= 60, `Now ${title.length} characters. Aim for 30–60 so it is not cut off.`, title.length > 0)
  add('desc-len', 'Google description length', description.length >= 120 && description.length <= 160, `Now ${description.length} characters. Aim for 120–160.`, description.length > 0)
  add('image', 'Featured picture added', i.hasImage, 'Add a featured picture: it appears on cards and when the article is shared.', false)
  add('length', 'Enough content', wc >= 300, `About ${wc} words. Articles of 300+ words rank and read better.`, wc >= 150)
  add('headings', 'Sections with headings', i.headings >= 2, 'Break the article up with at least two Heading 2 sections.', i.headings === 1)
  add('links', 'Links to your own pages', i.internalLinks >= 1, 'Link to a service or project page (for example /our-services/website-design).', false)
  add('slug', 'Short web address', i.slug.length > 0 && i.slug.length <= 75, 'Keep the address short and descriptive.', i.slug.length > 75)

  if (!kw) {
    add('keyword', 'Focus keyword chosen', false, 'Type the phrase people would search for in the “Focus keyword” box below.', true)
  } else {
    add('kw-title', 'Keyword in the Google title', has(title, kw), `Use “${kw}” in the Google title.`)
    add('kw-desc', 'Keyword in the Google description', has(description, kw), `Mention “${kw}” in the description.`, true)
    add('kw-intro', 'Keyword in the opening paragraph', has(firstPart, kw), `Use “${kw}” within the first few sentences.`, true)
    add('kw-slug', 'Keyword in the web address', has(i.slug, kw.replace(/\s+/g, '-')), `Include “${kw.replace(/\s+/g, '-')}” in the address (slug).`, true)
  }
  const score = checks.filter((c) => c.status === 'good').length
  return { checks, score, total: checks.length }
}
