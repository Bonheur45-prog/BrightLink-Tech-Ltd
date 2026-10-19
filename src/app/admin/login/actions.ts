'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { startSession } from '@/lib/auth/session';
import { loginThrottle } from '@/lib/auth/throttle';
import { prisma } from '@/lib/db';
import { clientIp } from '@/lib/security/client-ip';

export type LoginState = { error?: string; email?: string };

// Compared against when the email is unknown, so a wrong email takes as long as a wrong password
// (otherwise response time would reveal which emails have accounts).
let dummyHash: Promise<string> | undefined;

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase().slice(0, 200);
  const password = String(formData.get('password') ?? '').slice(0, 200);
  if (!email || !password) return { error: 'Enter your email and password.', email };

  const ip = clientIp(await headers());
  const keys = [`email:${email}`, `ip:${ip}`];
  const wait = loginThrottle.retryAfter(keys);
  if (wait > 0) {
    const minutes = Math.ceil(wait / 60000);
    return { error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`, email };
  }

  let userId: string | null = null;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.active) {
      if (await verifyPassword(password, user.passwordHash)) userId = user.id;
    } else {
      await verifyPassword(password, await (dummyHash ??= hashPassword('not-a-real-password')));
    }
  } catch (error) {
    console.error('login: database error', error);
    return { error: 'Could not reach the database. Please try again in a moment.', email };
  }

  if (!userId) {
    loginThrottle.fail(keys);
    return { error: 'That email and password do not match.', email };
  }

  loginThrottle.succeed(keys);
  await startSession(userId);
  redirect('/admin');
}
