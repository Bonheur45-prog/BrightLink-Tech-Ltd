import type {
  AboutData,
  BlogCategory,
  BlogPageData,
  ContactPageData,
  BlogPost,
  BlogPostFull,
  CategoryColor,
  ClientItem,
  ClientsData,
  ContactData,
  Cta,
  Feature,
  FooterData,
  HeaderData,
  HeroData,
  HeroSlide,
  HomePageData,
  MediaRef,
  NavItem,
  PortfolioData,
  ProjectDetail,
  ProjectItem,
  ProjectsPageData,
  ServiceClient,
  ServiceDetail,
  ServiceItem,
  ServicesPageData,
  SiteSettingsData,
  TeamMember,
  WhatWeDoData,
  WhoWeAreData,
  WhyData,
} from './types'
import { DEFAULT_BLOG_PAGE } from './blogDefaults'
import { DEFAULT_CONTACT_PAGE } from './contactDefaults'
import { lexicalToBlocks, readingMinutes } from './richtext'
import { DEFAULT_PROJECTS_PAGE } from './projectDefaults'
import { DEFAULT_SERVICES_PAGE, starterServiceExtra } from './serviceDefaults'
import {
  DEFAULT_ABOUT,
  DEFAULT_CLIENTS,
  DEFAULT_CONTACT,
  DEFAULT_FOOTER,
  DEFAULT_HEADER,
  DEFAULT_HOME,
  DEFAULT_PORTFOLIO,
  DEFAULT_SETTINGS,
  DEFAULT_WHAT,
  DEFAULT_WHO,
  DEFAULT_WHY,
} from './defaults'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Raw = any

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v.trim() : fallback)
const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback)
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : fallback

/** A populated Payload upload (depth ≥ 1) → MediaRef. Returns null for ids / missing files. */
export function toMedia(raw: Raw, preferredSize?: string): MediaRef | null {
  if (!raw || typeof raw !== 'object' || typeof raw.url !== 'string') return null
  const sized = preferredSize ? raw.sizes?.[preferredSize] : undefined
  const useSized = sized && typeof sized.url === 'string'
  return {
    url: useSized ? sized.url : raw.url,
    alt: str(raw.alt),
    width: (useSized ? num(sized.width) : num(raw.width)) ?? undefined,
    height: (useSized ? num(sized.height) : num(raw.height)) ?? undefined,
    mimeType: str(raw.mimeType) || undefined,
  }
}

function toCta(raw: Raw): Cta | null {
  const label = str(raw?.label)
  const url = str(raw?.url)
  if (!label || !url) return null
  return { label, url, newTab: bool(raw?.openInNewTab, false) }
}

export function normalizeSettings(raw: Raw): SiteSettingsData {
  const d = DEFAULT_SETTINGS
  if (!raw) return d
  return {
    headingFont: d.headingFont,
    bodyFont: d.bodyFont,
    smoothScroll: d.smoothScroll,
    parallax: d.parallax,
    enabledLocales: d.enabledLocales,
    locale: d.locale,
    companyName: str(raw.companyName, d.companyName) || d.companyName,
    legalName: str(raw.legalName, d.legalName) || d.legalName,
    tagline: str(raw.tagline, d.tagline) || d.tagline,
    logo: toMedia(raw.logo),
    logoLight: toMedia(raw.logoLight),
    footerDescription: str(raw.footerDescription),
    // BrightLink's contact details are the fallback until different ones are saved in Site Settings.
    phone: str(raw.phone) || d.phone,
    secondaryPhone: str(raw.secondaryPhone) || (raw.phone ? '' : d.secondaryPhone),
    email: str(raw.email) || d.email,
    address: {
      street: str(raw.address?.street),
      city: str(raw.address?.city, d.address.city),
      country: str(raw.address?.country, d.address.country),
      countryCode: str(raw.address?.countryCode, d.address.countryCode),
    },
    openingHours: str(raw.openingHours),
    socials: Array.isArray(raw.socials)
      ? raw.socials
          .map((s: Raw) => ({ platform: str(s?.platform), url: str(s?.url) }))
          .filter((s: { platform: string; url: string }) => s.platform && s.url)
      : [],
    seo: {
      defaultTitle: str(raw.seo?.defaultTitle) || d.seo.defaultTitle,
      titleTemplate: str(raw.seo?.titleTemplate) || d.seo.titleTemplate,
      defaultDescription: str(raw.seo?.defaultDescription) || d.seo.defaultDescription,
      defaultOgImage: toMedia(raw.seo?.defaultOgImage),
      googleSiteVerification: str(raw.seo?.googleSiteVerification),
    },
  }
}

