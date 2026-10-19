import type { Metadata } from 'next';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import { EmptyState } from '@/components/admin/EmptyState/EmptyState';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { requireUser } from '@/lib/auth/session';
import { noticeFrom } from '@/lib/cms/notices';
import { prisma } from '@/lib/db';
import { deleteEntity, restoreEntity, type Kind } from '../collection-actions';
import type { Search } from '../_collections/shared';
import styles from '../_collections/shared.module.css';

export const metadata: Metadata = { title: 'Trash' };
const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'Africa/Kigali' });

export default async function TrashPage({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const trashed = { deletedAt: { not: null } };
  const en = { translations: { where: { locale: 'en' as const } } };
  const [services, projects, clients, team] = await Promise.all([
    prisma.service.findMany({ where: trashed, include: en }),
    prisma.project.findMany({ where: trashed, include: en }),
    prisma.client.findMany({ where: trashed }),
    prisma.teamMember.findMany({ where: trashed }),
  ]);
  const rows: { kind: Kind; label: string; id: string; title: string; at: Date }[] = [
    ...services.map((s) => ({ kind: 'services' as const, label: 'Service', id: s.id, title: s.translations[0]?.title || s.slug, at: s.deletedAt! })),
    ...projects.map((p) => ({ kind: 'projects' as const, label: 'Project', id: p.id, title: p.translations[0]?.title || p.slug, at: p.deletedAt! })),
    ...clients.map((c) => ({ kind: 'clients' as const, label: 'Client', id: c.id, title: c.name, at: c.deletedAt! })),
    ...team.map((t) => ({ kind: 'team' as const, label: 'Team member', id: t.id, title: t.name, at: t.deletedAt! })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());
  const { notice } = noticeFrom(await searchParams);

  return (
    <>
      <PageHeader title="Trash" description="Services, projects, clients and team members you removed. Restored items come back as drafts. Photos and videos have their own trash in the Media library." />
      {notice && <Notice tone="success">{notice}</Notice>}
      {rows.length === 0 ? (
        <EmptyState title="The trash is empty." />
      ) : (
        <ul className={styles.list}>
          {rows.map((r) => (
            <li key={r.id} className={styles.row}>
              <span className={styles.title}>
                {r.title}
                <span className={styles.sub}>
                  {r.label} · removed {when.format(r.at)}
                </span>
              </span>
              <form action={restoreEntity.bind(null, r.kind, r.id)}>
                <ConfirmButton size="sm">Restore</ConfirmButton>
              </form>
              <form action={deleteEntity.bind(null, r.kind, r.id)}>
                <ConfirmButton size="sm" variant="danger" confirm={`Delete “${r.title}” for good? This cannot be undone.`}>
                  Delete for good
                </ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
