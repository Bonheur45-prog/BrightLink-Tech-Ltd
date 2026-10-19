# Step 3 — About Us page

Route: `/about-us` (already linked from the header, footer, "Who We Are" and the hero).

## Sections (top to bottom)
1. **Banner** – breadcrumb, H1, intro, optional background picture (otherwise brand gradient + logo mark).
2. **Our Story** – large picture + smaller second picture, badge, ticked points, optional button.
3. **At a glance** – legal name, location, number of services, email and phones. Pulled from Site Settings and Services, nothing typed twice.
4. **Mission, Vision, Values**
5. **How we work** – numbered steps.
6. **What we offer** – service tiles linking to `/our-services/<slug>`.
7. **Meet the Team** (`/about-us#team`) – cards from the Team members collection, optional group photo. With no members, a friendly message and a "Talk to our team" button show instead. No fake people.
8. **Happy Clients** logos (switch off with "Show clients").
9. **Closing call to action.**

## Admin
- **Pages → About Us Page**: one tab per section, every text/picture/button is editable, plus SEO tab.
- **Content → Team members**: name, role, photo, short bio, email, LinkedIn, order, visible.
- Picture spaces: banner background, story picture 1 and 2, team group photo, each team photo.

## SEO
Metadata via `buildMetadata`, JSON-LD `AboutPage` + `BreadcrumbList` + one `Person` per real team member, one H1, `/about-us` added to the sitemap.

## After updating
1. `npm run dev` once (new tables), 2. `npm run seed` (fills About copy only if empty), 3. add pictures and team members in /admin.
