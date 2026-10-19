import type { ReactNode } from 'react';
import styles from './Notice.module.css';

type Tone = 'info' | 'success' | 'warning' | 'error';

/** A message box. Errors are announced to screen readers immediately; others politely. */
export function Notice({ tone = 'info', title, children }: { tone?: Tone; title?: string; children?: ReactNode }) {
  return (
    <div className={`${styles.notice} ${styles[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>
      {title && <p className={styles.title}>{title}</p>}
      {children && <div className={styles.body}>{children}</div>}
    </div>
  );
}
