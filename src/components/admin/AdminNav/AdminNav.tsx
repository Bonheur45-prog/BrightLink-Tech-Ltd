'use client';

import {
  Activity,
  Building2,
  ExternalLink,
  FileText,
  Handshake,
  Images,
  Inbox,
  Layers,
  LayoutDashboard,
  LogOut,
  MailPlus,
  Menu,
  Newspaper,
  PanelBottom,
  PanelTop,
  Settings,
  Trash2,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import styles from './AdminNav.module.css';

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  messages: Inbox,
  media: Images,
  pages: FileText,
  blog: Newspaper,
  services: Layers,
  projects: Building2,
  clients: Handshake,
  team: UserRound,
  subscribers: MailPlus,
  trash: Trash2,
  header: PanelTop,
  footer: PanelBottom,
  settings: Settings,
  users: Users,
  activity: Activity,
};

export type AdminNavLink = { href: string; label: string; icon: keyof typeof ICONS | string; count?: number };
export type AdminNavGroup = { label?: string; links: AdminNavLink[] };

type Props = {
  groups: AdminNavGroup[];
  businessName: string;
  user: { name: string; email: string };
  logoutAction: () => Promise<void>;
  children: ReactNode;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '?';

/**
 * The CMS frame: navy sidebar with the logo, icons and your account pinned at the bottom (a slide-in
 * drawer on phones), a top bar with where you are and a link to the website, and the page itself. Highlights the section you are in
 * (e.g. /admin/media/abc → Media library).
 */
export function AdminFrame({ groups, businessName, user, logoutAction, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`));

  // Close the phone menu after moving to another page, and with Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  let crumb: { group?: string; label: string } = { label: 'Dashboard' };
  for (const g of groups) for (const l of g.links) if (isActive(l.href)) crumb = { group: g.label, label: l.label };

  return (
    <div className={styles.shell} data-open={open || undefined}>
      <a href="#admin-main" className={styles.skip}>
        Skip to content
      </a>

      <aside className={styles.sidebar} aria-label="CMS menu">
        <div className={styles.brand}>
          <Link href="/admin" className={styles.brandLink} aria-label={`${businessName} — Dashboard`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- small fixed brand file, no resizing needed */}
            <img src="/images/brand/brightlink-logo-light-256.webp" alt={businessName} width={256} height={91} className={styles.brandLogo} />
          </Link>
          <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav} aria-label="CMS">
          {groups.map((group, index) => (
            <div key={group.label ?? index} className={styles.group}>
              {group.label && <p className={styles.groupLabel}>{group.label}</p>}
              <ul className={styles.list}>
                {group.links.map((link) => {
                  const Icon = ICONS[link.icon] ?? FileText;
                  return (
                    <li key={link.href}>
                      <Link href={link.href} className={styles.link} aria-current={isActive(link.href) ? 'page' : undefined}>
                        <Icon size={18} strokeWidth={1.9} className={styles.linkIcon} aria-hidden="true" />
                        <span className={styles.linkLabel}>{link.label}</span>
                        {link.count ? (
                          <span className={styles.count} aria-label={`${link.count} new`}>
                            {link.count}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className={styles.account}>
          <span className={styles.avatar} aria-hidden="true">
            {initials(user.name)}
          </span>
          <span className={styles.who}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userEmail}>{user.email}</span>
          </span>
          <form action={logoutAction}>
            <ConfirmButton variant="ghost" size="sm" className={styles.logout} aria-label="Log out" title="Log out">
              <LogOut size={18} aria-hidden="true" />
            </ConfirmButton>
          </form>
        </div>
      </aside>

      <button type="button" className={styles.scrim} onClick={() => setOpen(false)} aria-label="Close menu" tabIndex={-1} />

      <div className={styles.body}>
        <header className={styles.topbar}>
          <button type="button" className={styles.menuButton} onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
            <Menu size={20} />
          </button>
          <p className={styles.crumbs}>
            {crumb.group && <span className={styles.crumbGroup}>{crumb.group}</span>}
            <span className={styles.crumbPage}>{crumb.label}</span>
          </p>
          <Link href="/" target="_blank" rel="noopener" className={styles.viewSite}>
            <span>View website</span>
            <ExternalLink size={15} aria-hidden="true" />
          </Link>
        </header>
        <main id="admin-main" className={styles.main}>
          <div className={styles.content}>{children}</div>
        </main>
      </div>
    </div>
  );
}
