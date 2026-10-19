import 'server-only';
import type { MediaKind, Prisma } from '@prisma/client';
import type { Locale } from '@/i18n/config';
import { prisma } from '@/lib/db';
import { mediaUrl, parseVariants } from '@/lib/media';
import { processImage } from './image';
import { newUploadId, newUploadKey, variantKeyFor } from './keys';
import { deleteObjects, putObject } from './r2';

/** Shape the CMS screens use for one photo or video. */
export type AdminMedia = {
  id: string;
  kind: MediaKind;
  url: string;
  /** Small copy for grids and previews (a video shows its poster). */
  thumbUrl: string | null;
  posterUrl: string | null;
  width: number;
  height: number;
  sizeBytes: number;
  durationSec: number | null;
  blurDataUrl: string | null;
  /** English alt text (the default language). */
  alt: string;
  alts: Partial<Record<Locale, string>>;
  createdAt: string;
  trashed: boolean;
};

type AssetRow = Prisma.MediaAssetGetPayload<{ include: { translations: true } }>;

export function toAdminMedia(asset: AssetRow): AdminMedia {
  const variants = parseVariants(asset.variants);
  // the first stored copy that is at least 480 px wide is plenty for any CMS preview
  const thumbKey = variants[0]?.key ?? asset.objectKey;
  const alts: Partial<Record<Locale, string>> = {};
  for (const t of asset.translations) alts[t.locale] = t.alt;
  return {
    id: asset.id,
    kind: asset.kind,
    url: mediaUrl(asset.objectKey),
    thumbUrl: asset.kind === 'IMAGE' ? mediaUrl(thumbKey) : asset.posterKey ? mediaUrl(asset.posterKey) : null,
    posterUrl: asset.posterKey ? mediaUrl(asset.posterKey) : null,
    width: asset.width,
    height: asset.height,
    sizeBytes: asset.sizeBytes,
    durationSec: asset.durationSec,
    blurDataUrl: asset.blurDataUrl,
    alt: alts.en ?? '',
    alts,
    createdAt: asset.createdAt.toISOString(),
    trashed: asset.deletedAt !== null,
  };
}

/**
 * Stores one photo: the full-size WebP plus its smaller copies in R2, then the database row.
 * If anything fails after files were written, those files are removed again.
 */
export async function storeImage(input: Buffer, opts: { alt: string; userId: string }): Promise<AdminMedia> {
  const image = await processImage(input);
  const id = newUploadId();
  const key = newUploadKey('webp', new Date(), id);
  const written: string[] = [];
  try {
    await putObject(key, image.data, 'image/webp');
    written.push(key);
    const variants: { w: number; h: number; key: string }[] = [];
    for (const v of image.variants) {
      const variantKey = variantKeyFor(key, v.w);
      await putObject(variantKey, v.data, 'image/webp');
      written.push(variantKey);
      variants.push({ w: v.w, h: v.h, key: variantKey });
    }
    const asset = await prisma.mediaAsset.create({
      data: {
        kind: 'IMAGE',
        objectKey: key,
        mimeType: 'image/webp',
        sizeBytes: image.data.length,
        width: image.width,
        height: image.height,
        variants: variants as unknown as Prisma.InputJsonValue,
        blurDataUrl: image.blurDataUrl,
        uploadedById: opts.userId,
        translations: { create: { locale: 'en', alt: opts.alt } },
      },
      include: { translations: true },
    });
    return toAdminMedia(asset);
  } catch (error) {
    await deleteObjects(written).catch(() => {});
    throw error;
  }
}

type NewVideo = {
  objectKey: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  durationSec: number;
  posterKey: string | null;
  blurDataUrl: string | null;
  alt: string;
  userId: string;
};

export async function createVideoAsset(v: NewVideo): Promise<AdminMedia> {
  const { alt, userId, ...fields } = v;
  const asset = await prisma.mediaAsset.create({
    data: { kind: 'VIDEO', ...fields, uploadedById: userId, translations: { create: { locale: 'en', alt } } },
    include: { translations: true },
  });
  return toAdminMedia(asset);
}

// ───────────── Where is a file used? ─────────────

/**
 * Names of the places that use a file, e.g. ["Home page", "Service: Web design"]. Empty = unused.
 * Pages and the header/footer keep media ids inside JSON, so those are found by text search; everything
 * else is a normal database reference.
 */
