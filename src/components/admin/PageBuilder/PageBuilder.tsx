'use client';

import { createContext, useContext, useState } from 'react';
import { Button } from '@/components/admin/Button/Button';
import { Notice } from '@/components/admin/Notice/Notice';
import { MediaPicker, type PickedMedia } from '@/components/admin/MediaPicker/MediaPicker';
import { MediaThumb } from '@/components/admin/MediaThumb/MediaThumb';
import { PublishBar } from '@/components/admin/PublishBar/PublishBar';
import { useDocEditor } from '@/components/admin/PublishBar/useDocEditor';
import { localeNames, type Locale } from '@/i18n/config';
import type { DocKey } from '@/lib/cms/drafts';
import type { Problems, T } from '@/lib/cms/globals-model';
import { BACKGROUNDS, MAX_SECTIONS, SECTIONS, SECTION_BY_TYPE, type FieldDef } from '@/lib/pages/catalogue';
import { emptySection, newId, seoChecklist, type Item, type LinkValue, type PageDoc, type Section, type Value } from '@/lib/pages/model';
import styles from './PageBuilder.module.css';

type Ctx = { lang: Locale; problems: Problems; iconKeys: string[]; pages: string[]; media: Map<string, PickedMedia>; remember: (m: PickedMedia) => void };
const C = createContext<Ctx>(null as unknown as Ctx);

function move<X>(list: X[], i: number, step: number): X[] {
  const j = i + step;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Copy with fresh ids (duplicating a section or an item). */
function cloneWithIds<X>(v: X): X {
  if (Array.isArray(v)) return v.map(cloneWithIds) as X;
  if (v && typeof v === 'object') {
    const o = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, cloneWithIds(x)]));
    if ('id' in o) o.id = newId();
    return o as X;
  }
  return v;
}

function Err({ path }: { path: string }) {
  const { problems } = useContext(C);
  return problems[path] ? <span className={styles.error}>{problems[path]}</span> : null;
}

function TInput({ label, value, onChange, long, path, hint, max }: { label: string; value: T; onChange: (t: T) => void; long?: boolean; path: string; hint?: string; max?: number }) {
  const { lang, problems } = useContext(C);
  const common = {
    className: styles.input,
    value: value[lang] ?? '',
    maxLength: max,
    placeholder: lang !== 'en' ? (value.en ?? '') : '',
    onChange: (e: { target: { value: string } }) => onChange({ ...value, [lang]: e.target.value }),
  };
  return (
    <label className={styles.field} data-invalid={problems[path] ? true : undefined}>
      <span className={styles.label}>
        {label} {lang !== 'en' && <span className={styles.muted}>({localeNames[lang]})</span>}
      </span>
      {long ? <textarea rows={4} {...common} /> : <input {...common} />}
      {hint && <span className={styles.muted}>{hint}</span>}
      <Err path={path} />
    </label>
  );
}

function MediaInput({ label, value, onChange, video, path, hint }: { label: string; value: string | null; onChange: (v: string | null) => void; video?: boolean; path: string; hint?: string }) {
  const { media, remember } = useContext(C);
  const [open, setOpen] = useState(false);
  const m = value ? media.get(value) : null;
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.inline}>
        <MediaThumb media={value ? { kind: m?.kind ?? (video ? 'VIDEO' : 'IMAGE'), thumbUrl: m?.thumbUrl ?? null, durationSec: null } : null} size={64} />
        <Button size="sm" onClick={() => setOpen(true)}>{value ? 'Change' : 'Choose'}</Button>
        {value && <Button size="sm" variant="ghost" onClick={() => onChange(null)}>Remove</Button>}
      </div>
      {hint && <span className={styles.muted}>{hint}</span>}
      <Err path={path} />
      <MediaPicker
        open={open}
        kind={video ? 'VIDEO' : 'IMAGE'}
        title={label}
        onClose={() => setOpen(false)}
        onPick={(p) => {
          remember(p);
          onChange(p.id);
          setOpen(false);
        }}
      />
    </div>
  );
}

