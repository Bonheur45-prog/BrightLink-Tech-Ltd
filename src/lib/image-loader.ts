// Image loader for next/image (next.config.ts → images.loaderFile). Pure (tested in media.test.ts).
//
// Photos from the media library are stored in R2 as WebP at full size plus smaller copies:
// abc.webp, abc-480.webp, abc-960.webp, abc-1600.webp (only widths smaller than the original).
// Their addresses end in "#w=480.960.1600~2400" (src/lib/media.ts → photoUrl). For each width the
// browser asks for, this returns the smallest stored copy at least that wide, or the original.
// Nothing is resized on the server: Cloudflare serves the ready-made file from its cache.
//
// Files in /public (brand pictures) are small and used as they are.

type LoaderArgs = { src: string; width: number; quality?: number }

export default function imageLoader({ src, width }: LoaderArgs): string {
  const m = /^(.*)#w=([\d.]*)~(\d+)$/.exec(src)
  if (!m) return src.startsWith('/') ? `${src}?w=${width}` : src
  const [, base, list] = m
  const widths = list
    .split('.')
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .sort((a, b) => a - b)
  const pick = widths.find((w) => w >= width)
  return pick ? base.replace(/\.webp$/i, `-${pick}.webp`) : base
}
