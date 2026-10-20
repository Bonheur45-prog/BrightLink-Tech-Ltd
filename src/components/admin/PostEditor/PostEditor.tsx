'use client';

import dynamic from 'next/dynamic';
import type { JSONContent } from '@tiptap/core';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { savePost } from '@/app/admin/(cms)/blog/actions';
import { Button } from '@/components/admin/Button/Button';
import { MediaPicker, type PickedMedia } from '@/components/admin/MediaPicker/MediaPicker';
import { MediaThumb } from '@/components/admin/MediaThumb/MediaThumb';
import { Notice } from '@/components/admin/Notice/Notice';
import { localeNames, type Locale } from '@/i18n/config';
import { seoChecks, type PostPayload, type PostT } from '@/lib/blog/post-model';
import { renderDoc, type DocNode } from '@/lib/blog/render';
import type { Errors } from '@/lib/cms/settings-validation';
import styles from './PostEditor.module.css';

// The editor bundle is only downloaded on this screen.
const RichEditor = dynamic(() => import('@/components/admin/RichEditor/RichEditor'), { ssr: false, loading: () => <p>Loading the editor…</p> });

type Props = {
  id: string;
  initial: PostPayload;
  locales: Locale[];
  categories: { id: string; name: string }[];
  authors: { id: string; name: string }[];
  media: PickedMedia[];
};

const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });
const emptyT = (): PostT => ({ title: '', excerpt: '', doc: { type: 'doc', content: [] }, metaTitle: '', metaDescription: '', ogMediaId: null });
const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function Chooser({ label, value, onChange, media, remember }: { label: string; value: string | null; onChange: (v: string | null) => void; media: Map<string, PickedMedia>; remember: (m: PickedMedia) => void }) {
  const [open, setOpen] = useState(false);
  const m = value ? media.get(value) : null;
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.row}>
        <MediaThumb media={value ? { kind: 'IMAGE', thumbUrl: m?.thumbUrl ?? null, durationSec: null } : null} size={72} />
        <Button size="sm" onClick={() => setOpen(true)}>{value ? 'Change' : 'Choose'}</Button>
        {value && <Button size="sm" variant="ghost" onClick={() => onChange(null)}>Remove</Button>}
      </div>
      <MediaPicker open={open} title={label} onClose={() => setOpen(false)} onPick={(p) => { remember(p); onChange(p.id); setOpen(false); }} />
    </div>
  );
}

