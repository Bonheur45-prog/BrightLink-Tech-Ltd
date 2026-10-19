import { slugify } from '../slug'
import type { Block, Inline } from './types'

/**
 * Converts the CMS rich-text (Lexical JSON) into the simple blocks the Blog renders, and back again for the
 * seed script. Keeping our own small block model means article styling lives in one place and the table of
 * contents can be built from the headings.
 */

type N = { type?: string; text?: string; format?: number | string; tag?: string; listType?: string; children?: N[]; fields?: { url?: string; newTab?: boolean }; value?: unknown }

const BOLD = 1
const ITALIC = 2
const CODE = 16

function inlines(nodes: N[] | undefined, link?: { href: string; newTab: boolean }): Inline[] {
  const out: Inline[] = []
  for (const n of nodes ?? []) {
    if (n.type === 'text' && typeof n.text === 'string') {
      const f = typeof n.format === 'number' ? n.format : 0
      out.push({
        text: n.text,
        ...(f & BOLD ? { bold: true } : {}),
        ...(f & ITALIC ? { italic: true } : {}),
        ...(f & CODE ? { code: true } : {}),
        ...(link ? { href: link.href, newTab: link.newTab } : {}),
      })
    } else if (n.type === 'linebreak') {
      out.push({ text: '\n' })
    } else if (n.type === 'link' || n.type === 'autolink') {
      const href = String(n.fields?.url ?? '')
      out.push(...inlines(n.children, href ? { href, newTab: Boolean(n.fields?.newTab) } : link))
    } else if (n.children) {
      out.push(...inlines(n.children, link))
    }
  }
  return out
}

const plain = (i: Inline[]) => i.map((x) => x.text).join('')

export function lexicalToBlocks(doc: unknown): Block[] {
  const root = (doc as { root?: N } | null)?.root
  if (!root?.children) return []
  const blocks: Block[] = []
  const used = new Map<string, number>()
  const uid = (text: string) => {
    const base = slugify(text) || 'section'
    const n = used.get(base) ?? 0
    used.set(base, n + 1)
    return n ? `${base}-${n + 1}` : base
  }

  const listItems = (list: N): Inline[][] => {
    const items: Inline[][] = []
    for (const li of list.children ?? []) {
      if (li.type !== 'listitem') continue
      const own = (li.children ?? []).filter((c) => c.type !== 'list')
      const text = inlines(own)
      if (plain(text).trim()) items.push(text)
      // nested lists are flattened into the same list
      for (const nested of (li.children ?? []).filter((c) => c.type === 'list')) items.push(...listItems(nested))
    }
    return items
  }

  for (const n of root.children) {
    switch (n.type) {
      case 'paragraph': {
        const i = inlines(n.children)
        if (plain(i).trim()) blocks.push({ type: 'p', inlines: i })
        break
      }
      case 'heading': {
        const i = inlines(n.children)
        const text = plain(i).trim()
        if (!text) break
        // h1 inside an article would duplicate the page heading, so it is shown as h2
        blocks.push({ type: n.tag === 'h3' || n.tag === 'h4' || n.tag === 'h5' || n.tag === 'h6' ? 'h3' : 'h2', id: uid(text), inlines: i })
        break
      }
      case 'quote': {
        const i = inlines(n.children)
        if (plain(i).trim()) blocks.push({ type: 'quote', inlines: i })
        break
      }
      case 'list': {
        const items = listItems(n)
        if (items.length) blocks.push({ type: n.listType === 'number' ? 'ol' : 'ul', items })
        break
      }
      case 'horizontalrule':
        blocks.push({ type: 'hr' })
        break
      case 'upload': {
        const v = n.value as { url?: string; alt?: string; caption?: string; mimeType?: string } | null
        if (v && typeof v === 'object' && v.url && (!v.mimeType || v.mimeType.startsWith('image/')))
          blocks.push({ type: 'image', url: v.url, alt: v.alt ?? '', caption: v.caption ?? '' })
        break
      }
      default: {
        const i = inlines(n.children)
        if (plain(i).trim()) blocks.push({ type: 'p', inlines: i })
      }
    }
  }
  return blocks
}

