import { isFontKey, type FontKey } from '@/lib/fonts';
import type { Block, Inline } from '@/lib/content/types';

// Article body: the editor's document (Tiptap JSON) → clean HTML, rendered once when the post is saved,
// so visitors never download the editor. The JSON comes from the browser, so it is NOT trusted: only
// the node types, marks and attribute values listed here get through; all text is escaped.
// Pure (tested in blog.test.ts).

export type DocNode = { type?: string; text?: string; attrs?: Record<string, unknown>; marks?: { type?: string; attrs?: Record<string, unknown> }[]; content?: DocNode[] };
export type TocEntry = { id: string; text: string; level: 2 | 3 };
export type MediaInfo = { src: string; srcset?: string; width: number; height: number; alt: string };
export type Rendered = { html: string; toc: TocEntry[]; fonts: FontKey[]; words: number; readingMinutes: number; text: string; imageIds: string[]; links: string[]; headings: number };

/** Colours editors can pick (brand palette). Anything else is dropped. */
export const TEXT_COLORS = [
  { value: '#00327f', label: 'Navy' },
  { value: '#ff8e00', label: 'Orange' },
  { value: '#a85d00', label: 'Dark orange' },
  { value: '#009b9c', label: 'Teal' },
  { value: '#2f6b3a', label: 'Green' },
  { value: '#a12a1f', label: 'Red' },
  { value: '#5b6b8a', label: 'Grey' },
] as const;
export const HIGHLIGHTS = [
  { value: '#fff3c4', label: 'Yellow' },
  { value: '#ffe2bf', label: 'Orange' },
  { value: '#d6f2f2', label: 'Teal' },
  { value: '#e3ebf8', label: 'Blue' },
] as const;
export const CALLOUT_TONES = ['info', 'tip', 'warning'] as const;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const COLOR_SET = new Set<string>(TEXT_COLORS.map((c) => c.value));
const HIGHLIGHT_SET = new Set<string>(HIGHLIGHTS.map((c) => c.value));
const ALIGN = new Set(['center', 'right', 'justify']);

