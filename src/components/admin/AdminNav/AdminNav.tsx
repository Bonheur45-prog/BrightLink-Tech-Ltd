'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdminNav.module.css';

export type AdminNavLink = { href: string; label: string; count?: number };

/** Sidebar links; highlights the section you are in (e.g. /admin/media/abc → Media library). */
export function AdminNav({ groups }: { groups: { label?: string; links: AdminNavLink[] }[] }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  return (
    <nav aria-label="CMS" className={styles.nav}>
      {groups.map((group, index) => (
        <div key={group.label ?? index} className={styles.group}>
          {group.label && <p className={styles.groupLabel}>{group.label}</p>}
          <ul className={styles.list}>
            {group.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={styles.link}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  <span>{link.label}</span>
                  {link.count ? (
                    <span className={styles.count} aria-label={`${link.count} new`}>
                      {link.count}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
