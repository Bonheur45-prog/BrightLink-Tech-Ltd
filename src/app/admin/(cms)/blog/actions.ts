'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { STARTER_CATEGORIES_RAW } from '@/lib/content/blogDefaults';
import { locales } from '@/i18n/config';
import { audit } from '@/lib/audit';
import { requireUser } from '@/lib/auth/session';
import { mediaInfoMap } from '@/lib/blog/media';
import { validatePost } from '@/lib/blog/post-model';
import { imageIdsIn, renderDoc } from '@/lib/blog/render';
import { refreshPublicSite } from '@/lib/cms/revalidate';
import { inputFrom, type Errors } from '@/lib/cms/settings-validation';
import { isValidSlug, slugify, uniqueSlug } from '@/lib/cms/slug';
import { prisma } from '@/lib/db';

const ID = /^[a-z0-9]{10,40}$/;
export type PostSaveResult = { ok: true; savedAt: number; slug: string; status: 'DRAFT' | 'PUBLISHED'; publishedAt: string | null } | { ok: false; message: string; errors: Errors };

export async function createPost(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get('name') ?? '').trim().slice(0, 160);
  if (!title) redirect('/admin/blog?error=missing-title');
  const category = await prisma.blogCategory.findFirst({ orderBy: { sortOrder: 'asc' }, select: { id: true } });
  if (!category) redirect('/admin/blog/categories?error=no-category');
  const slug = await uniqueSlug(slugify(title), async (s) => !!(await prisma.post.findUnique({ where: { slug: s }, select: { id: true } })));
  const post = await prisma.post.create({ data: { slug, categoryId: category.id, translations: { create: { locale: 'en', title, doc: { type: 'doc', content: [] } } } } });
  await audit(user.id, 'posts.create', 'posts', post.id, { title });
  redirect(`/admin/blog/${post.id}?notice=created`);
}

/** Saves the whole post (every language). The HTML visitors get is rendered here, from the editor's document. */
export async function savePost(id: string, raw: unknown): Promise<PostSaveResult> {
  const user = await requireUser();
  const current = ID.test(id) ? await prisma.post.findUnique({ where: { id }, select: { slug: true, deletedAt: true, publishedAt: true } }) : null;
  if (!current || current.deletedAt) return { ok: false, message: 'This article no longer exists or is in the trash.', errors: {} };
  const r = validatePost(raw);
  if (!r.ok) return { ok: false, message: 'Some fields need attention.', errors: r.errors };
  const d = r.data;
  const errors: Errors = {};
  if (await prisma.post.findFirst({ where: { slug: d.slug, id: { not: id } }, select: { id: true } })) errors.slug = 'Another article already uses this address.';
  if (!(await prisma.blogCategory.findUnique({ where: { id: d.categoryId }, select: { id: true } }))) errors.categoryId = 'Choose a category.';
  if (d.authorId && !(await prisma.teamMember.findFirst({ where: { id: d.authorId, deletedAt: null }, select: { id: true } }))) d.authorId = null;

  const rendered: Partial<Record<(typeof locales)[number], ReturnType<typeof renderDoc>>> = {};
  for (const l of locales) {
    const t = d.translations[l];
    if (!t) continue;
    const ids = imageIdsIn(t.doc);
    const media = await mediaInfoMap(ids, l);
    rendered[l] = renderDoc(t.doc, media);
    if (d.status === 'PUBLISHED') {
      const missing = ids.filter((m) => !media.get(m)?.alt);
      if (ids.some((m) => !media.has(m))) errors[`doc.${l}`] = 'A photo in the article was deleted from the media library. Remove it or choose another.';
      else if (missing.length) errors[`doc.${l}`] = `${missing.length} photo(s) in the article have no description. Add it in the Media library before publishing.`;
    }
  }
  if (Object.keys(errors).length) return { ok: false, message: 'Some fields need attention.', errors };

  // First publish without a chosen date = now. A chosen future date = scheduled.
  const publishedAt = d.publishedAt ? new Date(d.publishedAt) : d.status === 'PUBLISHED' ? (current.publishedAt ?? new Date()) : current.publishedAt;
  const { translations, publishedAt: _p, ...base } = d;
  await prisma.$transaction(async (tx) => {
    await tx.post.update({ where: { id }, data: { ...base, publishedAt, readingMinutes: rendered.en?.readingMinutes ?? 1 } });
    for (const l of locales) {
      const t = translations[l];
      const out = rendered[l];
      if (t && out) {
        const row = { title: t.title, excerpt: t.excerpt, doc: t.doc as object, html: out.html, toc: out.toc, fonts: out.fonts, metaTitle: t.metaTitle, metaDescription: t.metaDescription, ogMediaId: t.ogMediaId };
        await tx.postTranslation.upsert({ where: { postId_locale: { postId: id, locale: l } }, update: row, create: { postId: id, locale: l, ...row } });
      } else await tx.postTranslation.deleteMany({ where: { postId: id, locale: l } });
    }
    if (current.slug !== d.slug) {
      const from = `/blog/${current.slug}`;
      const to = `/blog/${d.slug}`;
      await tx.redirect.deleteMany({ where: { fromPath: to } });
      await tx.redirect.updateMany({ where: { toPath: from }, data: { toPath: to } });
      await tx.redirect.upsert({ where: { fromPath: from }, update: { toPath: to }, create: { fromPath: from, toPath: to } });
    }
  });
  await audit(user.id, 'posts.save', 'posts', id, { status: d.status });
  refreshPublicSite();
  revalidatePath('/admin/blog');
  return { ok: true, savedAt: Date.now(), slug: d.slug, status: d.status, publishedAt: publishedAt?.toISOString() ?? null };
}