export function normalizeHeader(raw: Raw): HeaderData {
  const d = DEFAULT_HEADER
  if (!raw) return d

  const navItems: NavItem[] = Array.isArray(raw.navItems)
    ? raw.navItems
        .map((item: Raw): NavItem => {
          const isDropdown = item?.linkType === 'dropdown'
          const children = isDropdown && Array.isArray(item.children)
            ? item.children
                .map((c: Raw) => ({ label: str(c?.label), url: str(c?.url), description: str(c?.description) }))
                .filter((c: { label: string; url: string }) => c.label && c.url)
            : []
          return {
            label: str(item?.label),
            url: isDropdown ? '' : str(item?.url),
            newTab: bool(item?.openInNewTab, false),
            children,
          }
        })
        .filter((n: NavItem) => n.label && (n.url || n.children.length))
    : []

  const showCta = bool(raw.showCta, true)
  const cta = showCta
    ? { label: str(raw.ctaLabel, d.cta?.label ?? ''), url: str(raw.ctaUrl, d.cta?.url ?? ''), newTab: false }
    : null

  return {
    // An empty menu would look broken, so fall back to the default pages until one is saved.
    navItems: navItems.length ? navItems : d.navItems,
    cta: cta && cta.label && cta.url ? cta : null,
    topBar: {
      enabled: bool(raw.topBar?.enabled, d.topBar.enabled),
      message: str(raw.topBar?.message),
      showPhone: bool(raw.topBar?.showPhone, true),
      showEmail: bool(raw.topBar?.showEmail, true),
      showSocials: bool(raw.topBar?.showSocials, true),
    },
    sticky: bool(raw.sticky, d.sticky),
    transparentOnHero: bool(raw.transparentOnHero, d.transparentOnHero),
  }
}

function normalizeSlide(raw: Raw, index: number): HeroSlide | null {
  const heading = str(raw?.heading)
  if (!heading) return null
  const mediaType = oneOf(raw?.mediaType, ['image', 'video', 'none'] as const, 'none')
  const image = toMedia(raw?.image, 'hero')
  const video = toMedia(raw?.video)
  // A slide whose chosen media is missing degrades to the brand background instead of an empty box.
  const effectiveType =
    mediaType === 'image' && !image ? 'none' : mediaType === 'video' && !video ? 'none' : mediaType
  return {
    id: str(raw?.id) || `slide-${index}`,
    mediaType: effectiveType,
    image,
    video,
    poster: toMedia(raw?.poster, 'hero'),
    eyebrow: str(raw?.eyebrow),
    heading,
    highlightText: str(raw?.highlightText),
    subheading: str(raw?.subheading),
    primaryCta: toCta(raw?.primaryCta),
    secondaryCta: toCta(raw?.secondaryCta),
    textAlign: oneOf(raw?.textAlign, ['left', 'center'] as const, 'left'),
    overlay: oneOf(raw?.overlay, ['light', 'medium', 'strong'] as const, 'medium'),
    durationSeconds: num(raw?.durationSeconds),
  }
}

