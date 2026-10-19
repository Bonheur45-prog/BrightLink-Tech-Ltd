import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

type Props = {
  title: string;
  description?: ReactNode;
  back?: { href: string; label: string };
  actions?: ReactNode;
};

export function PageHeader({ title, description, back, actions }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        {back && (
          <Link href={back.href} className={styles.back}>
            ← {back.label}
          </Link>
        )}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
