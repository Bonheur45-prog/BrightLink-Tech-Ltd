'use server';

import { redirect } from 'next/navigation';
import { audit } from '@/lib/audit';
import { hashPassword, passwordProblem, verifyPassword } from '@/lib/auth/password';
import { requireUser, startSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

// CMS logins. Every user can manage everything (one role), so any logged-in user can add users,
// reset passwords and deactivate others. Nobody can deactivate themselves or the last active user.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ID = /^[a-z0-9]{10,40}$/;
const field = (data: FormData, name: string) => String(data.get(name) ?? '').trim();
const back = (query: string): never => redirect(`/admin/users?${query}`);

export async function addUser(data: FormData) {
  const me = await requireUser();
  const name = field(data, 'name');
  const email = field(data, 'email').toLowerCase();
  const password = String(data.get('password') ?? '');
  if (!name || name.length > 80) back('error=bad-name');
  if (!EMAIL.test(email) || email.length > 200) back('error=bad-email');
  if (passwordProblem(password)) back('error=short-password');
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) back('error=email-taken');
  const user = await prisma.user.create({ data: { name, email, passwordHash: await hashPassword(password) } });
  await audit(me.id, 'user.create', 'user', user.id, { email });
  back('notice=user-added');
}

export async function setUserPassword(userId: string, data: FormData) {
  const me = await requireUser();
  if (!ID.test(userId)) back('error=not-found');
  const password = String(data.get('password') ?? '');
  if (passwordProblem(password)) back('error=short-password');
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) back('error=not-found');
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(password) } }),
    prisma.session.deleteMany({ where: { userId } }), // logged out everywhere
  ]);
  await audit(me.id, 'user.password', 'user', userId);
  if (userId === me.id) await startSession(me.id); // keep this browser logged in
  back('notice=password-set');
}

export async function changeOwnPassword(data: FormData) {
  const me = await requireUser();
  const current = String(data.get('current') ?? '');
  const next = String(data.get('password') ?? '');
  if (next !== String(data.get('confirm') ?? '')) back('error=mismatch');
  if (passwordProblem(next)) back('error=short-password');
  const row = await prisma.user.findUnique({ where: { id: me.id }, select: { passwordHash: true } });
  if (!row || !(await verifyPassword(current, row.passwordHash))) back('error=wrong-password');
  await prisma.$transaction([
    prisma.user.update({ where: { id: me.id }, data: { passwordHash: await hashPassword(next) } }),
    prisma.session.deleteMany({ where: { userId: me.id } }),
  ]);
  await startSession(me.id); // this browser stays logged in; other devices are logged out
  await audit(me.id, 'user.own-password', 'user', me.id);
  back('notice=own-password');
}

export async function setUserActive(userId: string, active: boolean) {
  const me = await requireUser();
  if (!ID.test(userId)) back('error=not-found');
  if (userId === me.id && !active) back('error=self');
  if (!active && (await prisma.user.count({ where: { active: true, id: { not: userId } } })) === 0) back('error=last-user');
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { active } }),
    ...(active ? [] : [prisma.session.deleteMany({ where: { userId } })]),
  ]);
  await audit(me.id, active ? 'user.activate' : 'user.deactivate', 'user', userId);
  back(active ? 'notice=user-on' : 'notice=user-off');
}