export function normalizeHome(raw: Raw): HomePageData {
  const d = DEFAULT_HOME
  if (!raw) return d
  const h = raw.hero ?? {}
  const slides: HeroSlide[] = Array.isArray(h.slides)
    ? h.slides.map(normalizeSlide).filter((s: HeroSlide | null): s is HeroSlide => Boolean(s))
    : []

  const hero: HeroData = {
    enabled: bool(h.enabled, true),
    autoplay: bool(h.autoplay, true),
    intervalSeconds: num(h.intervalSeconds) ?? d.hero.intervalSeconds,
    height: oneOf(h.height, ['full', 'large', 'medium'] as const, 'large'),
    kenBurns: bool(h.kenBurns, true),
    showArrows: bool(h.showArrows, true),
    showDots: bool(h.showDots, true),
    showProgress: bool(h.showProgress, true),
    slides: slides.length ? slides : d.hero.slides,
  }

  return {
    hero,
    whoWeAre: normalizeWho(raw.whoWeAre),
    whatWeDo: normalizeWhat(raw.whatWeDo),
    why: normalizeWhy(raw.why),
    portfolio: normalizePortfolio(raw.portfolio),
    clients: normalizeClients(raw.clients),
    contact: normalizeContact(raw.contact),
    highlights: Array.isArray(raw.highlights)
      ? raw.highlights
          .map((x: Raw) => ({ title: str(x?.title), text: str(x?.text), url: str(x?.url) }))
          .filter((x: { title: string }) => x.title)
      : [],
    seo: {
      metaTitle: str(raw.seo?.metaTitle),
      metaDescription: str(raw.seo?.metaDescription),
      ogImage: toMedia(raw.seo?.ogImage),
    },
  }
}

/* ------------------------------------------------------------------ home sections */

/** A section counts as "set up" once an editor has saved a heading; until then the starter content is shown. */
const configured = (g: Raw): boolean => Boolean(str(g?.heading))

const toFeatures = (raw: Raw): Feature[] =>
  Array.isArray(raw)
    ? raw
        .map((f: Raw) => ({ icon: str(f?.icon, 'check') || 'check', title: str(f?.title), text: str(f?.text) }))
        .filter((f: Feature) => f.title)
    : []

export function normalizeWho(g: Raw): WhoWeAreData {
  const d = DEFAULT_WHO
  if (!configured(g)) return d
  const paragraphs = str(g.intro)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
  return {
    enabled: bool(g.enabled, true),
    eyebrow: str(g.eyebrow),
    heading: str(g.heading),
    highlightText: str(g.highlightText),
    paragraphs,
    features: toFeatures(g.features),
    image: toMedia(g.image, 'card'),
    badge: str(g.badge),
    primaryCta: toCta(g.primaryCta),
    secondaryCta: toCta(g.secondaryCta),
    learnMore: toCta(g.learnMore),
  }
}

export function normalizeWhat(g: Raw): WhatWeDoData {
  if (!configured(g)) return DEFAULT_WHAT
  return {
    enabled: bool(g.enabled, true),
    eyebrow: str(g.eyebrow),
    heading: str(g.heading),
    intro: str(g.intro),
    learnMoreLabel: str(g.learnMoreLabel, 'Learn more') || 'Learn more',
    viewAll: toCta(g.viewAll),
  }
}

export function normalizeWhy(g: Raw): WhyData {
  const d = DEFAULT_WHY
  if (!configured(g)) return d
  return {
    enabled: bool(g.enabled, true),
    eyebrow: str(g.eyebrow),
    heading: str(g.heading),
    message: str(g.message),
    backgroundImage: toMedia(g.backgroundImage, 'hero'),
    points: toFeatures(g.points),
    cta: toCta(g.cta),
    newsletter: {
      enabled: bool(g.newsletter?.enabled, true),
      heading: str(g.newsletter?.heading) || d.newsletter.heading,
      text: str(g.newsletter?.text),
      buttonLabel: str(g.newsletter?.buttonLabel) || d.newsletter.buttonLabel,
    },
  }
}

export function normalizePortfolio(g: Raw): PortfolioData {
  if (!configured(g)) return DEFAULT_PORTFOLIO
  return {
    enabled: bool(g.enabled, true),
    eyebrow: str(g.eyebrow),
    heading: str(g.heading),
    intro: str(g.intro),
    limit: Math.min(12, Math.max(1, num(g.limit) ?? DEFAULT_PORTFOLIO.limit)),
    viewAll: toCta(g.viewAll),
  }
}

export function normalizeClients(g: Raw): ClientsData {
  if (!configured(g)) return DEFAULT_CLIENTS
  return {
    enabled: bool(g.enabled, true),
    eyebrow: str(g.eyebrow),
    heading: str(g.heading),
    intro: str(g.intro),
  }
}

