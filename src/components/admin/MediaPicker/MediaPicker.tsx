'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { browseMedia, type PickerItem } from '@/app/admin/(cms)/media/actions';
import { Button } from '@/components/admin/Button/Button';
import { MediaThumb } from '@/components/admin/MediaThumb/MediaThumb';
import { MediaUploader } from '@/components/admin/MediaUploader/MediaUploader';
import styles from './MediaPicker.module.css';

export type PickedMedia = { id: string; thumbUrl: string | null; alt: string; kind?: 'IMAGE' | 'VIDEO' };

type PickerProps = { open: boolean; onClose: () => void; onPick: (m: PickedMedia) => void; kind?: 'IMAGE' | 'VIDEO'; title?: string };

/** Modal that lists the media library (search, pages) and lets you upload a new file and pick it. */
export function MediaPicker({ open, onClose, onPick, kind = 'IMAGE', title = 'Choose a photo' }: PickerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: PickerItem[]; total: number; pageSize: number } | null>(null);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const load = (query: string, p: number) =>
    start(async () => {
      try {
        setError('');
        setData(await browseMedia({ q: query, page: p, kind }));
      } catch {
        setError('The library could not be loaded. Check your connection and try again.');
      }
    });

  useEffect(() => {
    if (open) load(q, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page]);

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <dialog ref={ref} className={styles.dialog} onClose={onClose} aria-labelledby="media-picker-title">
      <div className={styles.head}>
        <h2 id="media-picker-title" className={styles.title}>{title}</h2>
        <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
      </div>
      <form
        className={styles.search}
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          load(q, 1);
        }}
      >
        <input className={styles.input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search descriptions" aria-label="Search descriptions" />
        <Button type="submit" size="sm">Search</Button>
      </form>
      <details className={styles.upload}>
        <summary>Upload a new file</summary>
        <MediaUploader
          multiple={false}
          allowVideo={kind === 'VIDEO'}
          onUploaded={(m) => onPick({ id: m.id, thumbUrl: m.thumbUrl, alt: m.alt, kind: m.kind })}
        />
      </details>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.grid} aria-busy={pending || undefined}>
        {data?.items.map((m) => (
          <button key={m.id} type="button" className={styles.item} onClick={() => onPick({ id: m.id, thumbUrl: m.thumbUrl, alt: m.alt, kind: m.kind })}>
            <MediaThumb media={{ kind: m.kind, thumbUrl: m.thumbUrl, durationSec: null }} fluid alt={m.alt} />
            <span className={styles.alt}>{m.alt || 'No description yet'}</span>
          </button>
        ))}
        {data && data.items.length === 0 && <p className={styles.empty}>Nothing here yet. Upload a file above.</p>}
      </div>
      {pages > 1 && (
        <div className={styles.pager}>
          <Button size="sm" disabled={page <= 1 || pending} onClick={() => setPage(page - 1)}>← Previous</Button>
          <span>Page {page} of {pages}</span>
          <Button size="sm" disabled={page >= pages || pending} onClick={() => setPage(page + 1)}>Next →</Button>
        </div>
      )}
    </dialog>
  );
}

/** Form field: a hidden input holding the chosen media id, with a preview and Choose/Remove buttons. */
export function MediaField({ name, label, hint, initial }: { name: string; label: string; hint?: string; initial: PickedMedia | null }) {
  const [value, setValue] = useState<PickedMedia | null>(initial);
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input type="hidden" name={name} value={value?.id ?? ''} />
      <div className={styles.fieldRow}>
        <MediaThumb media={value ? { kind: value.kind ?? 'IMAGE', thumbUrl: value.thumbUrl, durationSec: null } : null} size={72} alt={value?.alt} />
        <Button size="sm" onClick={() => setOpen(true)}>{value ? 'Change' : 'Choose'}</Button>
        {value && <Button size="sm" variant="ghost" onClick={() => setValue(null)}>Remove</Button>}
      </div>
      {hint && <span className={styles.hint}>{hint}</span>}
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onPick={(m) => {
          setValue(m);
          setOpen(false);
        }}
        title={label}
      />
    </div>
  );
}
