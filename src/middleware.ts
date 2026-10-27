import { NextResponse, type NextRequest } from 'next/server';
import { isLocale } from '@/i18n/config';

const SESSION_COOKIE = 'bl_admin_session';
const LOCALE_COOKIE = 'brightlink_locale';
const PREFIXED_LOCALES = ['fr', 'rw'] as const;

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const segments = url.pathname.split('/').filter(Boolean);
  const prefix = PREFIXED_LOCALES.find((value) => value === segments[0]);
  const selected = url.searchParams.get('locale');
  const selectedLocale = selected && isLocale(selected) ? selected : null;
  let pathname = url.pathname;
  let locale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (prefix) {
    locale = prefix;
    pathname = '/' + segments.slice(1).join('/');
    if (pathname === '') pathname = '/';
  } else if (selectedLocale) locale = selectedLocale;

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (pathname.startsWith('/admin/api/')) return prefix ? NextResponse.rewrite(new URL(pathname, request.url)) : NextResponse.next();
    if (prefix || selectedLocale) return NextResponse.redirect(new URL(pathname, request.url));
    if (pathname === '/admin/login' || request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  if (selectedLocale) {
    url.searchParams.delete('locale');
    url.pathname = selectedLocale === 'en' ? pathname : '/' + selectedLocale + (pathname === '/' ? '' : pathname);
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, selectedLocale, { path: '/', sameSite: 'lax', maxAge: 31536000 });
    return response;
  }
  if (prefix) {
    const headers = new Headers(request.headers);
    headers.set('x-brightlink-locale', prefix);
    const response = NextResponse.rewrite(new URL(pathname, request.url), { request: { headers } });
    response.cookies.set(LOCALE_COOKIE, prefix, { path: '/', sameSite: 'lax', maxAge: 31536000 });
    return response;
  }
  if (locale && isLocale(locale) && locale !== 'en') {
    const localized = new URL(request.url);
    localized.pathname = '/' + locale + (pathname === '/' ? '' : pathname);
    return NextResponse.redirect(localized);
  }
  const headers = new Headers(request.headers);
  headers.set('x-brightlink-locale', 'en');
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ['/admin', '/admin/((?!api/).*)', '/((?!admin(?:/|$)|api/|_next/|favicon.ico|robots.txt|sitemap.xml).*)'] };
