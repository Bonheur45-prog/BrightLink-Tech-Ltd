'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/admin/Button/Button';
import { Field, TextInput } from '@/components/admin/Field/Field';
import { MediaThumb } from '@/components/admin/MediaThumb/MediaThumb';
import { MediaUploader } from '@/components/admin/MediaUploader/MediaUploader';
import { localeNames, type Locale } from '@/i18n/config';
import { formatBytes } from '@/lib/storage/limits';
import type { AdminMedia } from '@/lib/storage/assets';
import { deleteMediaForever, restoreMedia, saveAlt, trashMedia, type MediaActionResult } from '@/app/admin/(cms)/media/actions';
import styles from './MediaLibrary.module.css';

type Props = { items: AdminMedia[]; trash: boolean; locales: Locale[] };

/** Grid of everything uploaded, with a side panel to describe (alt text), copy the link, trash or restore a file. */
export function MediaLibrary({ items, trash, locales }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const selected = items.find((m) => m.id === selectedId) ?? null;

  const run = (task: () => Promise<MediaActionResult>, success: string, after?: () => void) =>
    startTransition(async () => {
      const result = await task();
      if (result.ok) {
        setMessage({ tone: 'ok', text: success });
        after?.();
        router.refresh();
      } else {
        setMessage({ tone: 'error', text: result.error });
      }
    });

  return (
    <div className={styles.wrap}>
      {!trash && (
        <MediaUploader
          onUploaded={() => {
            setMessage({ tone: 'ok', text: 'Added. Describe it in the panel so Google and screen readers understand it.' });
            router.refresh();
          }}
        />
      )}

      {message && (
        <p className={styles.message} data-tone={message.tone} role={message.tone === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}

      <div className={styles.layout}>
        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={styles.tile}
                data-selected={item.id === selectedId || undefined}
                data-missing-alt={(!item.alt && item.kind === 'IMAGE') || undefined}
                onClick={() => setSelectedId(item.id)}
                aria-label={`${item.alt || 'No description'} (${item.kind === 'IMAGE' ? 'photo' : 'video'}) — select`}
              >
                <MediaThumb media={item} fluid />
              </button>
            </li>
          ))}
        </ul>

        {selected && (
          <aside className={styles.panel} aria-label="Selected file">
            <MediaThumb media={selected} fluid wide alt={selected.alt} />
            <dl className={styles.facts}>
              <div>
                <dt>Size</dt>
                <dd>
                  {selected.width} × {selected.height} px · {formatBytes(selected.sizeBytes)}
                </dd>
              </div>
              <div>
                <dt>Added</dt>
                <dd>{new Date(selected.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</dd>
              </div>
            </dl>
            <AltForm key={selected.id} media={selected} locales={locales} disabled={pending || trash} onSave={(alts) => run(() => saveAlt(selected.id, alts), 'Description saved.')} />
            <div className={styles.actions}>
              <Button size="sm" onClick={() => void navigator.clipboard?.writeText(selected.url)}>
                Copy link
              </Button>
              {trash ? (
                <>
                  <Button size="sm" disabled={pending} onClick={() => run(() => restoreMedia(selected.id), 'Restored.', () => setSelectedId(null))}>
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={pending}
                    onClick={() => {
                      if (window.confirm('Delete this file for good? This cannot be undone.')) {
                        run(() => deleteMediaForever(selected.id), 'Deleted.', () => setSelectedId(null));
                      }
                    }}
                  >
                    Delete for good
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="danger" disabled={pending} onClick={() => run(() => trashMedia(selected.id), 'Moved to the trash.', () => setSelectedId(null))}>
                  Move to trash
                </Button>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function AltForm({ media, locales, disabled, onSave }: { media: AdminMedia; locales: Locale[]; disabled: boolean; onSave: (alts: Partial<Record<Locale, string>>) => void }) {
  const [alts, setAlts] = useState<Partial<Record<Locale, string>>>(media.alts);
  const dirty = locales.some((l) => (alts[l] ?? '') !== (media.alts[l] ?? ''));
  return (
    <div className={styles.alt}>
      {locales.map((locale) => (
        <Field
          key={locale}
          label={`Description (${localeNames[locale]})`}
          htmlFor={`alt-${media.id}-${locale}`}
          hint={locale === 'en' ? 'Say what the picture shows, in a sentence. Used by Google and screen readers.' : 'Optional. Leave empty to use the English description.'}
        >
          <TextInput id={`alt-${media.id}-${locale}`} value={alts[locale] ?? ''} maxLength={300} disabled={disabled} onChange={(e) => setAlts({ ...alts, [locale]: e.target.value })} />
        </Field>
      ))}
      <Button size="sm" variant="primary" disabled={disabled || !dirty} onClick={() => onSave(alts)}>
        Save description
      </Button>
    </div>
  );
}
