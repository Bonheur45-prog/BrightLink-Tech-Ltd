import 'server-only';
import {
  DeleteObjectsCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  type HeadObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 speaks the S3 API. Settings come from .env (see .env.example).
const REQUIRED = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET', 'R2_PUBLIC_HOSTNAME'] as const;

/** Names of the R2 settings that are missing, so the CMS can say exactly what to fill in. */
export function missingR2Settings(): string[] {
  return REQUIRED.filter((name) => !process.env[name]);
}

export class StorageNotConfiguredError extends Error {
  constructor(missing: string[]) {
    super(`Uploads are not set up yet. Add ${missing.join(', ')} to .env and restart the server.`);
  }
}

let client: S3Client | undefined;

function r2(): { client: S3Client; bucket: string } {
  const missing = missingR2Settings();
  if (missing.length) throw new StorageNotConfiguredError(missing);
  client ??= new S3Client({
    region: 'auto',
    // R2_ENDPOINT is optional: only for testing against another S3-compatible server.
    endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    forcePathStyle: Boolean(process.env.R2_ENDPOINT),
    // Newer AWS SDKs add a CRC32 checksum to every request by default. In a signed upload link it is
    // computed before the file exists (the checksum of an empty body), so R2 would reject the video.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
    },
  });
  return { client, bucket: process.env.R2_BUCKET as string };
}

// Uploaded files never change (a new upload gets a new key), so browsers and Cloudflare may cache them for a year.
const IMMUTABLE = 'public, max-age=31536000, immutable';

export async function putObject(key: string, body: Buffer, contentType: string) {
  const { client, bucket } = r2();
  await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType, CacheControl: IMMUTABLE }),
  );
}

/** A link the browser can PUT one file to, directly, for the next 30 minutes. Used for videos. */
export async function presignedPutUrl(key: string, contentType: string, size: number): Promise<string> {
  const { client, bucket } = r2();
  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType, ContentLength: size, CacheControl: IMMUTABLE }),
    { expiresIn: 30 * 60, signableHeaders: new Set(['content-type', 'content-length']) },
  );
}

/** Size and type of a stored object, or null if it does not exist. */
export async function headObject(key: string): Promise<HeadObjectCommandOutput | null> {
  const { client, bucket } = r2();
  try {
    return await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (status === 404) return null;
    throw error;
  }
}

/** Deletes objects (missing ones are ignored). */
export async function deleteObjects(keys: string[]) {
  if (!keys.length) return;
  const { client, bucket } = r2();
  for (let i = 0; i < keys.length; i += 1000) {
    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: keys.slice(i, i + 1000).map((Key) => ({ Key })), Quiet: true },
      }),
    );
  }
}
