import { audit } from '@/lib/audit';
import { authenticateApi, jsonError } from '@/lib/auth/api';
import { prisma } from '@/lib/db';
import { createVideoAsset } from '@/lib/storage/assets';
import { processImage } from '@/lib/storage/image';
import { isUploadKey, posterKeyFor } from '@/lib/storage/keys';
import { VIDEO_EXTENSION, VIDEO_MAX_BYTES, isVideoType } from '@/lib/storage/limits';
import { deleteObjects, headObject, putObject, StorageNotConfiguredError } from '@/lib/storage/r2';

export const runtime = 'nodejs';

const intIn = (value: FormDataEntryValue | null, min: number, max: number) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

/**
 * Step 2 of a video upload, after the browser finished sending the file to R2.
 * Form fields: key, width, height, duration (seconds), poster (image, optional), alt.
 * The server checks the file really is in R2, stores the poster frame and registers the video.
 */
export async function POST(request: Request) {
  const auth = await authenticateApi(request);
  if ('response' in auth) return auth.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError('Invalid request.', 400);
  }
  const key = String(form.get('key') ?? '');
  const width = intIn(form.get('width'), 1, 16000);
  const height = intIn(form.get('height'), 1, 16000);
  const duration = intIn(form.get('duration'), 0, 24 * 3600);
  const poster = form.get('poster');
  const alt = String(form.get('alt') ?? '').trim().slice(0, 300);
  if (!isUploadKey(key) || !width || !height || duration === null) return jsonError('Invalid request.', 400);

  try {
    if (await prisma.mediaAsset.findUnique({ where: { objectKey: key }, select: { id: true } })) {
      return jsonError('This video was already saved.', 409);
    }
    const head = await headObject(key);
    if (!head) return jsonError('The video did not arrive in storage. Try uploading it again.', 409);
    const contentType = head.ContentType ?? '';
    const size = head.ContentLength ?? 0;
    if (!isVideoType(contentType) || !key.endsWith(`.${VIDEO_EXTENSION[contentType]}`) || size > VIDEO_MAX_BYTES) {
      await deleteObjects([key]);
      return jsonError('The stored file is not an accepted video.', 415);
    }

    let posterKey: string | null = null;
    let blurDataUrl: string | null = null;
    if (poster instanceof File && poster.size > 0 && poster.size < 10 * 1024 * 1024) {
      try {
        const image = await processImage(Buffer.from(await poster.arrayBuffer()), 1600, false);
        posterKey = posterKeyFor(key);
        await putObject(posterKey, image.data, 'image/webp');
        blurDataUrl = image.blurDataUrl;
      } catch (error) {
        console.error('video: poster could not be stored; saving without it', error);
        posterKey = null;
      }
    }

    try {
      const media = await createVideoAsset({
        objectKey: key,
        mimeType: contentType,
        sizeBytes: size,
        width,
        height,
        durationSec: duration,
        posterKey,
        blurDataUrl,
        alt,
        userId: auth.user.id,
      });
      await audit(auth.user.id, 'media.upload', 'media', media.id, { kind: 'VIDEO' });
      return Response.json({ media }, { status: 201 });
    } catch (error) {
      await deleteObjects([key, ...(posterKey ? [posterKey] : [])]).catch(() => {});
      throw error;
    }
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) return jsonError(error.message, 503);
    console.error('video finish failed', error);
    return jsonError('The video could not be saved. Try again.', 500);
  }
}
