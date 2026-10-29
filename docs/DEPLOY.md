# Deploying BrightLink to the VPS (same pattern as Oak Elite Home)

The build happens on GitHub (not on the VPS). Every push to `main` builds, runs `prisma migrate deploy`, uploads a
release and reloads PM2. Oak Elite Home uses port 3020; BrightLink uses **3021** (`deploy/ecosystem.config.cjs`).

## One-time VPS setup (done in October 2026 for brightlinkltd.com)
1. PostgreSQL 16 on the VPS, small settings in `/etc/postgresql/16/main/conf.d/brightlink.conf`
   (`listen_addresses = 'localhost'`, `max_connections = 20`, `shared_buffers = 128MB`, `effective_cache_size = 512MB`,
   `work_mem = 4MB`, `maintenance_work_mem = 64MB`). Database and user `brightlink`; the password is kept in
   `~/.pg-brightlink-pass` on the VPS (readable only by the `brightlink` user).
2. `/var/www/brightlink` owned by the deploy user, with `/var/www/brightlink/.env` (mode 600) holding the production values.
3. DNS on Cloudflare (Free): `A @` → VPS and `CNAME www` → `@`, both **DNS only** (grey cloud); `media` → the R2 bucket;
   Zoho mail records and Brevo records unchanged.
4. Add the blocks from `deploy/Caddyfile.brightlink` to `/etc/caddy/Caddyfile`, then
   `sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile && sudo systemctl reload caddy`.
   A reload does not interrupt the other sites; a file with a mistake is refused and the old settings stay.
5. First deploy: merge to `main` (or Actions → Deploy to VPS → Run workflow).
6. Starter content, once, on the new database: Actions → **Deploy to VPS** → **Run workflow** → tick
   **"Also add the starter content"**. Safe to repeat: it only adds what is missing.
7. First CMS user. The release folder has no scripts, so run it from your own checkout of the repo through an SSH tunnel:
   `ssh -N -L 15432:127.0.0.1:5432 brightlink@<VPS>` (leave it open), then in a second terminal
   `DATABASE_URL="postgresql://brightlink:<password>@127.0.0.1:15432/brightlink?schema=public" npm run user:create`.

Each deploy waits up to 30 seconds for the new release to answer on port 3021; if it does not, the deploy fails and
prints the site's log. The last 3 releases are kept in `/var/www/brightlink/releases` for a quick rollback
(`ln -sfn releases/<older> current && pm2 reload brightlink`).

## GitHub secrets (Settings → Secrets and variables → Actions)
`DATABASE_URL`, `R2_PUBLIC_HOSTNAME`, `SITE_URL`, `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

- `DATABASE_URL`: the **same value as in the VPS `.env`**, e.g. `postgresql://brightlink:…@localhost:5432/brightlink?schema=public`.
  When it points at the VPS (`localhost`, `127.0.0.1` or the VPS address), the deploy opens an SSH tunnel to the VPS and
  runs `prisma migrate deploy` through it, so PostgreSQL never has to be opened to the internet. A hosted database
  (e.g. Neon) is reached directly.
- `SITE_URL`: the public address with `https://` and no trailing slash (e.g. `https://brightlinkltd.com`). It is used for
  the sitemap, robots.txt, canonical addresses and share links, so it must also be in the VPS `.env`.
- `VPS_SSH_KEY`: the private key whose public half is in `~/.ssh/authorized_keys` of `VPS_USER` on the VPS.

## Cloudflare R2
- Create a bucket and a custom domain for it (e.g. `media.<yourdomain>`) so Cloudflare caches the files.
- API token with Object Read & Write on that bucket → `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.
- **CORS rule (needed for video uploads, which go from the browser straight to R2):** allow origin = your site
  address, methods `PUT` and `GET`, headers `*`.

## Email: contact messages sent to you
Every message from the contact form is saved first (it is always in **CMS → Messages**), then emailed to the
**Notification email** in Site settings (or the public email if that is empty). The result is shown on each message:
"Emailed to the team: Yes, <time>", or a yellow note saying why it was not emailed (email not set up, wrong password,
server unreachable). Visitors are only told "sent" once the message is saved.

Add to the VPS `.env` (any SMTP server works):
- Gmail: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=<the Gmail address>`,
  `SMTP_PASS=<a 16-character App Password>` (Google Account → Security → 2-Step Verification → App passwords),
  `EMAIL_FROM="BrightLink website <the same Gmail address>"`.
- Port 465 uses TLS; port 587 uses STARTTLS.
After changing `.env`: `pm2 restart brightlink --update-env`. Send yourself a test message from the site.

## Spam protection: Cloudflare Turnstile
Cloudflare dashboard → Turnstile → Add widget (domains: your domain and `localhost`), then add `TURNSTILE_SITE_KEY`
and `TURNSTILE_SECRET_KEY` to the VPS `.env` and restart. The contact form then shows a small "I am human" check and the
server refuses messages without a valid one. If Cloudflare itself cannot be reached, messages are let through (the limit
of 5 messages per visitor per 10 minutes still applies) so a real enquiry is never lost. Without the keys the check is off.
If a visitor's browser blocks the check, the form tells them to email you instead.

## Google Analytics
CMS → **Site settings** → SEO → **Google Analytics ID**: paste the Measurement ID (`G-…`) from Google Analytics →
Admin → Data streams → your web stream (pasting Google's whole tag snippet also works; the ID is taken from it).
It shows on the public pages within about a minute; the CMS (`/admin`) is never tracked. Empty the field to turn it off.
