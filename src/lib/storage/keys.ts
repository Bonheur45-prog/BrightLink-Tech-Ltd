import { randomBytes } from 'node:crypto';

// Object keys for CMS uploads: uploads/2026/10/k3j9x0c2m1q8w7e4a1b2.webp
// Random, so a key never reveals the original file name and can never collide.
// A photo's smaller copies share its id: ...a1b2-480.webp. A video's poster is ...a1b2-poster.webp.
export const UPLOAD_KEY_PREFIX = 'uploads/';

export function newUploadId(): string {
  return randomBytes(10).toString('hex');
}

export function newUploadKey(extension: string, now: Date = new Date(), id: string = newUploadId()): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${UPLOAD_KEY_PREFIX}${year}/${month}/${id}.${extension}`;
}

/** Smaller copy of a photo: uploads/2026/10/abc.webp → uploads/2026/10/abc-480.webp */
export function variantKeyFor(key: string, width: number): string {
  return key.replace(/\.webp$/i, '') + `-${width}.webp`;
}

/** Poster image stored next to its video: uploads/2026/10/abc.mp4 → uploads/2026/10/abc-poster.webp */
export function posterKeyFor(videoKey: string): string {
  return videoKey.replace(/\.[a-z0-9]+$/i, '') + '-poster.webp';
}

/** Only keys this CMS generated may be registered, so a request cannot claim some other object in the bucket. */
export function isUploadKey(key: string): boolean {
  return /^uploads\/\d{4}\/\d{2}\/[a-f0-9]{20}\.(webp|mp4|webm|mov)$/.test(key);
}
