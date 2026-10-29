import { test } from 'node:test';
import assert from 'node:assert/strict';
import imageLoader from './image-loader';
import { photoUrl, withoutSizes } from './media';
import { absoluteUrl } from './seo';

const KEY = 'uploads/2026/10/abc123.webp';
const variants = [
  { w: 480, h: 270, key: 'uploads/2026/10/abc123-480.webp' },
  { w: 960, h: 540, key: 'uploads/2026/10/abc123-960.webp' },
  { w: 1600, h: 900, key: 'uploads/2026/10/abc123-1600.webp' },
];

test('a photo address lists its stored widths; videos and odd entries are left plain', () => {
  process.env.R2_PUBLIC_HOSTNAME = 'media.brightlinkltd.com';
  assert.equal(photoUrl({ objectKey: KEY, width: 2400, variants, kind: 'IMAGE' }), `https://media.brightlinkltd.com/${KEY}#w=480.960.1600~2400`);
  // a small original has no smaller copies
  assert.equal(photoUrl({ objectKey: KEY, width: 400, variants: [], kind: 'IMAGE' }), `https://media.brightlinkltd.com/${KEY}#w=~400`);
  // copies stored under another name are ignored (the loader rebuilds the name from the width)
  assert.equal(photoUrl({ objectKey: KEY, width: 2400, variants: [{ w: 480, h: 1, key: 'elsewhere/x.webp' }], kind: 'IMAGE' }), `https://media.brightlinkltd.com/${KEY}#w=~2400`);
  assert.equal(photoUrl({ objectKey: 'uploads/2026/10/v.mp4', width: 1920, kind: 'VIDEO', mimeType: 'video/mp4' }), 'https://media.brightlinkltd.com/uploads/2026/10/v.mp4');
});

test('the loader serves the smallest stored copy at least as wide as asked, else the original', () => {
  const src = `https://media.x.rw/${KEY}#w=480.960.1600~2400`;
  assert.equal(imageLoader({ src, width: 256 }), 'https://media.x.rw/uploads/2026/10/abc123-480.webp');
  assert.equal(imageLoader({ src, width: 480 }), 'https://media.x.rw/uploads/2026/10/abc123-480.webp');
  assert.equal(imageLoader({ src, width: 640 }), 'https://media.x.rw/uploads/2026/10/abc123-960.webp');
  assert.equal(imageLoader({ src, width: 1280 }), 'https://media.x.rw/uploads/2026/10/abc123-1600.webp');
  assert.equal(imageLoader({ src, width: 1920 }), `https://media.x.rw/${KEY}`);
  assert.equal(imageLoader({ src: `https://media.x.rw/${KEY}#w=~400`, width: 1920 }), `https://media.x.rw/${KEY}`);
});

test('the bundled brand pictures use their WebP copies; other files are used as they are', () => {
  assert.equal(imageLoader({ src: '/images/brand/brightlink-logo.webp#w=256.384.480~839', width: 384 }), '/images/brand/brightlink-logo-384.webp');
  assert.equal(imageLoader({ src: '/images/brand/brightlink-logo.webp#w=256.384.480~839', width: 640 }), '/images/brand/brightlink-logo.webp');
  assert.equal(imageLoader({ src: '/images/brand/brightlink-mark.webp#w=~212', width: 960 }), '/images/brand/brightlink-mark.webp');
  assert.equal(imageLoader({ src: '/images/other.png', width: 640 }), '/images/other.png?w=640');
});

test('the size marker never leaves the page: share images and structured data get the plain address', () => {
  process.env.SITE_URL = 'https://brightlinkltd.com';
  assert.equal(withoutSizes(`https://media.x.rw/${KEY}#w=480.960~2400`), `https://media.x.rw/${KEY}`);
  assert.equal(absoluteUrl(`https://media.x.rw/${KEY}#w=480.960~2400`), `https://media.x.rw/${KEY}`);
  assert.equal(absoluteUrl('/images/brand/brightlink-mark.webp#w=~212'), 'https://brightlinkltd.com/images/brand/brightlink-mark.webp');
  assert.equal(absoluteUrl('/about-us#team'), 'https://brightlinkltd.com/about-us#team'); // real anchors stay
});

test('every bundled brand copy the components ask for exists', async () => {
  const { existsSync } = await import('node:fs');
  for (const f of ['brightlink-logo', 'brightlink-logo-light']) {
    for (const w of [256, 384, 480]) assert.ok(existsSync(`public/images/brand/${f}-${w}.webp`), `${f}-${w}.webp`);
    assert.ok(existsSync(`public/images/brand/${f}.webp`));
  }
  assert.ok(existsSync('public/images/brand/brightlink-mark.webp'));
});
