import 'server-only';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { refreshPublicSite } from '@/lib/cms/revalidate';
import { footerProblems, headerProblems, parseFooter, parseHeader, type FooterDoc, type HeaderDoc, type Problems } from './globals-model';

/*
 * Draft → publish → version history (same rules as Oak):
 * - Editors only change the DRAFT; visitors see PUBLISHED.
 * - Every publish stores a snapshot in ContentVersion, so an earlier version can be brought back.
 * Phase 4 adds the pages to SPEC.
 */

type Docs = { header: HeaderDoc; footer: FooterDoc };
export type DocKey = keyof Docs;
export const DOC_KEYS = ['header', 'footer'] as const satisfies readonly DocKey[];
export const isDocKey = (v: unknown): v is DocKey => (DOC_KEYS as readonly unknown[]).includes(v);

const SPEC: { [K in DocKey]: { table: 'page' | 'global'; key: string; parse: (raw: unknown) => Docs[K]; problems: (doc: Docs[K]) => Problems } } = {
  header: { table: 'global', key: 'header', parse: parseHeader, problems: headerProblems },
  footer: { table: 'global', key: 'footer', parse: parseFooter, problems: footerProblems },
};

const MAX_VERSIONS = 30;

async function readRow(k: DocKey) {
  const s = SPEC[k];
  return s.table === 'page' ? prisma.page.findUnique({ where: { key: s.key } }) : prisma.globalSection.findUnique({ where: { key: s.key } });
}

async function write(k: DocKey, data: { draft: Prisma.InputJsonValue; published?: Prisma.InputJsonValue; publishedAt?: Date }, tx: Prisma.TransactionClient = prisma) {
  const s = SPEC[k];
  const args = { where: { key: s.key }, update: data, create: { key: s.key, ...data } };
  if (s.table === 'page') await tx.page.upsert(args);
  else await tx.globalSection.upsert(args);
}

const hasContent = (v: Prisma.JsonValue | null | undefined) => !!v && typeof v === 'object' && Object.keys(v).length > 0;

export type EditorState<K extends DocKey> = { draft: Docs[K]; publishedAt: Date | null; hasUnpublishedChanges: boolean };

export async function getEditorState<K extends DocKey>(k: K): Promise<EditorState<K>> {
  const s = SPEC[k];
  const row = await readRow(k);
  const published = hasContent(row?.published) ? (s.parse(row!.published) as Docs[K]) : null;
  const draft = hasContent(row?.draft) ? (s.parse(row!.draft) as Docs[K]) : (published ?? (s.parse({}) as Docs[K]));
  return { draft, publishedAt: row?.publishedAt ?? null, hasUnpublishedChanges: JSON.stringify(draft) !== JSON.stringify(published) };
}

/** What visitors see, or null when nothing was published yet (the site then uses its starter content). */
export async function getPublished<K extends DocKey>(k: K): Promise<Docs[K] | null> {
  const row = await readRow(k);
  return hasContent(row?.published) ? (SPEC[k].parse(row!.published) as Docs[K]) : null;
}

export async function saveDraft<K extends DocKey>(k: K, raw: unknown): Promise<Docs[K]> {
  const doc = SPEC[k].parse(raw) as Docs[K];
  await write(k, { draft: doc as unknown as Prisma.InputJsonValue });
  return doc;
}

export async function publish(k: DocKey, userId: string, note?: string): Promise<{ ok: true } | { ok: false; problems: Problems }> {
  const s = SPEC[k];
  const { draft } = await getEditorState(k);
  const problems = (s.problems as (d: unknown) => Problems)(draft);
  if (Object.keys(problems).length) return { ok: false, problems };
  const json = draft as unknown as Prisma.InputJsonValue;
  await prisma.$transaction(async (tx) => {
    await write(k, { draft: json, published: json, publishedAt: new Date() }, tx);
    await tx.contentVersion.create({ data: { entityType: s.table, entityKey: s.key, snapshot: json, note: note?.trim().slice(0, 200) || null, createdById: userId } });
    const old = await tx.contentVersion.findMany({
      where: { entityType: s.table, entityKey: s.key },
      orderBy: { createdAt: 'desc' },
      skip: MAX_VERSIONS,
      select: { id: true },
    });
    if (old.length) await tx.contentVersion.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
  });
  refreshPublicSite();
  return { ok: true };
}

/** Throws away unpublished changes: the draft becomes what is live again. */
export async function discardDraft(k: DocKey) {
  const row = await readRow(k);
  await write(k, { draft: (row?.published ?? {}) as Prisma.InputJsonValue });
}

export type VersionRow = { id: string; createdAt: Date; note: string | null; by: string | null };

export async function listVersions(k: DocKey): Promise<VersionRow[]> {
  const s = SPEC[k];
  const rows = await prisma.contentVersion.findMany({
    where: { entityType: s.table, entityKey: s.key },
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true, note: true, createdById: true },
  });
  const ids = rows.map((r) => r.createdById).filter((v): v is string => !!v);
  const users = ids.length ? await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } }) : [];
  return rows.map((r) => ({ id: r.id, createdAt: r.createdAt, note: r.note, by: users.find((u) => u.id === r.createdById)?.name ?? null }));
}

/** Copies a published version into the draft. Nothing changes on the site until the next publish. */
export async function restoreVersion(k: DocKey, versionId: string): Promise<boolean> {
  const s = SPEC[k];
  const v = await prisma.contentVersion.findFirst({ where: { id: versionId, entityType: s.table, entityKey: s.key } });
  if (!v) return false;
  await saveDraft(k, v.snapshot);
  return true;
}
