'use client';

import { createContext, useActionState, useContext, useState, useTransition, type ReactNode } from 'react';
import { Button } from '@/components/admin/Button/Button';
import { Field } from '@/components/admin/Field/Field';
import { MediaPicker, type PickedMedia } from '@/components/admin/MediaPicker/MediaPicker';
import { MediaThumb } from '@/components/admin/MediaThumb/MediaThumb';
import { Notice } from '@/components/admin/Notice/Notice';
import type { EntityFormState } from '@/app/admin/(cms)/collection-actions';
import type { Errors } from '@/lib/cms/settings-validation';
import styles from './EntityForm.module.css';

const ErrorsContext = createContext<Errors>({});
const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

type Action = (state: EntityFormState, data: FormData) => Promise<EntityFormState>;

/**
 * Editor form for one record. Submitted by hand (not <form action>) so React does not reset the
 * fields: what was typed stays after a validation error. Field errors reach <CField> through context.
 */
export function EntityForm({ action, children, aside }: { action: Action; children: ReactNode; aside?: ReactNode }) {
  const [state, run] = useActionState<EntityFormState, FormData>(action, { status: 'idle' });
  const [pending, start] = useTransition();
  const [dirty, setDirty] = useState(false);
  const errors = state.status === 'error' ? state.errors : {};

  return (
    <ErrorsContext.Provider value={errors}>
      <form
        className={styles.form}
        noValidate
        onChange={() => setDirty(true)}
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          // The save action revalidates the admin pages, so fresh data arrives with its response.
          start(() => run(data));
          setDirty(false);
        }}
      >
        {state.status === 'error' && <Notice tone="error">{state.message}</Notice>}
        {state.status === 'saved' && !dirty && <Notice tone="success">Saved at {time.format(state.savedAt)}.</Notice>}
        <div className={styles.layout}>
          <div className={styles.main}>{children}</div>
          {aside && <div className={styles.aside}>{aside}</div>}
        </div>
        <div className={styles.bar}>
          <span className={styles.status} data-dirty={dirty || undefined}>
            {pending ? 'Saving…' : dirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <Button type="submit" variant="primary" disabled={pending}>
            Save
          </Button>
        </div>
      </form>
    </ErrorsContext.Provider>
  );
}

/** Field whose error comes from the last save. The control inside must use id={name}. */
export function CField({ name, label, hint, required, children }: { name: string; label: string; hint?: string; required?: boolean; children: ReactNode }) {
  const errors = useContext(ErrorsContext);
  return (
    <Field label={label} htmlFor={name} hint={hint} error={errors[name]} required={required}>
      {children}
    </Field>
  );
}

/** True when any field whose name ends with the suffix has an error (marks a language tab). */
export function useHasError(suffix: string) {
  const errors = useContext(ErrorsContext);
  return Object.keys(errors).some((k) => k.endsWith(suffix));
}

/** Ordered list of photos (a project gallery): hidden inputs named `name`, one per photo. */
export function MediaListField({ name, label, initial, max = 30 }: { name: string; label: string; initial: PickedMedia[]; max?: number }) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const move = (i: number, step: number) =>
    setItems((list) => {
      const j = i + step;
      if (j < 0 || j >= list.length) return list;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  return (
    <div className={styles.gallery}>
      <span className={styles.label}>{label}</span>
      <ol className={styles.galleryList}>
        {items.map((m, i) => (
          <li key={m.id} className={styles.galleryItem}>
            <input type="hidden" name={name} value={m.id} />
            <MediaThumb media={{ kind: m.kind ?? 'IMAGE', thumbUrl: m.thumbUrl, durationSec: null }} size={96} alt={m.alt} />
            <span className={styles.galleryTools}>
              <Button size="sm" variant="ghost" onClick={() => move(i, -1)} aria-label="Move earlier">←</Button>
              <Button size="sm" variant="ghost" onClick={() => move(i, 1)} aria-label="Move later">→</Button>
              <Button size="sm" variant="ghost" onClick={() => setItems((l) => l.filter((x) => x.id !== m.id))} aria-label="Remove photo">✕</Button>
            </span>
          </li>
        ))}
      </ol>
      {items.length < max && (
        <Button size="sm" onClick={() => setOpen(true)}>
          + Add photo
        </Button>
      )}
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onPick={(m) => {
          setItems((l) => (l.some((x) => x.id === m.id) ? l : [...l, m]));
          setOpen(false);
        }}
        title="Add a photo to the gallery"
      />
    </div>
  );
}
