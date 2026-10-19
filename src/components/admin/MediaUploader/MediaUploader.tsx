'use client';

import { useId, useRef, useState, type DragEvent } from 'react';
import type { AdminMedia } from '@/lib/storage/assets';
import {
  IMAGE_ACCEPT,
  IMAGE_MAX_BYTES,
  VIDEO_ACCEPT,
  VIDEO_MAX_BYTES,
  formatBytes,
  isVideoType,
} from '@/lib/storage/limits';
import { readVideo, send } from './upload-client';
import styles from './MediaUploader.module.css';

type Props = {
  /** How many more files fit. Leave out for the media library (no limit). */
  remaining?: number;
  onUploaded: (media: AdminMedia) => void;
  /** false = photos only (e.g. showcase slides). */
  allowVideo?: boolean;
  /** false = one file at a time (e.g. the photo or video of one slide). */
  multiple?: boolean;
  /** Replaces the default "Add photos or videos" label. */
  label?: string;
};

type Job = { id: string; name: string; progress: number; state: 'waiting' | 'working' | 'done' | 'error'; message?: string };

const isImage = (file: File) => file.type.startsWith('image/');

/** Drop zone + file picker. Uploads one file at a time; photos via the server (resized, several widths), videos straight to R2. */
export function MediaUploader({ remaining = Number.POSITIVE_INFINITY, onUploaded, allowVideo = true, multiple = true, label }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dragging, setDragging] = useState(false);
  const busy = jobs.some((j) => j.state === 'waiting' || j.state === 'working');

  const update = (id: string, patch: Partial<Job>) =>
    setJobs((list) => list.map((job) => (job.id === id ? { ...job, ...patch } : job)));

  async function uploadImage(file: File, job: Job) {
    const form = new FormData();
    form.append('file', file);
    const result = await send('POST', '/admin/api/media/image', form, (p) => update(job.id, { progress: p * 0.9 }));
    if (!result.ok) throw new Error(String(result.data.error ?? `Upload failed (${result.status}).`));
    return result.data.media as AdminMedia;
  }

  async function uploadVideo(file: File, job: Job) {
    update(job.id, { message: 'Checking the video…' });
    const info = await readVideo(file);

    const start = await send(
      'POST',
      '/admin/api/media/video/start',
      JSON.stringify({ contentType: file.type, size: file.size }),
      () => {},
      { 'Content-Type': 'application/json' },
    );
    if (!start.ok) throw new Error(String(start.data.error ?? `Upload failed (${start.status}).`));

    update(job.id, { message: undefined });
    const put = await send('PUT', String(start.data.uploadUrl), file, (p) => update(job.id, { progress: p * 0.92 }), {
      'Content-Type': file.type,
    });
    if (!put.ok) {
      throw new Error(
        put.status === 0
          ? 'The video could not reach storage. Check your connection; if it keeps failing, the R2 CORS rule may be missing (see README).'
          : `Storage refused the video (${put.status}).`,
      );
    }

    const form = new FormData();
    form.append('key', String(start.data.key));
    form.append('width', String(info.width));
    form.append('height', String(info.height));
    form.append('duration', String(Math.round(info.duration)));
    if (info.poster) form.append('poster', info.poster, 'poster.jpg');
    const finish = await send('POST', '/admin/api/media/video/finish', form, () => {});
    if (!finish.ok) throw new Error(String(finish.data.error ?? `Saving failed (${finish.status}).`));
    return finish.data.media as AdminMedia;
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length || busy) return;
    const files = Array.from(fileList);
    const newJobs: Job[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      progress: 0,
      state: 'waiting',
    }));
    setJobs(newJobs);

    let slots = remaining;
    for (const [index, file] of files.entries()) {
      const job = newJobs[index] as Job;
      const fail = (message: string) => update(job.id, { state: 'error', message });
      const video = isVideoType(file.type);

      if (slots <= 0) {
        fail('Not added: the limit is reached. Remove something first.');
        continue;
      }
      if (video && !allowVideo) {
        fail('Only photos can be used here.');
        continue;
      }
      if (!video && !isImage(file)) {
        fail(allowVideo ? 'Not a photo or a supported video (MP4, WebM, MOV).' : 'Not a photo (JPG, PNG, WebP or AVIF).');
        continue;
      }
      if (!video && file.size > IMAGE_MAX_BYTES) {
        fail(`Too large (${formatBytes(file.size)}). Photos can be up to ${formatBytes(IMAGE_MAX_BYTES)}.`);
        continue;
      }
      if (video && file.size > VIDEO_MAX_BYTES) {
        fail(`Too large (${formatBytes(file.size)}). Videos can be up to ${formatBytes(VIDEO_MAX_BYTES)}.`);
        continue;
      }

      update(job.id, { state: 'working' });
      try {
        const media = video ? await uploadVideo(file, job) : await uploadImage(file, job);
        update(job.id, { state: 'done', progress: 1, message: undefined });
        slots--;
        onUploaded(media);
      } catch (error) {
        fail(error instanceof Error ? error.message : 'Upload failed.');
      }
    }
    if (inputRef.current) inputRef.current.value = '';
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    void handleFiles(event.dataTransfer.files);
  };

  const full = remaining <= 0;

  return (
    <div className={styles.uploader}>
      <div
        className={styles.zone}
        data-dragging={dragging || undefined}
        data-disabled={full || busy || undefined}
        onDragOver={(e) => {
          e.preventDefault();
          if (!full && !busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={full || busy ? (e) => e.preventDefault() : onDrop}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple={multiple}
          accept={allowVideo ? `${IMAGE_ACCEPT},${VIDEO_ACCEPT}` : IMAGE_ACCEPT}
          className={styles.input}
          disabled={full || busy}
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <label htmlFor={inputId} className={styles.label}>
          {full ? (
            'Limit reached. Remove a photo or video to add another.'
          ) : (
            <>
              <span className={styles.labelMain}>{busy ? 'Uploading…' : (label ?? (allowVideo ? 'Add photos or videos' : 'Add photos'))}</span>
              <span className={styles.labelSub}>
                {multiple ? 'Drop files here or click to choose' : 'Drop a file here or click to choose'} · photos
                up to {formatBytes(IMAGE_MAX_BYTES)}
                {allowVideo && `, videos (MP4) up to ${formatBytes(VIDEO_MAX_BYTES)}`}
              </span>
            </>
          )}
        </label>
      </div>

      {jobs.length > 0 && (
        <ul className={styles.jobs} aria-live="polite">
          {jobs.map((job) => (
            <li key={job.id} className={styles.job} data-state={job.state}>
              <span className={styles.jobName}>{job.name}</span>
              <span className={styles.jobStatus}>
                {job.state === 'waiting' && 'Waiting'}
                {job.state === 'working' && (job.message ?? `${Math.round(job.progress * 100)}%`)}
                {job.state === 'done' && 'Added'}
                {job.state === 'error' && job.message}
              </span>
              {job.state === 'working' && (
                <progress className={styles.progress} value={job.progress} max={1} aria-label={`Uploading ${job.name}`} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
