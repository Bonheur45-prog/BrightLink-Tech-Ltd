'use client';

import { useState } from 'react';
import { Button } from '@/components/admin/Button/Button';
import type { EditorStatus } from './useDocEditor';
import styles from './PublishBar.module.css';

type Props = {
  dirty: boolean;
  unpublished: boolean;
  status: EditorStatus;
  pending: boolean;
  onSave: () => void;
  onPublish: (note: string) => void;
};

const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

/** Sticky bar under every page editor: where things stand, Save draft, Publish (with an optional note). */
export function PublishBar({ dirty, unpublished, status, pending, onSave, onPublish }: Props) {
  const [note, setNote] = useState('');

  const message = pending
    ? 'Working…'
    : dirty
      ? 'Unsaved changes'
      : status.kind === 'published'
        ? `Published at ${time.format(status.at)}. The website shows it now.`
        : status.kind === 'saved'
          ? `Draft saved at ${time.format(status.at)}. Not on the website until you publish.`
          : unpublished
            ? 'Draft has changes that are not on the website yet.'
            : 'Everything here is live.';

  return (
    <div className={styles.bar}>
      <p className={styles.status} aria-live="polite" data-tone={dirty || unpublished ? 'pending' : 'live'}>
        {message}
      </p>
      <label className={styles.note}>
        <span className={styles.srOnly}>Note for the version history (optional)</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
          placeholder="What changed? (optional)"
          className={styles.noteInput}
        />
      </label>
      <div className={styles.actions}>
        <Button onClick={onSave} disabled={pending || !dirty}>
          Save draft
        </Button>
        <Button
          variant="primary"
          disabled={pending || (!dirty && !unpublished)}
          onClick={() => {
            onPublish(note);
            setNote('');
          }}
        >
          Publish
        </Button>
      </div>
    </div>
  );
}
