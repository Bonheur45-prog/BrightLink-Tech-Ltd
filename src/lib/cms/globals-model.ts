import { locales, type Locale } from '@/i18n/config';
import { DEFAULT_FOOTER, DEFAULT_HEADER } from '@/lib/content/defaults';
import type { FooterData, HeaderData } from '@/lib/content/types';

// Header and footer as stored in GlobalSection (draft/published JSON). Text is per language
// ({ en, fr, rw }); English is required, other languages fall back to English on the site.
// Pure: parsing, publish checks and resolving to the shapes the public components use.

export type T = Partial<Record<Locale, string>>;
export type Problems = Record<string, string>;

export type LinkDoc = { id: string; label: T; url: string; newTab: boolean };
export type NavChildDoc = { id: string; label: T; url: string; description: T };
export type NavItemDoc = LinkDoc & { children: NavChildDoc[] };

export type HeaderDoc = {
  navItems: NavItemDoc[];
  cta: { enabled: boolean; label: T; url: string; newTab: boolean };
  topBar: { enabled: boolean; message: T; showPhone: boolean; showEmail: boolean; showSocials: boolean };
  sticky: boolean;
  transparentOnHero: boolean;
};

export type FooterDoc = {
  quickLinks: LinkDoc[];
  showServices: boolean;
  copyright: T;
  legalLinks: LinkDoc[];
};

export const MAX_NAV_ITEMS = 10;
export const MAX_CHILDREN = 12;
export const MAX_LINKS = 15;

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
const id = (v: unknown, i: number) => (typeof v === 'string' && /^[\w-]{1,40}$/.test(v) ? v : `i${i}`);

/** { en: "Home", fr: "" } → { en: "Home" } (empty languages dropped). A plain string counts as English. */
export function parseT(v: unknown, max = 300): T {
  if (typeof v === 'string') return v.trim() ? { en: str(v, max) } : {};
  const o = obj(v);
  const out: T = {};
  for (const l of locales) {
    const s = str(o[l], max);
    if (s) out[l] = s;
  }
  return out;
}

/** Text in a language, falling back to English. */
export const tr = (t: T, locale: Locale) => t[locale] || t.en || '';

const en = (s: string): T => (s ? { en: s } : {});

const parseLink = (v: unknown, i: number): LinkDoc => {
  const o = obj(v);
  return { id: id(o.id, i), label: parseT(o.label, 80), url: str(o.url, 500), newTab: bool(o.newTab, false) };
};

export function defaultHeaderDoc(): HeaderDoc {
  const h = DEFAULT_HEADER;
  return {
    navItems: h.navItems.map((n, i) => ({
      id: `n${i}`,
      label: en(n.label),
      url: n.url,
      newTab: n.newTab,
      children: n.children.map((c, j) => ({ id: `n${i}c${j}`, label: en(c.label), url: c.url, description: en(c.description) })),
    })),
    cta: { enabled: !!h.cta, label: en(h.cta?.label ?? ''), url: h.cta?.url ?? '', newTab: h.cta?.newTab ?? false },
    topBar: { ...h.topBar, message: en(h.topBar.message) },
    sticky: h.sticky,
    transparentOnHero: h.transparentOnHero,
  };
}

export function defaultFooterDoc(): FooterDoc {
  const f = DEFAULT_FOOTER;
  return {
    quickLinks: f.quickLinks.map((l, i) => ({ id: `q${i}`, label: en(l.label), url: l.url, newTab: l.newTab })),
    showServices: f.showServices,
    copyright: en(f.copyrightText),
    legalLinks: f.legalLinks.map((l, i) => ({ id: `l${i}`, label: en(l.label), url: l.url, newTab: false })),
  };
}

