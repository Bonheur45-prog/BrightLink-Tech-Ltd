# Progress and handoff

Plan: 7 phases, each delivered as a full zip. Start each phase in a fresh chat: upload the latest zip and this file.

| # | Phase | Status |
|---|---|---|
| 1 | Foundation: schema, auth, admin shell, users, audit log, R2 media library | **done (this zip)** |
| 2 | Site settings, header, footer, SEO defaults, languages, curated font list | next |
| 3 | Collections: services, projects, clients, team, leads, subscribers, trash | |
| 4 | Page builder: section catalogue, layouts, backgrounds, draft/publish, versions | |
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

## Next (Phase 2) — what to build
Site settings editor (company, contact, socials, SEO defaults, languages, heading/body font from the curated list in
`src/lib/fonts.ts` (to create), parallax/smooth-scroll switches), header and footer editors (GlobalSection drafts),
`MediaPicker` modal (not built yet), version history UI, publish bar copied from Oak's `PublishBar`.
Admin nav currently lists only Dashboard, Media library, Users, Activity.

`docs/legacy-steps/` = old Payload-era notes, kept only as a reference for the content that must be re-created.
