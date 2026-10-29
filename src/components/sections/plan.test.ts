import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIXED_PAGE_DEFAULTS, servicePageDefault } from '../../lib/pages/defaults';
import { pageMediaIds } from '../../lib/pages/media';
import { emptySection, type Section } from '../../lib/pages/model';
import { planSections, startsWithTitle } from './plan';

const sec = (type: string, variant?: string): Section => {
  const s = emptySection(type)!;
  if (variant) s.variant = variant;
  return s;
};

test('sections are drawn in the editor’s order, each with a unique anchor', () => {
  const plans = planSections([sec('banner'), sec('textMedia'), sec('textMedia'), sec('contact'), sec('team'), sec('textMedia')]);
  assert.deepEqual(
    plans.map((p) => [p.section.type, p.anchor]),
    [
      ['banner', 'top'],
      ['textMedia', 'story'],
      ['textMedia', 'story-2'],
      ['contact', 'get-in-touch'], // links all over the site point to "/#get-in-touch"
      ['team', 'team'], // the header links to "/about-us#team"
      ['textMedia', 'story-3'],
    ],
  );
  assert.deepEqual(
    plans.map((p) => p.first),
    [true, false, false, false, false, false],
  );
});

test('highlight cards right after the hero, and a newsletter right after a "list beside a photo", are drawn with it', () => {
  const plans = planSections([sec('hero'), sec('highlights'), sec('features', 'list'), sec('newsletter'), sec('features', 'cards'), sec('newsletter')]);
  assert.deepEqual(
    plans.map((p) => [p.section.type, p.partner?.type ?? null]),
    [
      ['hero', 'highlights'],
      ['features', 'newsletter'],
      ['features', null], // cards do not take a newsletter beside them
      ['newsletter', null],
    ],
  );
  // highlights elsewhere stay a section of their own
  assert.deepEqual(
    planSections([sec('banner'), sec('highlights')]).map((p) => p.section.type),
    ['banner', 'highlights'],
  );
});

test('the page title (h1) comes from a first hero or banner; otherwise the page adds one', () => {
  assert.equal(startsWithTitle([sec('hero'), sec('cta')]), true);
  assert.equal(startsWithTitle([sec('banner')]), true);
  assert.equal(startsWithTitle([sec('richText'), sec('banner')]), false);
  assert.equal(startsWithTitle([]), false);
});

test('every starter page opens with its title, so the site keeps exactly one h1 per page', () => {
  for (const [key, build] of Object.entries(FIXED_PAGE_DEFAULTS)) {
    assert.ok(startsWithTitle(build().sections.filter((s) => s.visible)), key);
  }
  const page = servicePageDefault({ slug: 'web', title: 'Web', shortDescription: 'Sites', features: ['Fast'] });
  assert.ok(startsWithTitle(page.sections.filter((s) => s.visible)));
});

test('a service without its own "why choose us" gets the shared one (as before)', () => {
  const page = servicePageDefault({ slug: 'brand-new-service', title: 'Brand new', shortDescription: 'New', features: [] });
  const why = page.sections.find((s) => s.type === 'features' && s.variant === 'list');
  assert.ok(why?.visible);
  assert.ok((why!.data.items as unknown[]).length > 0);
});

test('the Our Projects starter page shows completed and in-progress projects as two groups of one section', () => {
  const projects = FIXED_PAGE_DEFAULTS.projects().sections.filter((s) => s.type === 'projects');
  assert.equal(projects.length, 1);
  assert.equal(projects[0].variant, 'explorer');
  assert.equal(projects[0].data.filter, 'all');
  assert.ok((projects[0].data.secondHeading as { en?: string }).en);
});

test('pageMediaIds finds photos and videos in fields, slides, backgrounds and the share image', () => {
  const hero = sec('hero');
  const slides = hero.data.slides as Record<string, unknown>[];
  slides.push({ id: 's1', image: 'img00000001', video: 'vid00000001', heading: { en: 'x' } });
  const text = sec('textMedia');
  text.data.image = 'img00000002';
  text.data.secondImage = 'img00000003';
  const band = sec('cta');
  band.background = { style: 'image', image: 'bg000000001', parallax: true, overlay: 'medium' };
  const off = sec('cta');
  off.background = { style: 'dark', image: 'unused00001', parallax: true, overlay: 'medium' }; // not a photo background
  const ids = pageMediaIds({ sections: [hero, text, band, off], seo: { title: {}, description: {}, ogImage: 'og000000001', noIndex: false } });
  assert.deepEqual(ids.sort(), ['bg000000001', 'img00000001', 'img00000002', 'img00000003', 'og000000001', 'vid00000001']);
});