export function normalizeContact(g: Raw): ContactData {
  if (!configured(g)) return DEFAULT_CONTACT
  return {
    enabled: bool(g.enabled, true),
    eyebrow: str(g.eyebrow),
    heading: str(g.heading),
    intro: str(g.intro),
    formTitle: str(g.formTitle) || DEFAULT_CONTACT.formTitle,
    showForm: bool(g.showForm, true),
  }
}

/* ------------------------------------------------------------------ collections */

export function normalizeService(raw: Raw): ServiceItem | null {
  const title = str(raw?.title)
  const slug = str(raw?.slug)
  if (!title || !slug) return null
  return {
    id: String(raw.id ?? slug),
    title,
    slug,
    url: `/our-services/${slug}`,
    icon: str(raw.icon, 'code') || 'code',
    shortDescription: str(raw.shortDescription),
    features: Array.isArray(raw.features) ? raw.features.map((f: Raw) => str(f?.text)).filter(Boolean) : [],
    showOnHome: bool(raw.showOnHome, true),
    image: toMedia(raw.image, 'card'),
  }
}

export function normalizeProject(raw: Raw): ProjectItem | null {
  const title = str(raw?.title)
  const slug = str(raw?.slug)
  if (!title || !slug) return null
  const status: 'completed' | 'in-progress' = raw.status === 'in-progress' ? 'in-progress' : 'completed'
  const pct = Math.max(0, Math.min(100, Math.round(Number(raw.progress) || 0)))
  return {
    id: String(raw.id ?? slug),
    title,
    slug,
    url: `/our-projects/${slug}`,
    category: str(raw.category),
    shortDescription: str(raw.shortDescription),
    image: toMedia(raw.featuredImage, 'card'),
    externalUrl: /^https?:\/\//i.test(str(raw.externalUrl)) ? str(raw.externalUrl) : '',
    showOnHome: bool(raw.showOnHome, true),
    // `service` is a populated document at depth ≥ 1, or just an id (→ not linked)
    serviceSlug: raw.service && typeof raw.service === 'object' ? str(raw.service.slug) : '',
    status,
    progress: status === 'completed' ? 100 : pct,
  }
}

export function normalizeProjectDetail(raw: Raw): ProjectDetail | null {
  const base = normalizeProject(raw)
  if (!base) return null
  const paragraphs = paras(raw.description)
  return {
    ...base,
    paragraphs: paragraphs.length ? paragraphs : base.shortDescription ? [base.shortDescription] : [],
    highlights: Array.isArray(raw.highlights) ? raw.highlights.map((h: Raw) => str(h?.text)).filter(Boolean) : [],
    gallery: Array.isArray(raw.gallery)
      ? raw.gallery.map((g: Raw) => toMedia(g?.image)).filter((m: MediaRef | null): m is MediaRef => Boolean(m))
      : [],
    serviceTitle: raw.service && typeof raw.service === 'object' ? str(raw.service.title) : '',
    seo: {
      metaTitle: str(raw.seo?.metaTitle),
      metaDescription: str(raw.seo?.metaDescription),
      ogImage: toMedia(raw.seo?.ogImage),
    },
  }
}

export function normalizeProjectsPage(raw: Raw): ProjectsPageData {
  const d = DEFAULT_PROJECTS_PAGE
  if (!raw) return d
  const cl = raw.closing
  return {
    banner: {
      eyebrow: str(raw.banner?.eyebrow) || d.banner.eyebrow,
      heading: str(raw.banner?.heading) || d.banner.heading,
      intro: str(raw.banner?.intro) || d.banner.intro,
      image: toMedia(raw.banner?.image),
    },
    completed: {
      heading: str(raw.completed?.heading) || d.completed.heading,
      intro: str(raw.completed?.intro) || d.completed.intro,
    },
    inProgress: {
      heading: str(raw.inProgress?.heading) || d.inProgress.heading,
      intro: str(raw.inProgress?.intro) || d.inProgress.intro,
    },
    closing: {
      enabled: bool(cl?.enabled, true),
      heading: str(cl?.heading) || d.closing.heading,
      text: str(cl?.text) || d.closing.text,
      primaryCta: str(cl?.heading) ? toCta(cl?.primaryCta) : d.closing.primaryCta,
      secondaryCta: str(cl?.heading) ? toCta(cl?.secondaryCta) : d.closing.secondaryCta,
    },
    seo: {
      metaTitle: str(raw.seo?.metaTitle),
      metaDescription: str(raw.seo?.metaDescription),
      ogImage: toMedia(raw.seo?.ogImage),
    },
  }
}

