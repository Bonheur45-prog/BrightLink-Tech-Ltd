import 'server-only';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { refreshPublicSite } from '@/lib/cms/revalidate';
import { PAGES, type FixedPageKey } from '@/lib/pages/catalogue';
import { FIXED_PAGE_DEFAULTS, servicePageDefault } from '@/lib/pages/defaults';
import { mediaIdsOf, pageProblems, parsePage, type PageDoc } from '@/lib/pages/model';
import { footerProblems, headerProblems, parseFooter, parseHeader, type FooterDoc, type HeaderDoc, type Problems } from './globals-model';

/*
 * Draft → publish → version history (same rules as Oak):
 * - Editors only change the DRAFT; visitors see PUBLISHED.
 * - Every publish stores a snapshot in ContentVersion, so an earlier version can be brought back.
 * Keys: "header", "footer" (GlobalSection), the fixed pages "home", "about"… and "service-<serviceId>" (Page).
 */

export type DocKey = 'header' | 'footer' | FixedPageKey | `service-${string}`;
type DocOf<K> = K extends 'header' ? HeaderDoc : K extends 'footer' ? FooterDoc : PageDoc;

const FIXED = PAGES.map((p) => p.key) as readonly string[];
export const isDocKey = (v: unknown): v is DocKey =>
  typeof v === 'string' && (v === 'header' || v === 'footer' || FIXED.includes(v) || /^service-[a-z0-9]{10,40}$/.test(v));
export const isPageDoc = (k: DocKey) => k !== 'header' && k !== 'footer';

type Spec = { table: 'page' | 'global'; parse: (raw: unknown) => unknown; problems: (doc: never) => Problems };

async function specFor(k: DocKey): Promise<Spec> {
  if (k === 'header') return { table: 'global', parse: parseHeader, problems: headerProblems };
  if (k === 'footer') return { table: 'global', parse: parseFooter, problems: footerProblems };
  if (FIXED.includes(k)) return { table: 'page', parse: (raw) => parsePage(raw, FIXED_PAGE_DEFAULTS[k as FixedPageKey]), problems: pageProblems };
  // a service page starts from the service's own name and description
  const service = await prisma.service.findUnique({ where: { id: k.slice('service-'.length) }, include: { translations: { where: { locale: 'en' } } } });
  const t = service?.translations[0];
  const fallback = () => servicePageDefault({ slug: service?.slug ?? '', title: t?.title ?? '', shortDescription: t?.shortDescription ?? '', features: Array.isArray(t?.features) ? (t!.features as string[]) : [] });
  return { table: 'page', parse: (raw) => parsePage(raw, fallback), problems: pageProblems };
}

const MAX_VERSIONS = 30;

async function readRow(k: DocKey, table: Spec['table']) {
  return table === 'page' ? prisma.page.findUnique({ where: { key: k } }) : prisma.globalSection.findUnique({ where: { key: k } });
}

async function write(k: DocKey, table: Spec['table'], data: { draft: Prisma.InputJsonValue; published?: Prisma.InputJsonValue; publishedAt?: Date }, tx: Prisma.TransactionClient = prisma) {
  const args = { where: { key: k }, update: data, create: { key: k, ...data } };
  if (table === 'page') await tx.page.upsert(args);
  else await tx.globalSection.upsert(args);
}

const hasContent = (v: Prisma.JsonValue | null | undefined) => !!v && typeof v === 'object' && Object.keys(v).length > 0;

export type EditorState<K extends DocKey> = { draft: DocOf<K>; publishedAt: Date | null; hasUnpublishedChanges: boolean };

export async function getEditorState<K extends DocKey>(k: K): Promise<EditorState<K>> {
  const s = await specFor(k);
  const row = await readRow(k, s.table);
  const published = hasContent(row?.published) ? s.parse(row!.published) : null;
  const draft = hasContent(row?.draft) ? s.parse(row!.draft) : (published ?? s.parse({}));
  return { draft: draft as DocOf<K>, publishedAt: row?.publishedAt ?? null, hasUnpublishedChanges: JSON.stringify(draft) !== JSON.stringify(published) };
}

