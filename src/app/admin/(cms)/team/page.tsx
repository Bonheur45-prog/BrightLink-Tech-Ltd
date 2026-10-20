import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { CollectionList, pickedMedia, type Search } from '../_collections/shared';

export const metadata: Metadata = { title: 'Team' };

export default async function TeamPage({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const rows = await prisma.teamMember.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }], include: { translations: { where: { locale: 'en' } } } });
  const thumbs = await pickedMedia(rows.map((r) => r.photoMediaId));
  return (
    <CollectionList
      kind="team"
      title="Team"
      description="People shown on the About page. Team members can also be blog authors."
      createLabel="Name of a new team member"
      searchParams={searchParams}
      rows={rows.map((r) => ({ id: r.id, title: r.name, sub: r.translations[0]?.role || undefined, status: r.status, thumb: r.photoMediaId ? (thumbs.get(r.photoMediaId) ?? null) : null }))}
    />
  );
}
