import { audit } from '@/lib/audit';
import { authenticateApi, jsonError } from '@/lib/auth/api';
import { storeImage } from '@/lib/storage/assets';
import { IMAGE_MAX_BYTES, formatBytes } from '@/lib/storage/limits';
import { StorageNotConfiguredError } from '@/lib/storage/r2';

export const runtime = 'nodejs';

/**
 * Uploads one photo to the media library.
 * Form fields: file, alt (optional, English).
 * The photo is rotated upright, resized, converted to WebP in several widths and stored in R2.
 */
export async function POST(request: Request) {
  const auth = await authenticateApi(request);
  if ('response' in auth) return auth.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError('The upload could not be read. Try again.', 400);
  }
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) return jsonError('No file was received.', 400);
  if (file.size > IMAGE_MAX_BYTES) {
    return jsonError(`This photo is ${formatBytes(file.size)}. The limit is ${formatBytes(IMAGE_MAX_BYTES)}.`, 413);
  }
  const alt = String(form.get('alt') ?? '').trim().slice(0, 300);

  try {
    const media = await storeImage(Buffer.from(await file.arrayBuffer()), { alt, userId: auth.user.id });
    await audit(auth.user.id, 'media.upload', 'media', media.id, { kind: 'IMAGE' });
    return Response.json({ media }, { status: 201 });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) return jsonError(error.message, 503);
    // sharp throws when the bytes are not an image it can read
    if (error instanceof Error && /unsupported image format|Input buffer|corrupt|bad seek|VipsJpeg|Invalid/i.test(error.message)) {
      return jsonError(
        `"${file.name}" is not a photo this site can read. Use JPG, PNG, WebP or AVIF (iPhone HEIC: export as JPG first).`,
        415,
      );
    }
    console.error('upload: image failed', error);
    return jsonError('The photo could not be stored. Check your connection and try again.', 502);
  }
}
