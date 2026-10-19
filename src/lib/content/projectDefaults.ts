import type { ProjectsPageData } from './types'

/** Starter text for the Our Projects page. Everything is editable in /admin → Pages → Our Projects Page. */
export const DEFAULT_PROJECTS_PAGE: ProjectsPageData = {
  banner: {
    eyebrow: 'Our Projects',
    heading: 'Systems and websites we have built — and what we are building next',
    intro:
      'See the software, websites and digital work BrightLink has completed for organisations in Rwanda, and follow the projects we are building right now.',
    image: null,
  },
  completed: {
    heading: 'Completed projects',
    intro: 'Delivered and in use. Open a project for details, or visit the live site where there is one.',
  },
  inProgress: {
    heading: 'Projects in progress',
    intro: 'Being built right now. The bar shows how far along each project is.',
  },
  closing: {
    enabled: true,
    heading: 'Have a project in mind?',
    text: 'Tell us what you want to build and we will discuss how to make it happen.',
    primaryCta: { label: 'Start a project', url: '/#get-in-touch', newTab: false },
    secondaryCta: { label: 'Explore our services', url: '/our-services', newTab: false },
  },
  seo: { metaTitle: '', metaDescription: '', ogImage: null },
}
