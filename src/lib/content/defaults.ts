import type {
  AboutData,
  ClientItem,
  FooterData,
  HeaderData,
  HomePageData,
  ProjectItem,
  ServiceItem,
  SiteSettingsData,
} from './types'

/**
 * Starter content. It is used (1) as a safe fallback if the database is unreachable and
 * (2) by `npm run seed` to fill the CMS the first time. Everything here can be edited in /admin.
 *
 * Only statements BrightLink can stand behind are used: no invented statistics, clients or awards.
 */

export const DEFAULT_SETTINGS: SiteSettingsData = {
  companyName: 'BrightLink Technologies',
  legalName: 'BrightLink Technologies Ltd',
  tagline: 'Technology solutions that connect your business to what’s next.',
  logo: null,
  logoLight: null,
  footerDescription: '',
  phone: '+250 782 567 921',
  secondaryPhone: '+250 795 263 269',
  email: 'info@brightlinkltd.com',
  address: { street: '', city: 'Kigali', country: 'Rwanda', countryCode: 'RW' },
  openingHours: '',
  socials: [],
  seo: {
    defaultTitle: 'BrightLink Technologies | Technology Solutions in Kigali, Rwanda',
    titleTemplate: '%s | BrightLink Technologies',
    defaultDescription:
      'BrightLink Technologies Ltd builds websites, software and digital solutions that help businesses in Rwanda and beyond grow.',
    defaultOgImage: null,
    googleSiteVerification: '',
    googleAnalyticsId: '',
  },
  headingFont: 'outfit',
  bodyFont: 'inter',
  smoothScroll: true,
  parallax: true,
  enabledLocales: ['en'],
  locale: 'en',
}

/** Starter services (also used by the seed). Editable in /admin → Content → Services. */
export const STARTER_SERVICES_RAW = [
  {
    title: 'Software Development',
    slug: 'software-development',
    icon: 'code',
    shortDescription:
      'Custom management systems and business applications built around the way your organisation really works.',
    features: [
      'Property, hotel, employee and inventory systems',
      'Web and mobile applications',
      'Ongoing improvements and support',
    ],
    order: 10,
  },
  {
    title: 'Website Design',
    slug: 'website-design',
    icon: 'globe',
    shortDescription:
      'Professional, responsive websites that look sharp, load fast and are built to be found on Google.',
    features: ['Mobile-first, responsive design', 'SEO-ready structure', 'Easy-to-update content'],
    order: 20,
  },
  {
    title: 'Digital Marketing',
    slug: 'digital-marketing',
    icon: 'megaphone',
    shortDescription: 'Grow your visibility online and reach the customers who are looking for what you offer.',
    features: ['Search engine optimisation (SEO)', 'Social media and content', 'Campaigns you can measure'],
    order: 30,
  },
  {
    title: 'IT Support & Consultancy',
    slug: 'it-support-consultancy',
    icon: 'headset',
    shortDescription:
      'Practical IT support and expert advice to keep your technology running and aligned with your goals.',
    features: ['Troubleshooting and maintenance', 'Technology planning and advice', 'Equipment and network setup'],
    order: 40,
  },
]

export const STARTER_SERVICES: ServiceItem[] = STARTER_SERVICES_RAW.map((x, i) => ({
  id: `starter-service-${i}`,
  title: x.title,
  slug: x.slug,
  url: `/our-services/${x.slug}`,
  icon: x.icon,
  shortDescription: x.shortDescription,
  features: x.features,
  showOnHome: true,
  image: null,
}))

export const DEFAULT_HEADER: HeaderData = {
  navItems: [
    { label: 'Home', url: '/', newTab: false, children: [] },
    { label: 'About Us', url: '/about-us', newTab: false, children: [] },
    {
      label: 'Our Services',
      url: '',
      newTab: false,
      children: [
        { label: 'All services', url: '/our-services', description: 'Everything BrightLink offers' },
        ...STARTER_SERVICES_RAW.map((x) => ({
          label: x.title,
          url: `/our-services/${x.slug}`,
          description: x.shortDescription.split('.')[0],
        })),
      ],
    },
    { label: 'Our Projects', url: '/our-projects', newTab: false, children: [] },
    { label: 'Blog', url: '/blog', newTab: false, children: [] },
    { label: 'Contact Us', url: '/contact-us', newTab: false, children: [] },
  ],
  cta: { label: 'Request a Quote', url: '/contact-us', newTab: false },
  topBar: { enabled: true, message: '', showPhone: true, showEmail: true, showSocials: true },
  sticky: true,
  transparentOnHero: true,
}

