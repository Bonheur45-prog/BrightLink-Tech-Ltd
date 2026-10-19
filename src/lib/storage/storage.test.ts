import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSrcSet, normalizeHost, parseVariants } from '../media';
import { isUploadKey, newUploadKey, posterKeyFor, variantKeyFor } from './keys';

test('upload keys are random, dated and recognised', () => {
  const key = newUploadKey('webp', new Date(Date.UTC(2026, 9, 5)), 'a'.repeat(20));
  assert.equal(key, `uploads/2026/10/${'a'.repeat(20)}.webp`);
  assert.ok(isUploadKey(key));
  assert.ok(!isUploadKey(`${key}.exe`));
  assert.ok(!isUploadKey('uploads/2026/10/../../secret.webp'));
  assert.ok(!isUploadKey('other/2026/10/aaaaaaaaaaaaaaaaaaaa.webp'));
});

test('variant and poster keys sit next to the original', () => {
  const key = `uploads/2026/10/${'b'.repeat(20)}.webp`;
  assert.equal(variantKeyFor(key, 480), `uploads/2026/10/${'b'.repeat(20)}-480.webp`);
  assert.equal(posterKeyFor(`uploads/2026/10/${'b'.repeat(20)}.mp4`), `uploads/2026/10/${'b'.repeat(20)}-poster.webp`);
  // a variant key is not a registrable upload key: clients cannot claim someone else's copy
  assert.ok(!isUploadKey(variantKeyFor(key, 480)));
});

test('host normalising accepts what people paste', () => {
  assert.equal(normalizeHost('https://media.example.com/'), 'media.example.com');
  assert.equal(normalizeHost(' media.example.com '), 'media.example.com');
  assert.equal(normalizeHost(undefined), '');
});

test('variants are read defensively and sorted', () => {
  assert.deepEqual(parseVariants(null), []);
  assert.deepEqual(parseVariants('nope'), []);
  const parsed = parseVariants([{ w: 960, h: 640, key: 'b' }, { w: 480, h: 320, key: 'a' }, { bad: true }]);
  assert.deepEqual(parsed.map((v) => v.w), [480, 960]);
});

test('srcset lists every width including the original', () => {
  process.env.R2_PUBLIC_HOSTNAME = 'media.example.com';
  const set = buildSrcSet('o.webp', 2400, [{ w: 480, h: 320, key: 'a.webp' }]);
  assert.equal(set, 'https://media.example.com/a.webp 480w, https://media.example.com/o.webp 2400w');
});
