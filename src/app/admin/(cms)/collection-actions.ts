'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { ICON_KEYS } from '@/components/ui/Icons';
import { locales } from '@/i18n/config';
import { audit } from '@/lib/audit';
import { requireUser } from '@/lib/auth/session';
import { validateClient, validateProject, validateService, validateTeam } from '@/lib/cms/collections-validation';
import { refreshPublicSite } from '@/lib/cms/revalidate';
import { inputFrom, type Errors } from '@/lib/cms/settings-validation';
import { slugify, uniqueSlug } from '@/lib/cms/slug';
import { prisma } from '@/lib/db';

// Create / save / trash / restore / delete for services, projects, clients and team members.
// Every change refreshes the public site; slug renames leave a redirect behind so old links keep working.

export type Kind = 'services' | 'projects' | 'clients' | 'team';
export type EntityFormState = { status: 'idle' } | { status: 'saved'; savedAt: number } | { status: 'error'; message: string; errors: Errors };

const KINDS: Kind[] = ['services', 'projects', 'clients', 'team'];
const ID = /^[a-z0-9]{10,40}$/;
const fail = (errors: Errors, message = 'Some fields need attention.'): EntityFormState => ({ status: 'error', message, errors });
const PUBLIC_PATH = { services: '/our-services', projects: '/our-projects' } as const;

function done(kind: Kind): EntityFormState {
  refreshPublicSite();
  revalidatePath(`/admin/${kind}`, 'layout');
  return { status: 'saved', savedAt: Date.now() };
}

/** Media ids that still exist (a file may have been deleted in another tab). */
async function existing(ids: (string | null)[]): Promise<Set<string>> {
  const list = ids.filter((v): v is string => !!v);
  if (!list.length) return new Set();
  const rows = await prisma.mediaAsset.findMany({ where: { id: { in: list }, deletedAt: null }, select: { id: true } });
  return new Set(rows.map((r) => r.id));
}

/** Old address → new address after a slug rename. Chains are flattened; a redirect never points at itself. */
async function renameRedirect(tx: Prisma.TransactionClient, base: string, oldSlug: string, newSlug: string) {
  if (oldSlug === newSlug) return;
  const from = `${base}/${oldSlug}`;
  const to = `${base}/${newSlug}`;
  await tx.redirect.deleteMany({ where: { fromPath: to } });
  await tx.redirect.updateMany({ where: { toPath: from }, data: { toPath: to } });
  await tx.redirect.upsert({ where: { fromPath: from }, update: { toPath: to, permanent: true }, create: { fromPath: from, toPath: to } });
}

// ───────── Create (name only, then the editor opens) ─────────

export async function createEntity(kind: Kind, formData: FormData) {
  const user = await requireUser();
  if (!KINDS.includes(kind)) redirect('/admin');
  const name = String(formData.get('name') ?? '').trim().slice(0, 120);
  if (!name) redirect(`/admin/${kind}?error=missing-title`);
  let id: string;
  if (kind === 'services' || kind === 'projects') {
    const slug = await uniqueSlug(slugify(name), async (s) =>
      kind === 'services' ? !!(await prisma.service.findUnique({ where: { slug: s }, select: { id: true } })) : !!(await prisma.project.findUnique({ where: { slug: s }, select: { id: true } })),
    );
    const max = kind === 'services' ? await prisma.service.aggregate({ _max: { sortOrder: true } }) : await prisma.project.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (max._max.sortOrder ?? 0) + 10;
    id =
      kind === 'services'
        ? (await prisma.service.create({ data: { slug, status: 'DRAFT', sortOrder, translations: { create: { locale: 'en', title: name } } } })).id
        : (await prisma.project.create({ data: { slug, status: 'DRAFT', sortOrder, translations: { create: { locale: 'en', title: name } } } })).id;
  } else if (kind === 'clients') {
    const max = await prisma.client.aggregate({ _max: { sortOrder: true } });
    id = (await prisma.client.create({ data: { name, status: 'DRAFT', sortOrder: (max._max.sortOrder ?? 0) + 10 } })).id;
  } else {
    const max = await prisma.teamMember.aggregate({ _max: { sortOrder: true } });
    id = (await prisma.teamMember.create({ data: { name, status: 'DRAFT', sortOrder: (max._max.sortOrder ?? 0) + 10, translations: { create: { locale: 'en' } } } })).id;
  }
  await audit(user.id, `${kind}.create`, kind, id, { name });
  redirect(`/admin/${kind}/${id}?notice=created`);
}