/** Raw (CMS-shaped) starter slides, shared by the fallback and the seed script. */
export const STARTER_SLIDES = [
  {
    mediaType: 'none' as const,
    eyebrow: 'Technology company · Kigali, Rwanda',
    heading: 'Technology that links your business to what’s next',
    highlightText: 'links your business',
    subheading:
      'BrightLink Technologies builds websites, software and digital solutions that help organisations in Rwanda and beyond work smarter and grow faster.',
    primaryCta: { label: 'Explore our services', url: '/our-services', openInNewTab: false },
    secondaryCta: { label: 'Talk to our team', url: '/contact-us', openInNewTab: false },
    textAlign: 'left' as const,
    overlay: 'medium' as const,
  },
  {
    mediaType: 'none' as const,
    eyebrow: 'Software built around your operations',
    heading: 'Management systems that keep your business in control',
    highlightText: 'in control',
    subheading:
      'From property and hotel management to employee and inventory systems, we design software that fits the way you actually work.',
    primaryCta: { label: 'See our projects', url: '/our-projects', openInNewTab: false },
    secondaryCta: { label: 'Request a quote', url: '/contact-us', openInNewTab: false },
    textAlign: 'left' as const,
    overlay: 'medium' as const,
  },
  {
    mediaType: 'none' as const,
    eyebrow: 'Your digital presence',
    heading: 'Websites that look sharp and get found',
    highlightText: 'get found',
    subheading:
      'Fast, mobile-first websites built to be discovered on Google and to turn visitors into customers.',
    primaryCta: { label: 'Start a project', url: '/contact-us', openInNewTab: false },
    secondaryCta: { label: 'Read our blog', url: '/blog', openInNewTab: false },
    textAlign: 'left' as const,
    overlay: 'medium' as const,
  },
]


/* ------------------------------------------------------------------ home sections */

export const DEFAULT_WHO: HomePageData['whoWeAre'] = {
  enabled: true,
  eyebrow: 'Who We Are',
  heading: 'A Kigali technology partner that turns ideas into working solutions',
  highlightText: 'working solutions',
  paragraphs: [
    'BrightLink Technologies Ltd is a technology company based in Kigali, Rwanda. We design and build software, websites and digital solutions — and we support the people who use them.',
    'We listen first, then build practical technology that fits the way your organisation really works, so you can focus on growing.',
  ],
  features: [
    { icon: 'code', title: 'Custom software', text: 'Systems built around your operations.' },
    { icon: 'globe', title: 'Websites that perform', text: 'Fast, mobile-first and easy to find on Google.' },
    { icon: 'headset', title: 'Reliable IT support', text: 'Practical help whenever you need it.' },
    { icon: 'users', title: 'A partner, not just a vendor', text: 'Clear communication from first call to launch.' },
  ],
  image: null,
  badge: 'Kigali, Rwanda',
  primaryCta: { label: 'Start Conversation', url: '#get-in-touch', newTab: false },
  secondaryCta: { label: 'Connect with Team', url: '/about-us#team', newTab: false },
  learnMore: { label: 'Learn more about us', url: '/about-us', newTab: false },
}

export const DEFAULT_WHAT: HomePageData['whatWeDo'] = {
  enabled: true,
  eyebrow: 'What We Do',
  heading: 'Solutions that move your business forward',
  intro:
    'From custom software to everyday IT support, everything you need to work smarter — under one roof.',
  learnMoreLabel: 'Learn more',
  viewAll: null,
}

