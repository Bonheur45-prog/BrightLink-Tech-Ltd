# Deploying BrightLink to the VPS (same pattern as Oak Elite Home)

The build happens on GitHub (not on the VPS). Every push to `main` builds, runs `prisma migrate deploy`, uploads a
release and reloads PM2. Oak Elite Home uses port 3020; BrightLink uses **3021** (`deploy/ecosystem.config.cjs`).

## One-time VPS setup
1. Create the database and a user for it (PostgreSQL), e.g. `brightlink`.
2. `mkdir -p /var/www/brightlink` and create `/var/www/brightlink/.env` from `.env.example` (production values).
3. Add the block from `deploy/Caddyfile.brightlink` to `/etc/caddy/Caddyfile`, then `systemctl reload caddy`.
   **The domain in it is a placeholder: change it to the real one.**
4. Create the first CMS user. The release folder has no scripts, so run it from a checkout of the repo with
   `DATABASE_URL` pointing at the production database: either on the VPS (`git clone`, `npm ci`, `npm run user:create`),
   or from your computer through an SSH tunnel (`ssh -N -L 15432:127.0.0.1:5432 user@vps`, then
   `DATABASE_URL=postgresql://…@127.0.0.1:15432/brightlink npm run user:create`).

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
