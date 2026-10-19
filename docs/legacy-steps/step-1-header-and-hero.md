# Step 1 — Header & Home Page Hero

Status: code written; visually tested in a preview harness; **not yet run with `npm install` / `next build`** (the build workspace could not reach the npm registry). First thing to do on your machine: run the commands below and fix anything the real build reports.

## Run it

```bash
cd brightlink
cp .env.example .env.local        # set DATABASE_URI, PAYLOAD_SECRET, NEXT_PUBLIC_SERVER_URL
npm install
npm run dev                       # site: http://localhost:3000  admin: http://localhost:3000/admin
# create the first admin user in the browser, then (optional, fills starter content):
npm run seed
```

## What the visitor sees

- **Header** — logo (official file, with a light-wordmark version for dark backgrounds), main menu with dropdowns, "Request a Quote" button, optional top bar (phone, email, social icons, short message). Floats transparently over the hero, turns solid white with a logo-colour line when scrolled. Full-screen drawer menu on phones.
- **Hero slider** — each slide has its own picture, video, or brand background, and its own text; text and media change together. Autoplay with progress bar, pause button, arrows, dots, swipe, keyboard arrows. Pauses on hover/focus/hidden tab. Respects "reduce motion" (no autoplay, video replaced by its poster).
- **Highlight cards** (optional) overlapping the bottom of the hero.

## What editors control in /admin

| Part | Where | Controls |
|---|---|---|
| Logo, company name, phone, email, address, hours, social links | Site → Site Settings | logo + dark-background logo upload |
| Menu, dropdowns, CTA button | Site → Header & Navigation | order, labels, links, new-tab, dropdown links with descriptions |
| Top bar | Header & Navigation → Top bar | on/off, message, show phone/email/socials |
| Sticky / transparent header | Header & Navigation → Behaviour | two switches |
| Slides (up to 8) | Pages → Home Page → Hero Slider | picture / video / brand background, eyebrow, heading, highlighted words, sub-text, 2 buttons, left/centre text, darkness over media, seconds per slide |
| Slider behaviour | Hero Slider → Slider behaviour | autoplay, seconds, height, zoom effect, arrows, dots, progress bar, hide the whole hero |
| Highlight cards (max 4) | Home Page → Hero Highlights | title, text, optional link |
| Home page SEO | Home Page → SEO | title, description, social image |
| Site-wide SEO | Site Settings → SEO defaults | default title/description, title template, social image, Google verification |

Saving any of these refreshes the live site immediately.

## SEO built in

- First slide's heading is the page's single `<h1>`; other slides use `<h2>`; all slide text is in the server-rendered HTML.
- Per-page title/description/canonical/Open Graph/Twitter metadata (`src/lib/seo.ts`).
- JSON-LD: Organization/ProfessionalService, WebSite, WebPage.
- `sitemap.xml`, `robots.txt` (blocks `/admin` and `/api`), branded 404 page.
- First slide image is preloaded (LCP); other images lazy-load; fonts use `display: swap`.
- Alt text comes from the Media library — fill it in for every upload.

## Hero media tips

- Pictures: landscape, at least 1920×1080, under ~500 KB each.
- Videos: MP4 (H.264) or WebM, silent, 10–20 seconds, under ~10 MB (upload limit is 50 MB). Always add a poster image.
- If text is hard to read on a bright picture, raise "Darkness over media" to Strong.

## Still to do (next steps)

1. Run the real build and fix anything it reports; generate Payload types (`npm run generate:types`).
2. Add real contact details and social links in Site Settings.
3. Upload real hero pictures/videos (until then the slides use the brand background).
4. Production: add a cloud storage adapter for the Media library and run database migrations before deploying.
5. Next page sections: About teaser, Services, Projects, Blog, Contact CTA, Footer.