export async function mediaUsage(id: string): Promise<string[]> {
  const like = `%${id}%`;
  const [pages, globals, settings, services, projects, gallery, clients, team, posts, svcOg, prjOg, postOg] = await Promise.all([
    prisma.$queryRaw<{ key: string }[]>`SELECT key FROM "Page" WHERE draft::text LIKE ${like} OR published::text LIKE ${like}`,
    prisma.$queryRaw<{ key: string }[]>`SELECT key FROM "GlobalSection" WHERE draft::text LIKE ${like} OR published::text LIKE ${like}`,
    prisma.siteSettings.count({ where: { OR: [{ logoMediaId: id }, { logoLightMediaId: id }, { defaultOgMediaId: id }] } }),
    prisma.service.findMany({ where: { coverMediaId: id }, select: { slug: true }, take: 5 }),
    prisma.project.findMany({ where: { coverMediaId: id }, select: { slug: true }, take: 5 }),
    prisma.projectMedia.findMany({ where: { mediaId: id }, select: { project: { select: { slug: true } } }, take: 5 }),
    prisma.client.findMany({ where: { logoMediaId: id }, select: { name: true }, take: 5 }),
    prisma.teamMember.findMany({ where: { photoMediaId: id }, select: { name: true }, take: 5 }),
    prisma.post.findMany({ where: { coverMediaId: id }, select: { slug: true }, take: 5 }),
    prisma.serviceTranslation.findMany({ where: { ogMediaId: id }, select: { service: { select: { slug: true } } }, take: 5 }),
    prisma.projectTranslation.findMany({ where: { ogMediaId: id }, select: { project: { select: { slug: true } } }, take: 5 }),
    prisma.postTranslation.findMany({ where: { ogMediaId: id }, select: { post: { select: { slug: true } } }, take: 5 }),
  ]);
  const uses: string[] = [];
  for (const p of pages) uses.push(`Page: ${p.key}`);
  for (const g of globals) uses.push(`Site-wide: ${g.key}`);
  if (settings) uses.push('Site settings');
  for (const s of services) uses.push(`Service: ${s.slug}`);
  for (const p of projects) uses.push(`Project: ${p.slug}`);
  for (const g of gallery) uses.push(`Project gallery: ${g.project.slug}`);
  for (const c of clients) uses.push(`Client: ${c.name}`);
  for (const t of team) uses.push(`Team: ${t.name}`);
  for (const p of posts) uses.push(`Blog post: ${p.slug}`);
  for (const s of svcOg) uses.push(`Service share image: ${s.service.slug}`);
  for (const p of prjOg) uses.push(`Project share image: ${p.project.slug}`);
  for (const p of postOg) uses.push(`Post share image: ${p.post.slug}`);
  return [...new Set(uses)];
}

// ───────────── Library queries ─────────────

export const LIBRARY_PAGE_SIZE = 36;

export type LibraryQuery = { q?: string; kind?: 'IMAGE' | 'VIDEO'; trash?: boolean; page?: number };

export async function listMedia({ q, kind, trash = false, page = 1 }: LibraryQuery) {
  const where: Prisma.MediaAssetWhereInput = {
    deletedAt: trash ? { not: null } : null,
    ...(kind && { kind }),
    ...(q && { translations: { some: { alt: { contains: q, mode: 'insensitive' } } } }),
  };
  const [rows, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      include: { translations: true },
      orderBy: { createdAt: 'desc' },
      skip: (Math.max(1, page) - 1) * LIBRARY_PAGE_SIZE,
      take: LIBRARY_PAGE_SIZE,
    }),
    prisma.mediaAsset.count({ where }),
  ]);
  return { items: rows.map(toAdminMedia), total };
}

// ───────────── Removing files ─────────────

/**
 * Deletes media for good: database rows first, then the files in R2. A failed R2 delete only leaves an
 * unused file behind (logged); it never leaves the site pointing at a missing file.
 */
export async function deleteMediaAssets(mediaIds: string[]) {
  if (!mediaIds.length) return;
  const assets = await prisma.mediaAsset.findMany({
    where: { id: { in: mediaIds } },
    select: { id: true, objectKey: true, posterKey: true, variants: true },
  });
  await prisma.mediaAsset.deleteMany({ where: { id: { in: mediaIds } } });
  const keys = assets.flatMap((a) => [a.objectKey, a.posterKey, ...parseVariants(a.variants).map((v) => v.key)]).filter((k): k is string => !!k);
  try {
    await deleteObjects(keys);
  } catch (error) {
    console.error('media: rows deleted but these R2 files could not be removed:', keys, error);
  }
}
