# Progress and handoff

Plan: 7 phases. Each phase is pushed to its own branch (`phase-N`); CI (`.github/workflows/ci.yml`) must be green before it is merged into `main` (merging to `main` deploys).

| # | Phase | Status |
|---|---|---|
| 1 | Foundation: schema, auth, admin shell, users, audit log, R2 media library | done |
| 2 | Site settings, header, footer, SEO defaults, languages, curated font list | **done (branch phase-2)** |

| 3 | Collections: services, projects, clients, team, leads, subscribers, trash | **done (branch phase-3)** |
| 4 | Page builder: section catalogue, layouts, backgrounds, draft/publish, versions | **done (branch phase-4)** |
| 5 | Blog: categories, posts, Tiptap editor, fonts, SEO assistant, RSS | |
| 6 | Public site reconnected: caching, parallax, smooth scroll, image sizes | |
| 7 | Hardening: deploy, performance and SEO audit, tests | |

## What exists after Phase 1
- `prisma/schema.prisma`: the **complete** data model for all phases (25 tables) + `prisma/migrations/…_init`.
  Later phases add columns/tables only if needed (`npm run db:migrate`).
- Auth (scrypt passwords, hashed session tokens, login throttle), users page, activity log, middleware guard.
- Media library `/admin/media`: upload photos (resized to WebP, stored in 4 widths: ≤2400, 1600, 960, 480 — only widths
  smaller than the original), upload videos (browser → R2 directly), alt text per language, trash/restore/delete,
  refuses to trash a file still used somewhere (pages JSON text search + all database references).
- `src/lib/db.ts`: **engine-free Prisma client** (`engineType = "client"` + `@prisma/adapter-pg`): no Rust query-engine process.
- Public site (BrightLink Tailwind components) kept; Payload removed. Contact and subscribe forms now write to Postgres.

## IMPORTANT: public site is temporarily not editable
`src/lib/content/index.ts` returns the built-in starter content (`defaults.ts`). Phases 2–5 build the editors; Phase 6
reconnects these same function names to the database. `force-dynamic` is still on in `src/app/(frontend)/layout.tsx`
(removed in Phase 6, together with caching). **The public site is not yet faster than before.**

## Verification (Phase 1)
Tested in the sandbox (PostgreSQL 16, an S3 emulator standing in for R2, built app):
typecheck clean · 11 unit tests · `next build` · standalone server boots and reads the database · init migration applies
with 0 errors (25 tables) · login right/wrong password, forged cookie, API without session · image upload with variants,
non-image rejected, video start/PUT/finish, duplicate and forged keys rejected · alt text save/clear · trash/restore/purge,
in-use protection · add user (valid, duplicate, short password) · seed twice (idempotent) · `user:create` script.

**Not tested — do these yourself:**
- Real Cloudflare R2 (only an emulator): upload, public URL via your custom domain, the CORS rule for videos.
- `npm run build` with internet: Google Fonts (Inter, Outfit) were stubbed in the sandbox build.
- `npx prisma migrate deploy` itself: the SQL was generated with Prisma and applied with psql; Prisma's own
  migration bookkeeping was not exercised.
- The admin screens were never looked at in a browser (layout/colours copied from Oak, recoloured navy/orange).
- Email (SMTP) and Turnstile (not wired to anything yet), GitHub Action, VPS, PM2, Caddy.
- Phones, any speed number.

