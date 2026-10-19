import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { prisma } from '@/lib/db';

// Session = random token in an httpOnly cookie. Only its SHA-256 hash is stored, so a leaked
// database copy cannot be used to log in. Logging out deletes the row, which ends the session at once.
export const SESSION_COOKIE = 'bl_admin_session';
const SESSION_DAYS = 14;

export type AdminUser = { id: string; email: string; name: string };

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/** Creates a session and sets the cookie. Only callable from a server action or route handler. */
export async function startSession(userId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt } });
  await prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  // Old sessions are cleaned up here rather than by a scheduled job.
  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    expires: expiresAt,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  jar.delete({ name: SESSION_COOKIE, path: '/admin' });
}

/** The logged-in user, or null. Cached for the duration of one request. */
export const getCurrentUser = cache(async (): Promise<AdminUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, email: true, name: true, active: true } } },
  });
  if (!session || session.expiresAt < new Date() || !session.user.active) return null;
  const { id, email, name } = session.user;
  return { id, email, name };
});

/** Use at the top of every admin page and server action. Sends visitors without a session to the login page. */
export async function requireUser(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');
  return user;
}
