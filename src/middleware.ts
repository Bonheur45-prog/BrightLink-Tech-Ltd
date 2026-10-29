import { NextResponse, type NextRequest } from 'next/server';
import { LOCALE_HEADER, PATH_HEADER, isLocale, splitLocale } from '@/i18n/config';

// Two jobs, without the database (middleware must stay fast):
//
// 1. Admin: sends visitors WITHOUT a session cookie away from /admin pages. It cannot check whether the
//    cookie is valid, so every admin page and server action also calls requireUser().
//
// 2. Languages. English pages have no prefix; "/fr/…" and "/rw/…" are served by the same pages (rewrite),
//    with the language passed to them in the x-brightlink-locale header. The address alone decides the
//    language: no cookie, no automatic redirect, so every address always shows the same page to everyone
//    (visitors, search engines and caches). Whether a language is switched on in Site settings needs the
//    database, so the public layout checks it (src/lib/locale.ts).

const SESSION_COOKIE = 'bl_admin_session'; // keep in sync with src/lib/auth/session.ts
const OLD_LOCALE_COOKIE = 'brightlink_locale'; // set by an earlier version; removed when seen

function withoutOldCookie(request: NextRequest, response: NextResponse) {
  if (request.cookies.has(OLD_LOCALE_COOKIE)) response.cookies.delete(OLD_LOCALE_COOKIE);
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (pathname === '/admin/login' || request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // "/en/…" is not an address of this site: English has no prefix.
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }

  // Old language-switcher links ("?locale=fr"): send them to the real address once.
  const asked = request.nextUrl.searchParams.get('locale');
  if (asked !== null) {
    const url = request.nextUrl.clone();
    url.searchParams.delete('locale');
    const { path } = splitLocale(pathname);
    url.pathname = asked && isLocale(asked) && asked !== 'en' ? `/${asked}${path === '/' ? '' : path}` : path;
    return withoutOldCookie(request, NextResponse.redirect(url));
  }

  const { locale, path } = splitLocale(pathname);
  // The CMS and APIs have no language versions: "/fr/admin" → "/admin" (where the login check applies).
  if (locale !== 'en' && /^\/(?:admin|api)(?:\/|$)/.test(path)) return NextResponse.redirect(new URL(path + search, request.url));

  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, locale); // always set here, so a visitor cannot choose it by sending the header
  headers.set(PATH_HEADER, path + search);
  if (locale === 'en') return withoutOldCookie(request, NextResponse.next({ request: { headers } }));

  const url = request.nextUrl.clone();
  url.pathname = path;
  return withoutOldCookie(request, NextResponse.rewrite(url, { request: { headers } }));
}

export const config = {
  matcher: [
    '/admin',
    '/admin/((?!api/).*)',
    // Public pages. Not: the CMS (above), APIs, Next's files, /images, and the files at the root
    // (favicon, icons, robots.txt, sitemap.xml). "/fr/…" files are still matched so they reach the file.
    '/((?!admin(?:/|$)|api/|_next/|images/|favicon\\.ico|icon\\.png|apple-icon\\.png|robots\\.txt|sitemap\\.xml).*)',
  ],
};
