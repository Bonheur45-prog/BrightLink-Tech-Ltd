import { linkProblem, parseT, type Problems, type T } from '@/lib/cms/globals-model';
import { BACKGROUNDS, MAX_SECTIONS, SECTION_BY_TYPE, type FieldDef } from './catalogue';

// A page = ordered sections + SEO. Pure: parsing (anything → valid doc), publish checks, media ids.

export type LinkValue = { label: T; url: string; newTab: boolean };
export type Value = T | LinkValue | string | number | boolean | null | Item[];
export type Item = { id: string } & Record<string, Value>;
export type Background = { style: (typeof BACKGROUNDS)[number]['value']; image: string | null; parallax: boolean; overlay: 'light' | 'medium' | 'strong' };
export type Section = { id: string; type: string; variant: string; visible: boolean; background: Background; data: Record<string, Value> };
export type PageDoc = { sections: Section[]; seo: { title: T; description: T; ogImage: string | null; noIndex: boolean } };

const MEDIA_ID = /^[a-z0-9]{10,40}$/;
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const id = (v: unknown, fallback: string) => (typeof v === 'string' && /^[\w-]{1,40}$/.test(v) ? v : fallback);
export const newId = () => Math.random().toString(36).slice(2, 10);

export function parseLink(v: unknown): LinkValue {
  const o = obj(v);
  return { label: parseT(o.label, 60), url: typeof o.url === 'string' ? o.url.trim().slice(0, 500) : '', newTab: o.newTab === true };
}

export function parseValue(f: FieldDef, v: unknown, path: string): Value {
  switch (f.kind) {
    case 'text':
    case 'long':
      return parseT(v, f.max ?? (f.kind === 'text' ? 200 : 4000));
    case 'media':
      return typeof v === 'string' && MEDIA_ID.test(v) ? v : null;
    case 'link':
      return parseLink(v);
    case 'select':
      return typeof v === 'string' && f.options.some((o) => o.value === v) ? v : f.default;
    case 'number': {
      const n = typeof v === 'number' ? v : Number.parseInt(String(v), 10);
      return Number.isFinite(n) ? Math.min(f.max, Math.max(f.min, Math.round(n))) : f.default;
    }
    case 'boolean':
      return typeof v === 'boolean' ? v : f.default;
    case 'icon':
      return typeof v === 'string' ? v.slice(0, 40) : '';
    case 'items':
      return (Array.isArray(v) ? v : []).slice(0, f.max).map((raw, i) => {
        const o = obj(raw);
        const item: Item = { id: id(o.id, `${path}-${i}`) };
        for (const sub of f.fields) item[sub.key] = parseValue(sub, o[sub.key], `${path}-${i}`);
        return item;
      });
  }
}

/** Empty section of a type, with field defaults. */
export function emptySection(type: string): Section | null {
  const def = SECTION_BY_TYPE[type];
  if (!def) return null;
  const sid = newId();
  return parseSection({ id: sid, type, variant: def.variants[0].value, visible: true }, 0);
}

export function parseSection(raw: unknown, index: number): Section | null {
  const o = obj(raw);
  const def = SECTION_BY_TYPE[String(o.type)];
  if (!def) return null; // unknown types (e.g. from a newer version) are dropped
  const sid = id(o.id, `s${index}`);
  const bg = obj(o.background);
  const data: Record<string, Value> = {};
  const d = obj(o.data);
  for (const f of def.fields) data[f.key] = parseValue(f, d[f.key], sid);
  return {
    id: sid,
    type: def.type,
    variant: def.variants.some((v) => v.value === o.variant) ? String(o.variant) : def.variants[0].value,
    visible: o.visible !== false,
    background: {
      style: BACKGROUNDS.some((b) => b.value === bg.style) ? (bg.style as Background['style']) : 'default',
      image: typeof bg.image === 'string' && MEDIA_ID.test(bg.image) ? bg.image : null,
      parallax: bg.parallax !== false,
      overlay: bg.overlay === 'light' || bg.overlay === 'strong' ? bg.overlay : 'medium',
    },
    data,
  };
}

/** Anything → a valid page. `fallback` is used when the stored JSON is empty (nothing saved yet). */
export function parsePage(raw: unknown, fallback?: () => PageDoc): PageDoc {
  const o = obj(raw);
  if (!Object.keys(o).length && fallback) return fallback();
  const seen = new Set<string>();
  const sections = (Array.isArray(o.sections) ? o.sections : [])
    .slice(0, MAX_SECTIONS)
    .map(parseSection)
    .filter((s): s is Section => !!s)
    .map((s) => {
      if (seen.has(s.id)) s.id = newId(); // ids must be unique (duplicated sections)
      seen.add(s.id);
      return s;
    });
  const seo = obj(o.seo);
  return {
    sections,
    seo: {
      title: parseT(seo.title, 120),
      description: parseT(seo.description, 300),
      ogImage: typeof seo.ogImage === 'string' && MEDIA_ID.test(seo.ogImage) ? seo.ogImage : null,
      noIndex: seo.noIndex === true,
    },
  };
}

