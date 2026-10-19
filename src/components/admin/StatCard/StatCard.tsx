import Link from 'next/link';
import styles from './StatCard.module.css';

type Props = { label: string; value: number; href?: string; note?: string; highlight?: boolean };

/** One number with a label; links to the list it counts. */
export function StatCard({ label, value, href, note, highlight }: Props) {
  const body = (
    <>
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