function LinkInput({ label, value, onChange, path }: { label: string; value: LinkValue; onChange: (v: LinkValue) => void; path: string }) {
  const { pages } = useContext(C);
  return (
    <fieldset className={styles.linkBox}>
      <legend className={styles.label}>{label}</legend>
      <div className={styles.inline}>
        <TInput label="Text" value={value.label} max={60} path={`${path}.label`} onChange={(l) => onChange({ ...value, label: l })} />
        <label className={styles.field}>
          <span className={styles.label}>Link</span>
          <input className={styles.input} list="builder-pages" value={value.url} maxLength={500} placeholder="/contact-us or https://…" onChange={(e) => onChange({ ...value, url: e.target.value })} />
          <Err path={`${path}.url`} />
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={value.newTab} onChange={(e) => onChange({ ...value, newTab: e.target.checked })} /> New tab
        </label>
      </div>
      <datalist id="builder-pages">{pages.map((p) => <option key={p} value={p} />)}</datalist>
    </fieldset>
  );
}

function FieldInput({ def, value, onChange, path }: { def: FieldDef; value: Value; onChange: (v: Value) => void; path: string }) {
  const { iconKeys } = useContext(C);
  switch (def.kind) {
    case 'text':
    case 'long':
      return <TInput label={def.label + (def.required ? ' *' : '')} value={value as T} long={def.kind === 'long'} max={def.max} hint={def.hint} path={path} onChange={onChange} />;
    case 'media':
      return <MediaInput label={def.label} value={value as string | null} video={def.video} hint={def.hint} path={path} onChange={onChange} />;
    case 'link':
      return <LinkInput label={def.label} value={value as LinkValue} path={path} onChange={onChange} />;
    case 'select':
    case 'icon':
      return (
        <label className={styles.field}>
          <span className={styles.label}>{def.label}</span>
          <select className={styles.input} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
            {def.kind === 'icon' ? (
              <>
                <option value="">(none)</option>
                {iconKeys.map((k) => <option key={k} value={k}>{k}</option>)}
              </>
            ) : (
              def.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)
            )}
          </select>
        </label>
      );
    case 'number':
      return (
        <label className={styles.field}>
          <span className={styles.label}>{def.label}</span>
          <input className={styles.input} type="number" min={def.min} max={def.max} value={Number(value)} onChange={(e) => onChange(Number(e.target.value))} />
        </label>
      );
    case 'boolean':
      return (
        <label className={styles.check}>
          <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} /> {def.label}
        </label>
      );
    case 'items': {
      const items = value as Item[];
      const set = (list: Item[]) => onChange(list);
      const blank = () => {
        const it: Item = { id: newId() };
        for (const f of def.fields) it[f.key] = f.kind === 'text' || f.kind === 'long' ? {} : f.kind === 'link' ? { label: {}, url: '', newTab: false } : f.kind === 'items' ? [] : 'default' in f ? f.default : f.kind === 'media' ? null : '';
        return it;
      };
      return (
        <div className={styles.items}>
          <span className={styles.label}>{def.label}</span>
          <Err path={path} />
          {items.map((it, i) => (
            <details key={it.id} className={styles.item} open={items.length <= 3}>
              <summary className={styles.itemHead}>
                <span>
                  {def.itemLabel} {i + 1}
                  {(() => {
                    const first = def.fields.find((f) => f.kind === 'text');
                    const t = first ? (it[first.key] as T) : null;
                    return t?.en ? `: ${t.en.slice(0, 50)}` : '';
                  })()}
                </span>
                <span className={styles.tools} onClick={(e) => e.preventDefault()}>
                  <Button size="sm" variant="ghost" onClick={() => set(move(items, i, -1))} aria-label="Move up">↑</Button>
                  <Button size="sm" variant="ghost" onClick={() => set(move(items, i, 1))} aria-label="Move down">↓</Button>
                  {items.length < def.max && <Button size="sm" variant="ghost" onClick={() => set([...items.slice(0, i + 1), cloneWithIds(it), ...items.slice(i + 1)])}>Copy</Button>}
                  <Button size="sm" variant="ghost" onClick={() => set(items.filter((_, j) => j !== i))}>Remove</Button>
                </span>
              </summary>
              <div className={styles.stack}>
                {def.fields.map((f) => (
                  <FieldInput key={f.key} def={f} value={it[f.key]} path={`${path}.${i}.${f.key}`} onChange={(v) => set(items.map((x, j) => (j === i ? { ...x, [f.key]: v } : x)))} />
                ))}
              </div>
            </details>
          ))}
          {items.length < def.max && (
            <Button size="sm" onClick={() => set([...items, blank()])}>
              + Add {def.itemLabel}
            </Button>
          )}
        </div>
      );
    }
  }
}