// ───────── Save ─────────

export async function saveService(id: string, _s: EntityFormState, formData: FormData): Promise<EntityFormState> {
  const user = await requireUser();
  const current = ID.test(id) ? await prisma.service.findUnique({ where: { id }, select: { slug: true, deletedAt: true } }) : null;
  if (!current || current.deletedAt) return fail({}, 'This service no longer exists or is in the trash.');
  const r = validateService(inputFrom(formData), ICON_KEYS());
  if (!r.ok) return fail(r.errors);
  const { translations, ...d } = r.data;
  if (await prisma.service.findFirst({ where: { slug: d.slug, id: { not: id } }, select: { id: true } })) return fail({ slug: 'Another service already uses this address.' });
  if (d.coverMediaId && !(await existing([d.coverMediaId])).has(d.coverMediaId)) d.coverMediaId = null;
  await prisma.$transaction(async (tx) => {
    await tx.service.update({ where: { id }, data: d });
    for (const l of locales) {
      const t = translations[l];
      if (t) await tx.serviceTranslation.upsert({ where: { serviceId_locale: { serviceId: id, locale: l } }, update: t, create: { serviceId: id, locale: l, ...t } });
      else await tx.serviceTranslation.deleteMany({ where: { serviceId: id, locale: l } });
    }
    await renameRedirect(tx, PUBLIC_PATH.services, current.slug, d.slug);
  });
  await audit(user.id, 'services.save', 'services', id, { status: d.status });
  return done('services');
}

export async function saveProject(id: string, _s: EntityFormState, formData: FormData): Promise<EntityFormState> {
  const user = await requireUser();
  const current = ID.test(id) ? await prisma.project.findUnique({ where: { id }, select: { slug: true, deletedAt: true } }) : null;
  if (!current || current.deletedAt) return fail({}, 'This project no longer exists or is in the trash.');
  const r = validateProject(inputFrom(formData));
  if (!r.ok) return fail(r.errors);
  const { translations, gallery, ...d } = r.data;
  if (await prisma.project.findFirst({ where: { slug: d.slug, id: { not: id } }, select: { id: true } })) return fail({ slug: 'Another project already uses this address.' });
  if (d.serviceId && !(await prisma.service.findFirst({ where: { id: d.serviceId, deletedAt: null }, select: { id: true } }))) d.serviceId = null;
  const ok = await existing([d.coverMediaId, ...gallery]);
  if (d.coverMediaId && !ok.has(d.coverMediaId)) d.coverMediaId = null;
  const photos = gallery.filter((g) => ok.has(g));
  await prisma.$transaction(async (tx) => {
    await tx.project.update({ where: { id }, data: d });
    for (const l of locales) {
      const t = translations[l];
      if (t) await tx.projectTranslation.upsert({ where: { projectId_locale: { projectId: id, locale: l } }, update: t, create: { projectId: id, locale: l, ...t } });
      else await tx.projectTranslation.deleteMany({ where: { projectId: id, locale: l } });
    }
    await tx.projectMedia.deleteMany({ where: { projectId: id } });
    if (photos.length) await tx.projectMedia.createMany({ data: photos.map((mediaId, position) => ({ projectId: id, mediaId, position })) });
    await renameRedirect(tx, PUBLIC_PATH.projects, current.slug, d.slug);
  });
  await audit(user.id, 'projects.save', 'projects', id, { status: d.status });
  return done('projects');
}

