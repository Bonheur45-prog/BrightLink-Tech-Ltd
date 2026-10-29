import { locales, type Locale } from '@/i18n/config';
import { DEFAULT_BODY_FONT, DEFAULT_HEADING_FONT, isFontKey, type FontKey } from '@/lib/fonts';

// Pure validation of the Site settings form (tested in settings-validation.test.ts).

export type Input = { get(name: string): string; getAll(name: string): string[] };
export type Errors = Record<string, string>;

/** FormData → Input (files are ignored). */
export function inputFrom(data: FormData): Input {
  return {
    get: (name) => {
      const v = data.get(name);
      return typeof v === 'string' ? v : '';
    },
    getAll: (name) => data.getAll(name).filter((v): v is string => typeof v === 'string'),
  };
}

export const SOCIAL_NETWORKS = [
  { key: 'linkedin', label: 'LinkedIn', host: /(^|\.)linkedin\.com$/ },
  { key: 'facebook', label: 'Facebook', host: /(^|\.)(facebook|fb)\.com$/ },
  { key: 'instagram', label: 'Instagram', host: /(^|\.)instagram\.com$/ },
  { key: 'x', label: 'X (Twitter)', host: /(^|\.)(x|twitter)\.com$/ },
  { key: 'youtube', label: 'YouTube', host: /(^|\.)(youtube\.com|youtu\.be)$/ },
  { key: 'tiktok', label: 'TikTok', host: /(^|\.)tiktok\.com$/ },
  { key: 'whatsapp', label: 'WhatsApp', host: /(^|\.)(wa\.me|whatsapp\.com)$/ },
] as const;

export type SettingsTranslationData = { tagline: string; footerDescription: string; seoTitle: string; seoDescription: string };

export type SettingsData = {
  companyName: string;
  legalName: string;
  phone: string;
  secondaryPhone: string;
  publicEmail: string;
  notificationEmail: string;
  addressStreet: string;
  addressCity: string;
  addressCountry: string;
  addressCountryCode: string;
  openingHours: string;
  socials: { platform: string; url: string }[];
  logoMediaId: string | null;
  logoLightMediaId: string | null;
  defaultOgMediaId: string | null;
  titleTemplate: string;
  googleSiteVerification: string;
  googleAnalyticsId: string;
  enabledLocales: Locale[];
  headingFont: FontKey;
  bodyFont: FontKey;
  smoothScroll: boolean;
  parallax: boolean;
  translations: Partial<Record<Locale, SettingsTranslationData>>;
};

export type Validation<T> = { ok: true; data: T } | { ok: false; errors: Errors };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s()-]{7,25}$/;
const MEDIA_ID = /^[a-z0-9]{10,40}$/;

/** Google gives a whole <meta> tag; people paste it. Keep only the code. */
export function verificationCode(raw: string): string {
  const v = raw.trim();
  const m = v.match(/content=["']([^"']+)["']/i);
  return (m ? m[1] : v).trim();
}

/** The "G-…" ID from whatever was pasted: the ID itself or Google's whole tag snippet. */
export function analyticsId(raw: string): string {
  const v = raw.trim();
  const m = v.match(/\bG-[A-Z0-9]{4,20}\b/i);
  return (m ? m[0] : v).toUpperCase();
}

