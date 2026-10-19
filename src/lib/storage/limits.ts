// Upload rules shared by the browser (to warn early) and the server (to enforce).

export const IMAGE_MAX_BYTES = 30 * 1024 * 1024; // phone photos are 3–15 MB
export const IMAGE_MAX_EDGE_PX = 2400; // largest stored size: sharp on a 2× full-HD screen
/** Smaller copies stored next to every photo. The browser picks the one that fits its screen. */
export const IMAGE_VARIANT_WIDTHS = [480, 960, 1600] as const;
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/tiff';

export const VIDEO_MAX_BYTES = 50 * 1024 * 1024; // short hero videos; 10–20 s of H.264 is about 10 MB
/** MP4 (H.264) plays everywhere. WebM plays in all modern browsers. MOV is accepted, but iPhone
 *  HEVC .mov files do not play in Chrome or Firefox on Windows, so the browser check catches those. */
export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'] as const;
export const VIDEO_ACCEPT = VIDEO_TYPES.join(',');

export type VideoType = (typeof VIDEO_TYPES)[number];

export function isVideoType(type: string): type is VideoType {
  return (VIDEO_TYPES as readonly string[]).includes(type);
}

export const VIDEO_EXTENSION: Record<VideoType, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}