function SectionCard({ s, index, count, onChange, onMove, onRemove, onDuplicate }: { s: Section; index: number; count: number; onChange: (s: Section) => void; onMove: (step: number) => void; onRemove: () => void; onDuplicate?: () => void }) {
  const def = SECTION_BY_TYPE[s.type];
  const { problems } = useContext(C);
  const hasProblem = Object.keys(problems).some((k) => k.startsWith(`s.${s.id}.`));
  const heading = (s.data.heading as T | undefined)?.en || ((s.data.slides as Item[] | undefined)?.[0]?.heading as T | undefined)?.en;
  return (
    <details className={styles.section} data-hidden={!s.visible || undefined} data-invalid={hasProblem || undefined} open={hasProblem || undefined}>
      <summary className={styles.sectionHead}>
        <span className={styles.sectionTitle}>
          <strong>{index + 1}. {def.label}</strong>
          {heading && <span className={styles.muted}> · {heading.slice(0, 60)}</span>}
          {!s.visible && <span className={styles.badge}>Hidden</span>}
          {hasProblem && <span className={styles.badgeError}>Needs attention</span>}
        </span>
        <span className={styles.tools} onClick={(e) => e.preventDefault()}>
          <Button size="sm" variant="ghost" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move section up">↑</Button>
          <Button size="sm" variant="ghost" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move section down">↓</Button>
          <Button size="sm" variant="ghost" onClick={() => onChange({ ...s, visible: !s.visible })}>{s.visible ? 'Hide' : 'Show'}</Button>
          {onDuplicate && <Button size="sm" variant="ghost" onClick={onDuplicate}>Duplicate</Button>}
          <Button size="sm" variant="ghost" onClick={() => window.confirm(`Remove the “${def.label}” section?`) && onRemove()}>Remove</Button>
        </span>
      </summary>
      <div className={styles.sectionBody}>
        <p className={styles.muted}>{def.description}</p>
        <div className={styles.inline}>
          {def.variants.length > 1 && (
            <label className={styles.field}>
              <span className={styles.label}>Layout</span>
              <select className={styles.input} value={s.variant} onChange={(e) => onChange({ ...s, variant: e.target.value })}>
                {def.variants.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </label>
          )}
          <label className={styles.field}>
            <span className={styles.label}>Background</span>
            <select className={styles.input} value={s.background.style} onChange={(e) => onChange({ ...s, background: { ...s.background, style: e.target.value as Section['background']['style'] } })}>
              {BACKGROUNDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </label>
        </div>
        {s.background.style === 'image' && (
          <div className={styles.bgBox}>
            <MediaInput label="Background photo" value={s.background.image} path={`s.${s.id}.background`} onChange={(image) => onChange({ ...s, background: { ...s.background, image } })} />
            <label className={styles.check}>
              <input type="checkbox" checked={s.background.parallax} onChange={(e) => onChange({ ...s, background: { ...s.background, parallax: e.target.checked } })} /> Parallax (photo moves slower than the page; follows the site-wide switch)
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Darkening over the photo</span>
              <select className={styles.input} value={s.background.overlay} onChange={(e) => onChange({ ...s, background: { ...s.background, overlay: e.target.value as 'light' | 'medium' | 'strong' } })}>
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="strong">Strong</option>
              </select>
            </label>
          </div>
        )}
        {def.fields.map((f) => (
          <FieldInput key={f.key} def={f} value={s.data[f.key]} path={`s.${s.id}.${f.key}`} onChange={(v) => onChange({ ...s, data: { ...s.data, [f.key]: v } })} />
        ))}
      </div>
    </details>
  );
}

function SeoPanel({ doc, setSeo, fallbackTitle, path }: { doc: PageDoc; setSeo: (seo: PageDoc['seo']) => void; fallbackTitle: string; path: string }) {
  const { lang } = useContext(C);
  const title = doc.seo.title[lang] || doc.seo.title.en || fallbackTitle;
  const desc = doc.seo.description[lang] || doc.seo.description.en || '';
  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Search engines and sharing</h2>
      <TInput label="Page title" value={doc.seo.title} max={120} path="seo.title" hint={`Empty = “${fallbackTitle}”.`} onChange={(title) => setSeo({ ...doc.seo, title })} />
      <TInput label="Description" value={doc.seo.description} long max={300} path="seo.description" onChange={(description) => setSeo({ ...doc.seo, description })} />
      <MediaInput label="Share image" value={doc.seo.ogImage} path="seo.ogImage" hint="1200 × 630 works best. Empty = the site default." onChange={(ogImage) => setSeo({ ...doc.seo, ogImage })} />
      <label className={styles.check}>
        <input type="checkbox" checked={doc.seo.noIndex} onChange={(e) => setSeo({ ...doc.seo, noIndex: e.target.checked })} /> Hide this page from Google
      </label>
      <div className={styles.preview} aria-label="Google preview">
        <span className={styles.previewUrl}>brightlinkltd.com{path === '/' ? '' : ` › ${path.slice(1).replace(/\//g, ' › ')}`}</span>
        <span className={styles.previewTitle}>{title}</span>
        <span className={styles.previewDesc}>{desc || 'Google will pick text from the page.'}</span>
      </div>
      <ul className={styles.checklist}>
        {seoChecklist(doc, fallbackTitle).map((c) => (
          <li key={c.text} data-ok={c.ok || undefined}>
            {c.ok ? '✓' : '!'} {c.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

type Props = { docKey: DocKey; initial: PageDoc; unpublished: boolean; locales: Locale[]; iconKeys: string[]; pages: string[]; media: PickedMedia[]; path: string; fallbackTitle: string };

/** The page builder: ordered sections from the fixed catalogue, each with a layout, background and fields. */
export function PageBuilder({ docKey, initial, unpublished, locales, iconKeys, pages, media: initialMedia, path, fallbackTitle }: Props) {
  const ed = useDocEditor<PageDoc>(docKey, initial, unpublished);
  const [lang, setLang] = useState<Locale>('en');
  const [media, setMedia] = useState(() => new Map(initialMedia.map((m) => [m.id, m])));
  const [adding, setAdding] = useState(SECTIONS[1].type);
  const doc = ed.doc;
  const setSections = (f: (list: Section[]) => Section[]) => ed.setDoc((d) => ({ ...d, sections: f(d.sections) }));
  const ctx: Ctx = { lang, problems: ed.problems, iconKeys, pages, media, remember: (m) => setMedia((cur) => new Map(cur).set(m.id, m)) };

  return (
    <C.Provider value={ctx}>
      <div className={styles.builder}>
        {ed.status.kind === 'error' && <Notice tone="error">{ed.status.message}</Notice>}
        {ed.problems.sections && <Notice tone="error">{ed.problems.sections}</Notice>}
        {locales.length > 1 && (
          <div className={styles.inline} role="group" aria-label="Language you are editing">
            <span>Editing text in:</span>
            {locales.map((l) => (
              <Button key={l} size="sm" variant={l === lang ? 'primary' : 'secondary'} aria-pressed={l === lang} onClick={() => setLang(l)}>
                {localeNames[l]}
              </Button>
            ))}
            {lang !== 'en' && <span className={styles.muted}>Empty boxes show the English text on the website.</span>}
          </div>
        )}

        <div className={styles.layout}>
          <div className={styles.sections}>
            {doc.sections.map((s, i) => (
              <SectionCard
                key={s.id}
                s={s}
                index={i}
                count={doc.sections.length}
                onChange={(next) => setSections((list) => list.map((x) => (x.id === s.id ? next : x)))}
                onMove={(step) => setSections((list) => move(list, i, step))}
                onRemove={() => setSections((list) => list.filter((x) => x.id !== s.id))}
                onDuplicate={doc.sections.length < MAX_SECTIONS ? () => setSections((list) => [...list.slice(0, i + 1), cloneWithIds(s), ...list.slice(i + 1)]) : undefined}
              />
            ))}
            {doc.sections.length < MAX_SECTIONS && (
              <div className={styles.add}>
                <label className={styles.field}>
                  <span className={styles.label}>Add a section at the end</span>
                  <select className={styles.input} value={adding} onChange={(e) => setAdding(e.target.value)}>
                    {SECTIONS.map((d) => (
                      <option key={d.type} value={d.type}>
                        {d.label}: {d.description}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  onClick={() => {
                    const s = emptySection(adding);
                    if (s) setSections((list) => [...list, s]);
                  }}
                >
                  + Add section
                </Button>
              </div>
            )}
          </div>
          <SeoPanel doc={doc} path={path} fallbackTitle={fallbackTitle} setSeo={(seo) => ed.setDoc((d) => ({ ...d, seo }))} />
        </div>

        <PublishBar dirty={ed.dirty} unpublished={ed.unpublished} status={ed.status} pending={ed.pending} onSave={ed.save} onPublish={ed.publish} />
      </div>
    </C.Provider>
  );
}