export async function saveClient(id: string, _s: EntityFormState, formData: FormData): Promise<EntityFormState> {
  const user = await requireUser();
  const current = ID.test(id) ? await prisma.client.findUnique({ where: { id }, select: { deletedAt: true } }) : null;
  if (!current || current.deletedAt) return fail({}, 'This client no longer exists or is in the trash.');
  const r = validateClient(inputFrom(formData));
  if (!r.ok) return fail(r.errors);
  if (r.data.logoMediaId && !(await existing([r.data.logoMediaId])).has(r.data.logoMediaId)) r.data.logoMediaId = null;
  await prisma.client.update({ where: { id }, data: r.data });
  await audit(user.id, 'clients.save', 'clients', id, { status: r.data.status });
  return done('clients');
}

export async function saveTeam(id: string, _s: EntityFormState, formData: FormData): Promise<EntityFormState> {
  const user = await requireUser();
  const current = ID.test(id) ? await prisma.teamMember.findUnique({ where: { id }, select: { deletedAt: true } }) : null;
  if (!current || current.deletedAt) return fail({}, 'This person no longer exists or is in the trash.');
  const r = validateTeam(inputFrom(formData));
  if (!r.ok) return fail(r.errors);
  const { translations, ...d } = r.data;
  if (d.photoMediaId && !(await existing([d.photoMediaId])).has(d.photoMediaId)) d.photoMediaId = null;
  await prisma.$transaction(async (tx) => {
    await tx.teamMember.update({ where: { id }, data: d });
    for (const l of locales) {
      const t = translations[l];
      if (t) await tx.teamMemberTranslation.upsert({ where: { memberId_locale: { memberId: id, locale: l } }, update: t, create: { memberId: id, locale: l, ...t } });
      else await tx.teamMemberTranslation.deleteMany({ where: { memberId: id, locale: l } });
    }
  });
  await audit(user.id, 'team.save', 'team', id, { status: d.status });
  return done('team');
}

// ───────── Trash ─────────

function model(kind: Kind) {
  // The four models share id + deletedAt, which is all the trash needs.
  const m = { services: prisma.service, projects: prisma.project, clients: prisma.client, team: prisma.teamMember }[kind];
  return m as unknown as {
    updateMany(args: { where: { id: string }; data: { deletedAt: Date | null; status?: 'DRAFT' } }): Promise<unknown>;
    deleteMany(args: { where: { id: string; deletedAt: { not: null } } }): Promise<{ count: number }>;
  };
}

export async function trashEntity(kind: Kind, id: string) {
  const user = await requireUser();
  if (!KINDS.includes(kind) || !ID.test(id)) redirect('/admin');
  await model(kind).updateMany({ where: { id }, data: { deletedAt: new Date() } });
  await audit(user.id, `${kind}.trash`, kind, id);
  refreshPublicSite();
  redirect(`/admin/${kind}?notice=trashed`);
}

export async function restoreEntity(kind: Kind, id: string) {
  const user = await requireUser();
  if (!KINDS.includes(kind) || !ID.test(id)) redirect('/admin');
  await model(kind).updateMany({ where: { id }, data: { deletedAt: null, status: 'DRAFT' } });
  await audit(user.id, `${kind}.restore`, kind, id);
  redirect('/admin/trash?notice=restored');
}

/** Deletes for good. Photos stay in the media library. Projects of a deleted service keep existing without a service. */
export async function deleteEntity(kind: Kind, id: string) {
  const user = await requireUser();
  if (!KINDS.includes(kind) || !ID.test(id)) redirect('/admin');
  const { count } = await model(kind).deleteMany({ where: { id, deletedAt: { not: null } } });
  if (count && kind === 'services') {
    // the service's own page and its version history go with it
    await prisma.page.deleteMany({ where: { key: `service-${id}` } });
    await prisma.contentVersion.deleteMany({ where: { entityType: 'page', entityKey: `service-${id}` } });
  }
  await audit(user.id, `${kind}.delete`, kind, id);
  redirect('/admin/trash?notice=deleted-entity');
}
