import { GlobalEditor } from '@/components/admin/GlobalEditor/GlobalEditor';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { VersionHistory } from '@/components/admin/VersionHistory/VersionHistory';
import type { Locale } from '@/i18n/config';
import { requireUser } from '@/lib/auth/session';
import { getEditorState, listVersions } from '@/lib/cms/drafts';
import { noticeFrom } from '@/lib/cms/notices';
import type { FooterDoc, HeaderDoc } from '@/lib/cms/globals-model';
import { STARTER_SERVICES } from '@/lib/content/defaults';
import { prisma } from '@/lib/db';
import { discardDoc, restoreDocVersion } from './doc-actions';

const PAGES = ['/', '/about-us', '/our-services', '/our-projects', '/blog', '/contact-us'];

/** Shared screen for the header and footer editors. */
export async function DocEditorPage({ kind, searchParams }: { kind: 'header' | 'footer'; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireUser();
  const [state, versions, settings, services, query] = await Promise.all([
    getEditorState(kind),
    listVersions(kind),
    prisma.siteSettings.findUnique({ where: { id: 1 }, select: { enabledLocales: true } }),
    prisma.service.findMany({ where: { deletedAt: null }, select: { slug: true }, orderBy: { sortOrder: 'asc' } }),
    searchParams,
  ]);
  const { notice, error } = noticeFrom(query);
  const locales = (settings?.enabledLocales?.length ? settings.enabledLocales : ['en']) as Locale[];
  const slugs = services.length ? services.map((s) => s.slug) : STARTER_SERVICES.map((s) => s.slug);
  const pages = [...PAGES, ...slugs.map((s) => `/our-services/${s}`)];
  const title = kind === 'header' ? 'Header' : 'Footer';

  return (
    <>
      <PageHeader
        title={title}
        description={`Shown on every page. Changes stay a draft until you publish. Turn on more languages in Site settings to translate the ${kind}.`}
      />
      {notice && <Notice tone="success">{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
      {kind === 'header' ? (
        <GlobalEditor key={JSON.stringify(state.draft)} kind="header" initial={state.draft as HeaderDoc} unpublished={state.hasUnpublishedChanges} locales={locales} pages={pages} />
      ) : (
        <GlobalEditor key={JSON.stringify(state.draft)} kind="footer" initial={state.draft as FooterDoc} unpublished={state.hasUnpublishedChanges} locales={locales} pages={pages} />
      )}
      <VersionHistory
        versions={versions}
        restore={restoreDocVersion.bind(null, kind)}
        discard={state.publishedAt ? discardDoc.bind(null, kind) : undefined}
        hasUnpublishedChanges={state.hasUnpublishedChanges}
      />
    </>
  );
}
