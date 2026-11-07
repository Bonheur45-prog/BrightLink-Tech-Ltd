import type { ReactNode } from 'react';
import { AdminFrame, type AdminNavGroup } from '@/components/admin/AdminNav/AdminNav';

type Props = {
  businessName: string;
  user: { name: string; email: string };
  newMessages: number;
  logoutAction: () => Promise<void>;
  children: ReactNode;
};

/** The CMS menu (the frame itself is drawn by AdminFrame). */
export function AdminShell({ businessName, user, newMessages, logoutAction, children }: Props) {
  const groups: AdminNavGroup[] = [
    {
      links: [
        { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
        { href: '/admin/messages', label: 'Messages', icon: 'messages', count: newMessages },
        { href: '/admin/media', label: 'Media library', icon: 'media' },
      ],
    },
    {
      label: 'Content',
      links: [
        { href: '/admin/pages', label: 'Pages', icon: 'pages' },
        { href: '/admin/blog', label: 'Blog', icon: 'blog' },
        { href: '/admin/services', label: 'Services', icon: 'services' },
        { href: '/admin/projects', label: 'Projects', icon: 'projects' },
        { href: '/admin/clients', label: 'Clients', icon: 'clients' },
        { href: '/admin/team', label: 'Team', icon: 'team' },
        { href: '/admin/subscribers', label: 'Subscribers', icon: 'subscribers' },
        { href: '/admin/trash', label: 'Trash', icon: 'trash' },
      ],
    },
    {
      label: 'Site-wide',
      links: [
        { href: '/admin/header', label: 'Header', icon: 'header' },
        { href: '/admin/footer', label: 'Footer', icon: 'footer' },
        { href: '/admin/settings', label: 'Site settings', icon: 'settings' },
      ],
    },
    {
      label: 'System',
      links: [
        { href: '/admin/users', label: 'Users', icon: 'users' },
        { href: '/admin/activity', label: 'Activity', icon: 'activity' },
      ],
    },
  ];

  return (
    <AdminFrame groups={groups} businessName={businessName} user={user} logoutAction={logoutAction}>
      {children}
    </AdminFrame>
  );
}
