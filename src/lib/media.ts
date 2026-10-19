/**
 * Public URL of a stored media file. Everything lives in the Cloudflare R2 bucket and is served from its
 * custom domain R2_PUBLIC_HOSTNAME (behind Cloudflare's cache).
 */

/** Accepts "media.example.rw", "https://media.example.rw" or "media.example.rw/" and returns the bare host. */
export function normalizeHost(value: string | undefined): string {
  return (value ?? '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

export function mediaUrl(objectKey: string): string {
  const host = normalizeHost(process.env.R2_PUBLIC_HOSTNAME);
  if (!host) {
    throw new Error('R2_PUBLIC_HOSTNAME is not set, so media URLs cannot be built. See .env.example.');
  }
  // http only for a local test server (R2_ENDPOINT); real R2 hosts are always https.
  const scheme = /^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? 'http' : 'https';
  return `${scheme}://${host}/${objectKey}`;
}

export type StoredVariant = { w: number; h: number; key: string };

/** Reads the `variants` JSON column safely. */
export function parseVariants(raw: unknown): StoredVariant[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v): v is StoredVariant => !!v && typeof v === 'object' && typeof (v as StoredVariant).w === 'number' && typeof (v as StoredVariant).key === 'string')
    .map((v) => ({ w: v.w, h: Number((v as StoredVariant).h) || 0, key: v.key }))
    .sort((a, b) => a.w - b.w);
}

/** `srcset` for a photo: every stored width plus the largest one. */
export function buildSrcSet(objectKey: string, width: number, variants: StoredVariant[]): string {
  return [...variants.map((v) => `${mediaUrl(v.key)} ${v.w}w`), `${mediaUrl(objectKey)} ${width}w`].join(', ');
}