export function validateSettings(input: Input): Validation<SettingsData> {
  const errors: Errors = {};
  const text = (name: string, label: string, max: number, required = false) => {
    const value = input.get(name).trim();
    if (required && !value) errors[name] = `${label} is required.`;
    else if (value.length > max) errors[name] = `${label} can be at most ${max} characters.`;
    return value;
  };
  const email = (name: string, label: string) => {
    const value = input.get(name).trim().toLowerCase();
    if (!value) errors[name] = `${label} is required.`;
    else if (!EMAIL.test(value) || value.length > 200) errors[name] = 'Use a valid email address.';
    return value;
  };
  const phone = (name: string) => {
    const value = input.get(name).trim();
    if (value && !PHONE.test(value)) errors[name] = 'Use a phone number like +250 782 567 921.';
    return value;
  };
  const media = (name: string) => {
    const value = input.get(name).trim();
    return MEDIA_ID.test(value) ? value : null;
  };

  const companyName = text('companyName', 'Company name', 120, true);
  const legalName = text('legalName', 'Legal name', 160, true);
  const ph = phone('phone');
  const secondaryPhone = phone('secondaryPhone');
  const publicEmail = email('publicEmail', 'Public email');
  const notificationEmail = email('notificationEmail', 'Notification email');
  const addressStreet = text('addressStreet', 'Street', 200);
  const addressCity = text('addressCity', 'City', 80);
  const addressCountry = text('addressCountry', 'Country', 80);
  const addressCountryCode = input.get('addressCountryCode').trim().toUpperCase();
  if (addressCountryCode && !/^[A-Z]{2}$/.test(addressCountryCode)) errors.addressCountryCode = 'Use the 2-letter code, e.g. RW.';
  const openingHours = text('openingHours', 'Opening hours', 200);

  const socials: { platform: string; url: string }[] = [];
  for (const network of SOCIAL_NETWORKS) {
    const name = `social.${network.key}`;
    const raw = input.get(name).trim();
    if (!raw) continue;
    let url: URL | null = null;
    try {
      url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    } catch {
      url = null;
    }
    if (!url || url.protocol !== 'https:' || !network.host.test(url.hostname.replace(/^www\./, ''))) {
      errors[name] = `Paste the full ${network.label} link (https://…).`;
    } else socials.push({ platform: network.key, url: url.toString() });
  }

  const titleTemplate = text('titleTemplate', 'Title pattern', 120, true);
  if (titleTemplate && !errors.titleTemplate && (titleTemplate.match(/%s/g) ?? []).length !== 1) {
    errors.titleTemplate = 'Include %s exactly once: it is replaced by the page title.';
  }
  const googleSiteVerification = verificationCode(input.get('googleSiteVerification'));
  if (googleSiteVerification.length > 120 || /[\s<>"]/.test(googleSiteVerification)) {
    errors.googleSiteVerification = 'Paste only the code Google gives you (or the whole meta tag).';
  }

  const googleAnalyticsId = analyticsId(input.get('googleAnalyticsId'));
  if (googleAnalyticsId && !/^G-[A-Z0-9]{4,20}$/.test(googleAnalyticsId)) {
    errors.googleAnalyticsId = 'Paste the Measurement ID from Google Analytics. It starts with G-, e.g. G-AB12CD34EF.';
  }

  const chosen = input.getAll('enabledLocales');
  const enabledLocales = locales.filter((l) => l === 'en' || chosen.includes(l)); // English is always on

  const hf = input.get('headingFont');
  const bf = input.get('bodyFont');

  const translations: Partial<Record<Locale, SettingsTranslationData>> = {};
  for (const locale of locales) {
    const t = (field: string, label: string, max: number, required = false) =>
      text(`${field}.${locale}`, label, max, required && locale === 'en');
    const row = {
      tagline: t('tagline', 'Tagline', 200),
      footerDescription: t('footerDescription', 'Footer description', 500),
      seoTitle: t('seoTitle', 'Default page title', 120, true),
      seoDescription: t('seoDescription', 'Default description', 300, true),
    };
    if (locale === 'en' || Object.values(row).some(Boolean)) translations[locale] = row;
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      companyName,
      legalName,
      phone: ph,
      secondaryPhone,
      publicEmail,
      notificationEmail,
      addressStreet,
      addressCity,
      addressCountry,
      addressCountryCode,
      openingHours,
      socials,
      logoMediaId: media('logoMediaId'),
      logoLightMediaId: media('logoLightMediaId'),
      defaultOgMediaId: media('defaultOgMediaId'),
      titleTemplate,
      googleSiteVerification,
      googleAnalyticsId,
      enabledLocales,
      headingFont: isFontKey(hf) ? hf : DEFAULT_HEADING_FONT,
      bodyFont: isFontKey(bf) ? bf : DEFAULT_BODY_FONT,
      smoothScroll: input.get('smoothScroll') === 'on',
      parallax: input.get('parallax') === 'on',
      translations,
    },
  };
}
