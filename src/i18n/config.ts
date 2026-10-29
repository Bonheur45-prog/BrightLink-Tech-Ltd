// Languages the CODE supports. Which ones are switched ON for visitors lives in the
// database (SiteSettings.enabledLocales), so adding Kinyarwanda needs no deployment.
export const locales = ['en', 'rw', 'fr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const localeNames: Record<Locale, string> = {
  en: 'English',
  rw: 'Kinyarwanda',
  fr: 'Français',
};

/** Request headers the middleware sets for public pages (src/middleware.ts → src/lib/content/request-locale.ts). */
export const LOCALE_HEADER = 'x-brightlink-locale';
export const PATH_HEADER = 'x-brightlink-path';

/** Open Graph `og:locale` for each language. */
export const ogLocale: Record<Locale, string> = { en: 'en_US', fr: 'fr_FR', rw: 'rw_RW' };

// Addresses: English has no prefix ("/about-us"); the other languages do ("/fr/about-us", "/rw").
// Pure helpers, shared by the middleware, server components and client components (tested in i18n.test.ts).

/** "/fr/about-us" → { locale: "fr", path: "/about-us" }; "/about-us" → { locale: "en", path: "/about-us" }. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const m = /^\/(fr|rw)(?=\/|$)(.*)$/.exec(pathname);
  if (!m) return { locale: defaultLocale, path: pathname || '/' };
  return { locale: m[1] as Locale, path: m[2] || '/' };
}

/** Paths that are never pages in a language: the CMS, APIs, Next's files and files with an extension. */
const NOT_A_PAGE = /^\/(?:admin|api|_next|images)(?:[/?#]|$)|\.[a-z0-9]{2,5}(?:[?#]|$)/i;

/**
 * The address of a page of this site for visitors reading `locale`: "/about-us" → "/fr/about-us",
 * "/#get-in-touch" → "/fr#get-in-touch". Other sites, mail/phone links, anchors on the same page,
 * the CMS and files are returned unchanged, and so is anything that already has a language prefix.
 */
export function localizeHref(href: string, locale: Locale): string {
  if (locale === defaultLocale) return href;
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  if (/^\/(?:fr|rw|en)(?:[/?#]|$)/.test(href) || NOT_A_PAGE.test(href)) return href;
  return href === '/' || /^\/[?#]/.test(href) ? `/${locale}${href.slice(1)}` : `/${locale}${href}`;
}

/** Same as localizeHref for every `href="/…"` in a piece of HTML (article bodies rendered when they were saved). */
export function localizeHtml(html: string, locale: Locale): string {
  if (locale === defaultLocale) return html;
  return html.replace(/href="(\/[^"]*)"/g, (_all, href: string) => `href="${localizeHref(href, locale)}"`);
}
