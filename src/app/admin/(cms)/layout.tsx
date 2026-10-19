import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/AdminShell/AdminShell';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { getSiteSettings } from '@/lib/settings';
import { logout } from '../actions';

// Every page inside (cms) requires a valid session. Server actions check again on their own,
// because they can be called directly without loading this layout.
export default async function CmsLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const [settings, newMessages] = await Promise.all([getSiteSettings(), prisma.lead.count({ where: { status: 'NEW' } })]);

  return (
    <AdminShell businessName={settings.businessName} user={user} newMessages={newMessages} logoutAction={logout}>
      {children}
    </AdminShell>
  );
}
