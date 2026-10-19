import { NextResponse, type NextRequest } from 'next/server';

// First line of defence only: sends visitors WITHOUT a session cookie away from /admin pages.
// It cannot check whether the cookie is valid (no database here), so every admin page and
// server action also calls requireUser().
// /admin/api/* is NOT matched: middleware limits request bodies to 10 MB, which would cut off
// photo uploads. Those routes check the session themselves (src/lib/auth/api.ts).
const SESSION_COOKIE = 'bl_admin_session'; // keep in sync with src/lib/auth/session.ts

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/admin/login' || request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  return NextResponse.redirect(new URL('/admin/login', request.url));
}

export const config = { matcher: ['/admin', '/admin/((?!api/).*)'] };
