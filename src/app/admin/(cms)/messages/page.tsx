import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/admin/Button/Button';
import { EmptyState } from '@/components/admin/EmptyState/EmptyState';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { Pagination } from '@/components/admin/Pagination/Pagination';
import { StatusBadge } from '@/components/admin/StatusBadge/StatusBadge';
import { requireUser } from '@/lib/auth/session';
import { noticeFrom } from '@/lib/cms/notices';
import { prisma } from '@/lib/db';
import type { Search } from '../_collections/shared';
import styles from '../_collections/shared.module.css';

export const metadata: Metadata = { title: 'Messages' };
const PAGE = 30;
const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Kigali' });
const TABS = [
  ['', 'All'],
  ['NEW', 'New'],
  ['CONTACTED', 'Contacted'],
  ['CLOSED', 'Closed'],
] as const;

export default async function MessagesPage({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const sp = await searchParams;
  const status = TABS.some(([k]) => k && k === sp.status) ? (sp.status as 'NEW' | 'CONTACTED' | 'CLOSED') : undefined;
  const page = Math.max(1, Number.parseInt(String(sp.page ?? ''), 10) || 1);
  const where = status ? { status } : {};
  const [rows, total] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * PAGE, take: PAGE }),
    prisma.lead.count({ where }),
  ]);
  const { notice } = noticeFrom(sp);
  const href = (p: number, s = status ?? '') => `/admin/messages?${new URLSearchParams({ ...(s && { status: s }), ...(p > 1 && { page: String(p) }) })}`;

  return (
    <>
      <PageHeader title="Messages" description="Everything sent through the contact forms on the website." actions={<Button href="/admin/api/export/leads" newTab>Download CSV</Button>} />
      {notice && <Notice tone="success">{notice}</Notice>}
      <p style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        {TABS.map(([k, label]) => (
          <Button key={k} size="sm" variant={(status ?? '') === k ? 'primary' : 'secondary'} href={href(1, k)}>
            {label}
          </Button>
        ))}
      </p>
      {rows.length === 0 ? (
        <EmptyState title="No messages here." />
      ) : (
        <ul className={styles.list}>
          {rows.map((r) => (
            <li key={r.id} className={styles.row}>
              <Link href={`/admin/messages/${r.id}`} className={styles.title}>
                {r.name} · {r.email}
                <span className={styles.sub}>
                  {when.format(r.createdAt)} · {r.service || r.source} · {r.message.slice(0, 90)}
                  {r.message.length > 90 ? '…' : ''}
                </span>
              </Link>
              <StatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} pageSize={PAGE} total={total} hrefFor={(p) => href(p)} />
    </>
  );
}
