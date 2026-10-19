import type { Metadata } from 'next';
import { Button } from '@/components/admin/Button/Button';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import { EmptyState } from '@/components/admin/EmptyState/EmptyState';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { setSubscriberActive } from '../messages/actions';
import styles from '../_collections/shared.module.css';

export const metadata: Metadata = { title: 'Subscribers' };
const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'Africa/Kigali' });

export default async function SubscribersPage() {
  await requireUser();
  const rows = await prisma.subscriber.findMany({ orderBy: [{ active: 'desc' }, { createdAt: 'desc' }], take: 1000 });
  const active = rows.filter((r) => r.active).length;
  return (
    <>
      <PageHeader
        title="Subscribers"
        description={`${active} active. People who asked for updates. Deactivate anyone who asks to be removed.`}
        actions={<Button href="/admin/api/export/subscribers" newTab>Download CSV</Button>}
      />
      {rows.length === 0 ? (
        <EmptyState title="No subscribers yet." />
      ) : (
        <ul className={styles.list}>
          {rows.map((r) => (
            <li key={r.id} className={styles.row}>
              <span className={styles.title}>
                {r.email}
                <span className={styles.sub}>
                  {when.format(r.createdAt)} · {r.source}
                  {!r.active && ' · removed'}
                </span>
              </span>
              <form action={setSubscriberActive.bind(null, r.id, !r.active)}>
                <ConfirmButton size="sm" variant={r.active ? 'ghost' : 'secondary'}>{r.active ? 'Remove' : 'Add back'}</ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
