import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { CollectionList, pickedMedia, type Search } from '../_collections/shared';

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const rows = await prisma.project.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }], include: { translations: { where: { locale: 'en' } }, service: { select: { slug: true } } } });
  const thumbs = await pickedMedia(rows.map((r) => r.coverMediaId));
  return (
    <CollectionList
      kind="projects"
      title="Projects"
      description="Work BrightLink has delivered or is delivering."
      createLabel="Name of a new project"
      searchParams={searchParams}
      rows={rows.map((r) => ({
        id: r.id,
        title: r.translations[0]?.title || r.slug,
        sub: [r.state === 'IN_PROGRESS' ? `In progress (${r.progress}%)` : 'Completed', r.service?.slug].filter(Boolean).join(' · '),
        status: r.status,
        thumb: r.coverMediaId ? (thumbs.get(r.coverMediaId) ?? null) : null,
      }))}
    />
  );
}