/** Plain text of blocks (word count, SEO checks, search). */
export function blocksText(blocks: Block[]): string {
  return blocks
    .map((b) => {
      if ('items' in b) return b.items.map(plain).join(' ')
      if ('inlines' in b) return plain(b.inlines)
      return ''
    })
    .join(' ')
}

export function readingMinutes(blocks: Block[]): number {
  const words = blocksText(blocks).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/* ------------------------------------------------------------------ seed helpers */

/** Tiny writing format for starter articles: "## Heading", "### Sub", "- bullet", "1. step", "> quote", blank line = new paragraph. Inline **bold**, *italic*, [text](url). */
function parseInline(src: string): Inline[] {
  const out: Inline[] = []
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ text: src.slice(last, m.index) })
    if (m[1]) out.push({ text: m[1], bold: true })
    else if (m[2]) out.push({ text: m[2], italic: true })
    else out.push({ text: m[3], href: m[4], newTab: /^https?:/i.test(m[4]) })
    last = m.index + m[0].length
  }
  if (last < src.length) out.push({ text: src.slice(last) })
  return out
}

export function markdownToBlocks(md: string): Block[] {
  const blocks: Block[] = []
  const used = new Map<string, number>()
  const uid = (text: string) => {
    const base = slugify(text) || 'section'
    const n = used.get(base) ?? 0
    used.set(base, n + 1)
    return n ? `${base}-${n + 1}` : base
  }
  for (const chunk of md.trim().split(/\n\s*\n/)) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean)
    if (!lines.length) continue
    const first = lines[0]
    if (first.startsWith('## ')) blocks.push({ type: 'h2', id: uid(first.slice(3)), inlines: parseInline(first.slice(3)) })
    else if (first.startsWith('### ')) blocks.push({ type: 'h3', id: uid(first.slice(4)), inlines: parseInline(first.slice(4)) })
    else if (first.startsWith('> ')) blocks.push({ type: 'quote', inlines: parseInline(lines.map((l) => l.replace(/^>\s?/, '')).join(' ')) })
    else if (lines.every((l) => l.startsWith('- '))) blocks.push({ type: 'ul', items: lines.map((l) => parseInline(l.slice(2))) })
    else if (lines.every((l) => /^\d+\.\s/.test(l))) blocks.push({ type: 'ol', items: lines.map((l) => parseInline(l.replace(/^\d+\.\s/, ''))) })
    else blocks.push({ type: 'p', inlines: parseInline(lines.join(' ')) })
  }
  return blocks
}

const base = { direction: 'ltr', format: '', indent: 0, version: 1 }
const textNode = (i: Inline) => ({
  type: 'text',
  text: i.text,
  format: (i.bold ? BOLD : 0) | (i.italic ? ITALIC : 0) | (i.code ? CODE : 0),
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})
const inlineNodes = (list: Inline[]) =>
  list.map((i) =>
    i.href
      ? { type: 'link', fields: { linkType: 'custom', url: i.href, newTab: Boolean(i.newTab) }, children: [textNode({ ...i, href: undefined })], ...base, version: 3 }
      : textNode(i),
  )

/** Blocks → Lexical JSON, so starter articles can be saved into the CMS and edited in the normal editor. */
export function blocksToLexical(blocks: Block[]) {
  const children = blocks.flatMap((b) => {
    switch (b.type) {
      case 'h2':
      case 'h3':
        return [{ type: 'heading', tag: b.type, children: inlineNodes(b.inlines), ...base }]
      case 'p':
        return [{ type: 'paragraph', children: inlineNodes(b.inlines), textFormat: 0, ...base }]
      case 'quote':
        return [{ type: 'quote', children: inlineNodes(b.inlines), ...base }]
      case 'ul':
      case 'ol':
        return [
          {
            type: 'list',
            listType: b.type === 'ul' ? 'bullet' : 'number',
            tag: b.type,
            start: 1,
            children: b.items.map((it, i) => ({ type: 'listitem', value: i + 1, children: inlineNodes(it), ...base })),
            ...base,
          },
        ]
      case 'hr':
        return [{ type: 'horizontalrule', ...base }]
      default:
        return []
    }
  })
  return { root: { type: 'root', children, ...base } }
}
