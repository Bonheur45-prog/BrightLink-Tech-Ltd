import type { AdminMedia } from '@/lib/storage/assets';
import styles from './MediaThumb.module.css';

const duration = (seconds: number | null) =>
  seconds == null ? '' : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

type Props = {
  media: Pick<AdminMedia, 'kind' | 'thumbUrl' | 'durationSec'> | null;
  size?: number;
  alt?: string;
  /** fill the parent's width (square, or 16:9 with `wide`) */
  fluid?: boolean;
  wide?: boolean;
};

/**
 * Preview of a photo, or of a video's poster frame with a "Video" label. A plain <img> on purpose:
 * the file is already a small WebP copy from R2, so the server never has to resize it again.
 */
export function MediaThumb({ media, size = 64, alt = '', fluid = false, wide = false }: Props) {
  return (
    <span
      className={[styles.thumb, fluid && styles.fluid, fluid && wide && styles.wide].filter(Boolean).join(' ')}
      style={fluid ? undefined : { width: size, height: size }}
    >
      {media?.thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.thumbUrl} alt={alt} loading="lazy" decoding="async" className={styles.image} />
      ) : (
        <span className={styles.empty} aria-hidden="true" />
      )}
      {media?.kind === 'VIDEO' && (
        <span className={styles.badge}>
          ▶{media.durationSec != null && ` ${duration(media.durationSec)}`}
        </span>
      )}
    </span>
  );
}
