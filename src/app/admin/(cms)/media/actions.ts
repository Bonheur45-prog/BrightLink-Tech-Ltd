'use server';

import { revalidatePath } from 'next/cache';
import { audit } from '@/lib/audit';
import { requireUser } from '@/lib/auth/session';
import { refreshPublicSite } from '@/lib/cms/revalidate';
import { prisma } from '@/lib/db';
import { locales, type Locale } from '@/i18n/config';
import { LIBRARY_PAGE_SIZE, deleteMediaAssets, listMedia, mediaUsage } from '@/lib/storage/assets';

export type MediaActionResult = { ok: true } | { ok: false; error: string };

const ID = /^[a-z0-9]{10,40}$/;
const done = (): MediaActionResult => {
  revalidatePath('/admin/media');
  return { ok: true };
};

/** Saves the alt text of one file in every language that has any. Alt text is what screen readers and Google read. */
export async function saveAlt(mediaId: string, alts: Partial<Record<Locale, string>>): Promise<MediaActionResult> {
  const user = await requireUser();
  if (!ID.test(mediaId)) return { ok: false, error: 'Unknown file.' };
  const exists = await prisma.mediaAsset.findUnique({ where: { id: mediaId }, select: { id: true } });
  if (!exists) return { ok: false, error: 'This file no longer exists.' };
  await prisma.$transaction(async (tx) => {
    for (const locale of locales) {
      const alt = String(alts[locale] ?? '').trim().slice(0, 300);
      if (locale !== 'en' && !alt) {
        await tx.mediaAssetTranslation.deleteMany({ where: { mediaId, locale } });
      } else {
        await tx.mediaAssetTranslation.upsert({ where: { mediaId_locale: { mediaId, locale } }, update: { alt }, create: { mediaId, locale, alt } });
      }
    }
  });
  await audit(user.id, 'media.alt', 'media', mediaId);
  refreshPublicSite();
  return done();
}

/** Moves a file to the trash. Refused while a page, service, project... still uses it. */
export async function trashMedia(mediaId: string): Promise<MediaActionResult> {
  const user = await requireUser();
  if (!ID.test(mediaId)) return { ok: false, error: 'Unknown file.' };
  const uses = await mediaUsage(mediaId);
  if (uses.length) return { ok: false, error: `Still in use: ${uses.slice(0, 4).join(', ')}${uses.length > 4 ? '…' : ''}. Replace it there first.` };
  await prisma.mediaAsset.updateMany({ where: { id: mediaId }, data: { deletedAt: new Date() } });
  await audit(user.id, 'media.trash', 'media', mediaId);
  return done();
}

export async function restoreMedia(mediaId: string): Promise<MediaActionResult> {
  const user = await requireUser();
  if (!ID.test(mediaId)) return { ok: false, error: 'Unknown file.' };
  await prisma.mediaAsset.updateMany({ where: { id: mediaId }, data: { deletedAt: null } });
  await audit(user.id, 'media.restore', 'media', mediaId);
  return done();
}

/** Deletes a trashed file for good, including its files in R2. */
export async function deleteMediaForever(mediaId: string): Promise<MediaActionResult> {
  const user = await requireUser();
  if (!ID.test(mediaId)) return { ok: false, error: 'Unknown file.' };
  const row = await prisma.mediaAsset.findUnique({ where: { id: mediaId }, select: { deletedAt: true } });
  if (!row) return { ok: false, error: 'This file no longer exists.' };
  if (!row.deletedAt) return { ok: false, error: 'Move it to the trash first.' };
  const uses = await mediaUsage(mediaId);
  if (uses.length) return { ok: false, error: `Still in use: ${uses.slice(0, 4).join(', ')}. Replace it there first.` };
  await deleteMediaAssets([mediaId]);
  await audit(user.id, 'media.delete', 'media', mediaId);
  return done();
}

export type PickerItem = { id: string; kind: 'IMAGE' | 'VIDEO'; thumbUrl: string | null; alt: string; width: number; height: number };

/** One page of the library for the media picker. */
export async function browseMedia(opts: { q?: string; page?: number; kind?: 'IMAGE' | 'VIDEO' }): Promise<{ items: PickerItem[]; total: number; pageSize: number }> {
  await requireUser();
  const q = String(opts.q ?? '').trim().slice(0, 100) || undefined;
  const page = Math.max(1, Math.min(1000, Number(opts.page) || 1));
  const kind = opts.kind === 'VIDEO' || opts.kind === 'IMAGE' ? opts.kind : undefined;
  const { items, total } = await listMedia({ q, kind, page });
  return {
    items: items.map((m) => ({ id: m.id, kind: m.kind, thumbUrl: m.thumbUrl, alt: m.alt, width: m.width, height: m.height })),
    total,
    pageSize: LIBRARY_PAGE_SIZE,
  };
}