/** What visitors see, or null when nothing was published yet (the site then uses its starter content). */
export async function getPublished<K extends DocKey>(k: K): Promise<DocOf<K> | null> {
  const s = await specFor(k);
  const row = await readRow(k, s.table);
  return hasContent(row?.published) ? (s.parse(row!.published) as DocOf<K>) : null;
}

export async function saveDraft<K extends DocKey>(k: K, raw: unknown): Promise<DocOf<K>> {
  const s = await specFor(k);
  const doc = s.parse(raw) as DocOf<K>;
  await write(k, s.table, { draft: doc as unknown as Prisma.InputJsonValue });
  return doc;
}

/** Photos used on a page must have an English description (alt text) before it is published. */
async function altTextProblems(doc: PageDoc): Promise<Problems> {
  const uses = mediaIdsOf(doc);
  if (!uses.length) return {};
  const rows = await prisma.mediaAsset.findMany({ where: { id: { in: [...new Set(uses.map((u) => u.id))] } }, include: { translations: { where: { locale: 'en' } } } });
  const p: Problems = {};
  for (const u of uses) {
    const m = rows.find((r) => r.id === u.id);
    if (!m || m.deletedAt) p[u.where] = 'This photo was deleted. Choose another one.';
    else if (m.kind === 'IMAGE' && !m.translations[0]?.alt) p[u.where] = 'This photo has no description. Add one in the Media library (it helps Google and screen readers).';
  }
  return p;
}

export async function publish(k: DocKey, userId: string, note?: string): Promise<{ ok: true } | { ok: false; problems: Problems }> {
  const s = await specFor(k);
  const { draft } = await getEditorState(k);
  const problems = { ...(s.problems as (d: unknown) => Problems)(draft), ...(isPageDoc(k) ? await altTextProblems(draft as PageDoc) : {}) };
  if (Object.keys(problems).length) return { ok: false, problems };
  const json = draft as unknown as Prisma.InputJsonValue;
  await prisma.$transaction(async (tx) => {
    await write(k, s.table, { draft: json, published: json, publishedAt: new Date() }, tx);
    await tx.contentVersion.create({ data: { entityType: s.table, entityKey: k, snapshot: json, note: note?.trim().slice(0, 200) || null, createdById: userId } });
    const old = await tx.contentVersion.findMany({ where: { entityType: s.table, entityKey: k }, orderBy: { createdAt: 'desc' }, skip: MAX_VERSIONS, select: { id: true } });
    if (old.length) await tx.contentVersion.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
  });
  refreshPublicSite();
  return { ok: true };
}

/** Throws away unpublished changes: the draft becomes what is live again. */
export async function discardDraft(k: DocKey) {
  const s = await specFor(k);
  const row = await readRow(k, s.table);
  await write(k, s.table, { draft: (row?.published ?? {}) as Prisma.InputJsonValue });
}

export type VersionRow = { id: string; createdAt: Date; note: string | null; by: string | null };

export async function listVersions(k: DocKey): Promise<VersionRow[]> {
  const s = await specFor(k);
  const rows = await prisma.contentVersion.findMany({ where: { entityType: s.table, entityKey: k }, orderBy: { createdAt: 'desc' }, select: { id: true, createdAt: true, note: true, createdById: true } });
  const ids = rows.map((r) => r.createdById).filter((v): v is string => !!v);
  const users = ids.length ? await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } }) : [];
  return rows.map((r) => ({ id: r.id, createdAt: r.createdAt, note: r.note, by: users.find((u) => u.id === r.createdById)?.name ?? null }));
}

/** Copies a published version into the draft. Nothing changes on the site until the next publish. */
export async function restoreVersion(k: DocKey, versionId: string): Promise<boolean> {
  const s = await specFor(k);
  const v = await prisma.contentVersion.findFirst({ where: { id: versionId, entityType: s.table, entityKey: k } });
  if (!v) return false;
  await saveDraft(k, v.snapshot);
  return true;
}
