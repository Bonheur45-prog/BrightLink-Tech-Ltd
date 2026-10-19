import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { CollectionList, pickedMedia, type Search } from '../_collections/shared';

export const metadata: Metadata = { title: 'Services' };

export default async function ServicesPage({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const rows = await prisma.service.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }], include: { translations: { where: { locale: 'en' } }, _count: { select: { projects: true } } } });
  const thumbs = await pickedMedia(rows.map((r) => r.coverMediaId));
  return (
    <CollectionList
      kind="services"
      title="Services"
      description="What BrightLink offers. Each service has its own page; projects can be linked to a service."
      createLabel="Name of a new service"
      searchParams={searchParams}
      rows={rows.map((r) => ({ id: r.id, title: r.translations[0]?.title || r.slug, sub: `/our-services/${r.slug} · ${r._count.projects} projects`, status: r.status, thumb: r.coverMediaId ? (thumbs.get(r.coverMediaId) ?? null) : null }))}
    />
  );
}