export const DEFAULT_WHY: HomePageData['why'] = {
  enabled: true,
  eyebrow: 'Why Work With Us',
  heading: 'Technology you can rely on, people you can talk to',
  message:
    'We combine technical skill with plain, honest communication — so you always know where your project stands and what it will deliver.',
  backgroundImage: null,
  points: [
    { icon: 'target', title: 'Built around your goals', text: 'We start with your business, not with technology.' },
    { icon: 'users', title: 'Clear communication', text: 'Straight answers and regular updates at every stage.' },
    { icon: 'shield', title: 'Support after launch', text: 'We stay available once your solution is live.' },
  ],
  cta: { label: 'Plan your project with us', url: '#get-in-touch', newTab: false },
  newsletter: {
    enabled: true,
    heading: 'Subscribe for our updates',
    text: 'News, tips and project stories from the BrightLink team. No spam.',
    buttonLabel: 'Subscribe',
  },
}

export const DEFAULT_PORTFOLIO: HomePageData['portfolio'] = {
  enabled: true,
  eyebrow: 'Our Portfolio',
  heading: 'Projects and systems we have built',
  intro: 'A selection of the solutions we have delivered for the organisations we work with.',
  limit: 6,
  viewAll: { label: 'View more projects', url: '/our-projects', newTab: false },
}

export const DEFAULT_CLIENTS: HomePageData['clients'] = {
  enabled: true,
  eyebrow: 'Our Happy Clients',
  heading: 'Trusted by the organisations we work with',
  intro: 'Click a logo to visit their website.',
}

export const DEFAULT_CONTACT: HomePageData['contact'] = {
  enabled: true,
  eyebrow: 'Get in Touch',
  heading: 'Let’s talk about your project',
  intro: 'Tell us what you need and our team will get back to you. You can also call or email us directly.',
  formTitle: 'Send us a message',
  showForm: true,
}

/**
 * Starter projects (also used by the seed). They list real work BrightLink has delivered; descriptions are kept
 * general — add screenshots and fuller descriptions in /admin → Content → Projects. `service` is the service slug.
 */
export type RawStarterProject = {
  title: string
  slug: string
  category: string
  service: string
  shortDescription: string
  externalUrl: string
  order: number
  /** defaults to 'completed' */
  status?: 'completed' | 'in-progress'
  /** 0–100, only for in-progress projects */
  progress?: number
  description?: string
}

export const STARTER_PROJECTS_RAW: RawStarterProject[] = [
  {
    title: 'StockPro',
    slug: 'stockpro',
    category: 'Software System',
    service: 'software-development',
    shortDescription: 'Inventory management system that tracks stock levels and movements so you always know what you have.',
    externalUrl: '',
    order: 10,
  },
  {
    title: 'CrewTrack',
    slug: 'crewtrack',
    category: 'Software System',
    service: 'software-development',
    shortDescription: 'Employee management system that keeps staff records and HR processes organised and easy to track.',
    externalUrl: '',
    order: 20,
  },
  {
    title: 'PMS — Property Management System',
    slug: 'property-management-system',
    category: 'Software System',
    service: 'software-development',
    shortDescription: 'Manage properties, tenants, leases and rent from one organised dashboard.',
    externalUrl: '',
    order: 30,
  },
  {
    title: 'HMS — Hotel Management System',
    slug: 'hotel-management-system',
    category: 'Software System',
    service: 'software-development',
    shortDescription: 'Handle bookings, rooms, guests and day-to-day hotel operations in one place.',
    externalUrl: '',
    order: 40,
  },
  {
    title: 'sagecltd.com',
    slug: 'sagecltd-com',
    category: 'Website',
    service: 'website-design',
    shortDescription: 'Company website designed and built for SAGEC Ltd.',
    externalUrl: 'https://sagecltd.com',
    order: 50,
  },
  {
    title: 'powerplustechnology.rw',
    slug: 'powerplustechnology-rw',
    category: 'Website',
    service: 'website-design',
    shortDescription: 'Company website designed and built for PowerPlus Technology Ltd.',
    externalUrl: 'https://powerplustechnology.rw',
    order: 60,
  },
  {
    title: 'nsi-monique.com',
    slug: 'nsi-monique-com',
    category: 'Website',
    service: 'website-design',
    shortDescription: 'Website designed and built by BrightLink.',
    externalUrl: 'https://nsi-monique.com',
    order: 70,
  },
  {
    title: 'gecoafrica.com',
    slug: 'gecoafrica-com',
    category: 'Website',
    service: 'website-design',
    shortDescription: 'Website designed and built by BrightLink.',
    externalUrl: 'https://gecoafrica.com',
    order: 80,
  },
  // Still being built: the progress figures are the ones BrightLink reported; edit them in /admin as work advances.
  {
    title: 'Hospital Management System',
    slug: 'hospital-management-system',
    category: 'Software System',
    service: 'software-development',
    shortDescription: 'A management system for hospitals, currently in development.',
    externalUrl: '',
    order: 110,
    status: 'in-progress',
    progress: 70,
  },
  {
    title: 'Public Transport Bus Tracking & Booking',
    slug: 'public-transport-bus-tracking-and-booking',
    category: 'Software System',
    service: 'software-development',
    shortDescription: 'A system for tracking public transport buses and booking seats, currently in development.',
    externalUrl: '',
    order: 120,
    status: 'in-progress',
    progress: 64,
  },
  {
    title: 'ComCoders',
    slug: 'comcoders',
    category: 'Software Platform',
    service: 'software-development',
    shortDescription:
      'A platform that connects young developers in Rwanda so they can share skills and get updates on new opportunities.',
    externalUrl: '',
    order: 130,
    status: 'in-progress',
    progress: 82,
  },
]

