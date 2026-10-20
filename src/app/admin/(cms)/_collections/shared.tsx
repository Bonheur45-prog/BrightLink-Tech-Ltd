import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/admin/Button/Button';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import { CField } from '@/components/admin/EntityForm/EntityForm';
import { Checkbox, Fieldset, Select, TextArea, TextInput } from '@/components/admin/Field/Field';
import { EmptyState } from '@/components/admin/EmptyState/EmptyState';
import { LocaleTabs } from '@/components/admin/LocaleTabs/LocaleTabs';
import type { PickedMedia } from '@/components/admin/MediaPicker/MediaPicker';
import { MediaThumb } from '@/components/admin/MediaThumb/MediaThumb';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge/StatusBadge';
import { localeNames, type Locale } from '@/i18n/config';
import { noticeFrom } from '@/lib/cms/notices';
import { prisma } from '@/lib/db';
import { toAdminMedia } from '@/lib/storage/assets';
import { createEntity, trashEntity, type Kind } from '../collection-actions';
import styles from './shared.module.css';

export type Search = Promise<Record<string, string | string[] | undefined>>;

export async function enabledLocales(): Promise<Locale[]> {
  const s = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { enabledLocales: true } });
  return (s?.enabledLocales?.length ? s.enabledLocales : ['en']) as Locale[];
}

/** Previews for the media pickers of an editor. */
export async function pickedMedia(ids: (string | null | undefined)[]): Promise<Map<string, PickedMedia>> {
  const list = ids.filter((v): v is string => !!v);
  const rows = list.length ? await prisma.mediaAsset.findMany({ where: { id: { in: list } }, include: { translations: true } }) : [];
  const map = new Map<string, PickedMedia>();
  for (const m of rows) {
    try {
      const a = toAdminMedia(m);
      map.set(m.id, { id: m.id, thumbUrl: a.thumbUrl, alt: a.alt, kind: a.kind });
    } catch {
      map.set(m.id, { id: m.id, thumbUrl: null, alt: '' }); // R2 address not configured
    }
  }
  return map;
}

export type Row = { id: string; title: string; sub?: string; status: 'DRAFT' | 'PUBLISHED'; thumb?: PickedMedia | null };

/** List screen: create box, notices, rows linking to the editor. */
export async function CollectionList({ kind, title, description, createLabel, rows, searchParams }: { kind: Kind; title: string; description: string; createLabel: string; rows: Row[]; searchParams: Search }) {
  const { notice, error } = noticeFrom(await searchParams);
  return (
    <>
      <PageHeader title={title} description={description} />
      {notice && <Notice tone="success">{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
      <form action={createEntity.bind(null, kind)} className={styles.create}>
        <label htmlFor="new-name" className={styles.srOnly}>{createLabel}</label>
        <TextInput id="new-name" name="name" placeholder={createLabel} maxLength={120} required />
        <ConfirmButton variant="primary">Create</ConfirmButton>
      </form>
      {rows.length === 0 ? (
        <EmptyState title="Nothing here yet.">Type a name above to add the first one.</EmptyState>
      ) : (
        <ul className={styles.list}>
          {rows.map((r) => (
            <li key={r.id} className={styles.row}>
              {r.thumb !== undefined && <MediaThumb media={r.thumb ? { kind: r.thumb.kind ?? 'IMAGE', thumbUrl: r.thumb.thumbUrl, durationSec: null } : null} size={56} />}
              <Link href={`/admin/${kind}/${r.id}`} className={styles.title}>
                {r.title}
                {r.sub && <span className={styles.sub}>{r.sub}</span>}
              </Link>
              <StatusBadge status={r.status} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** Header of an editor: back link, title, trash button. */
export async function EditorHeader({ kind, id, title, back, searchParams, viewHref }: { kind: Kind; id: string; title: string; back: string; searchParams: Search; viewHref?: string }) {
  const { notice, error } = noticeFrom(await searchParams);
  return (
    <>
      <PageHeader
        title={title}
        back={{ href: `/admin/${kind}`, label: back }}
        actions={
          <>
            {viewHref && <Button href={viewHref} newTab>View on website ↗</Button>}
            <form action={trashEntity.bind(null, kind, id)}>
              <ConfirmButton variant="danger" confirm="Move to the trash? It disappears from the website. You can restore it from Trash.">
                Move to trash
              </ConfirmButton>
            </form>
          </>
        }
      />
      {notice && <Notice tone="success">{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
    </>
  );
}

/** Published / draft + order: the box every editor has in its side column. */
export function PublishBox({ status, sortOrder, children }: { status: string; sortOrder: number; children?: ReactNode }) {
  return (
    <Fieldset legend="Visibility">
      <CField name="status" label="Status">
        <Select id="status" name="status" defaultValue={status}>
          <option value="PUBLISHED">Published (on the website)</option>
          <option value="DRAFT">Draft (hidden)</option>
        </Select>
      </CField>
      <CField name="sortOrder" label="Order" hint="Lower numbers come first.">
        <TextInput id="sortOrder" name="sortOrder" type="number" min={0} max={9999} defaultValue={sortOrder} />
      </CField>
      {children}
    </Fieldset>
  );
}

export function HomeCheckbox({ checked }: { checked: boolean }) {
  return <Checkbox name="showOnHome" defaultChecked={checked} label="Show on the home page" />;
}

export type TField = { field: string; label: string; type?: 'text' | 'textarea' | 'lines'; max?: number; required?: boolean; hint?: string };

/** One tab per enabled language with the same fields. Lists are typed one item per line. */
export function TranslationTabs({ locales, fields, values }: { locales: Locale[]; fields: TField[]; values: Partial<Record<Locale, Record<string, string | string[]>>> }) {
  return (
    <LocaleTabs
      tabs={locales.map((l) => ({
        code: l,
        label: localeNames[l],
        note: l === 'en' ? undefined : 'Leave empty to show the English text.',
        panel: (
          <div className={styles.stack}>
            {fields.map((f) => {
              const name = `${f.field}.${l}`;
              const raw = values[l]?.[f.field];
              const value = Array.isArray(raw) ? raw.join('\n') : (raw ?? '');
              const hint = f.type === 'lines' ? `One per line.${f.hint ? ` ${f.hint}` : ''}` : f.hint;
              return (
                <CField key={name} name={name} label={f.label} hint={hint} required={f.required && l === 'en'}>
                  {f.type === 'text' || !f.type ? (
                    <TextInput id={name} name={name} defaultValue={value} maxLength={f.max ?? 200} />
                  ) : (
                    <TextArea id={name} name={name} defaultValue={value} rows={f.type === 'lines' ? 5 : 4} />
                  )}
                </CField>
              );
            })}
          </div>
        ),
      }))}
    />
  );
}

export const SEO_FIELDS: TField[] = [
  { field: 'metaTitle', label: 'Search title', max: 120, hint: 'Optional. Empty = the name. Aim for 50–60 characters.' },
  { field: 'metaDescription', label: 'Search description', type: 'textarea', hint: 'Optional. Empty = the short description. Aim for 120–160 characters.' },
];
