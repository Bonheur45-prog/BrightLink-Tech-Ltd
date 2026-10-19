import type { ContactPageData } from './types'

export const DEFAULT_CONTACT_PAGE: ContactPageData = {
  banner: {
    eyebrow: 'Let’s start a conversation',
    heading: 'We’re here to help you move forward.',
    intro: 'Tell us what you’re working on. Our team will help you find the right next step.',
    image: null,
  },
  form: {
    heading: 'Tell us about your project',
    intro: 'Share a few details and we’ll get back to you within one working day.',
    backgroundImage: null,
  },
  subscribe: {
    enabled: true,
    heading: 'Stay in the loop',
    text: 'Occasional ideas and updates from BrightLink, delivered straight to your inbox.',
    buttonLabel: 'Subscribe',
  },
  seo: { metaTitle: '', metaDescription: '', ogImage: null },
}
