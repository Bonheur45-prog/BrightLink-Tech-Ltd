import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FONTS, isFontKey } from '../fonts';
import {
  footerProblems,
  headerProblems,
  linkProblem,
  parseFooter,
  parseHeader,
  parseT,
  resolveFooter,
  resolveHeader,
} from './globals-model';
import { validateSettings, verificationCode, type Input } from './settings-validation';

const input = (values: Record<string, string | string[]>): Input => ({
  get: (n) => (Array.isArray(values[n]) ? (values[n] as string[])[0] : (values[n] as string)) ?? '',
  getAll: (n) => (Array.isArray(values[n]) ? (values[n] as string[]) : values[n] ? [values[n] as string] : []),
});

const valid = {
  companyName: 'BrightLink Technologies',
  legalName: 'BrightLink Technologies Ltd',
  publicEmail: 'Info@BrightLinkltd.com',
  notificationEmail: 'info@brightlinkltd.com',
  titleTemplate: '%s | BrightLink',
  'seoTitle.en': 'BrightLink',
  'seoDescription.en': 'Technology solutions in Kigali.',
};

test('fonts: 8 curated fonts with unique keys', () => {
  assert.equal(FONTS.length, 8);
  assert.equal(new Set(FONTS.map((f) => f.key)).size, 8);
  assert.ok(isFontKey('inter'));
  assert.ok(!isFontKey('comic-sans'));
});

test('settings: valid input is cleaned; English always on; unknown fonts fall back', () => {
  const r = validateSettings(input({ ...valid, enabledLocales: ['fr', 'xx'], headingFont: 'nope', bodyFont: 'lora', smoothScroll: 'on', 'social.linkedin': 'linkedin.com/company/brightlink' }));
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.data.publicEmail, 'info@brightlinkltd.com');
  assert.deepEqual(r.data.enabledLocales, ['en', 'fr']);
  assert.equal(r.data.headingFont, 'outfit');
  assert.equal(r.data.bodyFont, 'lora');
  assert.equal(r.data.smoothScroll, true);
  assert.equal(r.data.parallax, false);
  assert.deepEqual(r.data.socials, [{ platform: 'linkedin', url: 'https://linkedin.com/company/brightlink' }]);
  assert.equal(r.data.translations.fr, undefined); // nothing typed in French
});

test('settings: errors for missing fields, bad template, wrong social host, bad phone', () => {
  const r = validateSettings(input({ ...valid, companyName: '', titleTemplate: 'No placeholder', 'social.facebook': 'https://evil.example/x', phone: 'call me', 'seoTitle.en': '' }));
  assert.ok(!r.ok);
  if (r.ok) return;
  for (const k of ['companyName', 'titleTemplate', 'social.facebook', 'phone', 'seoTitle.en']) assert.ok(r.errors[k], k);
});

test('settings: Google verification meta tag is reduced to its code', () => {
  assert.equal(verificationCode('<meta name="google-site-verification" content="abc123XYZ" />'), 'abc123XYZ');
  assert.equal(verificationCode(' abc '), 'abc');
});

test('links: site pages, anchors, web, mail and phone are allowed; others refused', () => {
  for (const ok of ['/', '/about-us', '#contact', 'https://x.com', 'mailto:a@b.co', 'tel:+250782567921']) assert.equal(linkProblem(ok), null, ok);
  for (const bad of ['', 'javascript:alert(1)', '//evil.com', 'about us', 'ftp://x']) assert.ok(linkProblem(bad), bad);
});

test('translatable text: empty languages dropped, fallback to English', () => {
  assert.deepEqual(parseT({ en: ' Home ', fr: '', rw: 'Ahabanza', de: 'x' }), { en: 'Home', rw: 'Ahabanza' });
  const h = parseHeader({ navItems: [{ id: 'a', label: { en: 'Home', fr: 'Accueil' }, url: '/', children: [] }], cta: { enabled: false } });
  assert.equal(resolveHeader(h, 'fr').navItems[0].label, 'Accueil');
  assert.equal(resolveHeader(h, 'rw').navItems[0].label, 'Home');
  assert.equal(resolveHeader(h, 'en').cta, null);
});

test('header: empty JSON gives the starter header, which is publishable', () => {
  const h = parseHeader({});
  assert.ok(h.navItems.length >= 5);
  assert.deepEqual(headerProblems(h), {});
  assert.deepEqual(footerProblems(parseFooter({})), {});
  assert.equal(resolveFooter(parseFooter({}), 'en').quickLinks[0].label, 'Home');
});

test('header: problems for missing label and bad link; dropdown parent may have no link', () => {
  const h = parseHeader({
    navItems: [
      { label: {}, url: 'nope' },
      { label: { en: 'Services' }, url: '', children: [{ label: { en: 'Web' }, url: '/our-services/web' }] },
    ],
    cta: { enabled: true, label: {}, url: '' },
  });
  const p = headerProblems(h);
  assert.ok(p['nav.0.label'] && p['nav.0.url'] && p['cta.label'] && p['cta.url']);
  assert.equal(p['nav.1.url'], undefined);
});
