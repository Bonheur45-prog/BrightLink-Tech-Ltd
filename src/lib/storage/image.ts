import sharp from 'sharp';
import { IMAGE_MAX_EDGE_PX, IMAGE_VARIANT_WIDTHS } from './limits';

// Lower memory use on a small server: one photo processed at a time, no in-memory image cache.
sharp.concurrency(1);
sharp.cache(false);

export type ImageVariant = { w: number; h: number; data: Buffer };
export type ProcessedImage = {
  data: Buffer;
  width: number;
  height: number;
  blurDataUrl: string;
  /** Smaller copies (only widths below the stored width), smallest first. */
  variants: ImageVariant[];
};

/**
 * Turns any supported photo into what the site stores: rotated upright (phone EXIF orientation), at most
 * IMAGE_MAX_EDGE_PX on the long edge, as WebP, plus smaller copies and a tiny blurred placeholder.
 * Used by CMS uploads and video posters (`withVariants: false`).
 * Throws if the bytes are not a readable image.
 */
export async function processImage(input: Buffer, maxEdge = IMAGE_MAX_EDGE_PX, withVariants = true): Promise<ProcessedImage> {
  const { data, info } = await sharp(input, { failOn: 'error' })
    .rotate()
    .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const variants: ImageVariant[] = [];
  if (withVariants) {
    for (const w of IMAGE_VARIANT_WIDTHS) {
      if (w >= info.width) continue; // never store a copy as big as (or bigger than) the original
      const copy = await sharp(data).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
      variants.push({ w: copy.info.width, h: copy.info.height, data: copy.data });
    }
  }

  const blur = await sharp(data).resize(16, 16, { fit: 'inside' }).webp({ quality: 40 }).toBuffer();
  return { data, width: info.width, height: info.height, blurDataUrl: `data:image/webp;base64,${blur.toString('base64')}`, variants };
}
