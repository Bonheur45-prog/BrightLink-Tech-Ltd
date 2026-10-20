'use server';

import { redirect } from 'next/navigation';
import { audit } from '@/lib/audit';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

const ID = /^[a-z0-9]{10,40}$/;
const STATUSES = ['NEW', 'CONTACTED', 'CLOSED'] as const;

export async function setLeadStatus(id: string, status: (typeof STATUSES)[number]) {
  const user = await requireUser();
  if (!ID.test(id) || !STATUSES.includes(status)) redirect('/admin/messages');
  await prisma.lead.updateMany({ where: { id }, data: { status } });
  await audit(user.id, 'lead.status', 'lead', id, { status });
  redirect(`/admin/messages/${id}?notice=status-${status.toLowerCase()}`);
}

export async function deleteLead(id: string) {
  const user = await requireUser();
  if (!ID.test(id)) redirect('/admin/messages');
  await prisma.lead.deleteMany({ where: { id } });
  await audit(user.id, 'lead.delete', 'lead', id);
  redirect('/admin/messages?notice=lead-deleted');
}

export async function setSubscriberActive(id: string, active: boolean) {
  const user = await requireUser();
  if (!ID.test(id)) redirect('/admin/subscribers');
  await prisma.subscriber.updateMany({ where: { id }, data: { active } });
  await audit(user.id, active ? 'subscriber.on' : 'subscriber.off', 'subscriber', id);
  redirect('/admin/subscribers');
}