/** Anything (saved JSON, editor input) → a valid HeaderDoc. An empty object gives the starter header. */
export function parseHeader(raw: unknown): HeaderDoc {
  const o = obj(raw);
  if (!Object.keys(o).length) return defaultHeaderDoc();
  const cta = obj(o.cta);
  const top = obj(o.topBar);
  return {
    navItems: arr(o.navItems)
      .slice(0, MAX_NAV_ITEMS)
      .map((v, i) => ({
        ...parseLink(v, i),
        children: arr(obj(v).children)
          .slice(0, MAX_CHILDREN)
          .map((c, j) => {
            const co = obj(c);
            return { id: id(co.id, j), label: parseT(co.label, 80), url: str(co.url, 500), description: parseT(co.description, 160) };
          }),
      })),
    cta: { enabled: bool(cta.enabled, false), label: parseT(cta.label, 40), url: str(cta.url, 500), newTab: bool(cta.newTab, false) },
    topBar: {
      enabled: bool(top.enabled, true),
      message: parseT(top.message, 160),
      showPhone: bool(top.showPhone, true),
      showEmail: bool(top.showEmail, true),
      showSocials: bool(top.showSocials, true),
    },
    sticky: bool(o.sticky, true),
    transparentOnHero: bool(o.transparentOnHero, true),
  };
}

export function parseFooter(raw: unknown): FooterDoc {
  const o = obj(raw);
  if (!Object.keys(o).length) return defaultFooterDoc();
  return {
    quickLinks: arr(o.quickLinks).slice(0, MAX_LINKS).map(parseLink),
    showServices: bool(o.showServices, true),
    copyright: parseT(o.copyright, 200),
    legalLinks: arr(o.legalLinks).slice(0, MAX_LINKS).map(parseLink),
  };
}

/** Allowed link targets: a page on this site (/…), a section (#…), a web address, email or phone. */
export function linkProblem(url: string): string | null {
  if (!url) return 'Add a link.';
  if (/^\/(?!\/)[^\s]*$/.test(url) || /^#[\w-]+$/.test(url) || /^(mailto:|tel:)\S+$/.test(url)) return null;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:' ? null : 'Use a web address starting with https://';
  } catch {
    return 'Use a page on this site (/about-us), or a full address (https://…).';
  }
}

export function headerProblems(doc: HeaderDoc): Problems {
  const p: Problems = {};
  if (!doc.navItems.length) p.navItems = 'Add at least one menu item.';
  doc.navItems.forEach((n, i) => {
    if (!n.label.en) p[`nav.${i}.label`] = 'Add an English label.';
    // A menu item with a dropdown may have no link of its own.
    if (!(n.children.length && !n.url)) {
      const lp = linkProblem(n.url);
      if (lp) p[`nav.${i}.url`] = lp;
    }
    n.children.forEach((c, j) => {
      if (!c.label.en) p[`nav.${i}.${j}.label`] = 'Add an English label.';
      const lp = linkProblem(c.url);
      if (lp) p[`nav.${i}.${j}.url`] = lp;
    });
  });
  if (doc.cta.enabled) {
    if (!doc.cta.label.en) p['cta.label'] = 'Add an English button text.';
    const lp = linkProblem(doc.cta.url);
    if (lp) p['cta.url'] = lp;
  }
  return p;
}

export function footerProblems(doc: FooterDoc): Problems {
  const p: Problems = {};
  const links = (list: LinkDoc[], key: string) =>
    list.forEach((l, i) => {
      if (!l.label.en) p[`${key}.${i}.label`] = 'Add an English label.';
      const lp = linkProblem(l.url);
      if (lp) p[`${key}.${i}.url`] = lp;
    });
  links(doc.quickLinks, 'quickLinks');
  links(doc.legalLinks, 'legalLinks');
  return p;
}

/** Stored header → what the public header component shows, in one language. */
export function resolveHeader(doc: HeaderDoc, locale: Locale): HeaderData {
  return {
    navItems: doc.navItems.map((n) => ({
      label: tr(n.label, locale),
      url: n.url,
      newTab: n.newTab,
      children: n.children.map((c) => ({ label: tr(c.label, locale), url: c.url, description: tr(c.description, locale) })),
    })),
    cta: doc.cta.enabled ? { label: tr(doc.cta.label, locale), url: doc.cta.url, newTab: doc.cta.newTab } : null,
    topBar: { ...doc.topBar, message: tr(doc.topBar.message, locale) },
    sticky: doc.sticky,
    transparentOnHero: doc.transparentOnHero,
  };
}

export function resolveFooter(doc: FooterDoc, locale: Locale): FooterData {
  return {
    quickLinks: doc.quickLinks.map((l) => ({ label: tr(l.label, locale), url: l.url, newTab: l.newTab })),
    showServices: doc.showServices,
    copyrightText: tr(doc.copyright, locale),
    legalLinks: doc.legalLinks.map((l) => ({ label: tr(l.label, locale), url: l.url })),
  };
}
