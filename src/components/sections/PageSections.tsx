import type { ReactNode } from 'react'

import type { LivePage } from '@/lib/content/live-pages'
import { BannerSection } from './BannerSection'
import { ContactSection } from './ContactSection'
import { FeaturesSection, NewsletterSection } from './FeaturesSection'
import { HeroSection, HighlightsSection } from './HeroSection'
import { ClientsSection, CtaSection, FaqSection, GlanceSection, MissionSection, RichTextSection, TeamSection } from './MoreSections'
import { PostsSection } from './PostsSection'
import { ProjectsSection } from './ProjectsSection'
import { ServicesSection } from './ServicesSection'
import { planSections, startsWithTitle, type Plan } from './plan'
import { makeCtx, type SectionCtx } from './shared'
import { TextMediaSection } from './TextMediaSection'

function render(plan: Plan, ctx: SectionCtx): ReactNode {
  const props = { section: plan.section, ctx }
  switch (plan.section.type) {
    case 'hero':
      return <HeroSection {...props} highlights={plan.partner} />
    case 'banner':
      return <BannerSection {...props} />
    case 'highlights':
      return <HighlightsSection {...props} />
    case 'textMedia':
      return <TextMediaSection {...props} />
    case 'services':
      return <ServicesSection {...props} />
    case 'projects':
      return <ProjectsSection {...props} />
    case 'features':
      return <FeaturesSection {...props} newsletter={plan.partner} />
    case 'mission':
      return <MissionSection {...props} />
    case 'glance':
      return <GlanceSection {...props} />
    case 'clients':
      return <ClientsSection {...props} />
    case 'team':
      return <TeamSection {...props} />
    case 'faq':
      return <FaqSection {...props} />
    case 'cta':
      return <CtaSection {...props} />
    case 'contact':
      return <ContactSection {...props} />
    case 'newsletter':
      return <NewsletterSection {...props} />
    case 'posts':
      return <PostsSection {...props} />
    case 'richText':
      return <RichTextSection {...props} />
    default:
      return null // a type this version does not know (the parser drops these already)
  }
}

/** Draws a page built in /admin/pages, section by section, in the editor's order. */
export function PageSections({ page, ctx, title }: { page: LivePage; ctx: Omit<Parameters<typeof makeCtx>[0], 'media'>; title: string }) {
  const base = makeCtx({ ...ctx, media: page.media })
  const plans = planSections(page.doc.sections)
  return (
    <>
      {/* every page needs exactly one H1; without a hero or banner first, it is the page title */}
      {!startsWithTitle(page.doc.sections) && <h1 className="sr-only">{title}</h1>}
      {plans.map((plan) => (
        <div key={plan.section.id} className="contents">
          {render(plan, { ...base, anchor: plan.anchor, first: plan.first, afterHero: plan.afterHero })}
        </div>
      ))}
    </>
  )
}
