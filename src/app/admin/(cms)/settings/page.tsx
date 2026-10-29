import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { SettingsForm, type SettingsInitial } from '@/components/admin/SettingsForm/SettingsForm';
import type { PickedMedia } from '@/components/admin/MediaPicker/MediaPicker';
import { locales, type Locale } from '@/i18n/config';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { DEFAULT_BODY_FONT, DEFAULT_HEADING_FONT, isFontKey } from '@/lib/fonts';
import { toAdminMedia } from '@/lib/storage/assets';
import { DEFAULT_SETTINGS } from '@/lib/content/defaults';

export const metadata: Metadata = { title: 'Site settings' };

export default async function SettingsPage() {
  await requireUser();
  const row = await prisma.siteSettings.findUnique({ where: { id: 1 }, include: { translations: true } });
  const ids = [row?.logoMediaId, row?.logoLightMediaId, row?.defaultOgMediaId].filter((v): v is string => !!v);
  const media = ids.length ? await prisma.mediaAsset.findMany({ where: { id: { in: ids } }, include: { translations: true } }) : [];
  const picked = (id: string | null | undefined): PickedMedia | null => {
    const m = media.find((x) => x.id === id);
    if (!m) return null;
    try {
      const a = toAdminMedia(m);
      return { id: a.id, thumbUrl: a.thumbUrl, alt: a.alt, kind: a.kind };
    } catch {
      return { id: m.id, thumbUrl: null, alt: '' }; // R2 address not configured: keep the choice, no preview
    }
  };
  const d = DEFAULT_SETTINGS;
  const t = Object.fromEntries(
    locales.map((l) => {
      const x = row?.translations.find((r) => r.locale === l);
      return [l, { tagline: x?.tagline ?? '', footerDescription: x?.footerDescription ?? '', seoTitle: x?.seoTitle ?? '', seoDescription: x?.seoDescription ?? '' }];
    }),
  ) as SettingsInitial['translations'];
  const socials = Array.isArray(row?.socials) ? (row!.socials as { platform?: string; url?: string }[]) : [];

  const initial: SettingsInitial = {
    companyName: row?.companyName ?? d.companyName,
    legalName: row?.legalName ?? d.legalName,
    phone: row?.phone ?? d.phone,
    secondaryPhone: row?.secondaryPhone ?? d.secondaryPhone,
    publicEmail: row?.publicEmail ?? d.email,
    notificationEmail: row?.notificationEmail ?? d.email,
    addressStreet: row?.addressStreet ?? '',
    addressCity: row?.addressCity ?? d.address.city,
    addressCountry: row?.addressCountry ?? d.address.country,
    addressCountryCode: row?.addressCountryCode ?? d.address.countryCode,
    openingHours: row?.openingHours ?? '',
    socials: Object.fromEntries(socials.filter((s) => s.platform && s.url).map((s) => [s.platform!, s.url!])),
    logo: picked(row?.logoMediaId),
    logoLight: picked(row?.logoLightMediaId),
    defaultOg: picked(row?.defaultOgMediaId),
    titleTemplate: row?.titleTemplate ?? d.seo.titleTemplate,
    googleSiteVerification: row?.googleSiteVerification ?? '',
    googleAnalyticsId: row?.googleAnalyticsId ?? '',
    enabledLocales: (row?.enabledLocales ?? ['en']) as Locale[],
    headingFont: isFontKey(row?.headingFont) ? row!.headingFont : DEFAULT_HEADING_FONT,
    bodyFont: isFontKey(row?.bodyFont) ? row!.bodyFont : DEFAULT_BODY_FONT,
    smoothScroll: row?.smoothScroll ?? true,
    parallax: row?.parallax ?? true,
    translations: t,
  };

  return (
    <>
      <PageHeader title="Site settings" description="Company details, search engine defaults, languages, fonts and motion. Saving updates the website at once." />
      <SettingsForm initial={initial} />
    </>
  );
}