export function normalizeClient(raw: Raw): ClientItem | null {
  const name = str(raw?.name)
  if (!name || raw?.visible === false) return null
  return {
    id: String(raw.id ?? name),
    name,
    logo: toMedia(raw.logo, 'card'),
    website: /^https?:\/\//i.test(str(raw.website)) ? str(raw.website) : '',
  }
}

export function normalizeFooter(raw: Raw): FooterData {
  const d = DEFAULT_FOOTER
  if (!raw) return d
  const quickLinks = Array.isArray(raw.quickLinks)
    ? raw.quickLinks
        .map((l: Raw) => ({ label: str(l?.label), url: str(l?.url), newTab: bool(l?.openInNewTab, false) }))
        .filter((l: { label: string; url: string }) => l.label && l.url)
    : []
  return {
    quickLinks: quickLinks.length ? quickLinks : d.quickLinks,
    showServices: bool(raw.showServices, true),
    copyrightText: str(raw.copyrightText),
    legalLinks: Array.isArray(raw.legalLinks)
      ? raw.legalLinks
          .map((l: Raw) => ({ label: str(l?.label), url: str(l?.url) }))
          .filter((l: { label: string; url: string }) => l.label && l.url)
      : [],
  }
}

/* ------------------------------------------------------------------ About Us */

export function normalizeAbout(raw: Raw): AboutData {
  const d = DEFAULT_ABOUT
  if (!raw) return d
  const paragraphs = (t: unknown) =>
    str(t)
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)

  const b = raw.banner
  const st = raw.story
  const m = raw.mission
  const pr = raw.process
  const sv = raw.services
  const tm = raw.team
  const cl = raw.closing

  return {
    banner: str(b?.heading)
      ? {
          eyebrow: str(b.eyebrow),
          heading: str(b.heading),
          intro: str(b.intro),
          image: toMedia(b.image, 'hero'),
        }
      : d.banner,
    story: configured(st)
      ? {
          enabled: bool(st.enabled, true),
          eyebrow: str(st.eyebrow),
          heading: str(st.heading),
          highlightText: str(st.highlightText),
          paragraphs: paragraphs(st.intro),
          points: Array.isArray(st.points) ? st.points.map((p: Raw) => str(p?.text)).filter(Boolean) : [],
          image: toMedia(st.image, 'card'),
          secondImage: toMedia(st.secondImage, 'card'),
          badge: str(st.badge),
          cta: toCta(st.cta),
        }
      : d.story,
    glance: {
      enabled: bool(raw.glance?.enabled, true),
      heading: str(raw.glance?.heading) || d.glance.heading,
    },
    mission: configured(m)
      ? {
          enabled: bool(m.enabled, true),
          eyebrow: str(m.eyebrow),
          heading: str(m.heading),
          missionTitle: str(m.missionTitle) || d.mission.missionTitle,
          missionText: str(m.missionText),
          visionTitle: str(m.visionTitle) || d.mission.visionTitle,
          visionText: str(m.visionText),
          valuesHeading: str(m.valuesHeading),
          values: toFeatures(m.values),
        }
      : d.mission,
    process: configured(pr)
      ? {
          enabled: bool(pr.enabled, true),
          eyebrow: str(pr.eyebrow),
          heading: str(pr.heading),
          intro: str(pr.intro),
          steps: Array.isArray(pr.steps)
            ? pr.steps
                .map((s: Raw) => ({ title: str(s?.title), text: str(s?.text) }))
                .filter((s: { title: string }) => s.title)
            : [],
        }
      : d.process,
    services: configured(sv)
      ? { enabled: bool(sv.enabled, true), eyebrow: str(sv.eyebrow), heading: str(sv.heading), intro: str(sv.intro) }
      : d.services,
    team: configured(tm)
      ? {
          enabled: bool(tm.enabled, true),
          eyebrow: str(tm.eyebrow),
          heading: str(tm.heading),
          intro: str(tm.intro),
          groupPhoto: toMedia(tm.groupPhoto, 'hero'),
          emptyMessage: str(tm.emptyMessage) || d.team.emptyMessage,
          cta: toCta(tm.cta),
        }
      : d.team,
    showClients: bool(raw.showClients, true),
    closing: configured(cl)
      ? {
          enabled: bool(cl.enabled, true),
          heading: str(cl.heading),
          text: str(cl.text),
          primaryCta: toCta(cl.primaryCta),
          secondaryCta: toCta(cl.secondaryCta),
        }
      : d.closing,
    seo: {
      metaTitle: str(raw.seo?.metaTitle),
      metaDescription: str(raw.seo?.metaDescription),
      ogImage: toMedia(raw.seo?.ogImage),
    },
  }
}

