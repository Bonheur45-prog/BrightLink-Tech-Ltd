# Step 6 — Blog

Routes: `/blog` (home), `/blog/category/<slug>`, `/blog/<slug>` (article), `/blog/feed.xml` (RSS).

## Design
- **Blog home** is a magazine layout: banner that says what the blog is, "Browse by topic" category tiles (colour-coded, with article counts), search box, one big **Featured** article, then a lead story with two side stories, then a card grid with numbered pages.
- **Category pages** have their own banner, description and article list (good for Google: one page per topic).
- **Article page**: headline block, cover picture, readable article text, sticky **table of contents** (built from your headings), share buttons (WhatsApp, LinkedIn, X, Facebook, copy link), a reading-progress bar, tags, author box, related articles, subscribe band and a call to action.

## Categories (starter)
Our Solutions · Tech News & Trends · Web & Design · Digital Marketing · IT Support Tips. Add or rename them in Blog → Blog categories (name, description, icon, colour, order, SEO).

## Starter articles (7)
The first three-plus-one are about solutions BrightLink built: StockPro, CrewTrack, ComCoders (in development) and the websites. The rest are general, evergreen advice (AI at work, cybersecurity habits, social media consistency). **No news, statistics or dates are invented.** For real "trending technology news", write articles in Blog → Blog posts under Tech News & Trends and link to your sources.

## Writing and SEO in the admin (Blog → Blog posts)
1. **Article tab**: headline, summary, featured picture, body (Heading 2/3 for sections, links, images, lists, quotes).
2. **SEO tab**: a live **Google preview** and a **checklist** (title length, description length, picture, length, headings, internal links, web address, and the focus keyword in title / description / opening / address). Green = done. Nothing blocks publishing.
3. Anything left empty is filled automatically: Google title = headline, description = summary, social image = featured picture.
4. Side panel: category, tags, author (optional, from Team members), publish date (set automatically; a future date schedules the article), Draft/Published, Featured.
Extras: canonical address and "hide from search engines" (advanced).

## Technical SEO
BlogPosting + Blog + Breadcrumb JSON-LD, article Open Graph (published time, author, tags), canonical URLs, one H1 per page, sitemap entries for the blog, every category and every published article (articles set to "hide" are left out), RSS feed, page 2+ and search results set to noindex.

## Updating
`npm run dev` once (new tables), then `npm run seed` (adds categories, 7 starter articles and the Blog page text; never overwrites edits). If the SEO tab does not show the assistant, run `npm run generate:importmap` once.
