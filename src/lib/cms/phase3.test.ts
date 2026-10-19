import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lines, validateClient, validateProject, validateService, validateTeam } from './collections-validation';
import { toCsv } from './csv';
import type { Input } from './settings-validation';

const input = (values: Record<string, string | string[]>): Input => ({
  get: (n) => (Array.isArray(values[n]) ? (values[n] as string[])[0] : (values[n] as string)) ?? '',
  getAll: (n) => (Array.isArray(values[n]) ? (values[n] as string[]) : values[n] ? [values[n] as string] : []),
});

test('lines: one item per line, blanks dropped', () => {
  assert.deepEqual(lines(' a \n\n b\r\nc '), ['a', 'b', 'c']);
});

test('service: slug from the English name; unknown icon dropped; French row only when filled', () => {
  const r = validateService(input({ 'title.en': 'Web Design!', icon: 'nope', 'features.en': 'Fast\nResponsive', status: 'DRAFT' }), ['code']);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.data.slug, 'web-design');
  assert.equal(r.data.icon, '');
  assert.deepEqual(r.data.translations.en?.features, ['Fast', 'Responsive']);
  assert.equal(r.data.translations.fr, undefined);
});

test('service: publishing needs a short description; bad slug refused', () => {
  const r = validateService(input({ 'title.en': 'Web', slug: 'Bad Slug', status: 'PUBLISHED' }), []);
  assert.ok(!r.ok);
  if (r.ok) return;
  assert.ok(r.errors.slug && r.errors['shortDescription.en']);
});

test('project: completed forces 100%; gallery deduplicated; bad website refused', () => {
  const ok = validateProject(input({ 'title.en': 'StockPro', state: 'COMPLETED', progress: '40', gallery: ['abcdefghij12', 'abcdefghij12', 'x'] }));
  assert.ok(ok.ok);
  if (ok.ok) {
    assert.equal(ok.data.progress, 100);
    assert.deepEqual(ok.data.gallery, ['abcdefghij12']);
  }
  const ip = validateProject(input({ 'title.en': 'X', state: 'IN_PROGRESS', progress: '150' }));
  assert.ok(ip.ok && ip.data.progress === 99);
  const bad = validateProject(input({ 'title.en': 'X', externalUrl: 'javascript:alert(1)' }));
  assert.ok(!bad.ok);
});

test('client and team: required names, LinkedIn must be a LinkedIn link', () => {
  assert.ok(!validateClient(input({ name: '' })).ok);
  const c = validateClient(input({ name: 'NSI', website: 'nsi.rw' }));
  assert.ok(c.ok && c.data.website === 'https://nsi.rw/');
  assert.ok(!validateTeam(input({ name: 'A', 'role.en': 'Dev', linkedin: 'https://example.com/me' })).ok);
  assert.ok(!validateTeam(input({ name: 'A' })).ok); // English role required
  assert.ok(validateTeam(input({ name: 'A', 'role.en': 'Dev', linkedin: 'https://www.linkedin.com/in/a' })).ok);
});

test('csv: quoted, BOM, formulas neutralised', () => {
  const csv = toCsv(['a', 'b'], [['=SUM(1)', 'say "hi"']]);
  assert.ok(csv.startsWith('﻿"a","b"\r\n'));
  assert.ok(csv.includes(`"'=SUM(1)","say ""hi"""`));
});
