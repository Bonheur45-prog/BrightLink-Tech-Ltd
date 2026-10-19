'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/admin/Button/Button';
import { Checkbox } from '@/components/admin/Field/Field';
import { Notice } from '@/components/admin/Notice/Notice';
import { PublishBar } from '@/components/admin/PublishBar/PublishBar';
import { useDocEditor } from '@/components/admin/PublishBar/useDocEditor';
import { localeNames, type Locale } from '@/i18n/config';
import {
  MAX_CHILDREN,
  MAX_LINKS,
  MAX_NAV_ITEMS,
  type FooterDoc,
  type HeaderDoc,
  type LinkDoc,
  type NavItemDoc,
  type Problems,
  type T,
} from '@/lib/cms/globals-model';
import styles from './GlobalEditor.module.css';

type Props =
  | { kind: 'header'; initial: HeaderDoc; unpublished: boolean; locales: Locale[]; pages: string[] }
  | { kind: 'footer'; initial: FooterDoc; unpublished: boolean; locales: Locale[]; pages: string[] };

const newId = () => Math.random().toString(36).slice(2, 10);

function move<X>(list: X[], i: number, step: number): X[] {
  const j = i + step;
  if (j < 0 || j >= list.length) return list;
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/** Text box for one language of a translatable value; other languages show the English text as a hint. */
function TText({ label, value, lang, onChange, error, max = 80 }: { label: string; value: T; lang: Locale; onChange: (t: T) => void; error?: string; max?: number }) {
  return (
    <label className={styles.field} data-invalid={error ? true : undefined}>
      <span className={styles.label}>
        {label} {lang !== 'en' && <span className={styles.lang}>({localeNames[lang]})</span>}
      </span>
      <input
        className={styles.input}
        value={value[lang] ?? ''}
        maxLength={max}
        placeholder={lang !== 'en' ? value.en ?? '' : ''}
        onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
      />
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}

function UrlInput({ value, onChange, error, listId }: { value: string; onChange: (v: string) => void; error?: string; listId: string }) {
  return (
    <label className={styles.field} data-invalid={error ? true : undefined}>
      <span className={styles.label}>Link</span>
      <input className={styles.input} value={value} list={listId} maxLength={500} placeholder="/about-us or https://…" onChange={(e) => onChange(e.target.value)} />
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}

function RowTools({ onUp, onDown, onRemove, what }: { onUp: () => void; onDown: () => void; onRemove: () => void; what: string }) {
  return (
    <div className={styles.tools}>
      <Button size="sm" variant="ghost" onClick={onUp} aria-label={`Move ${what} up`}>↑</Button>
      <Button size="sm" variant="ghost" onClick={onDown} aria-label={`Move ${what} down`}>↓</Button>
      <Button size="sm" variant="ghost" onClick={onRemove} aria-label={`Remove ${what}`}>Remove</Button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

/** A list of simple links (footer quick links, legal links). */
function LinkList({ items, onChange, lang, problems, prefix, listId, max }: { items: LinkDoc[]; onChange: (l: LinkDoc[]) => void; lang: Locale; problems: Problems; prefix: string; listId: string; max: number }) {
  const set = (i: number, patch: Partial<LinkDoc>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <>
      {items.map((l, i) => (
        <div key={l.id} className={styles.row}>
          <TText label="Label" value={l.label} lang={lang} onChange={(label) => set(i, { label })} error={problems[`${prefix}.${i}.label`]} />
          <UrlInput value={l.url} onChange={(url) => set(i, { url })} error={problems[`${prefix}.${i}.url`]} listId={listId} />
          <Checkbox label="New tab" checked={l.newTab} onChange={(e) => set(i, { newTab: e.target.checked })} />
          <RowTools what="link" onUp={() => onChange(move(items, i, -1))} onDown={() => onChange(move(items, i, 1))} onRemove={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      {items.length < max && (
        <Button size="sm" onClick={() => onChange([...items, { id: newId(), label: {}, url: '', newTab: false }])}>
          + Add link
        </Button>
      )}
    </>
  );
}

export function GlobalEditor(props: Props) {
  const ed = useDocEditor<HeaderDoc | FooterDoc>(props.kind, props.initial, props.unpublished);
  const [lang, setLang] = useState<Locale>('en');
  const p = ed.problems;
  const listId = `pages-${props.kind}`;

  return (
    <div className={styles.editor}>
      {ed.status.kind === 'error' && <Notice tone="error">{ed.status.message}</Notice>}
      <datalist id={listId}>
        {props.pages.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>

      {props.locales.length > 1 && (
        <div className={styles.langBar} role="group" aria-label="Language you are editing">
          <span>Editing text in:</span>
          {props.locales.map((l) => (
            <Button key={l} size="sm" variant={l === lang ? 'primary' : 'secondary'} aria-pressed={l === lang} onClick={() => setLang(l)}>
              {localeNames[l]}
            </Button>
          ))}
          {lang !== 'en' && <span className={styles.hint}>Empty boxes use the English text on the website.</span>}
        </div>
      )}

      {props.kind === 'header' ? (
        <HeaderFields doc={ed.doc as HeaderDoc} setDoc={(f) => ed.setDoc((d) => f(d as HeaderDoc))} lang={lang} problems={p} listId={listId} />
      ) : (
        <>
          <Section title="Quick links">
            <LinkList
              items={(ed.doc as FooterDoc).quickLinks}
              onChange={(quickLinks) => ed.setDoc((d) => ({ ...(d as FooterDoc), quickLinks }))}
              lang={lang}
              problems={p}
              prefix="quickLinks"
              listId={listId}
              max={MAX_LINKS}
            />
          </Section>
          <Section title="Other footer settings">
            <Checkbox
              label="Show the list of services"
              checked={(ed.doc as FooterDoc).showServices}
              onChange={(e) => ed.setDoc((d) => ({ ...(d as FooterDoc), showServices: e.target.checked }))}
            />
            <TText
              label="Copyright line (empty = “© year, legal name. All rights reserved.”)"
              value={(ed.doc as FooterDoc).copyright}
              lang={lang}
              max={200}
              onChange={(copyright) => ed.setDoc((d) => ({ ...(d as FooterDoc), copyright }))}
            />
          </Section>
          <Section title="Legal links (bottom row)">
            <LinkList
              items={(ed.doc as FooterDoc).legalLinks}
              onChange={(legalLinks) => ed.setDoc((d) => ({ ...(d as FooterDoc), legalLinks }))}
              lang={lang}
              problems={p}
              prefix="legalLinks"
              listId={listId}
              max={MAX_LINKS}
            />
          </Section>
        </>
      )}

      <PublishBar dirty={ed.dirty} unpublished={ed.unpublished} status={ed.status} pending={ed.pending} onSave={ed.save} onPublish={ed.publish} />
    </div>
  );
}

function HeaderFields({ doc, setDoc, lang, problems: p, listId }: { doc: HeaderDoc; setDoc: (f: (d: HeaderDoc) => HeaderDoc) => void; lang: Locale; problems: Problems; listId: string }) {
  const setNav = (navItems: NavItemDoc[]) => setDoc((d) => ({ ...d, navItems }));
  const setItem = (i: number, patch: Partial<NavItemDoc>) => setNav(doc.navItems.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <>
      <Section title="Menu">
        {p.navItems && <p className={styles.error}>{p.navItems}</p>}
        {doc.navItems.map((n, i) => (
          <div key={n.id} className={styles.card}>
            <div className={styles.row}>
              <TText label="Menu label" value={n.label} lang={lang} onChange={(label) => setItem(i, { label })} error={p[`nav.${i}.label`]} />
              <UrlInput value={n.url} onChange={(url) => setItem(i, { url })} error={p[`nav.${i}.url`]} listId={listId} />
              <Checkbox label="New tab" checked={n.newTab} onChange={(e) => setItem(i, { newTab: e.target.checked })} />
              <RowTools what="menu item" onUp={() => setNav(move(doc.navItems, i, -1))} onDown={() => setNav(move(doc.navItems, i, 1))} onRemove={() => setNav(doc.navItems.filter((_, j) => j !== i))} />
            </div>
            <div className={styles.children}>
              {n.children.length > 0 && <p className={styles.hint}>Dropdown links (the menu item’s own link may stay empty)</p>}
              {n.children.map((c, j) => {
                const setChild = (patch: Partial<typeof c>) => setItem(i, { children: n.children.map((x, k) => (k === j ? { ...x, ...patch } : x)) });
                return (
                  <div key={c.id} className={styles.row}>
                    <TText label="Label" value={c.label} lang={lang} onChange={(label) => setChild({ label })} error={p[`nav.${i}.${j}.label`]} />
                    <UrlInput value={c.url} onChange={(url) => setChild({ url })} error={p[`nav.${i}.${j}.url`]} listId={listId} />
                    <TText label="Short description" value={c.description} lang={lang} max={160} onChange={(description) => setChild({ description })} />
                    <RowTools
                      what="dropdown link"
                      onUp={() => setItem(i, { children: move(n.children, j, -1) })}
                      onDown={() => setItem(i, { children: move(n.children, j, 1) })}
                      onRemove={() => setItem(i, { children: n.children.filter((_, k) => k !== j) })}
                    />
                  </div>
                );
              })}
              {n.children.length < MAX_CHILDREN && (
                <Button size="sm" variant="ghost" onClick={() => setItem(i, { children: [...n.children, { id: newId(), label: {}, url: '', description: {} }] })}>
                  + Add dropdown link
                </Button>
              )}
            </div>
          </div>
        ))}
        {doc.navItems.length < MAX_NAV_ITEMS && (
          <Button size="sm" onClick={() => setNav([...doc.navItems, { id: newId(), label: {}, url: '', newTab: false, children: [] }])}>
            + Add menu item
          </Button>
        )}
      </Section>

      <Section title="Button on the right">
        <Checkbox label="Show the button" checked={doc.cta.enabled} onChange={(e) => setDoc((d) => ({ ...d, cta: { ...d.cta, enabled: e.target.checked } }))} />
        {doc.cta.enabled && (
          <div className={styles.row}>
            <TText label="Button text" value={doc.cta.label} lang={lang} max={40} onChange={(label) => setDoc((d) => ({ ...d, cta: { ...d.cta, label } }))} error={p['cta.label']} />
            <UrlInput value={doc.cta.url} onChange={(url) => setDoc((d) => ({ ...d, cta: { ...d.cta, url } }))} error={p['cta.url']} listId={listId} />
          </div>
        )}
      </Section>

      <Section title="Top bar and behaviour">
        <Checkbox label="Show the thin top bar (phone, email, socials)" checked={doc.topBar.enabled} onChange={(e) => setDoc((d) => ({ ...d, topBar: { ...d.topBar, enabled: e.target.checked } }))} />
        {doc.topBar.enabled && (
          <>
            <TText label="Short message (optional)" value={doc.topBar.message} lang={lang} max={160} onChange={(message) => setDoc((d) => ({ ...d, topBar: { ...d.topBar, message } }))} />
            <Checkbox label="Phone" checked={doc.topBar.showPhone} onChange={(e) => setDoc((d) => ({ ...d, topBar: { ...d.topBar, showPhone: e.target.checked } }))} />
            <Checkbox label="Email" checked={doc.topBar.showEmail} onChange={(e) => setDoc((d) => ({ ...d, topBar: { ...d.topBar, showEmail: e.target.checked } }))} />
            <Checkbox label="Social icons" checked={doc.topBar.showSocials} onChange={(e) => setDoc((d) => ({ ...d, topBar: { ...d.topBar, showSocials: e.target.checked } }))} />
          </>
        )}
        <Checkbox label="Stay at the top while scrolling" checked={doc.sticky} onChange={(e) => setDoc((d) => ({ ...d, sticky: e.target.checked }))} />
        <Checkbox label="See-through over the home page hero" checked={doc.transparentOnHero} onChange={(e) => setDoc((d) => ({ ...d, transparentOnHero: e.target.checked }))} />
      </Section>
    </>
  );
}