export function normalizeTeamMember(raw: Raw): TeamMember | null {
  const name = str(raw?.name)
  if (!name || raw?.visible === false) return null
  return {
    id: String(raw.id ?? name),
    name,
    role: str(raw.role),
    bio: str(raw.bio),
    photo: toMedia(raw.photo, 'card'),
    email: str(raw.email),
    linkedin: /^https?:\/\//i.test(str(raw.linkedin)) ? str(raw.linkedin) : '',
  }
}


/* ------------------------------------------------------------------ services */

const paras = (t: unknown) =>
  str(t)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

const iconCards = (raw: Raw): { icon: string; title: string; text: string }[] =>
  Array.isArray(raw)
    ? raw
        .map((c: Raw) => ({ icon: str(c?.icon, 'check') || 'check', title: str(c?.title), text: str(c?.text) }))
        .filter((c) => c.title)
    : []

/** A service page: whatever an editor has filled in wins; blank fields use the starter text for that service. */
export function normalizeServiceDetail(raw: Raw): ServiceDetail | null {
  const base = normalizeService(raw)
  if (!base) return null
  const d = starterServiceExtra(base.slug)

  const ov = raw.overview
  const ovParas = paras(ov?.text)
  const off = raw.offerings
  const offItems = iconCards(off?.items)
  const why = raw.why
  const whyPoints = iconCards(why?.points)
  const whyConfigured = Boolean(str(why?.heading)) || whyPoints.length > 0
  const pr = raw.process
  const steps = Array.isArray(pr?.steps)
    ? pr.steps.map((x: Raw) => ({ title: str(x?.title), text: str(x?.text) })).filter((x: { title: string }) => x.title)
    : []
  const faqs = Array.isArray(raw.faqs)
    ? raw.faqs.map((f: Raw) => ({ question: str(f?.question), answer: str(f?.answer) })).filter((f: { question: string; answer: string }) => f.question && f.answer)
    : []
  const served: ServiceClient[] = Array.isArray(raw.clientsServed)
    ? raw.clientsServed
        .map((x: Raw): ServiceClient | null => {
          const c = normalizeClient(x?.client && typeof x.client === 'object' ? x.client : null)
          return c ? { name: c.name, note: str(x?.note), logo: c.logo, website: c.website } : null
        })
        .filter((x: ServiceClient | null): x is ServiceClient => Boolean(x))
    : []
  const c = raw.cta

  return {
    ...base,
    banner: {
      heading: str(raw.banner?.heading) || d.banner.heading || base.title,
      intro: str(raw.banner?.intro) || d.banner.intro || base.shortDescription,
      image: toMedia(raw.banner?.image),
    },
    overview: {
      eyebrow: d.overview.eyebrow || base.title,
      heading: str(ov?.heading) || d.overview.heading,
      highlightText: str(ov?.heading) ? str(ov?.highlightText) : d.overview.highlightText,
      paragraphs: ovParas.length ? ovParas : d.overview.paragraphs,
      image: toMedia(ov?.image),
    },
    offerings: {
      heading: str(off?.heading) || d.offerings.heading,
      intro: str(off?.intro) || d.offerings.intro,
      items: offItems.length ? offItems : d.offerings.items,
    },
    why: whyConfigured
      ? {
          heading: str(why?.heading) || (d.why?.heading ?? ''),
          message: str(why?.message) || (d.why?.message ?? ''),
          image: toMedia(why?.image),
          points: whyPoints.length ? whyPoints : (d.why?.points ?? []),
        }
      : d.why,
    process: {
      heading: str(pr?.heading) || d.process.heading,
      intro: str(pr?.intro) || d.process.intro,
      steps: steps.length ? steps : d.process.steps,
    },
    work: { heading: str(raw.work?.heading) || d.work.heading, intro: str(raw.work?.intro) || d.work.intro },
    clientsServed: served,
    clientsServedFallback: d.clientsServedFallback,
    clientsHeading: str(raw.clientsHeading) || d.clientsHeading,
    faqs: faqs.length ? faqs : d.faqs,
    cta: {
      heading: str(c?.heading) || d.cta.heading,
      text: str(c?.text) || d.cta.text,
      primaryCta: toCta(c?.primaryCta) ?? d.cta.primaryCta,
      secondaryCta: toCta(c?.secondaryCta) ?? d.cta.secondaryCta,
    },
    seo: {
      metaTitle: str(raw.seo?.metaTitle) || d.seo.metaTitle,
      metaDescription: str(raw.seo?.metaDescription) || d.seo.metaDescription || base.shortDescription,
      ogImage: toMedia(raw.seo?.ogImage),
    },
  }
}

