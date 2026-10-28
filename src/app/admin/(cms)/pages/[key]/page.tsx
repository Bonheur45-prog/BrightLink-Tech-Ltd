import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button } from '@/components/admin/Button/Button';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageBuilder } from '@/components/admin/PageBuilder/PageBuilder';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { VersionHistory } from '@/components/admin/VersionHistory/VersionHistory';
import { ICON_KEYS } from '@/components/ui/Icons';
import { requireUser } from '@/lib/auth/session';
import { getEditorState, isDocKey, isPageDoc, listVersions } from '@/lib/cms/drafts';
import { noticeFrom } from '@/lib/cms/notices';
import { prisma } from '@/lib/db';
import { PAGES } from '@/lib/pages/catalogue';
import { mediaIdsOf, type PageDoc } from '@/lib/pages/model';
import { discardDoc, restoreDocVersion } from '../../doc-actions';
import { enabledLocales, pickedMedia, type Search } from '../../_collections/shared';

export const metadata: Metadata = { title: 'Edit page' };

export default async function PageEditor({ params, searchParams }: { params: Promise<{ key: string }>; searchParams: Search }) {
  await requireUser();
  const { key } = await params;
  if (!isDocKey(key) || !isPageDoc(key)) notFound();

  let title: string;
  let path: string;
  const fixed = PAGES.find((p) => p.key === key);
  if (fixed) {
    title = fixed.label;
    path = fixed.path;
  } else {
    const s = await prisma.service.findFirst({ where: { id: key.slice('service-'.length), deletedAt: null }, include: { translations: { where: { locale: 'en' } } } });
    if (!s) notFound();
    title = s.translations[0]?.title || s.slug;
    path = `/our-services/${s.slug}`;
  }

  const [state, versions, locales, services, query] = await Promise.all([
    getEditorState(key),
    listVersions(key),
    enabledLocales(),
    prisma.service.findMany({ where: { deletedAt: null }, select: { slug: true } }),
    searchParams,
  ]);
  const doc = state.draft as PageDoc;
  // every photo the page can show, including ones from earlier versions being restored
  const media = await pickedMedia([...new Set(mediaIdsOf({ ...doc, sections: doc.sections.map((s) => ({ ...s, visible: true })) }).map((m) => m.id))]);
  const { notice, error } = noticeFrom(query);
  const pages = [...PAGES.map((p) => p.path), ...services.map((s) => `/our-services/${s.slug}`), '/#get-in-touch'];

  return (
    <>
      <PageHeader title={title} back={{ href: '/admin/pages', label: 'All pages' }} actions={<Button href={path} newTab>View on website ↗</Button>} />
      {notice && <Notice tone="success">{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
      {!state.publishedAt && (
        <Notice tone="info">This page has never been published: the website shows its starter content, which is what the editor shows below.</Notice>
      )}
      <PageBuilder
        key={JSON.stringify(doc)}
        docKey={key}
        initial={doc}
        unpublished={state.hasUnpublishedChanges}
        locales={locales}
        iconKeys={ICON_KEYS()}
        pages={pages}
        media={[...media.values()]}
        path={path}
        fallbackTitle={title}
      />
      <VersionHistory
        versions={versions}
        restore={restoreDocVersion.bind(null, key)}
        discard={state.publishedAt ? discardDoc.bind(null, key) : undefined}
        hasUnpublishedChanges={state.hasUnpublishedChanges}
      />
    </>
  );
}
