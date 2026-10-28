import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SECTIONS } from './catalogue';
import { FIXED_PAGE_DEFAULTS, servicePageDefault } from './defaults';
import { emptySection, mediaIdsOf, pageProblems, parsePage, seoChecklist } from './model';
import { STARTER_SERVICES_RAW } from '../content/defaults';

test('every starter page parses to itself and can be published as it is', () => {
  for (const [key, make] of Object.entries(FIXED_PAGE_DEFAULTS)) {
    const doc = make();
    assert.ok(doc.sections.length > 1, key);
    assert.deepEqual(parsePage(JSON.parse(JSON.stringify(doc))), doc, `${key} round-trips`);
    assert.deepEqual(pageProblems(doc), {}, `${key} has no problems`);
  }
  for (const s of STARTER_SERVICES_RAW) {
    const doc = servicePageDefault({ slug: s.slug, title: s.title, shortDescription: s.shortDescription, features: s.features });
    assert.deepEqual(pageProblems(doc), {}, s.slug);
  }
});

test('home starter keeps the starter hero slides and text', () => {
  const home = FIXED_PAGE_DEFAULTS.home();
  const hero = home.sections[0];
  assert.equal(hero.type, 'hero');
  assert.equal((hero.data.slides as unknown[]).length, 3);
});

test('empty JSON uses the fallback; unknown section types and bad values are cleaned', () => {
  const fb = FIXED_PAGE_DEFAULTS.about;
  assert.deepEqual(parsePage({}, fb), fb());
  const doc = parsePage({
    sections: [
      { id: 'a', type: 'nope' },
      { id: 'b', type: 'banner', variant: 'weird', data: { heading: { en: 'Hi', de: 'x' }, image: 'BAD ID' } },
      { id: 'b', type: 'cta', data: { heading: 'Plain string is English' } },
    ],
  });
  assert.equal(doc.sections.length, 2);
  assert.equal(doc.sections[0].variant, 'cinematic');
  assert.deepEqual(doc.sections[0].data.heading, { en: 'Hi' });
  assert.equal(doc.sections[0].data.image, null);
  assert.notEqual(doc.sections[1].id, 'b'); // duplicate id replaced
  assert.deepEqual(doc.sections[1].data.heading, { en: 'Plain string is English' });
});

test('every catalogue type makes an empty section; required fields are reported, hidden sections are not', () => {
  for (const def of SECTIONS) assert.ok(emptySection(def.type), def.type);
  const cta = emptySection('cta')!;
  const p = pageProblems({ sections: [cta], seo: { title: {}, description: {}, ogImage: null, noIndex: false } });
  assert.ok(p[`s.${cta.id}.heading`] && p[`s.${cta.id}.primaryCta.url`]);
  assert.ok(pageProblems({ sections: [{ ...cta, visible: false }], seo: { title: {}, description: {}, ogImage: null, noIndex: false } }).sections);
});

test('highlight words must be in the heading; photo backgrounds need a photo', () => {
  const s = emptySection('textMedia')!;
  s.data.heading = { en: 'We build software' };
  s.data.highlightText = { en: 'websites' };
  s.background.style = 'image';
  const p = pageProblems({ sections: [s], seo: { title: {}, description: {}, ogImage: null, noIndex: false } });
  assert.ok(p[`s.${s.id}.highlightText`] && p[`s.${s.id}.background`]);
});

test('media ids are collected from fields, items, backgrounds and SEO (videos skipped)', () => {
  const hero = emptySection('hero')!;
  hero.data.slides = [{ id: 'x', image: 'aaaaaaaaaa11', video: 'vvvvvvvvvv11' }] as never;
  const b = emptySection('banner')!;
  b.background = { style: 'image', image: 'bbbbbbbbbb22', parallax: true, overlay: 'medium' };
  const ids = mediaIdsOf({ sections: [hero, b], seo: { title: {}, description: {}, ogImage: 'cccccccccc33', noIndex: false } }).map((m) => m.id);
  assert.deepEqual(ids, ['aaaaaaaaaa11', 'bbbbbbbbbb22', 'cccccccccc33']);
});

test('SEO checklist flags a short title and a missing description', () => {
  const list = seoChecklist(FIXED_PAGE_DEFAULTS.contact(), 'Contact');
  assert.equal(list.length, 4);
});