// ───── Categories ─────

const COLORS = ['orange', 'teal', 'blue', 'green', 'navy'];

export async function saveCategory(id: string | null, formData: FormData) {
  const user = await requireUser();
  const input = inputFrom(formData);
  const name = input.get('name.en').trim().slice(0, 80);
  if (!name) redirect('/admin/blog/categories?error=missing-title');
  const slug = input.get('slug').trim().toLowerCase() || slugify(name);
  if (!isValidSlug(slug)) redirect('/admin/blog/categories?error=bad-slug');
  const clash = await prisma.blogCategory.findFirst({ where: { slug, ...(id ? { id: { not: id } } : {}) }, select: { id: true } });
  if (clash) redirect('/admin/blog/categories?error=slug-taken');
  const color = COLORS.includes(input.get('color')) ? input.get('color') : 'blue';
  const data = { slug, color, icon: input.get('icon').slice(0, 40), sortOrder: Math.max(0, Math.min(9999, Number.parseInt(input.get('sortOrder'), 10) || 0)) };
  const before = id && ID.test(id) ? await prisma.blogCategory.findUnique({ where: { id }, select: { slug: true } }) : null;
  const cat = before ? await prisma.blogCategory.update({ where: { id: id! }, data }) : await prisma.blogCategory.create({ data });
  for (const l of locales) {
    const row = {
      name: input.get(`name.${l}`).trim().slice(0, 80),
      description: input.get(`description.${l}`).trim().slice(0, 400),
      metaTitle: input.get(`metaTitle.${l}`).trim().slice(0, 120),
      metaDescription: input.get(`metaDescription.${l}`).trim().slice(0, 300),
    };
    if (l !== 'en' && !row.name) await prisma.blogCategoryTranslation.deleteMany({ where: { categoryId: cat.id, locale: l } });
    else await prisma.blogCategoryTranslation.upsert({ where: { categoryId_locale: { categoryId: cat.id, locale: l } }, update: row, create: { categoryId: cat.id, locale: l, ...row } });
  }
  if (before && before.slug !== slug) {
    const from = `/blog/category/${before.slug}`;
    const to = `/blog/category/${slug}`;
    await prisma.redirect.deleteMany({ where: { fromPath: to } });
    await prisma.redirect.upsert({ where: { fromPath: from }, update: { toPath: to }, create: { fromPath: from, toPath: to } });
  }
  await audit(user.id, before ? 'category.save' : 'category.create', 'category', cat.id);
  refreshPublicSite();
  redirect('/admin/blog/categories?notice=saved');
}

export async function deleteCategory(id: string) {
  const user = await requireUser();
  if (!ID.test(id)) redirect('/admin/blog/categories');
  if (await prisma.post.count({ where: { categoryId: id } })) redirect('/admin/blog/categories?error=not-empty');
  await prisma.blogCategory.deleteMany({ where: { id } });
  await audit(user.id, 'category.delete', 'category', id);
  refreshPublicSite();
  redirect('/admin/blog/categories?notice=deleted-category');
}

/** Adds the starter categories (only when there are none). */
export async function addStarterCategories() {
  const user = await requireUser();
  if (await prisma.blogCategory.count()) redirect('/admin/blog/categories');
  for (const c of STARTER_CATEGORIES_RAW) {
    await prisma.blogCategory.create({ data: { slug: c.slug, icon: c.icon, color: c.color, sortOrder: c.order, translations: { create: { locale: 'en', name: c.name, description: c.description } } } });
  }
  await audit(user.id, 'category.starter', 'category', 'all');
  redirect('/admin/blog/categories?notice=saved');
}
