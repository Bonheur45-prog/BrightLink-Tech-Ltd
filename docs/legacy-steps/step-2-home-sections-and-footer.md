# Step 2 — Home page sections & footer

Status: code written and visually tested in a preview harness (desktop, tablet, mobile; forms; parallax; server-rendered HTML). **Still not run with `npm install` / `next build`** — do that first on your machine and fix anything it reports.

## Run it

```bash
npm install
npm run dev
npm run seed      # safe to re-run: only fills what is still empty
```
Run `npm run seed` again after updating — it adds the new sections, services, projects, clients, footer and your contact details without touching anything already edited. Then restart `npm run dev` once so Payload creates the new database tables.

## Sections on the home page (in order)

| Section | What it shows | Where to edit in /admin |
|---|---|---|
| Hero | (Step 1) | Pages → Home Page → Hero Slider |
| Who We Are | Animated intro on the left (heading, paragraphs, 4 icon highlights, buttons “Start Conversation”, “Connect with Team”, “Learn more about us” → About Us); picture on the right | Home Page → Who We Are |
| What We Do | Service cards with icon, description, 3 bullets and a “Learn more” link to `/our-services/<slug>` | Cards: Content → **Services**. Titles/intro: Home Page → What We Do |
| Why Work With Us | Large background picture that moves as you scroll, short confidence message, 3 points, “Plan your project” button, “Subscribe for our updates” box | Home Page → Why Work With Us |
| Portfolio | Project cards: picture, name, short intro, “View project” (+ optional “Visit site”), “View more projects” → `/our-projects` | Cards: Content → **Projects**. Titles/limit: Home Page → Portfolio |
| Our Happy Clients | Logo tiles; each logo opens the client’s website in a new tab | Content → **Clients** (upload logo + website). Titles: Home Page → Happy Clients |
| Get in Touch | Email, two phone numbers, location, and a message form | Details: Site → Site Settings → Contact. Texts: Home Page → Get in Touch |
| Footer | Logo, description, social icons, quick links, services list, contact, copyright | Site → **Footer**; description/contacts/socials in Site Settings |

Every section has a “Show this section” switch.

## Inbox

- **Inbox → Messages**: everything sent through the Get-in-touch form (name, email, phone, interested in, message, status new/contacted/closed).
- **Inbox → Subscribers**: emails from the “Subscribe for our updates” box (duplicates are ignored).
Both are visible to signed-in admins only. Forms use a hidden spam trap and a limit of 5 submissions per visitor per 10 minutes.

## Contact details used

Email `info@brightlinkltd.com`; phones `+250 782 567 921` and `+250 795 263 269`; Kigali, Rwanda. They are also written into the site’s structured data for Google. Change them any time in Site Settings → Contact.

## Starter content to review

All text was written from what is known about BrightLink — no invented statistics, awards or testimonials. Please check and edit:
- The 4 services (Software Development, Website Design, Digital Marketing, IT Support & Consultancy) and their bullet points.
- The 6 starter projects (Property, Hotel, Employee, Inventory management systems; PowerPlus Technology Ltd; SAGEC Ltd). Their descriptions are deliberately general, and they have **no screenshots yet** — a branded placeholder is shown until you upload one.
- The 2 starter clients (PowerPlus Technology Ltd, SAGEC Ltd) appear as names until you upload their logos and websites. **Delete any that are not clients.**
- If a collection is completely empty the site shows these starter items; switch the section off to hide it instead.

## Pictures to upload

Who We Are (portrait/square, 1000px+), Why Work With Us background (wide, 2000px+), project screenshots (16:10, e.g. 1600×1000), client logos (transparent PNG/SVG). Always fill in the Alt text in the Media library.

## Pages these links expect (to build next)

`/about-us` (with a `#team` section), `/our-services` and `/our-services/<slug>`, `/our-projects` and `/our-projects/<slug>`, `/blog`, `/contact-us`. Until they exist, those links show the branded 404 page.
