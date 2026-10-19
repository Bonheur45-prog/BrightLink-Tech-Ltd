'use server';

import { revalidatePath } from 'next/cache';
import type { Locale } from '@/i18n/config';
import { audit } from '@/lib/audit';
import { requireUser } from '@/lib/auth/session';
import { refreshPublicSite } from '@/lib/cms/revalidate';
import { inputFrom, validateSettings, type Errors } from '@/lib/cms/settings-validation';
import { prisma } from '@/lib/db';

export type SettingsFormState = { status: 'idle' } | { status: 'saved'; savedAt: number } | { status: 'error'; message: string; errors: Errors };

/** Settings take effect at once (no draft): a phone number must never wait for a publish. */
export async function saveSettings(_state: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const user = await requireUser();
  const result = validateSettings(inputFrom(formData));
  if (!result.ok) return { status: 'error', message: 'Some fields need attention.', errors: result.errors };
  const { translations, ...data } = result.data;

  // Media ids must point at files that still exist (a file may have been deleted in another tab).
  const ids = [data.logoMediaId, data.logoLightMediaId, data.defaultOgMediaId].filter((v): v is string => !!v);
  const found = new Set((await prisma.mediaAsset.findMany({ where: { id: { in: ids }, deletedAt: null }, select: { id: true } })).map((m) => m.id));
  for (const k of ['logoMediaId', 'logoLightMediaId', 'defaultOgMediaId'] as const) if (data[k] && !found.has(data[k]!)) data[k] = null;

  await prisma.$transaction(async (tx) => {
    await tx.siteSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
    for (const locale of data.enabledLocales) {
      const t = translations[locale as Locale];
      if (t) await tx.siteSettingsTranslation.upsert({ where: { settingsId_locale: { settingsId: 1, locale } }, update: t, create: { settingsId: 1, locale, ...t } });
      else if (locale !== 'en') await tx.siteSettingsTranslation.deleteMany({ where: { settingsId: 1, locale } });
    }
  });
  await audit(user.id, 'settings.update', 'settings', '1');
  refreshPublicSite();
  revalidatePath('/admin', 'layout');
  return { status: 'saved', savedAt: Date.now() };
}