/** Allowed link targets: http(s), mailto, tel, a page on this site, or an anchor. */
export function safeHref(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const v = raw.trim();
  if (/^\/(?!\/)[^\s]*$/.test(v) || /^#[\w-]+$/.test(v) || /^mailto:[^\s]+$/i.test(v) || /^tel:[+\d\s()-]+$/i.test(v)) return v;
  try {
    const u = new URL(v);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}

/** "var(--font-lora)" or "lora" → "lora" when it is a curated font. */
export function fontKeyOf(raw: unknown): FontKey | null {
  if (typeof raw !== 'string') return null;
  const m = raw.match(/^var\(--font-([a-z-]+)\)$/) ?? raw.match(/^([a-z-]+)$/);
  return m && isFontKey(m[1]) ? m[1] : null;
}

export const headingId = (text: string) =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'section';

const textOf = (n: DocNode): string => (n.type === 'text' ? (n.text ?? '') : (n.content ?? []).map(textOf).join(n.type === 'paragraph' ? '' : ' '));

export function renderDoc(doc: unknown, media: Map<string, MediaInfo> = new Map()): Rendered {
  const toc: TocEntry[] = [];
  const fonts = new Set<FontKey>();
  const ids = new Set<string>();
  const imageIds: string[] = [];
  const links: string[] = [];
  const plain: string[] = [];
  let headings = 0;

  const alignStyle = (n: DocNode) => {
    const a = n.attrs?.textAlign;
    return typeof a === 'string' && ALIGN.has(a) ? ` style="text-align:${a}"` : '';
  };

  const renderText = (n: DocNode): string => {
    let out = esc(n.text ?? '');
    for (const m of n.marks ?? []) {
      const a = m.attrs ?? {};
      switch (m.type) {
        case 'bold':
          out = `<strong>${out}</strong>`;
          break;
        case 'italic':
          out = `<em>${out}</em>`;
          break;
        case 'underline':
          out = `<u>${out}</u>`;
          break;
        case 'strike':
          out = `<s>${out}</s>`;
          break;
        case 'code':
          out = `<code>${out}</code>`;
          break;
        case 'link': {
          const href = safeHref(a.href);
          if (!href) break;
          links.push(href);
          const external = /^https?:/i.test(href);
          out = `<a href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${out}</a>`;
          break;
        }
        case 'textStyle': {
          const styles: string[] = [];
          if (typeof a.color === 'string' && COLOR_SET.has(a.color.toLowerCase())) styles.push(`color:${a.color.toLowerCase()}`);
          const f = fontKeyOf(a.fontFamily);
          if (f) {
            fonts.add(f);
            styles.push(`font-family:var(--font-${f})`);
          }
          if (styles.length) out = `<span style="${styles.join(';')}">${out}</span>`;
          break;
        }
        case 'highlight': {
          const c = typeof a.color === 'string' && HIGHLIGHT_SET.has(a.color.toLowerCase()) ? a.color.toLowerCase() : HIGHLIGHTS[0].value;
          out = `<mark style="background-color:${c}">${out}</mark>`;
          break;
        }
      }
    }
    return out;
  };

  const kids = (n: DocNode) => (n.content ?? []).map(node).join('');

  function node(n: DocNode): string {
    switch (n.type) {
      case 'text':
        return renderText(n);
      case 'hardBreak':
        return '<br>';
      case 'paragraph': {
        const t = textOf(n).trim();
        if (t) plain.push(t);
        return `<p${alignStyle(n)}>${kids(n)}</p>`;
      }
      case 'heading': {
        const level = Math.min(4, Math.max(2, Number(n.attrs?.level) || 2)) as 2 | 3 | 4;
        const text = textOf(n).trim();
        headings++;
        let id = headingId(text);
        for (let i = 2; ids.has(id); i++) id = `${headingId(text)}-${i}`;
        ids.add(id);
        if (level !== 4 && text) toc.push({ id, text: text.slice(0, 120), level });
        if (text) plain.push(text);
        return `<h${level} id="${id}"${alignStyle(n)}>${kids(n)}</h${level}>`;
      }
      case 'bulletList':
        return `<ul>${kids(n)}</ul>`;
      case 'orderedList': {
        const start = Number(n.attrs?.start);
        return `<ol${Number.isInteger(start) && start > 1 && start < 10000 ? ` start="${start}"` : ''}>${kids(n)}</ol>`;
      }
      case 'listItem':
        return `<li>${kids(n)}</li>`;
      case 'blockquote':
        return `<blockquote>${kids(n)}</blockquote>`;
      case 'horizontalRule':
        return '<hr>';
      case 'codeBlock': {
        const lang = typeof n.attrs?.language === 'string' && /^[a-z0-9+#-]{1,20}$/i.test(n.attrs.language) ? n.attrs.language : '';
        return `<pre><code${lang ? ` class="language-${lang}"` : ''}>${esc(textOf(n))}</code></pre>`;
      }
      case 'callout': {
        const tone = CALLOUT_TONES.includes(n.attrs?.tone as never) ? String(n.attrs?.tone) : 'info';
        return `<aside class="callout callout-${tone}" role="note">${kids(n)}</aside>`;
      }
      case 'image': {
        const id = typeof n.attrs?.mediaId === 'string' ? n.attrs.mediaId : '';
        const m = media.get(id);
        if (!m) return ''; // only photos from the media library are allowed
        imageIds.push(id);
        const alt = (typeof n.attrs?.alt === 'string' && n.attrs.alt.trim()) || m.alt;
        const caption = typeof n.attrs?.title === 'string' ? n.attrs.title.trim().slice(0, 300) : '';
        const img = `<img src="${esc(m.src)}"${m.srcset ? ` srcset="${esc(m.srcset)}" sizes="(min-width: 800px) 760px, 100vw"` : ''} alt="${esc(alt)}" width="${m.width}" height="${m.height}" loading="lazy" decoding="async">`;
        return `<figure>${img}${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
      }
      case 'table':
        return `<div class="table-wrap"><table><tbody>${kids(n)}</tbody></table></div>`;
      case 'tableRow':
        return `<tr>${kids(n)}</tr>`;
      case 'tableCell':
      case 'tableHeader': {
        const tag = n.type === 'tableHeader' ? 'th' : 'td';
        const span = (k: string) => {
          const v = Number(n.attrs?.[k]);
          return Number.isInteger(v) && v > 1 && v <= 20 ? ` ${k}="${v}"` : '';
        };
        return `<${tag}${span('colspan')}${span('rowspan')}>${kids(n)}</${tag}>`;
      }
      case 'doc':
        return kids(n);
      default:
        return ''; // unknown node: dropped
    }
  }

  const root = (doc && typeof doc === 'object' ? doc : { type: 'doc', content: [] }) as DocNode;
  const html = root.type === 'doc' ? node(root) : '';
  const all = plain.join(' ');
  const words = all.split(/\s+/).filter(Boolean).length;
  return { html, toc, fonts: [...fonts], words, readingMinutes: Math.max(1, Math.round(words / 200)), text: all, imageIds, links, headings };
}

/** Media ids used by image nodes (to look them up before rendering). */
export function imageIdsIn(doc: unknown): string[] {
  const out: string[] = [];
  const walk = (n: DocNode) => {
    if (n.type === 'image' && typeof n.attrs?.mediaId === 'string') out.push(n.attrs.mediaId);
    (n.content ?? []).forEach(walk);
  };
  if (doc && typeof doc === 'object') walk(doc as DocNode);
  return [...new Set(out)];
}

// ───── Starter articles (Block[] from the old site) → editor documents ─────

const inlineNodes = (inlines: Inline[]): DocNode[] =>
  inlines
    .filter((i) => i.text)
    .map((i) => {
      const marks: DocNode['marks'] = [];
      if (i.bold) marks.push({ type: 'bold' });
      if (i.italic) marks.push({ type: 'italic' });
      if (i.code) marks.push({ type: 'code' });
      if (i.href) marks.push({ type: 'link', attrs: { href: i.href, target: i.newTab ? '_blank' : null } });
      return { type: 'text', text: i.text, ...(marks.length ? { marks } : {}) };
    });

export function blocksToDoc(blocks: Block[]): DocNode {
  const para = (inlines: Inline[]): DocNode => ({ type: 'paragraph', content: inlineNodes(inlines) });
  const content: DocNode[] = [];
  for (const b of blocks) {
    if (b.type === 'h2' || b.type === 'h3') content.push({ type: 'heading', attrs: { level: b.type === 'h2' ? 2 : 3 }, content: inlineNodes(b.inlines) });
    else if (b.type === 'p') content.push(para(b.inlines));
    else if (b.type === 'quote') content.push({ type: 'blockquote', content: [para(b.inlines)] });
    else if (b.type === 'ul' || b.type === 'ol') content.push({ type: b.type === 'ul' ? 'bulletList' : 'orderedList', content: b.items.map((it) => ({ type: 'listItem', content: [para(it)] })) });
    else if (b.type === 'hr') content.push({ type: 'horizontalRule' });
    // starter images have no media library file: left out
  }
  return { type: 'doc', content };
}
