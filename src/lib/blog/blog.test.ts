import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STARTER_POSTS_RAW } from '../content/blogDefaults';
import { markdownToBlocks } from '../content/richtext';
import { seoChecks, validatePost } from './post-model';
import { blocksToDoc, fontKeyOf, imageIdsIn, renderDoc, safeHref, type DocNode } from './render';

const doc = (...content: DocNode[]): DocNode => ({ type: 'doc', content });
const p = (...content: DocNode[]): DocNode => ({ type: 'paragraph', content });
const txt = (text: string, marks?: DocNode['marks']): DocNode => ({ type: 'text', text, marks });

test('render: text is escaped; unknown nodes, bad links, colours and fonts are dropped', () => {
  const r = renderDoc(
    doc(
      p(txt('<script>alert(1)</script>')),
      p(txt('x', [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }])),
      p(txt('y', [{ type: 'textStyle', attrs: { color: 'red;background:url(x)', fontFamily: 'Comic Sans' } }])),
      { type: 'iframe', attrs: { src: 'https://evil' } },
      p(txt('z', [{ type: 'link', attrs: { href: 'https://x.com/"onmouseover="a' } }])),
    ),
  );
  assert.ok(!r.html.includes('<script'));
  assert.ok(r.html.includes('&lt;script&gt;'));
  assert.ok(!r.html.includes('javascript:'));
  assert.ok(!r.html.includes('iframe'));
  assert.ok(!r.html.includes('style='));
  assert.ok(!r.html.includes('"onmouseover'));
});

test('render: headings get unique ids and a table of contents; fonts are collected', () => {
  const r = renderDoc(
    doc(
      { type: 'heading', attrs: { level: 2 }, content: [txt('Why it matters')] },
      { type: 'heading', attrs: { level: 2 }, content: [txt('Why it matters')] },
      { type: 'heading', attrs: { level: 1 }, content: [txt('Sub')] },
      p(txt('Hello', [{ type: 'textStyle', attrs: { fontFamily: 'var(--font-lora)', color: '#FF8E00' } }, { type: 'bold' }])),
    ),
  );
  assert.deepEqual(r.toc.map((t) => t.id), ['why-it-matters', 'why-it-matters-2', 'sub']);
  assert.ok(r.html.includes('<h2 id="sub">')); // h1 is reserved for the title
  assert.deepEqual(r.fonts, ['lora']);
  assert.ok(r.html.includes('<strong><span style="color:#ff8e00;font-family:var(--font-lora)">Hello</span></strong>'));
});

test('render: images only from the media library, with srcset and alt; tables, callouts, code', () => {
  const media = new Map([['abcdefghij12', { src: 'https://m.x/a.webp', srcset: 'https://m.x/a-480.webp 480w', width: 1600, height: 900, alt: 'Office' }]]);
  const d = doc(
    { type: 'image', attrs: { mediaId: 'abcdefghij12', title: 'Our office' } },
    { type: 'image', attrs: { src: 'https://evil/x.png' } },
    { type: 'table', content: [{ type: 'tableRow', content: [{ type: 'tableHeader', attrs: { colspan: 2 }, content: [p(txt('H'))] }] }] },
    { type: 'callout', attrs: { tone: 'tip' }, content: [p(txt('Tip'))] },
    { type: 'codeBlock', attrs: { language: 'js"><script>' }, content: [txt('a < b')] },
  );
  const r = renderDoc(d, media);
  assert.deepEqual(imageIdsIn(d), ['abcdefghij12']);
  assert.ok(r.html.includes('alt="Office"') && r.html.includes('srcset=') && r.html.includes('<figcaption>Our office</figcaption>'));
  assert.ok(!r.html.includes('evil'));
  assert.ok(r.html.includes('<th colspan="2">'));
  assert.ok(r.html.includes('<aside class="callout callout-tip" role="note">'));
  assert.ok(r.html.includes('<pre><code>a &lt; b</code></pre>'));
});

test('links and fonts helpers', () => {
  assert.equal(safeHref('/our-services'), '/our-services');
  assert.equal(safeHref('//evil.com'), null);
  assert.equal(safeHref('data:text/html,x'), null);
  assert.equal(fontKeyOf('var(--font-dm-sans)'), 'dm-sans');
  assert.equal(fontKeyOf('var(--font-arial)'), null);
});

test('starter articles convert to editor documents with the same headings and text', () => {
  for (const post of STARTER_POSTS_RAW) {
    const blocks = markdownToBlocks(post.body);
    const r = renderDoc(blocksToDoc(blocks));
    assert.equal(r.toc.length, blocks.filter((b) => b.type === 'h2' || b.type === 'h3').length, post.slug);
    assert.ok(r.words > 100, post.slug);
  }
});

test('post validation: title required; publishing needs a summary and text; bad canonical refused', () => {
  const base = { slug: '', categoryId: 'abcdefghij12', translations: { en: { title: 'Hello world', excerpt: '', doc: doc() } } };
  const draft = validatePost({ ...base, status: 'DRAFT' });
  assert.ok(draft.ok && draft.data.slug === 'hello-world');
  const pub = validatePost({ ...base, status: 'PUBLISHED', canonicalUrl: 'http://x' });
  assert.ok(!pub.ok && pub.errors['excerpt.en'] && pub.errors['doc.en'] && pub.errors.canonicalUrl);
  const fr = validatePost({ ...base, translations: { ...base.translations, fr: { excerpt: 'Résumé' } } });
  assert.ok(!fr.ok && fr.errors['title.fr']);
  const tags = validatePost({ ...base, tags: ['a', 'a', ' b ', '', 'c'.repeat(50)] });
  assert.ok(tags.ok && tags.data.tags.length === 3 && tags.data.tags[2].length === 30);
});

test('SEO assistant: focus keyword checks', () => {
  const r = renderDoc(doc(p(txt('An inventory system keeps stock under control.'))));
  const checks = seoChecks({ title: 'Inventory system guide', slug: 'inventory-system-guide', excerpt: 'x', metaTitle: '', metaDescription: '', focusKeyword: 'Inventory System', rendered: r, hasCover: false, missingAlt: 0 });
  assert.ok(checks.find((c) => c.text.includes('search title'))?.ok);
  assert.ok(checks.find((c) => c.text.includes('address'))?.ok);
  assert.ok(checks.find((c) => c.text.includes('start of the article'))?.ok);
  assert.ok(!checks.find((c) => c.text.includes('description.'))?.ok);
});
