import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { PickedMedia } from '@/components/admin/MediaPicker/MediaPicker';
import { PostEditor } from '@/components/admin/PostEditor/PostEditor';
import { locales as ALL, type Locale } from '@/i18n/config';
import { requireUser } from '@/lib/auth/session';
import type { PostPayload, PostT } from '@/lib/blog/post-model';
import { imageIdsIn } from '@/lib/blog/render';
import { prisma } from '@/lib/db';
import { EditorHeader, enabledLocales, pickedMedia, type Search } from '../../_collections/shared';

export const metadata: Metadata = { title: 'Edit article' };

export default async function PostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Search }) {
  await requireUser();
  const { id } = await params;
  const post = await prisma.post.findFirst({ where: { id, deletedAt: null }, include: { translations: true } });
  if (!post) notFound();
  const [enabled, categories, authors] = await Promise.all([
    enabledLocales(),
    prisma.blogCategory.findMany({ orderBy: { sortOrder: 'asc' }, include: { translations: { where: { locale: 'en' } } } }),
    prisma.teamMember.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: 'asc' }, select: { id: true, name: true } }),
  ]);
  // languages already translated stay editable even if switched off in Site settings
  const locales = ALL.filter((l) => enabled.includes(l) || post.translations.some((t) => t.locale === l)) as Locale[];
  const translations: Partial<Record<Locale, PostT>> = {};
  for (const t of post.translations) {
    translations[t.locale] = { title: t.title, excerpt: t.excerpt, doc: t.doc, metaTitle: t.metaTitle, metaDescription: t.metaDescription, ogMediaId: t.ogMediaId };
  }
  const ids = [post.coverMediaId, ...post.translations.map((t) => t.ogMediaId), ...post.translations.flatMap((t) => imageIdsIn(t.doc))];
  const media = await pickedMedia(ids);
  const initial: PostPayload = {
    slug: post.slug,
    status: post.status,
    categoryId: post.categoryId,
    authorId: post.authorId,
    coverMediaId: post.coverMediaId,
    tags: post.tags,
    featured: post.featured,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    focusKeyword: post.focusKeyword,
    canonicalUrl: post.canonicalUrl,
    noIndex: post.noIndex,
    translations,
  };
  const live = post.status === 'PUBLISHED' && post.publishedAt && post.publishedAt <= new Date();
  return (
    <>
      <EditorHeader kind="posts" id={post.id} title={translations.en?.title || post.slug} back="All articles" searchParams={searchParams} viewHref={live ? `/blog/${post.slug}` : undefined} />
      <PostEditor
        id={post.id}
        initial={initial}
        locales={locales}
        categories={categories.map((c) => ({ id: c.id, name: c.translations[0]?.name ?? c.slug }))}
        authors={authors}
        media={[...media.values()] as PickedMedia[]}
      />
    </>
  );
}