## Decisions to keep
English at `/` (no prefix), other languages at `/fr`, `/rw` (Phase 6; differs from Oak's `/en`).
Admin keeps Oak's CSS-module design tokens (recoloured); public site stays Tailwind. Images: WebP only (no AVIF).
`DATABASE_POOL_MAX` (default 5) controls the connection pool.

## What Phase 2 added
- `/admin/settings`: company, contact, socials, logos + default share image (MediaPicker), languages (en always on;
  fr/rw switchable), per-language tagline/footer text/default SEO title+description with a Google preview, title
  pattern (%s), Search Console code (meta tag pasted → code kept), heading/body fonts, smooth-scroll/parallax switches.
  Saves immediately (no draft). Validation: `src/lib/cms/settings-validation.ts`.
- `/admin/header`, `/admin/footer`: draft → publish → version history (30 kept), discard, restore. Text per language
  (`{en,fr,rw}`, English required, others fall back). Model + checks: `src/lib/cms/globals-model.ts`; store:
  `src/lib/cms/drafts.ts` (generic: Phase 4 adds pages to its SPEC). Shared actions: `src/app/admin/(cms)/doc-actions.ts`.
- `MediaPicker` / `MediaField` (`src/components/admin/MediaPicker`): browse, search, page, upload-and-pick.
- Fonts: `src/lib/fonts.ts` (8 curated keys) + `src/styles/fonts.ts` (next/font, self-hosted, preload off). Public
  layout sets `--font-heading`/`--font-body`; Tailwind `font-display`/`font-sans` use them.
- **Public site now reads settings, header and footer from the database** (`src/lib/content/site.ts`, cached, refreshed on
  save/publish, starter content if the DB is down or nothing is published yet). Everything else is still starter content.
- Smooth-scroll/parallax switches are stored but only take effect in Phase 6. Locale routing (`/fr`, `/rw`) is Phase 6;
  until then the site renders English.
- CI: migrate deploy, seed ×2, typecheck, lint, 19 unit tests, build, start the standalone server and check key pages.

## What Phase 4 added
- Section catalogue `src/lib/pages/catalogue.ts`: 17 types (hero, banner, highlights, textMedia, services, projects,
  features, mission, glance, clients, team, faq, cta, contact, newsletter, posts, richText), each with layouts
  (variants) and a field schema. Background per section: page colour / tint / dark / photo (+ parallax, darkening).
- Page JSON `{ sections: [{ id, type, variant, visible, background, data }], seo: { title, description, ogImage, noIndex } }`;
  text values are `{ en, fr, rw }`. Parser/checks: `src/lib/pages/model.ts` (unknown types dropped, values clamped).
- Starter pages `src/lib/pages/defaults.ts`, built from the existing starter content (home, about, services, projects,
  blog, contact, and one per service from its name/description): the editor shows them until a page is published.
- `/admin/pages` + `/admin/pages/<key>` (keys: home, about, services, projects, blog, contact, `service-<serviceId>`):
  generic schema-driven editor (add/reorder/hide/duplicate/remove sections and items, language switcher), SEO panel
  with Google preview + checklist, draft/publish bar, version history. Store: `src/lib/cms/drafts.ts` (now also pages).
- Publishing is refused when a visible photo has no English alt text, or required text / links are missing.
- Deleting a service for good also deletes its page and versions. `ServiceTranslation.content` is no longer used.
- The public pages are NOT yet drawn from these sections: Phase 6 maps each section type to the components.

## What Phase 3 added
- `/admin/services`, `/admin/projects`, `/admin/clients`, `/admin/team`: list → create by name → editor (texts per
  language in tabs, lists typed one per line, cover/logo/photo via MediaPicker, project gallery with reorder, status
  Draft/Published, order, show-on-home). Slug renames create a `Redirect` (chains flattened). Service page *sections*
  (the `content` JSON) are left for the Phase 4 page builder.
- `/admin/messages` (filter by status, detail, mark new/contacted/closed, delete, reply/call links) and
  `/admin/subscribers` (remove/add back). CSV downloads at `/admin/api/export/leads|subscribers` (formula-safe).
- `/admin/trash`: services, projects, clients, team; restore (as draft) or delete for good (photos are kept).
- Seed now also creates the starter services, projects and clients (only into empty tables).
- Actions: `src/app/admin/(cms)/collection-actions.ts`; validation: `src/lib/cms/collections-validation.ts`;
  shared UI: `src/app/admin/(cms)/_collections/shared.tsx`, `src/components/admin/EntityForm`.
- Public pages still use starter content for these until Phase 6. Contact-form email notifications are not wired yet.

## Not tested in Phase 2 (do these yourself)
- The new admin screens in a real browser (only typechecked/built; layout untested), the MediaPicker against real R2.

## Earlier plan notes (Phase 2)
Site settings editor (company, contact, socials, SEO defaults, languages, heading/body font from the curated list in
`src/lib/fonts.ts` (to create), parallax/smooth-scroll switches), header and footer editors (GlobalSection drafts),
`MediaPicker` modal (not built yet), version history UI, publish bar copied from Oak's `PublishBar`.
Admin nav currently lists only Dashboard, Media library, Users, Activity.

`docs/legacy-steps/` = old Payload-era notes, kept only as a reference for the content that must be re-created.
