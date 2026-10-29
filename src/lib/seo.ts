import type { Metadata } from 'next'
import { defaultLocale, localizeHref, ogLocale, type Locale } from '@/i18n/config'
import type { MediaRef, SiteSettingsData } from './content/types'

/**
 * Public site URL (SITE_URL in .env, e.g. https://brightlinkltd.com): drives canonical links, the
 * sitemap, robots.txt, Open Graph and JSON-LD. NEXT_PUBLIC_SERVER_URL is still read as an older name.
 */
export function getServerUrl(): string {
  const url = process.env.SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  return url.replace(/\/+$/, '')
}

/** Full address of a page or file. With a language, a page of this site gets its prefix ("/fr/about-us"). */
export function absoluteUrl(path = '/', locale?: Locale): string {
  if (/^https?:\/\//i.test(path)) return path
  const p = path.startsWith('/') ? path : `/${path}`
  return `${getServerUrl()}${locale ? localizeHref(p, locale) : p}`
}

/**
 * Canonical address of a page in the visitor's language, plus one hreflang link per language switched
 * on in Site settings (and x-default = English), so search engines index each language separately.
 */
export function languageAlternates(path: string, settings: Pick<SiteSettingsData, 'locale' | 'enabledLocales'>): NonNullable<Metadata['alternates']> {
  const enabled = settings.enabledLocales
  return {
    canonical: absoluteUrl(path, settings.locale),
    ...(enabled.length > 1
      ? { languages: { ...Object.fromEntries(enabled.map((l) => [l, absoluteUrl(path, l)])), 'x-default': absoluteUrl(path, defaultLocale) } }
      : {}),
  }
}

type BuildMetadataArgs = {
  settings: SiteSettingsData
  /** Page title WITHOUT the site suffix (the layout's title template adds it). Omit for the home page. */
  title?: string
  description?: string
  path: string
  image?: MediaRef | null
  type?: 'website' | 'article'
  noIndex?: boolean
}

/** One place that builds consistent per-page metadata: title, description, canonical, Open Graph, Twitter. */
export function buildMetadata({
  settings,
  title,
  description,
  path,
  image,
  type = 'website',
  noIndex = false,
}: BuildMetadataArgs): Metadata {
  const desc = description || settings.seo.defaultDescription
  const fullTitle = title
    ? settings.seo.titleTemplate.replace('%s', title)
    : settings.seo.defaultTitle
  const ogImage = image ?? settings.seo.defaultOgImage
  const images = ogImage
    ? [{ url: absoluteUrl(ogImage.url), width: ogImage.width, height: ogImage.height, alt: ogImage.alt || fullTitle }]
    : undefined

  return {
    // `absolute` stops the layout template being applied twice.
    title: { absolute: fullTitle },
    description: desc,
    alternates: languageAlternates(path, settings),
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      url: absoluteUrl(path, settings.locale),
      siteName: settings.companyName,
      title: fullTitle,
      description: desc,
      locale: ogLocale[settings.locale],
      images,
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description: desc,
      images: images?.map((i) => i.url),
    },
  }
}

/* ------------------------------------------------------------------ JSON-LD */

export function organizationJsonLd(settings: SiteSettingsData) {
  const logo = absoluteUrl(settings.logo?.url ?? '/images/brand/brightlink-logo.png')
  const hasAddress = settings.address.city || settings.address.country
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService'],
    '@id': `${getServerUrl()}/#organization`,
    name: settings.legalName || settings.companyName,
    alternateName: settings.companyName,
    url: getServerUrl(),
    logo,
    image: logo,
    description: settings.seo.defaultDescription,
    ...(settings.phone
      ? { telephone: settings.secondaryPhone ? [settings.phone, settings.secondaryPhone] : settings.phone }
      : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.openingHours ? { openingHours: settings.openingHours } : {}),
    ...(hasAddress
      ? {
          address: {
            '@type': 'PostalAddress',
            ...(settings.address.street ? { streetAddress: settings.address.street } : {}),
            addressLocality: settings.address.city,
            addressCountry: settings.address.countryCode || settings.address.country,
          },
        }
      : {}),
    ...(settings.socials.length ? { sameAs: settings.socials.map((s) => s.url) } : {}),
  }
}

export function websiteJsonLd(settings: SiteSettingsData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${getServerUrl()}/#website`,
    url: getServerUrl(),
    name: settings.companyName,
    description: settings.seo.defaultDescription,
    publisher: { '@id': `${getServerUrl()}/#organization` },
    inLanguage: settings.locale,
  }
}

export function webPageJsonLd(opts: { name: string; description: string; path: string; locale?: Locale }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${absoluteUrl(opts.path, opts.locale)}#webpage`,
    url: absoluteUrl(opts.path, opts.locale),
    ...(opts.locale ? { inLanguage: opts.locale } : {}),
    name: opts.name,
    description: opts.description,
    isPartOf: { '@id': `${getServerUrl()}/#website` },
    about: { '@id': `${getServerUrl()}/#organization` },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[], locale?: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path, locale),
    })),
  }
}

/** Schema.org Service for one service page, with the company as provider. */
export function serviceJsonLd(opts: { name: string; description: string; path: string; image?: string | null; locale?: Locale }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${absoluteUrl(opts.path, opts.locale)}#service`,
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.path, opts.locale),
    serviceType: opts.name,
    ...(opts.image ? { image: absoluteUrl(opts.image) } : {}),
    provider: { '@id': `${getServerUrl()}/#organization` },
    areaServed: [{ '@type': 'Country', name: 'Rwanda' }],
  }
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function blogPostingJsonLd(opts: {
  title: string
  description: string
  path: string
  image?: string | null
  published: string
  modified?: string
  authorName: string
  keywords?: string[]
  section?: string
  settings: SiteSettingsData
}) {
  const org = { '@id': `${getServerUrl()}/#organization` }
  const url = absoluteUrl(opts.path, opts.settings.locale)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: opts.title.slice(0, 110),
    description: opts.description,
    url,
    datePublished: opts.published,
    dateModified: opts.modified || opts.published,
    ...(opts.image ? { image: [absoluteUrl(opts.image)] } : {}),
    author: opts.authorName === 'BrightLink Team' ? org : { '@type': 'Person', name: opts.authorName },
    publisher: org,
    inLanguage: opts.settings.locale,
    ...(opts.keywords?.length ? { keywords: opts.keywords.join(', ') } : {}),
    ...(opts.section ? { articleSection: opts.section } : {}),
  }
}