export const STARTER_PROJECTS: ProjectItem[] = STARTER_PROJECTS_RAW.map((x, i) => ({
  id: `starter-project-${i}`,
  title: x.title,
  slug: x.slug,
  url: `/our-projects/${x.slug}`,
  category: x.category,
  shortDescription: x.shortDescription,
  image: null,
  externalUrl: x.externalUrl,
  showOnHome: true,
  serviceSlug: x.service,
  status: x.status ?? 'completed',
  progress: x.status === 'in-progress' ? (x.progress ?? 0) : 100,
}))

export const STARTER_CLIENTS_RAW = [
  { name: 'PowerPlus Technology Ltd', order: 10 },
  { name: 'SAGEC Ltd', order: 20 },
  { name: 'Minimekix Forex', order: 30 },
  { name: 'NSI Group', order: 40 },
]

export const STARTER_CLIENTS: ClientItem[] = STARTER_CLIENTS_RAW.map((x, i) => ({
  id: `starter-client-${i}`,
  name: x.name,
  logo: null,
  website: '',
}))

export const DEFAULT_FOOTER: FooterData = {
  quickLinks: [
    { label: 'Home', url: '/', newTab: false },
    { label: 'About Us', url: '/about-us', newTab: false },
    { label: 'Our Services', url: '/our-services', newTab: false },
    { label: 'Our Projects', url: '/our-projects', newTab: false },
    { label: 'Blog', url: '/blog', newTab: false },
    { label: 'Contact Us', url: '/contact-us', newTab: false },
  ],
  showServices: true,
  copyrightText: '',
  legalLinks: [],
}

export const DEFAULT_HOME: HomePageData = {
  hero: {
    enabled: true,
    autoplay: true,
    intervalSeconds: 7,
    height: 'large',
    kenBurns: true,
    showArrows: true,
    showDots: true,
    showProgress: true,
    slides: STARTER_SLIDES.map((s, i) => ({
      id: `starter-${i}`,
      mediaType: s.mediaType,
      image: null,
      video: null,
      poster: null,
      eyebrow: s.eyebrow,
      heading: s.heading,
      highlightText: s.highlightText,
      subheading: s.subheading,
      primaryCta: { label: s.primaryCta.label, url: s.primaryCta.url, newTab: false },
      secondaryCta: { label: s.secondaryCta.label, url: s.secondaryCta.url, newTab: false },
      textAlign: s.textAlign,
      overlay: s.overlay,
      durationSeconds: null,
    })),
  },
  highlights: [],
  whoWeAre: DEFAULT_WHO,
  whatWeDo: DEFAULT_WHAT,
  why: DEFAULT_WHY,
  portfolio: DEFAULT_PORTFOLIO,
  clients: DEFAULT_CLIENTS,
  contact: DEFAULT_CONTACT,
  seo: { metaTitle: '', metaDescription: '', ogImage: null },
}

