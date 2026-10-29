import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localizeHref, localizeHtml, splitLocale } from './config';

test('splitLocale separates the language prefix from the page', () => {
  assert.deepEqual(splitLocale('/'), { locale: 'en', path: '/' });
  assert.deepEqual(splitLocale('/about-us'), { locale: 'en', path: '/about-us' });
  assert.deepEqual(splitLocale('/fr'), { locale: 'fr', path: '/' });
  assert.deepEqual(splitLocale('/fr/about-us'), { locale: 'fr', path: '/about-us' });
  assert.deepEqual(splitLocale('/rw/blog/a-post'), { locale: 'rw', path: '/blog/a-post' });
  // only a whole first segment counts
  assert.deepEqual(splitLocale('/french-fries'), { locale: 'en', path: '/french-fries' });
  assert.deepEqual(splitLocale('/frontend'), { locale: 'en', path: '/frontend' });
});

test('localizeHref adds the prefix to pages of this site only', () => {
  assert.equal(localizeHref('/about-us', 'en'), '/about-us');
  assert.equal(localizeHref('/about-us', 'fr'), '/fr/about-us');
  assert.equal(localizeHref('/', 'fr'), '/fr');
  assert.equal(localizeHref('/#get-in-touch', 'rw'), '/rw#get-in-touch');
  assert.equal(localizeHref('/?page=2', 'fr'), '/fr?page=2');
  assert.equal(localizeHref('/blog?q=web', 'fr'), '/fr/blog?q=web');
  assert.equal(localizeHref('/our-services/web#faq', 'fr'), '/fr/our-services/web#faq');
});

test('localizeHref leaves everything else alone', () => {
  for (const href of [
    'https://example.com/about-us',
    '//cdn.example.com/x',
    'mailto:info@brightlinkltd.com',
    'tel:+250788000000',
    '#faq',
    '/fr/about-us',
    '/rw',
    '/en/about-us',
    '/admin',
    '/admin/pages',
    '/api/x',
    '/_next/static/a.js',
    '/images/brand/logo.png',
    '/blog/feed.xml',
    '/sitemap.xml',
  ]) {
    assert.equal(localizeHref(href, 'fr'), href, href);
  }
});

test('localizeHtml rewrites internal links inside article HTML', () => {
  const html = '<p><a href="/our-services/web">web</a> <a href="https://x.com">x</a> <a href="#top">top</a> <a href="/images/a.png">img</a></p>';
  assert.equal(localizeHtml(html, 'en'), html);
  assert.equal(
    localizeHtml(html, 'fr'),
    '<p><a href="/fr/our-services/web">web</a> <a href="https://x.com">x</a> <a href="#top">top</a> <a href="/images/a.png">img</a></p>',
  );
});
