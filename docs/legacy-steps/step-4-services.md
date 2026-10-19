# Step 4 — Our Services (overview + one page per service)

Routes: `/our-services` and `/our-services/<slug>` (software-development, website-design, digital-marketing, it-support-consultancy). Every "Learn more" button, header menu item and footer link already points to these.

## Each service page
1. Banner (breadcrumb, H1, intro, optional background photo)
2. Overview – explanation + ticked highlights + **photo space** + "Start a conversation" button
3. What's included – icon cards
4. **Why choose us** – parallax photo background (own text per service, or the shared one)
5. How we work – numbered steps
6. **Our work** – projects tagged with the service (screenshot space, "Visit site" for live sites) and/or clients we serve with logos + what we do for them
7. FAQ – accordion, also sent to Google as FAQ data
8. Closing call-to-action band, and links to the other services

## Starter content (from what you told us)
- Software Development: StockPro (inventory), CrewTrack (employee management), PMS, HMS
- Website Design: sagecltd.com, powerplustechnology.rw, nsi-monique.com, gecoafrica.com (each links to the live site)
- Digital Marketing: we manage and create/post content for SAGEC Ltd and PowerPlus Technology Ltd
- IT Support & Consultancy: Minimekix Forex, SAGEC Ltd, NSI Group
Nothing else is invented: no statistics, prices or testimonials.

## Admin
- Content → Services: tabs Basics, Page banner, Overview, What we offer, Why choose us, How we work, Our work, FAQ, Call to action, SEO.
- Content → Projects: set **Service** to show a project on that service page; add the screenshot and live site address.
- Content → Clients: logos + website; choose them under a service's "Our work" tab.
- Pages → Our Services Page: overview banner, shared "Why choose us", closing CTA, SEO.
- Photo spaces: banner background, overview picture, why-choose-us background, project screenshots, client logos, social image.

## SEO
Per-service title/description/social image, `Service` + `BreadcrumbList` + `FAQPage` JSON-LD, one H1, canonical URLs; `/our-services` and each published service are in the sitemap automatically.

## Updating
`npm run dev` (once), `npm run seed` (adds missing starter projects, links projects to services, seeds the overview page; never overwrites edits). If you already have old starter projects (e.g. an "Inventory" one), delete duplicates in /admin.
