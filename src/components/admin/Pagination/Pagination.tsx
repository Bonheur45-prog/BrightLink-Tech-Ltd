import Link from 'next/link';
import styles from './Pagination.module.css';

type Props = { page: number; pageSize: number; total: number; hrefFor: (page: number) => string };

export function Pagination({ page, pageSize, total, hrefFor }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pages" className={styles.pagination}>
      {page > 1 ? <Link href={hrefFor(page - 1)}>← Previous</Link> : <span aria-hidden="true" />}
      <span className={styles.status}>
        Page {page} of {pages}
      </span>
      {page < pages ? <Link href={hrefFor(page + 1)}>Next →</Link> : <span aria-hidden="true" />}
    </nav>
  );
}
