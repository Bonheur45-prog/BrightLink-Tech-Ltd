'use client';

import { useEffect, useState, useTransition } from 'react';
import { publishDoc, saveDocDraft, type DocSaveResult } from '@/app/admin/(cms)/doc-actions';
import type { DocKey } from '@/lib/cms/drafts';
import type { Problems } from '@/lib/cms/globals-model';

export type EditorStatus = { kind: 'idle' } | { kind: 'saved'; at: number } | { kind: 'published'; at: number } | { kind: 'error'; message: string };

/** Holds the document being edited; saves the draft or publishes it through the server actions. */
export function useDocEditor<T>(key: DocKey, initial: T, initiallyUnpublished: boolean) {
  const [doc, setDocState] = useState<T>(initial);
  const [dirty, setDirty] = useState(false);
  const [unpublished, setUnpublished] = useState(initiallyUnpublished);
  const [problems, setProblems] = useState<Problems>({});
  const [status, setStatus] = useState<EditorStatus>({ kind: 'idle' });
  const [pending, startTransition] = useTransition();

  const setDoc = (update: (current: T) => T) => {
    setDocState(update);
    setDirty(true);
  };

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const handle = (result: DocSaveResult, kind: 'saved' | 'published') => {
    setDirty(false); // the draft itself is saved either way
    if (result.ok) {
      setProblems({});
      setUnpublished(kind === 'saved');
      setStatus({ kind, at: result.savedAt });
    } else {
      setUnpublished(true);
      setProblems(result.problems ?? {});
      setStatus({ kind: 'error', message: result.error });
    }
  };

  return {
    doc,
    setDoc,
    dirty,
    unpublished,
    problems,
    status,
    pending,
    save: () => startTransition(async () => handle(await saveDocDraft(key, doc), 'saved')),
    publish: (note: string) => startTransition(async () => handle(await publishDoc(key, doc, note), 'published')),
  };
}
