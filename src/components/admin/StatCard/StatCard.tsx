import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './StatCard.module.css';

type Props = { label: string; value: number | string; href?: string; note?: string; highlight?: boolean; icon?: ReactNode };

/** One number with a label; links to the list it counts. */
export function StatCard({ label, value, href, note, highlight, icon }: Props) {
  const body = (
    <>
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
      {note && <span className={styles.note}>{note}</span>}
    </>
  );
  return href ? (
    <Link href={href} className={styles.card} data-highlight={highlight || undefined}>
      {body}
    </Link>
  ) : (
    <div className={styles.card} data-highlight={highlight || undefined}>
      {body}
    </div>
  );
}
