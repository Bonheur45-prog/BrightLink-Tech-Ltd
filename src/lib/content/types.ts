/**
 * View-models used by the public website.
 * Payload documents are normalised into these shapes (see normalize.ts) so components never
 * deal with nulls, relationship ids or missing fields.
 */

export type MediaRef = {
  url: string
  alt: string
  width?: number
  height?: number
  mimeType?: string
  /** videos only: still picture shown before the video plays */
  poster?: string
}

export type Cta = { label: string; url: string; newTab: boolean }

export type SocialLink = { platform: string; url: string }

export type SiteSettingsData = {
  companyName: string
  legalName: string
  tagline: string
  logo: MediaRef | null
  logoLight: MediaRef | null
  footerDescription: string
  phone: string
  secondaryPhone: string
  email: string
  address: { street: string; city: string; country: string; countryCode: string }
  openingHours: string
  socials: SocialLink[]
  seo: {
    defaultTitle: string
    titleTemplate: string
    defaultDescription: string
    defaultOgImage: MediaRef | null
    googleSiteVerification: string
    /** Google Analytics 4 measurement ID ("G-…"), or empty for none. */
    googleAnalyticsId: string
  }
  /** Keys from src/lib/fonts.ts */
  headingFont: string
  bodyFont: string
  smoothScroll: boolean
  parallax: boolean
  enabledLocales: ('en' | 'fr' | 'rw')[]
  /** The language these settings were loaded in (the language of the page being shown). */
  locale: 'en' | 'fr' | 'rw'
}

export type NavChild = { label: string; url: string; description: string }
export type NavItem = {
  label: string
  url: string
  newTab: boolean
  children: NavChild[]
}

export type HeaderData = {
  navItems: NavItem[]
  cta: Cta | null
  topBar: {
    enabled: boolean
    message: string
    showPhone: boolean
    showEmail: boolean
    showSocials: boolean
  }
  sticky: boolean
  transparentOnHero: boolean
}

export type HeroSlide = {
  id: string
  mediaType: 'image' | 'video' | 'none'
  image: MediaRef | null
  video: MediaRef | null
  poster: MediaRef | null
  eyebrow: string
  heading: string
  highlightText: string
  subheading: string
  primaryCta: Cta | null
  secondaryCta: Cta | null
  textAlign: 'left' | 'center'
  overlay: 'light' | 'medium' | 'strong'
  durationSeconds: number | null
}

export type HeroData = {
  enabled: boolean
  autoplay: boolean
  intervalSeconds: number
  height: 'full' | 'large' | 'medium'
  kenBurns: boolean
  showArrows: boolean
  showDots: boolean
  showProgress: boolean
  slides: HeroSlide[]
}

export type Highlight = { title: string; text: string; url: string }

export type Feature = { icon: string; title: string; text: string }

export type WhoWeAreData = {
  enabled: boolean
  eyebrow: string
  heading: string
  highlightText: string
  paragraphs: string[]
  features: Feature[]
  image: MediaRef | null
  badge: string
  primaryCta: Cta | null
  secondaryCta: Cta | null
  learnMore: Cta | null
}

export type WhatWeDoData = {
  enabled: boolean
  eyebrow: string
  heading: string
  intro: string
  learnMoreLabel: string
  viewAll: Cta | null
}

export type WhyData = {
  enabled: boolean
  eyebrow: string
  heading: string
  message: string
  backgroundImage: MediaRef | null
  points: Feature[]
  cta: Cta | null
  newsletter: { enabled: boolean; heading: string; text: string; buttonLabel: string }
}

export type PortfolioData = {
  enabled: boolean
  eyebrow: string
  heading: string
  intro: string
  limit: number
  viewAll: Cta | null
}

export type ClientsData = { enabled: boolean; eyebrow: string; heading: string; intro: string }

export type ContactData = {
  enabled: boolean
  eyebrow: string
  heading: string
  intro: string
  formTitle: string
  showForm: boolean
}