export function PostEditor({ id, initial, locales, categories, authors, media: initialMedia }: Props) {
  const [p, setP] = useState<PostPayload>(initial);
  const [lang, setLang] = useState<Locale>('en');
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [media, setMedia] = useState(() => new Map(initialMedia.map((m) => [m.id, m])));
  const remember = (m: PickedMedia) => setMedia((cur) => new Map(cur).set(m.id, m));
  const t = p.translations[lang] ?? emptyT();

  const update = (patch: Partial<PostPayload>) => {
    setP((cur) => ({ ...cur, ...patch }));
    setDirty(true);
  };
  const updateT = (patch: Partial<PostT>) => {
    setP((cur) => ({ ...cur, translations: { ...cur.translations, [lang]: { ...(cur.translations[lang] ?? emptyT()), ...patch } } }));
    setDirty(true);
  };

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = (status: PostPayload['status']) =>
    start(async () => {
      const result = await savePost(id, { ...p, status });
      if (result.ok) {
        setP((cur) => ({ ...cur, status: result.status, slug: result.slug, publishedAt: result.publishedAt }));
        setErrors({});
        setDirty(false);
        const scheduled = result.status === 'PUBLISHED' && result.publishedAt && new Date(result.publishedAt) > new Date();
        setMessage({ tone: 'success', text: `Saved at ${time.format(result.savedAt)}. ${result.status === 'DRAFT' ? 'It is a draft: not on the website.' : scheduled ? 'Scheduled: it appears on the website at the chosen date.' : 'It is on the website.'}` });
      } else {
        setErrors(result.errors);
        setMessage({ tone: 'error', text: result.message });
        const bad = Object.keys(result.errors).find((k) => k.includes('.'))?.split('.').pop();
        if (bad && locales.includes(bad as Locale)) setLang(bad as Locale);
      }
    });

  const rendered = useMemo(() => renderDoc(t.doc), [t.doc]);
  const missingAlt = useMemo(() => {
    let n = 0;
    const walk = (node: DocNode) => {
      if (node.type === 'image' && !String(node.attrs?.alt ?? '').trim()) n++;
      node.content?.forEach(walk);
    };
    walk(t.doc as DocNode);
    return n;
  }, [t.doc]);
  const checks = seoChecks({ title: t.title, slug: p.slug, excerpt: t.excerpt, metaTitle: t.metaTitle, metaDescription: t.metaDescription, focusKeyword: p.focusKeyword, rendered, hasCover: !!p.coverMediaId, missingAlt });
  const err = (k: string) => (errors[k] ? <span className={styles.error}>{errors[k]}</span> : null);
  const scheduled = p.status === 'PUBLISHED' && p.publishedAt && new Date(p.publishedAt) > new Date();

  return (
    <div className={styles.editor}>
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      {locales.length > 1 && (
        <div className={styles.row} role="group" aria-label="Language">
          <span>Language:</span>
          {locales.map((l) => (
            <Button key={l} size="sm" variant={l === lang ? 'primary' : 'secondary'} aria-pressed={l === lang} onClick={() => setLang(l)}>
              {localeNames[l]}
              {Object.keys(errors).some((k) => k.endsWith(`.${l}`)) ? ' (!)' : ''}
            </Button>
          ))}
          {lang !== 'en' && !p.translations[lang] && <span className={styles.muted}>Not translated yet: visitors see the English article.</span>}
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.main}>
          <label className={styles.field}>
            <span className={styles.label}>Title</span>
            <input className={`${styles.input} ${styles.title}`} value={t.title} maxLength={160} onChange={(e) => updateT({ title: e.target.value })} />
            {err(`title.${lang}`)}
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Summary</span>
            <textarea className={styles.input} rows={2} value={t.excerpt} maxLength={400} onChange={(e) => updateT({ excerpt: e.target.value })} />
            <span className={styles.muted}>Shown on the blog list and used when the search description is empty.</span>
            {err(`excerpt.${lang}`)}
          </label>
          <div className={styles.field}>
            <span className={styles.label}>Article</span>
            {err(`doc.${lang}`)}
            <RichEditor key={lang} initial={t.doc as JSONContent} label={`Article text (${localeNames[lang]})`} onChange={(doc) => updateT({ doc })} />
            <span className={styles.muted}>
              {rendered.words} words · about {rendered.readingMinutes} min read · {rendered.toc.length} headings in the table of contents
            </span>
          </div>
        </div>

        <aside className={styles.aside}>
          <section className={styles.box}>
            <h2 className={styles.boxTitle}>Publishing</h2>
            <p className={styles.muted}>
              Now: <strong>{p.status === 'DRAFT' ? 'Draft (hidden)' : scheduled ? 'Scheduled' : 'Published'}</strong>
              {dirty && ' · unsaved changes'}
            </p>
            <label className={styles.field}>
              <span className={styles.label}>Publication date</span>
              <input className={styles.input} type="datetime-local" value={toLocalInput(p.publishedAt)} onChange={(e) => update({ publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null })} />
              <span className={styles.muted}>Empty = when you publish. A future date schedules the article.</span>
              {err('publishedAt')}
            </label>
            <div className={styles.row}>
              <Button disabled={pending} onClick={() => save('DRAFT')}>{p.status === 'DRAFT' ? 'Save draft' : 'Unpublish'}</Button>
              <Button variant="primary" disabled={pending} onClick={() => save('PUBLISHED')}>{p.status === 'DRAFT' ? 'Publish' : 'Save'}</Button>
            </div>
          </section>

          <section className={styles.box}>
            <h2 className={styles.boxTitle}>Details</h2>
            <label className={styles.field}>
              <span className={styles.label}>Category</span>
              <select className={styles.input} value={p.categoryId} onChange={(e) => update({ categoryId: e.target.value })}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {err('categoryId')}
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Author</span>
              <select className={styles.input} value={p.authorId ?? ''} onChange={(e) => update({ authorId: e.target.value || null })}>
                <option value="">BrightLink Team</option>
                {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
            <Chooser label="Cover photo" value={p.coverMediaId} onChange={(v) => update({ coverMediaId: v })} media={media} remember={remember} />
            <label className={styles.field}>
              <span className={styles.label}>Tags</span>
              <input className={styles.input} value={p.tags.join(', ')} onChange={(e) => update({ tags: e.target.value.split(',').map((x) => x.trimStart()) })} />
              <span className={styles.muted}>Separate with commas. Up to 10.</span>
            </label>
            <label className={styles.check}>
              <input type="checkbox" checked={p.featured} onChange={(e) => update({ featured: e.target.checked })} /> Featured (shown large at the top of the blog)
            </label>
          </section>

          <section className={styles.box}>
            <h2 className={styles.boxTitle}>SEO assistant</h2>
            <label className={styles.field}>
              <span className={styles.label}>Focus keyword</span>
              <input className={styles.input} value={p.focusKeyword} maxLength={80} placeholder="e.g. inventory management system" onChange={(e) => update({ focusKeyword: e.target.value })} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Address</span>
              <input className={styles.input} value={p.slug} maxLength={80} onChange={(e) => update({ slug: e.target.value })} />
              <span className={styles.muted}>/blog/{p.slug}. Changing it keeps old links working.</span>
              {err('slug')}
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Search title ({localeNames[lang]})</span>
              <input className={styles.input} value={t.metaTitle} maxLength={120} placeholder={t.title} onChange={(e) => updateT({ metaTitle: e.target.value })} />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Search description ({localeNames[lang]})</span>
              <textarea className={styles.input} rows={3} value={t.metaDescription} maxLength={300} placeholder={t.excerpt} onChange={(e) => updateT({ metaDescription: e.target.value })} />
            </label>
            <div className={styles.preview} aria-label="Google preview">
              <span className={styles.previewUrl}>brightlinkltd.com › blog › {p.slug}</span>
              <span className={styles.previewTitle}>{t.metaTitle || t.title || 'Title'}</span>
              <span className={styles.previewDesc}>{t.metaDescription || t.excerpt || 'Description'}</span>
            </div>
            <ul className={styles.checklist}>
              {checks.map((c) => (
                <li key={c.text} data-ok={c.ok || undefined}>{c.ok ? '✓' : '!'} {c.text}</li>
              ))}
            </ul>
            <Chooser label={`Share image (${localeNames[lang]})`} value={t.ogMediaId} onChange={(v) => updateT({ ogMediaId: v })} media={media} remember={remember} />
            <details>
              <summary className={styles.label}>Advanced</summary>
              <label className={styles.field}>
                <span className={styles.label}>Canonical address</span>
                <input className={styles.input} value={p.canonicalUrl} placeholder="Only if this article was first published elsewhere" onChange={(e) => update({ canonicalUrl: e.target.value })} />
                {err('canonicalUrl')}
              </label>
              <label className={styles.check}>
                <input type="checkbox" checked={p.noIndex} onChange={(e) => update({ noIndex: e.target.checked })} /> Hide from Google
              </label>
            </details>
          </section>
        </aside>
      </div>
    </div>
  );
}
