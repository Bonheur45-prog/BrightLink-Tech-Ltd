import 'server-only';
import type { Locale } from '@/i18n/config';
import { getPublished } from '@/lib/cms/drafts';
import { defaultFooterDoc, defaultHeaderDoc, resolveFooter, resolveHeader } from '@/lib/cms/globals-model';
import { prisma } from '@/lib/db';
import { DEFAULT_BODY_FONT, DEFAULT_HEADING_FONT, isFontKey } from '@/lib/fonts';
import { mediaUrl } from '@/lib/media';
import { cachedPublic } from '@/lib/public-cache';
import { DEFAULT_SETTINGS } from './defaults';
import type { FooterData, HeaderData, MediaRef, SiteSettingsData } from './types';

// Site settings, header and footer for the public site, read from the database (cached; refreshed
// the moment the CMS saves). If the database cannot be reached, the starter content is shown instead
// so the website never goes down because of it.

async function mediaRefs(ids: (string | null)[], locale: Locale): Promise<Map<string, MediaRef>> {
  const wanted = ids.filter((v): v is string => !!v);
  const map = new Map<string, MediaRef>();
  if (!wanted.length) return map;
  const rows = await prisma.mediaAsset.findMany({ where: { id: { in: wanted }, deletedAt: null }, include: { translations: true } });
  for (const m of rows) {
    try {
      const alt = m.translations.find((t) => t.locale === locale)?.alt || m.translations.find((t) => t.locale === 'en')?.alt || '';
      map.set(m.id, { url: mediaUrl(m.objectKey), alt, width: m.width, height: m.height, mimeType: m.mimeType });
    } catch {
      // R2_PUBLIC_HOSTNAME not set: no URL can be built, so the built-in logo/image is used.
    }
  }
  return map;
}

export const loadSiteSettings = cachedPublic('site-settings', async (locale: Locale = 'en'): Promise<SiteSettingsData> => {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: 1 }, include: { translations: true } });
    if (!row) return DEFAULT_SETTINGS;
    const t = row.translations.find((x) => x.locale === locale);
    const en = row.translations.find((x) => x.locale === 'en');
    const pick = (k: 'tagline' | 'footerDescription' | 'seoTitle' | 'seoDescription') => t?.[k] || en?.[k] || '';
    const media = await mediaRefs([row.logoMediaId, row.logoLightMediaId, row.defaultOgMediaId], locale);
    const socials = (Array.isArray(row.socials) ? row.socials : [])
      .map((s) => s as { platform?: unknown; url?: unknown })
      .filter((s): s is { platform: string; url: string } => typeof s.platform === 'string' && typeof s.url === 'string');
    return {
      companyName: row.companyName,
      legalName: row.legalName,
      tagline: pick('tagline'),
      logo: (row.logoMediaId && media.get(row.logoMediaId)) || null,
      logoLight: (row.logoLightMediaId && media.get(row.logoLightMediaId)) || null,
      footerDescription: pick('footerDescription'),
      phone: row.phone,
      secondaryPhone: row.secondaryPhone,
      email: row.publicEmail,
      address: { street: row.addressStreet, city: row.addressCity, country: row.addressCountry, countryCode: row.addressCountryCode },
      openingHours: row.openingHours,
      socials,
      seo: {
        defaultTitle: pick('seoTitle') || DEFAULT_SETTINGS.seo.defaultTitle,
        titleTemplate: row.titleTemplate.includes('%s') ? row.titleTemplate : DEFAULT_SETTINGS.seo.titleTemplate,
        defaultDescription: pick('seoDescription') || DEFAULT_SETTINGS.seo.defaultDescription,
        defaultOgImage: (row.defaultOgMediaId && media.get(row.defaultOgMediaId)) || null,
        googleSiteVerification: row.googleSiteVerification,
      },
      headingFont: isFontKey(row.headingFont) ? row.headingFont : DEFAULT_HEADING_FONT,
      bodyFont: isFontKey(row.bodyFont) ? row.bodyFont : DEFAULT_BODY_FONT,
      smoothScroll: row.smoothScroll,
      parallax: row.parallax,
      enabledLocales: row.enabledLocales,
    };
  } catch (error) {
    console.error('[site] settings could not be loaded; using starter content', error);
    return DEFAULT_SETTINGS;
  }
});

export const loadHeader = cachedPublic('site-header', async (locale: Locale = 'en'): Promise<HeaderData> => {
  try {
    return resolveHeader((await getPublished('header')) ?? defaultHeaderDoc(), locale);
  } catch (error) {
    console.error('[site] header could not be loaded; using starter content', error);
    return resolveHeader(defaultHeaderDoc(), locale);
  }
});

export const loadFooter = cachedPublic('site-footer', async (locale: Locale = 'en'): Promise<FooterData> => {
  try {
    return resolveFooter((await getPublished('footer')) ?? defaultFooterDoc(), locale);
  } catch (error) {
    console.error('[site] footer could not be loaded; using starter content', error);
    return resolveFooter(defaultFooterDoc(), locale);
  }
});
