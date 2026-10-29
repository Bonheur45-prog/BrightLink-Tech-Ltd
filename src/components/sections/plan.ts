import type { Section } from '@/lib/pages/model'

// Pure (tested in plan.test.ts): how a page's sections are drawn — order, anchors, pairs, the page title.

/**
 * Anchor of each section type. Links elsewhere on the site rely on "#get-in-touch" (contact) and
 * "#team"; a type used twice on a page gets "-2", "-3"…
 */
const ANCHOR: Record<string, string> = {
  hero: 'top',
  banner: 'top',
  highlights: 'highlights',
  textMedia: 'story',
  services: 'services',
  projects: 'projects',
  features: 'features',
  mission: 'mission',
  glance: 'glance',
  clients: 'clients',
  team: 'team',
  faq: 'faq',
  cta: 'next-step',
  contact: 'get-in-touch',
  newsletter: 'newsletter',
  posts: 'articles',
  richText: 'text',
}

export type Plan = { section: Section; partner?: Section; anchor: string; first: boolean; afterHero: boolean }

/** Pure: which sections are drawn, in which order, with which anchor and partner. Exported for tests. */
export function planSections(sections: Section[]): Plan[] {
  const used = new Map<string, number>()
  const plans: Plan[] = []
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i]
    const next = sections[i + 1]
    const base = ANCHOR[s.type] ?? s.type
    const n = (used.get(base) ?? 0) + 1
    used.set(base, n)
    const plan: Plan = { section: s, anchor: n === 1 ? base : `${base}-${n}`, first: i === 0, afterHero: sections[i - 1]?.type === 'hero' }
    // Highlight cards right after the hero overlap its bottom edge; a newsletter right after a
    // "list beside a photo" sits beside the list (as on the original home page).
    if ((s.type === 'hero' && next?.type === 'highlights') || (s.type === 'features' && s.variant === 'list' && next?.type === 'newsletter')) {
      plan.partner = next
      i++
    }
    plans.push(plan)
  }
  return plans
}

/** The page's own <h1> comes from its first section when that is a hero or a banner. */
export const startsWithTitle = (sections: Section[]) => ['hero', 'banner'].includes(sections[0]?.type ?? '')