export type HomePageData = {
  hero: HeroData
  highlights: Highlight[]
  whoWeAre: WhoWeAreData
  whatWeDo: WhatWeDoData
  why: WhyData
  portfolio: PortfolioData
  clients: ClientsData
  contact: ContactData
  seo: { metaTitle: string; metaDescription: string; ogImage: MediaRef | null }
}

/* ---- collections */

export type ServiceItem = {
  id: string
  title: string
  slug: string
  url: string
  icon: string
  shortDescription: string
  features: string[]
  showOnHome: boolean
  image: MediaRef | null
}

export type ProjectItem = {
  id: string
  title: string
  slug: string
  url: string
  category: string
  shortDescription: string
  image: MediaRef | null
  externalUrl: string
  showOnHome: boolean
  /** slug of the service this project belongs to ('' when not linked) */
  serviceSlug: string
  status: 'completed' | 'in-progress'
  /** 0–100; always 100 for completed projects */
  progress: number
}

/** Everything shown on one project page (/our-projects/<slug>). */
export type ProjectDetail = ProjectItem & {
  paragraphs: string[]
  highlights: string[]
  gallery: MediaRef[]
  serviceTitle: string
  seo: { metaTitle: string; metaDescription: string; ogImage: MediaRef | null }
}

export type ProjectsPageData = {
  banner: { eyebrow: string; heading: string; intro: string; image: MediaRef | null }
  completed: { heading: string; intro: string }
  inProgress: { heading: string; intro: string }
  closing: { enabled: boolean; heading: string; text: string; primaryCta: Cta | null; secondaryCta: Cta | null }
  seo: { metaTitle: string; metaDescription: string; ogImage: MediaRef | null }
}

export type ClientItem = { id: string; name: string; logo: MediaRef | null; website: string }

export type FooterData = {
  quickLinks: { label: string; url: string; newTab: boolean }[]
  showServices: boolean
  copyrightText: string
  legalLinks: { label: string; url: string }[]
}

/* ---- About Us page */

export type AboutData = {
  banner: { eyebrow: string; heading: string; intro: string; image: MediaRef | null }
  story: {
    enabled: boolean
    eyebrow: string
    heading: string
    highlightText: string
    paragraphs: string[]
    points: string[]
    image: MediaRef | null
    secondImage: MediaRef | null
    badge: string
    cta: Cta | null
  }
  glance: { enabled: boolean; heading: string }
  mission: {
    enabled: boolean
    eyebrow: string
    heading: string
    missionTitle: string
    missionText: string
    visionTitle: string
    visionText: string
    valuesHeading: string
    values: Feature[]
  }
  process: {
    enabled: boolean
    eyebrow: string
    heading: string
    intro: string
    steps: { title: string; text: string }[]
  }
  services: { enabled: boolean; eyebrow: string; heading: string; intro: string }
  team: {
    enabled: boolean
    eyebrow: string
    heading: string
    intro: string
    groupPhoto: MediaRef | null
    emptyMessage: string
    cta: Cta | null
  }
  showClients: boolean
  closing: {
    enabled: boolean
    heading: string
    text: string
    primaryCta: Cta | null
    secondaryCta: Cta | null
  }
  seo: { metaTitle: string; metaDescription: string; ogImage: MediaRef | null }
}

export type TeamMember = {
  id: string
  name: string
  role: string
  bio: string
  photo: MediaRef | null
  email: string
  linkedin: string
}

/* ---- Services */

export type IconCard = { icon: string; title: string; text: string }

export type ServiceClient = { name: string; note: string; logo: MediaRef | null; website: string }

