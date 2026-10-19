// URL slugs: lowercase letters, digits and single dashes, e.g. "kivu-corner-sofa".
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX = 80;

/** "Canapé d’angle  Kivu!" → "canape-d-angle-kivu" */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX)
    .replace(/-+$/, '');
}

export function isValidSlug(slug: string): boolean {
  return slug.length <= SLUG_MAX && SLUG_PATTERN.test(slug);
}

/** First free slug: "sofa", then "sofa-2", "sofa-3"… `taken` says whether a slug is already used. */
export async function uniqueSlug(base: string, taken: (slug: string) => Promise<boolean>): Promise<string> {
  const root = base || 'piece';
  if (!(await taken(root))) return root;
  for (let n = 2; n < 1000; n++) {
    const candidate = `${root.slice(0, SLUG_MAX - String(n).length - 1)}-${n}`;
    if (!(await taken(candidate))) return candidate;
  }
  throw new Error('Could not find a free slug.');
}
