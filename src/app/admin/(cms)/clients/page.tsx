import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { CollectionList, pickedMedia, type Search } from '../_collections/shared';

export const metadata: Metadata = { title: 'Clients' };

export default async function ClientsPage({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const rows = await prisma.client.findMany({ where: { deletedAt: null }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] });
  const thumbs = await pickedMedia(rows.map((r) => r.logoMediaId));
  return (
    <CollectionList
      kind="clients"
      title="Clients"
      description="Organisations BrightLink has worked with, shown as logos."
      createLabel="Name of a new client"
      searchParams={searchParams}
      rows={rows.map((r) => ({ id: r.id, title: r.name, sub: r.website || undefined, status: r.status, thumb: r.logoMediaId ? (thumbs.get(r.logoMediaId) ?? null) : null }))}
    />
  );
}
