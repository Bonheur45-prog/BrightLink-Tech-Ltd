// The curated, self-hosted fonts editors can choose from (site-wide heading/body fonts now,
// per-article fonts in the blog editor in Phase 5). The files are downloaded at build time by
// next/font and served from this site, never from Google. A browser only downloads a font file
// when something on the page actually uses that font, so unused fonts cost nothing.
// To add a font: add it here AND in src/styles/fonts.ts.

export const FONTS = [
  { key: 'inter', label: 'Inter', kind: 'Sans-serif', note: 'Neutral and very readable (default body)' },
  { key: 'outfit', label: 'Outfit', kind: 'Sans-serif', note: 'Geometric and friendly (default headings)' },
  { key: 'dm-sans', label: 'DM Sans', kind: 'Sans-serif', note: 'Clean, slightly compact' },
  { key: 'poppins', label: 'Poppins', kind: 'Sans-serif', note: 'Round and bold' },
  { key: 'montserrat', label: 'Montserrat', kind: 'Sans-serif', note: 'Wide, strong headings' },
  { key: 'lora', label: 'Lora', kind: 'Serif', note: 'Warm serif for reading' },
  { key: 'merriweather', label: 'Merriweather', kind: 'Serif', note: 'Sturdy serif for long articles' },
  { key: 'playfair', label: 'Playfair Display', kind: 'Serif', note: 'Elegant, for headings only' },
] as const;

export type FontKey = (typeof FONTS)[number]['key'];
export const DEFAULT_HEADING_FONT: FontKey = 'outfit';
export const DEFAULT_BODY_FONT: FontKey = 'inter';

export function isFontKey(value: unknown): value is FontKey {
  return typeof value === 'string' && FONTS.some((f) => f.key === value);
}

/** CSS variable that holds a font's family, e.g. "--font-dm-sans". */
export const fontVar = (key: FontKey) => `--font-${key}`;
