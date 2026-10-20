import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge/StatusBadge';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { PAGES } from '@/lib/pages/catalogue';
import styles from '../_collections/shared.module.css';

export const metadata: Metadata = { title: 'Pages' };

const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Kigali' });

export default async function PagesList() {
  await requireUser();
  const [rows, services] = await Promise.all([
    prisma.page.findMany({ select: { key: true, publishedAt: true, draft: true, published: true } }),
    prisma.service.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: 'asc' }, include: { translations: { where: { locale: 'en' } } } }),
  ]);
  const state = (key: string) => {
    const r = rows.find((x) => x.key === key);
    if (!r?.publishedAt) return { status: 'DRAFT', sub: 'Showing the starter content until first published' };
    const changed = JSON.stringify(r.draft) !== JSON.stringify(r.published);
    return { status: 'PUBLISHED', sub: `Published ${when.format(r.publishedAt)}${changed ? ' · has unpublished changes' : ''}` };
  };
  const list = [
    ...PAGES.map((p) => ({ key: p.key, title: p.label, path: p.path })),
    ...services.map((s) => ({ key: `service-${s.id}`, title: `Service: ${s.translations[0]?.title || s.slug}`, path: `/our-services/${s.slug}` })),
  ];
  return (
    <>
      <PageHeader title="Pages" description="Each page is a list of sections you can reorder, hide, and give a layout and background. Changes stay a draft until you publish." />
      <ul className={styles.list}>
        {list.map((p) => {
          const s = state(p.key);
          return (
            <li key={p.key} className={styles.row}>
              <Link href={`/admin/pages/${p.key}`} className={styles.title}>
                {p.title}
                <span className={styles.sub}>
                  {p.path} · {s.sub}
                </span>
              </Link>
              <StatusBadge status={s.status} />
            </li>
          );
        })}
      </ul>
    </>
  );
}