export function normalizeServicesPage(raw: Raw): ServicesPageData {
  const d = DEFAULT_SERVICES_PAGE
  if (!raw) return d
  const w = raw.why
  const pts = iconCards(w?.points)
  const cl = raw.closing
  return {
    banner: {
      eyebrow: str(raw.banner?.eyebrow) || d.banner.eyebrow,
      heading: str(raw.banner?.heading) || d.banner.heading,
      intro: str(raw.banner?.intro) || d.banner.intro,
      image: toMedia(raw.banner?.image),
    },
    listing: {
      eyebrow: str(raw.listing?.eyebrow) || d.listing.eyebrow,
      heading: str(raw.listing?.heading) || d.listing.heading,
      intro: str(raw.listing?.intro) || d.listing.intro,
    },
    why: {
      enabled: bool(w?.enabled, true),
      eyebrow: str(w?.eyebrow) || d.why.eyebrow,
      heading: str(w?.heading) || d.why.heading,
      message: str(w?.message) || d.why.message,
      image: toMedia(w?.backgroundImage),
      points: pts.length ? pts : d.why.points,
    },
    showProjects: bool(raw.showProjects, true),
    closing: {
      enabled: bool(cl?.enabled, true),
      heading: str(cl?.heading) || d.closing.heading,
      text: str(cl?.text) || d.closing.text,
      primaryCta: str(cl?.heading) ? toCta(cl?.primaryCta) : d.closing.primaryCta,
      secondaryCta: str(cl?.heading) ? toCta(cl?.secondaryCta) : d.closing.secondaryCta,
    },
    seo: {
      metaTitle: str(raw.seo?.metaTitle),
      metaDescription: str(raw.seo?.metaDescription),
      ogImage: toMedia(raw.seo?.ogImage),
    },
  }
}


/* ------------------------------------------------------------------ blog */

const COLORS: CategoryColor[] = ['orange', 'teal', 'blue', 'green', 'navy']
const color = (v: unknown): CategoryColor => (COLORS.includes(v as CategoryColor) ? (v as CategoryColor) : 'blue')

export function normalizeBlogCategory(raw: Raw): BlogCategory | null {
  const name = str(raw?.name)
  const slug = str(raw?.slug)
  if (!name || !slug) return null
  return {
    id: String(raw.id ?? slug),
    name,
    slug,
    url: `/blog/category/${slug}`,
    description: str(raw.description),
    icon: str(raw.icon, 'code') || 'code',
    color: color(raw.color),
    count: 0,
    seo: { metaTitle: str(raw.seo?.metaTitle), metaDescription: str(raw.seo?.metaDescription) },
  }
}