/* ------------------------------------------------------------------ About Us */

export const DEFAULT_ABOUT: AboutData = {
  banner: {
    eyebrow: 'About Us',
    heading: 'Technology built around people and their goals',
    intro:
      'BrightLink Technologies Ltd is a technology company based in Kigali, Rwanda. We build software and websites, support IT, and help organisations grow online.',
    image: null,
  },
  story: {
    enabled: true,
    eyebrow: 'Our Story',
    heading: 'The bright link between your business and the technology it needs',
    highlightText: 'bright link',
    paragraphs: [
      'BrightLink Technologies Ltd is a technology company based in Kigali, Rwanda. We bring software development, website design, digital marketing and IT support together, so organisations can get everything they need from one trusted partner.',
      'Our name says what we aim to be: a bright link between your business and the technology that helps it grow. We start by understanding how you work, then build solutions that are practical, reliable and easy to use.',
    ],
    points: [
      'Based in Kigali, Rwanda',
      'Software, web, marketing and IT support under one roof',
      'Clear communication from the first call to launch and beyond',
    ],
    image: null,
    secondImage: null,
    badge: 'BrightLink Technologies Ltd',
    cta: null,
  },
  glance: { enabled: true, heading: 'BrightLink at a glance' },
  mission: {
    enabled: true,
    eyebrow: 'Our Purpose',
    heading: 'Why we do what we do',
    missionTitle: 'Our Mission',
    missionText:
      'To help organisations in Rwanda and beyond work smarter by building practical, reliable technology and supporting the people who use it.',
    visionTitle: 'Our Vision',
    visionText:
      'To be a trusted technology partner whose solutions connect businesses to new opportunities and lasting growth.',
    valuesHeading: 'What we stand for',
    values: [
      { icon: 'target', title: 'Client first', text: 'Your goals come before our assumptions. We build what you actually need.' },
      { icon: 'shield', title: 'Integrity', text: 'Honest advice, fair dealing and clear communication at every step.' },
      { icon: 'check', title: 'Quality', text: 'Careful, tested work that you can depend on day after day.' },
      { icon: 'lightbulb', title: 'Innovation', text: 'Modern, practical ideas that solve real problems — not technology for its own sake.' },
    ],
  },
  process: {
    enabled: true,
    eyebrow: 'How We Work',
    heading: 'A clear process from first conversation to launch',
    intro: 'Every project is different, but the way we work stays simple and transparent.',
    steps: [
      { title: 'Listen & understand', text: 'We learn about your organisation, your users and what success looks like.' },
      { title: 'Plan & design', text: 'We agree on scope, timeline and design before any building begins.' },
      { title: 'Build & test', text: 'We develop in clear stages, share progress and test carefully.' },
      { title: 'Launch & support', text: 'We take your solution live, train your team and stay available afterwards.' },
    ],
  },
  services: {
    enabled: true,
    eyebrow: 'What We Offer',
    heading: 'Everything you need, from one team',
    intro: 'Explore our services to see how we can help your organisation.',
  },
  team: {
    enabled: true,
    eyebrow: 'Meet the Team',
    heading: 'The people behind BrightLink',
    intro: 'A dedicated team of developers, designers and support specialists who care about your success.',
    groupPhoto: null,
    emptyMessage: 'Our team profiles are on their way. In the meantime, we would love to hear from you.',
    cta: { label: 'Talk to our team', url: '/#get-in-touch', newTab: false },
  },
  showClients: true,
  closing: {
    enabled: true,
    heading: 'Ready to work with BrightLink?',
    text: 'Tell us about your project and let’s find the right solution together.',
    primaryCta: { label: 'Start a conversation', url: '/#get-in-touch', newTab: false },
    secondaryCta: { label: 'See our projects', url: '/our-projects', newTab: false },
  },
  seo: { metaTitle: '', metaDescription: '', ogImage: null },
}
