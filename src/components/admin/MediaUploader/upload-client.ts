// Browser-only helpers for the uploader: send with progress, and read a video before uploading it.

export type SendResult = { ok: boolean; status: number; data: Record<string, unknown> };

/** XMLHttpRequest instead of fetch, because fetch cannot report upload progress. */
export function send(
  method: 'POST' | 'PUT',
  url: string,
  body: XMLHttpRequestBodyInit,
  onProgress: (fraction: number) => void,
  headers: Record<string, string> = {},
): Promise<SendResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      let data: Record<string, unknown> = {};
      try {
        data = xhr.responseText ? (JSON.parse(xhr.responseText) as Record<string, unknown>) : {};
      } catch {
        // R2 answers PUT with an empty body or XML; nothing to read.
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
    };
    xhr.onerror = () => resolve({ ok: false, status: 0, data: { error: 'The connection was lost. Check your internet and try again.' } });
    xhr.send(body);
  });
}

export type VideoInfo = { width: number; height: number; duration: number; poster: Blob | null };

/**
 * Reads size and length of a video and grabs a frame as its poster, in the browser.
 * Rejects when the browser cannot play the file — then visitors' browsers could not play it either.
 */
export function readVideo(file: File): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    const done = (fn: () => void) => {
      clearTimeout(timer);
      fn();
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
    };
    const fail = () =>
      done(() =>
        reject(
          new Error(
            `"${file.name}" cannot be played in a web browser, so visitors would not see it. Export it as MP4 (H.264) and upload that.`,
          ),
        ),
      );
    const timer = setTimeout(fail, 20000);

    video.onerror = fail;
    video.onloadedmetadata = () => {
      if (!video.videoWidth || !video.videoHeight) return fail();
      video.currentTime = Math.min(1, (video.duration || 0) / 4);
    };
    video.onseeked = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      try {
        canvas.getContext('2d')?.drawImage(video, 0, 0, width, height);
        canvas.toBlob((blob) => done(() => resolve({ width, height, duration, poster: blob })), 'image/jpeg', 0.85);
      } catch {
        done(() => resolve({ width, height, duration, poster: null }));
      }
    };
    video.src = url;
  });
}