/** Everything shown on one service page (/our-services/<slug>). */
export type ServiceDetail = ServiceItem & {
  banner: { heading: string; intro: string; image: MediaRef | null }
  overview: { eyebrow: string; heading: string; highlightText: string; paragraphs: string[]; image: MediaRef | null }
  offerings: { heading: string; intro: string; items: IconCard[] }
  /** null = use the shared "Why choose us" section from the Our Services page settings */
  why: { heading: string; message: string; image: MediaRef | null; points: IconCard[] } | null
  process: { heading: string; intro: string; steps: { title: string; text: string }[] }
  work: { heading: string; intro: string }
  clientsServed: ServiceClient[]
  /** names used to find logos in Content → Clients when no clients are chosen in the CMS */
  clientsServedFallback: { name: string; note: string }[]
  clientsHeading: string
  faqs: { question: string; answer: string }[]
  cta: { heading: string; text: string; primaryCta: Cta | null; secondaryCta: Cta | null }
  seo: { metaTitle: string; metaDescription: string; ogImage: MediaRef | null }
}

export type ServicesPageData = {
  banner: { eyebrow: string; heading: string; intro: string; image: MediaRef | null }
  listing: { eyebrow: string; heading: string; intro: string }
  why: { enabled: boolean; eyebrow: string; heading: string; message: string; image: MediaRef | null; points: IconCard[] }
  showProjects: boolean
  closing: { enabled: boolean; heading: string; text: string; primaryCta: Cta | null; secondaryCta: Cta | null }
  seo: { metaTitle: string; metaDescription: string; ogImage: MediaRef | null }
}

/* ---- Blog */

/** A piece of article text. Rich text from the CMS is converted into these simple blocks (see richtext.ts). */
export type Inline = { text: string; bold?: boolean; italic?: boolean; code?: boolean; href?: string; newTab?: boolean }

export type Block =
  | { type: 'h2' | 'h3'; id: string; inlines: Inline[] }
  | { type: 'p' | 'quote'; inlines: Inline[] }
  | { type: 'ul' | 'ol'; items: Inline[][] }
  | { type: 'image'; url: string; alt: string; caption: string }
  | { type: 'hr' }

export type CategoryColor = 'orange' | 'teal' | 'blue' | 'green' | 'navy'

export type BlogCategory = {
  id: string
  name: string
  slug: string
  url: string
  description: string
  icon: string
  color: CategoryColor
  count: number
  seo: { metaTitle: string; metaDescription: string }
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  url: string
  excerpt: string
  image: MediaRef | null
  category: { name: string; slug: string; color: CategoryColor; icon: string } | null
  tags: string[]
  author: { name: string; role: string; photo: MediaRef | null }
  /** ISO date-time */
  publishedAt: string
  readingMinutes: number
  featured: boolean
  seo: {
    metaTitle: string
    metaDescription: string
    ogImage: MediaRef | null
    focusKeyword: string
    canonicalUrl: string
    noIndex: boolean
  }
}

export type BlogPostFull = BlogPost & { blocks: Block[] }

/** One heading in an article's table of contents. */
export type TocItem = { id: string; text: string; level: 2 | 3 }

/**
 * An article as the public site shows it: the safe HTML rendered when it was saved in the CMS
 * (src/lib/blog/render.ts: only allowed tags, attributes, colours, fonts and library photos).
 */
export type BlogArticle = BlogPost & { html: string; toc: TocItem[] }

export type BlogPageData = {
  banner: { eyebrow: string; heading: string; intro: string; image: MediaRef | null }
  postsPerPage: number
  latestHeading: string
  subscribe: { enabled: boolean; heading: string; text: string; buttonLabel: string }
  seo: { metaTitle: string; metaDescription: string; ogImage: MediaRef | null }
}

export type ContactPageData = {
  banner: { eyebrow: string; heading: string; intro: string; image: MediaRef | null }
  form: { heading: string; intro: string; backgroundImage: MediaRef | null }
  subscribe: { enabled: boolean; heading: string; text: string; buttonLabel: string }
  seo: { metaTitle: string; metaDescription: string; ogImage: MediaRef | null }
}