function fieldProblems(fields: FieldDef[], data: Record<string, Value>, prefix: string, p: Problems) {
  for (const f of fields) {
    const key = `${prefix}.${f.key}`;
    const v = data[f.key];
    if ((f.kind === 'text' || f.kind === 'long') && f.required && !(v as T)?.en) p[key] = 'Add the English text.';
    if (f.kind === 'link') {
      const l = v as LinkValue;
      if (l.url || l.label.en || f.required) {
        if (!l.label.en) p[`${key}.label`] = 'Add the English button text.';
        const lp = linkProblem(l.url);
        if (lp) p[`${key}.url`] = lp;
      }
    }
    if (f.kind === 'items') {
      const items = v as Item[];
      if (f.min && items.length < f.min) p[key] = `Add at least ${f.min} ${f.itemLabel}.`;
      items.forEach((item, i) => fieldProblems(f.fields, item, `${key}.${i}`, p));
    }
  }
}

/** What must be fixed before publishing. Keys: "s.<sectionId>.<field>[.<item>.<sub>]". */
export function pageProblems(doc: PageDoc): Problems {
  const p: Problems = {};
  if (!doc.sections.some((s) => s.visible)) p.sections = 'Show at least one section.';
  for (const s of doc.sections) {
    if (!s.visible) continue; // hidden sections may stay unfinished
    fieldProblems(SECTION_BY_TYPE[s.type].fields, s.data, `s.${s.id}`, p);
    if (s.background.style === 'image' && !s.background.image) p[`s.${s.id}.background`] = 'Choose a photo, or another background.';
    if (s.type === 'textMedia' || s.type === 'hero') {
      // highlighted words must be found in the heading, or nothing would be highlighted
      const items = s.type === 'hero' ? (s.data.slides as Item[]) : [s.data as Item];
      items.forEach((it, i) => {
        const h = (it.heading as T)?.en ?? '';
        const hl = (it.highlightText as T)?.en ?? '';
        if (hl && !h.includes(hl)) p[s.type === 'hero' ? `s.${s.id}.slides.${i}.highlightText` : `s.${s.id}.highlightText`] = 'These words are not in the heading.';
      });
    }
  }
  return p;
}

/** Every media id the page uses (sections, backgrounds, SEO image). */
export function mediaIdsOf(doc: PageDoc): { id: string; where: string }[] {
  const out: { id: string; where: string }[] = [];
  const walk = (fields: FieldDef[], data: Record<string, Value>, where: string) => {
    for (const f of fields) {
      const v = data[f.key];
      if (f.kind === 'media' && typeof v === 'string' && !f.video) out.push({ id: v, where: `${where}.${f.key}` });
      if (f.kind === 'items') (v as Item[]).forEach((it, i) => walk(f.fields, it, `${where}.${f.key}.${i}`));
    }
  };
  for (const s of doc.sections) {
    if (!s.visible) continue;
    walk(SECTION_BY_TYPE[s.type].fields, s.data, `s.${s.id}`);
    if (s.background.style === 'image' && s.background.image) out.push({ id: s.background.image, where: `s.${s.id}.background` });
  }
  if (doc.seo.ogImage) out.push({ id: doc.seo.ogImage, where: 'seo.ogImage' });
  return out;
}

/** Search-result advice shown in the editor (does not block publishing). */
export function seoChecklist(doc: PageDoc, fallbackTitle: string): { ok: boolean; text: string }[] {
  const title = doc.seo.title.en || fallbackTitle;
  const desc = doc.seo.description.en ?? '';
  const visible = doc.sections.filter((s) => s.visible);
  const firstHeading = visible.find((s) => s.type === 'hero' || s.type === 'banner');
  return [
    { ok: title.length >= 30 && title.length <= 60, text: `Title is ${title.length} characters (aim for 30–60).` },
    { ok: desc.length >= 120 && desc.length <= 160, text: desc ? `Description is ${desc.length} characters (aim for 120–160).` : 'Add a description: otherwise Google picks text from the page.' },
    { ok: !!firstHeading, text: firstHeading ? 'The page starts with a hero or banner (main heading).' : 'Start the page with a hero or banner: it holds the main heading.' },
    { ok: !!doc.seo.ogImage, text: doc.seo.ogImage ? 'Share image chosen.' : 'No share image: the site default is used.' },
  ];
}
