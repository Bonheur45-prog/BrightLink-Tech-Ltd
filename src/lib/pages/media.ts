import { SECTION_BY_TYPE, type FieldDef } from './catalogue'
import type { Item, PageDoc, Value } from './model'

// Pure (tested in pages.test.ts).

/** Every media id a page uses (fields marked "media" in the section catalogue, backgrounds, share image). */
export function pageMediaIds(doc: PageDoc): string[] {
  const out = new Set<string>()
  const walk = (fields: FieldDef[], data: Record<string, Value>) => {
    for (const f of fields) {
      const v = data[f.key]
      if (f.kind === 'media' && typeof v === 'string') out.add(v)
      if (f.kind === 'items' && Array.isArray(v)) (v as Item[]).forEach((it) => walk(f.fields, it))
    }
  }
  for (const s of doc.sections) {
    walk(SECTION_BY_TYPE[s.type]?.fields ?? [], s.data)
    if (s.background.style === 'image' && s.background.image) out.add(s.background.image)
  }
  if (doc.seo.ogImage) out.add(doc.seo.ogImage)
  return [...out]
}
