import { authenticateApi, jsonError } from '@/lib/auth/api';
import { newUploadKey } from '@/lib/storage/keys';
import { VIDEO_EXTENSION, VIDEO_MAX_BYTES, formatBytes, isVideoType } from '@/lib/storage/limits';
import { presignedPutUrl, StorageNotConfiguredError } from '@/lib/storage/r2';

export const runtime = 'nodejs';

/**
 * Step 1 of a video upload. The browser uploads the video straight to R2 with the signed link returned
 * here (so it never passes through this small server), then calls /finish.
 * JSON body: { contentType, size }
 */
export async function POST(request: Request) {
  const auth = await authenticateApi(request);
  if ('response' in auth) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError('Invalid request.', 400);
  }
  const contentType = String(body.contentType ?? '');
  const size = Number(body.size);
  if (!isVideoType(contentType)) return jsonError('Use an MP4, WebM or MOV video.', 415);
  if (!Number.isInteger(size) || size <= 0) return jsonError('Invalid file size.', 400);
  if (size > VIDEO_MAX_BYTES) {
    return jsonError(
      `This video is ${formatBytes(size)}. The limit is ${formatBytes(VIDEO_MAX_BYTES)}. Trim it or export it at a lower quality.`,
      413,
    );
  }

  try {
    const key = newUploadKey(VIDEO_EXTENSION[contentType]);
    const uploadUrl = await presignedPutUrl(key, contentType, size);
    return Response.json({ key, uploadUrl });
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) return jsonError(error.message, 503);
    throw error;
  }
}
