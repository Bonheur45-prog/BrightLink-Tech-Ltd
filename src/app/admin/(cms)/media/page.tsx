import type { Metadata } from 'next';
import { EmptyState } from '@/components/admin/EmptyState/EmptyState';
import { Field, TextInput } from '@/components/admin/Field/Field';
import { MediaLibrary } from '@/components/admin/MediaLibrary/MediaLibrary';
import { Button } from '@/components/admin/Button/Button';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { Pagination } from '@/components/admin/Pagination/Pagination';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { LIBRARY_PAGE_SIZE, listMedia } from '@/lib/storage/assets';
import { missingR2Settings } from '@/lib/storage/r2';
import type { Locale } from '@/i18n/config';

export const metadata: Metadata = { title: 'Media library' };

type Search = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : '');

export default async function MediaPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireUser();
  const sp = await searchParams;
  const q = one(sp.q).trim().slice(0, 100);
  const kind = one(sp.kind) === 'VIDEO' ? 'VIDEO' : one(sp.kind) === 'IMAGE' ? 'IMAGE' : undefined;
  const trash = one(sp.view) === 'trash';
  const page = Math.max(1, Number.parseInt(one(sp.page), 10) || 1);

  const [{ items, total }, settings, trashed] = await Promise.all([
    listMedia({ q: q || undefined, kind, trash, page }),
    prisma.siteSettings.findUnique({ where: { id: 1 }, select: { enabledLocales: true } }),
    prisma.mediaAsset.count({ where: { deletedAt: { not: null } } }),
  ]);
  const locales = (settings?.enabledLocales?.length ? settings.enabledLocales : ['en']) as Locale[];
  const missing = missingR2Settings();

  const href = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (kind) params.set('kind', kind);
    if (trash) params.set('view', 'trash');
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return `/admin/media${qs ? `?${qs}` : ''}`;
  };

  return (
    <>
      <PageHeader
        title={trash ? 'Media trash' : 'Media library'}
        description={
          trash
            ? 'Files you moved to the trash. Restore them, or delete them for good to free storage.'
            : 'Every photo and video on the website. Upload once, then pick the file anywhere. Each photo is stored in several sizes so visitors download only what fits their screen.'
        }
        actions={
          trash ? (
            <Button href="/admin/media">Back to library</Button>
          ) : trashed > 0 ? (
            <Button href="/admin/media?view=trash">Trash ({trashed})</Button>
          ) : undefined
        }
      />

      {missing.length > 0 && (
        <Notice tone="warning" title="Uploads are not set up yet">
          Add {missing.join(', ')} to the server’s .env file and restart. Until then files cannot be stored.
        </Notice>
      )}

      <form method="get" action="/admin/media" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'end', flexWrap: 'wrap' }}>
        {trash && <input type="hidden" name="view" value="trash" />}
        <Field label="Search descriptions" htmlFor="media-q">
          <TextInput id="media-q" name="q" defaultValue={q} placeholder="e.g. team, office" />
        </Field>
        <Button type="submit">Search</Button>
      </form>

      {items.length === 0 ? (
        <EmptyState title={q ? 'Nothing matches that search.' : trash ? 'The trash is empty.' : 'No files yet.'}>
          {!q && !trash && 'Drop photos or videos in the box below to start.'}
        </EmptyState>
      ) : null}
      {(items.length > 0 || (!trash && !q)) && <MediaLibrary items={items} trash={trash} locales={locales} />}
      <Pagination page={page} pageSize={LIBRARY_PAGE_SIZE} total={total} hrefFor={href} />
    </>
  );
}
