import Link from 'next/link';
import type { ReactNode } from 'react';
import { AdminNav, type AdminNavLink } from '@/components/admin/AdminNav/AdminNav';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import styles from './AdminShell.module.css';

type Props = {
  businessName: string;
  user: { name: string; email: string };
  newMessages: number;
  logoutAction: () => Promise<void>;
  children: ReactNode;
};

/** CMS frame: dark sidebar with navigation (top bar on phones) and the page content. */
export function AdminShell({ businessName, user, newMessages, logoutAction, children }: Props) {
  const groups: { label?: string; links: AdminNavLink[] }[] = [
    {
      links: [
        { href: '/admin', label: 'Dashboard', count: newMessages },
        { href: '/admin/media', label: 'Media library' },
      ],
    },
    {
      label: 'System',
      links: [
        { href: '/admin/users', label: 'Users' },
        { href: '/admin/activity', label: 'Activity' },
      ],
    },
  ];

  return (
    <div className={styles.shell}>
      <a href="#admin-main" className={styles.skip}>
        Skip to content
      </a>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Link href="/admin" className={styles.brandLink}>
            {businessName}
          </Link>
          <span className={styles.brandSub}>Content manager</span>
        </div>
        <AdminNav groups={groups} />
        <div className={styles.account}>
          <p className={styles.user}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userEmail}>{user.email}</span>
          </p>
          <div className={styles.accountActions}>
            <Link href="/" className={styles.viewSite} target="_blank" rel="noopener">
              View website ↗
            </Link>
            <form action={logoutAction}>
              <ConfirmButton variant="ghost" size="sm" className={styles.logout}>
                Log out
              </ConfirmButton>
            </form>
          </div>
        </div>
      </aside>
      <main id="admin-main" className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