/** A blog post. Pass `withContent` for the article page; lists skip converting the body. */
export function normalizeBlogPost(raw: Raw, withContent: true): BlogPostFull | null
export function normalizeBlogPost(raw: Raw, withContent?: false): BlogPost | null
export function normalizeBlogPost(raw: Raw, withContent = false): BlogPost | BlogPostFull | null {
  const title = str(raw?.title)
  const slug = str(raw?.slug)
  if (!title || !slug) return null
  const cat = raw.category && typeof raw.category === 'object' ? normalizeBlogCategory(raw.category) : null
  const author = raw.author && typeof raw.author === 'object' ? raw.author : null
  const blocks = withContent ? lexicalToBlocks(raw.content) : []
  const post: BlogPost = {
    id: String(raw.id ?? slug),
    title,
    slug,
    url: `/blog/${slug}`,
    excerpt: str(raw.excerpt),
    image: toMedia(raw.featuredImage, 'card'),
    category: cat ? { name: cat.name, slug: cat.slug, color: cat.color, icon: cat.icon } : null,
    tags: Array.isArray(raw.tags) ? raw.tags.map((t: Raw) => str(t?.tag)).filter(Boolean) : [],
    author: {
      name: str(author?.name) || 'BrightLink Team',
      role: str(author?.role),
      photo: author ? toMedia(author.photo, 'thumbnail') : null,
    },
    publishedAt: str(raw.publishedAt) || str(raw.createdAt) || new Date(0).toISOString(),
    readingMinutes: Math.max(1, Math.round(Number(raw.readingMinutes) || 0)) || 1,
    featured: bool(raw.featured, false),
    seo: {
      metaTitle: str(raw.seo?.metaTitle),
      metaDescription: str(raw.seo?.metaDescription),
      ogImage: toMedia(raw.seo?.ogImage),
      focusKeyword: str(raw.seo?.focusKeyword),
      canonicalUrl: /^https?:\/\//i.test(str(raw.seo?.canonicalUrl)) ? str(raw.seo?.canonicalUrl) : '',
      noIndex: bool(raw.seo?.noIndex, false),
    },
  }
  if (!withContent) return post
  return { ...post, readingMinutes: raw.readingMinutes ? post.readingMinutes : readingMinutes(blocks), blocks }
}

export function normalizeBlogPage(raw: Raw): BlogPageData {
  const d = DEFAULT_BLOG_PAGE
  if (!raw) return d
  const sub = raw.subscribe
  return {
    banner: {
      eyebrow: str(raw.banner?.eyebrow) || d.banner.eyebrow,
      heading: str(raw.banner?.heading) || d.banner.heading,
      intro: str(raw.banner?.intro) || d.banner.intro,
      image: toMedia(raw.banner?.image),
    },
    postsPerPage: Math.max(3, Math.min(24, Math.round(Number(raw.postsPerPage) || d.postsPerPage))),
    latestHeading: str(raw.latestHeading) || d.latestHeading,
    subscribe: {
      enabled: bool(sub?.enabled, true),
      heading: str(sub?.heading) || d.subscribe.heading,
      text: str(sub?.text) || d.subscribe.text,
      buttonLabel: str(sub?.buttonLabel) || d.subscribe.buttonLabel,
    },
    seo: {
      metaTitle: str(raw.seo?.metaTitle),
      metaDescription: str(raw.seo?.metaDescription),
      ogImage: toMedia(raw.seo?.ogImage),
    },
  }
}

export function normalizeContactPage(raw: Raw): ContactPageData {
  const d = DEFAULT_CONTACT_PAGE
  if (!raw) return d
  const sub = raw.subscribe
  return {
    banner: {
      eyebrow: str(raw.banner?.eyebrow) || d.banner.eyebrow,
      heading: str(raw.banner?.heading) || d.banner.heading,
      intro: str(raw.banner?.intro) || d.banner.intro,
      image: toMedia(raw.banner?.image),
    },
    form: {
      heading: str(raw.form?.heading) || d.form.heading,
      intro: str(raw.form?.intro) || d.form.intro,
      backgroundImage: toMedia(raw.form?.backgroundImage),
    },
    subscribe: {
      enabled: bool(sub?.enabled, true),
      heading: str(sub?.heading) || d.subscribe.heading,
      text: str(sub?.text) || d.subscribe.text,
      buttonLabel: str(sub?.buttonLabel) || d.subscribe.buttonLabel,
    },
    seo: {
      metaTitle: str(raw.seo?.metaTitle),
      metaDescription: str(raw.seo?.metaDescription),
      ogImage: toMedia(raw.seo?.ogImage),
    },
  }
}
