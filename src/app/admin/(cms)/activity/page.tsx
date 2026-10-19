import type { Metadata } from 'next';
import { EmptyState } from '@/components/admin/EmptyState/EmptyState';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { Pagination } from '@/components/admin/Pagination/Pagination';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Activity' };

const PER_PAGE = 50;

// "post.publish" → "Published a blog post". Unknown combinations fall back to the raw action name.
const NOUNS: Record<string, string> = {
  media: 'a photo or video',
  user: 'a user',
  page: 'a page',
  global: 'the header or footer',
  settings: 'the site settings',
  service: 'a service',
  project: 'a project',
  client: 'a client',
  team: 'a team member',
  category: 'a blog category',
  post: 'a blog post',
  lead: 'a message',
  subscriber: 'a subscriber',
  redirect: 'a redirect',
};
const VERBS: Record<string, string> = {
  create: 'Created',
  update: 'Edited',
  publish: 'Published',
  unpublish: 'Unpublished',
  discard: 'Discarded unpublished changes to',
  restore: 'Restored',
  trash: 'Moved to the trash:',
  delete: 'Deleted for good:',
  upload: 'Added',
  alt: 'Edited the description of',
  contacted: 'Marked as contacted:',
  closed: 'Closed',
};

function label(action: string): string {
  const [noun, verb] = action.split('.');
  const n = NOUNS[noun ?? ''];
  const v = VERBS[verb ?? ''];
  return n && v ? `${v} ${n}` : action;
}

const when = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kigali' });

export default async function ActivityPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireUser();
  const pageParam = (await searchParams).page;
  const page = Math.max(1, Number.parseInt(typeof pageParam === 'string' ? pageParam : '1', 10) || 1);
  const [total, rows] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { user: { select: { name: true } } },
    }),
  ]);

  return (
    <>
      <PageHeader title="Activity" description="Every change made in the content manager, newest first." />
      {rows.length === 0 ? (
        <EmptyState title="Nothing has been changed yet." />
      ) : (
        <ol className={styles.list}>
          {rows.map((row) => {
            const meta = (row.meta ?? {}) as { slug?: string; title?: string; email?: string };
            const detail = meta.title || meta.slug || meta.email;
            return (
              <li key={row.id} className={styles.row}>
                <time className={styles.time} dateTime={row.createdAt.toISOString()}>
                  {when.format(row.createdAt)}
                </time>
                <span>
                  <strong>{row.user?.name ?? 'Someone'}</strong> {label(row.action).toLowerCase()}
                  {detail ? <span className={styles.gone}>: {detail}</span> : null}
                </span>
              </li>
            );
          })}
        </ol>
      )}
      <Pagination page={page} pageSize={PER_PAGE} total={total} hrefFor={(p) => `/admin/activity${p > 1 ? `?page=${p}` : ''}`} />
    </>
  );
}
