# Step 5 — Our Projects

Routes: `/our-projects` (list) and `/our-projects/<slug>` (one page per project).

## What a first-time visitor sees
- Banner with a plain heading ("Systems and websites we have built — and what we are building next") and one-sentence explanation.
- Three quick cards under the banner: number of **completed** projects, number **in progress**, and "Want something like this?". The numbers are counted from the projects you publish.
- Tabs: All / Completed / In progress (all content stays in the page for Google).
- **Completed projects** section, then **Projects in progress** section with a progress bar and percentage on every card.

## Starter projects
- Completed: StockPro, CrewTrack, PMS, HMS, sagecltd.com, powerplustechnology.rw, nsi-monique.com, gecoafrica.com
- In progress: Hospital Management System **70%**, Public Transport Bus Tracking & Booking **64%**, ComCoders **82%** (connects young developers in Rwanda to share skills and get updates on new opportunities)

## Project page
Banner (type · status), description, key features, picture space + fact card (status, progress, type, service link, live-site button), optional gallery, more projects, call to action.

## Admin
- Content → Projects: **Status** (Completed / In progress), **Progress (%)**, short intro, full description, key features, picture, more pictures, live site address, Service, SEO tab.
- Pages → Our Projects Page: banner, section headings, closing call to action, SEO.
- When a project reaches 100%, change Status to Completed; it moves to the Completed section by itself.
- Only completed projects appear in the home page portfolio.

## SEO
Per-project and page-level titles/descriptions/social images, `CollectionPage`, `ItemList`, `CreativeWork` and breadcrumb JSON-LD, one H1, sitemap entries for the list and every published project.

## Updating
`npm run dev` once, then `npm run seed` (adds the 3 in-progress projects, seeds the page text; never overwrites edits).
